# Security

## Reporting

Found a vulnerability? Please open a private security advisory on GitHub rather than a public issue.

## Threat model and mitigations

| Threat                                      | Mitigation                                                                                                                                                              | Where                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| API key leakage                             | Keys live only in server-side env (Vite dev proxy / nginx at container start). They are never `VITE_*`-prefixed, so never bundled, and never baked into an image layer. | `vite.config.ts`, `docker/nginx.conf.template`, `Dockerfile`           |
| XSS through third-party news data           | Every article passes `sanitizeArticles`: only `http(s)` links and images survive. HTML snippets become plain text. No `dangerouslySetInnerHTML`.                        | `src/api/aggregator.ts`, `src/lib/url.ts`, `src/lib/text.ts`           |
| Script injection (defence in depth)         | Strict Content-Security-Policy: `script-src 'self'`, no inline or eval, `object-src 'none'`, `frame-ancestors 'none'`                                                   | `docker/security-headers.conf`                                         |
| Clickjacking, MIME sniffing, referrer leaks | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`                                                             | `docker/security-headers.conf`                                         |
| Proxy abuse (burning our API quota)         | GET-only, per-IP rate limit (5 r/s, burst 20, then 429), visitor cookies and auth stripped, fixed upstream hosts (no SSRF)                                              | `docker/api-proxy.conf`                                                |
| Reverse tabnabbing                          | `rel="noopener noreferrer"` on every external link (enforced by the scanner)                                                                                            | `ArticleCard.tsx`, `scripts/security-check.mjs`                        |
| Vulnerable dependencies                     | `npm audit` gate (prod: zero tolerance; dev: no high/critical), Dependabot weekly, targeted `overrides` instead of forced downgrades                                    | `scripts/security-check.mjs`, `.github/dependabot.yml`, `package.json` |
| Supply-chain install scripts                | `npm ci --ignore-scripts` in the Docker build                                                                                                                           | `Dockerfile`                                                           |
| Container breakout impact                   | Non-root `nginx-unprivileged` runtime, `server_tokens off`                                                                                                              | `Dockerfile`, nginx config                                             |
| Secrets committed by accident               | Pre-push hook + CI run the secret scanner. `.env` is ignored by git and Docker.                                                                                         | `.githooks/pre-push`, `.github/workflows/ci.yml`                       |

## Automated checks

```bash
npm run security
```

This runs the dependency audit, secret scan, forbidden-file check, unsafe-code scan and ignore-file check. It runs automatically:

- **before every `git push`** (`.githooks/pre-push`, enabled by `npm install`)
- **in CI** on every push and pull request

For a deeper manual review (threats a regex can't see), use the `security-auditor` agent in Claude Code, or the `/pre-push` command.

## Known limitations

- HSTS and TLS belong on the HTTPS proxy or CDN in front of the container. The container itself serves plain HTTP.
- Upstream TLS certificate verification (`proxy_ssl_verify`) is not enabled yet, because the CA bundle path in the image hasn't been verified.
- Anyone who can reach the app can use its API proxy within the rate limit. That's inherent to a public client-side app using server-held keys. Add authentication or a stricter quota if the app becomes public.
