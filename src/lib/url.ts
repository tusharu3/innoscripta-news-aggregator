/**
 * Returns the URL only if it is an absolute http(s) URL, otherwise undefined.
 *
 * Article links and images come from third-party feeds and are rendered into `href`/`src`.
 * Whitelisting the protocol blocks `javascript:`, `data:` and `vbscript:` payloads (XSS) even
 * though React 19 already refuses `javascript:` hrefs — defence in depth at the data boundary.
 */
export function toSafeHttpUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  } catch {
    return undefined // relative or malformed
  }
}
