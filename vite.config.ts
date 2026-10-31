import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin, type ProxyOptions } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Dev-server mirror of docker/nginx.conf.template.
 * The browser only ever calls same-origin `/api/<source>/...`; the proxy attaches API keys,
 * so keys never end up in the JS bundle (note: no `VITE_` prefix on purpose).
 */
function withQueryKey(prefix: string, key: string) {
  return (path: string) => {
    const stripped = path.replace(prefix, '')
    const sep = stripped.includes('?') ? '&' : '?'
    return `${stripped}${sep}api-key=${encodeURIComponent(key)}`
  }
}

function buildProxy(env: Record<string, string>): Record<string, ProxyOptions> {
  return {
    '/api/guardian': {
      target: 'https://content.guardianapis.com',
      changeOrigin: true,
      rewrite: withQueryKey('/api/guardian', env.GUARDIAN_API_KEY ?? ''),
    },
    '/api/nyt': {
      target: 'https://api.nytimes.com/svc',
      changeOrigin: true,
      rewrite: withQueryKey('/api/nyt', env.NYT_API_KEY ?? ''),
    },
    '/api/newsapi': {
      target: 'https://newsapi.org/v2',
      changeOrigin: true,
      rewrite: (path) => path.replace('/api/newsapi', ''),
      headers: { 'X-Api-Key': env.NEWSAPI_API_KEY ?? '' },
    },
    '/api/bbc': {
      target: 'https://feeds.bbci.co.uk',
      changeOrigin: true,
      rewrite: (path) => path.replace('/api/bbc', ''),
    },
  }
}

/**
 * Injects <link rel="preload"> for the two Poppins files used above the fold (400 body, 600 headings).
 * The browser fetches them in parallel with the JS instead of after the CSS is parsed, so headline
 * text paints in the brand font sooner (LCP) and doesn't swap late.
 */
function preloadCriticalFonts(): Plugin {
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        return Object.keys(bundle ?? {})
          .filter((file) => /poppins-latin-(400|600)-normal-.*\.woff2$/.test(file))
          .map((file) => ({
            tag: 'link',
            attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head' as const,
          }))
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  // '' prefix => load all vars from .env, not only VITE_*. They are used here (Node), never in client code.
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = buildProxy(env)

  return {
    plugins: [react(), preloadCriticalFonts()],
    // `@/` = `src/`, so imports read the same from any folder depth (mirrored in tsconfig.app.json).
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    css: {
      modules: {
        // BEM names are kept as written (`article-card__title`) and read via `bem()` in TSX.
        // Dev keeps them readable in DevTools; production shortens them to hashes.
        generateScopedName: mode === 'production' ? '[hash:base64:6]' : '[local]_[hash:base64:4]',
      },
      preprocessorOptions: {
        // Lets every module write `@use 'abstracts' as *;` without relative paths.
        scss: { loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))] },
      },
    },
    server: { proxy },
    preview: { proxy },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})
