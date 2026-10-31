#!/usr/bin/env node
/**
 * Pre-push / CI security gate. Fails (exit 1) on anything that must never reach the repository.
 *
 *   1. Dependency audit   – production deps: any known vulnerability fails; dev deps: high/critical fails.
 *   2. Secret scan        – API keys, tokens and private keys in files that would be committed.
 *   3. Forbidden files    – .env, private keys and certificates tracked by git.
 *   4. Unsafe code        – XSS sinks, eval, client-exposed secrets, unsafe target="_blank".
 *   5. Ignore files       – .env must be ignored by both git and Docker.
 *
 * Run: npm run security    (also runs automatically from .githooks/pre-push and in CI)
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const failures = []
const warnings = []

const run = (command) => {
  try {
    return execSync(command, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch (error) {
    return error.stdout?.toString() ?? ''
  }
}

// --- Files that would be committed -----------------------------------------------------------
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'storybook-static', 'coverage', '.git'])

function listFiles() {
  if (existsSync(join(ROOT, '.git'))) {
    // Tracked + untracked-but-not-ignored: exactly what `git add -A` would commit.
    return run('git ls-files --cached --others --exclude-standard').split('\n').filter(Boolean)
  }
  const files = []
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (IGNORED_DIRS.has(name)) continue
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else files.push(relative(ROOT, path))
    }
  }
  walk(ROOT)
  return files
}

const files = listFiles().filter((file) => existsSync(join(ROOT, file)))
const textFiles = files.filter(
  (file) => !/\.(png|jpe?g|gif|webp|ico|woff2?|ttf|lock)$/i.test(file) && file !== 'package-lock.json',
)

// --- 1. Dependency audit ---------------------------------------------------------------------
function audit(args) {
  const output = run(`npm audit ${args} --json`)
  try {
    return JSON.parse(output).metadata?.vulnerabilities ?? {}
  } catch {
    warnings.push(`npm audit ${args} could not be parsed (offline?)`)
    return {}
  }
}
const prod = audit('--omit=dev')
const prodCount = (prod.low ?? 0) + (prod.moderate ?? 0) + (prod.high ?? 0) + (prod.critical ?? 0)
if (prodCount > 0)
  failures.push(`Production dependencies have ${prodCount} known vulnerabilities (run: npm audit --omit=dev)`)
const all = audit('')
if ((all.high ?? 0) + (all.critical ?? 0) > 0)
  failures.push(`Dev dependencies have high/critical vulnerabilities (run: npm audit)`)
else if ((all.moderate ?? 0) + (all.low ?? 0) > 0)
  warnings.push(`Dev dependencies have ${(all.moderate ?? 0) + (all.low ?? 0)} low/moderate advisories`)

// --- 2. Secret scan --------------------------------------------------------------------------
const SECRET_PATTERNS = [
  ['Private key', /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['OpenAI/Anthropic-style key', /\bsk-(ant-)?[A-Za-z0-9_-]{20,}\b/],
  // KEY=value or "apiKey": "value" with a long literal value (env files, configs, code).
  ['Hard-coded credential', /\b[A-Z0-9_]*(API_?KEY|SECRET|TOKEN|PASSWORD)\s*[:=]\s*['"]?[A-Za-z0-9_-]{16,}/i],
]
for (const file of textFiles) {
  const lines = readFileSync(join(ROOT, file), 'utf8').split('\n')
  lines.forEach((line, index) => {
    for (const [label, pattern] of SECRET_PATTERNS) {
      if (pattern.test(line)) failures.push(`${label} in ${file}:${index + 1}`)
    }
  })
}

// --- 3. Forbidden files ----------------------------------------------------------------------
for (const file of files) {
  const name = file.split('/').pop()
  if (/^\.env(\..+)?$/.test(name) && name !== '.env.example')
    failures.push(`Environment file would be committed: ${file}`)
  if (/\.(pem|key|p12|pfx|keystore)$/i.test(name))
    failures.push(`Key/certificate file would be committed: ${file}`)
}

// --- 4. Unsafe code patterns -----------------------------------------------------------------
const CODE_PATTERNS = [
  ['dangerouslySetInnerHTML (XSS sink)', /dangerouslySetInnerHTML/],
  ['innerHTML/outerHTML assignment (XSS sink)', /\.(inner|outer)HTML\s*=/],
  ['eval / new Function', /\beval\s*\(|new Function\s*\(/],
  ['document.write', /document\.write\s*\(/],
  ['Secret exposed to the client bundle (VITE_* key)', /VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)/],
]
const codeFiles = textFiles.filter(
  (file) => /^src\/.*\.(ts|tsx|js|jsx)$/.test(file) && !/\.test\.|\.stories\./.test(file),
)
for (const file of codeFiles) {
  const source = readFileSync(join(ROOT, file), 'utf8')
  source.split('\n').forEach((line, index) => {
    for (const [label, pattern] of CODE_PATTERNS) {
      if (pattern.test(line)) failures.push(`${label} in ${file}:${index + 1}`)
    }
  })
  // Every target="_blank" link must also set rel="noopener noreferrer" (reverse tabnabbing).
  for (const match of source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gs)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(match[0]))
      failures.push(`target="_blank" without rel="noopener" in ${file}`)
  }
}

// --- 5. Ignore files -------------------------------------------------------------------------
const ignores = (file, entry) =>
  existsSync(join(ROOT, file)) && readFileSync(join(ROOT, file), 'utf8').split('\n').includes(entry)
if (!ignores('.gitignore', '.env')) failures.push('.env is not listed in .gitignore')
if (!ignores('.dockerignore', '.env'))
  failures.push('.env is not listed in .dockerignore (it would be copied into the image)')

// --- Report ----------------------------------------------------------------------------------
console.log(`Security check: scanned ${textFiles.length} files.`)
for (const warning of warnings) console.log(`  ⚠ ${warning}`)
if (failures.length) {
  console.error(`\n✖ ${failures.length} security issue(s) found:`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log('✔ No vulnerabilities, secrets or unsafe patterns found.')
