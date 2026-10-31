import { describe, expect, it } from 'vitest'
import { toSafeHttpUrl } from './url'

describe('toSafeHttpUrl', () => {
  it('keeps absolute http and https URLs', () => {
    expect(toSafeHttpUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1')
    expect(toSafeHttpUrl('http://example.com')).toBe('http://example.com/')
  })

  it('rejects script and data URLs (XSS payloads)', () => {
    expect(toSafeHttpUrl('javascript:alert(1)')).toBeUndefined()
    expect(toSafeHttpUrl('JaVaScRiPt:alert(1)')).toBeUndefined()
    expect(toSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(toSafeHttpUrl('vbscript:msgbox(1)')).toBeUndefined()
  })

  it('rejects relative, malformed and empty values', () => {
    expect(toSafeHttpUrl('/relative/path')).toBeUndefined()
    expect(toSafeHttpUrl('not a url')).toBeUndefined()
    expect(toSafeHttpUrl('')).toBeUndefined()
    expect(toSafeHttpUrl(undefined)).toBeUndefined()
  })
})
