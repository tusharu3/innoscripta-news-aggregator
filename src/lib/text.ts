/** Strips tags and decodes entities (`&#39;`, `&amp;`, ...) from provider-supplied HTML snippets. */
export function toPlainText(html: string | undefined | null): string | undefined {
  if (!html) return undefined
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim()
  return text || undefined
}

/** "By Jane Doe and John Roe" -> "Jane Doe and John Roe". */
export function cleanByline(byline: string | undefined | null): string | undefined {
  const name = byline?.replace(/^by\s+/i, '').trim()
  return name || undefined
}
