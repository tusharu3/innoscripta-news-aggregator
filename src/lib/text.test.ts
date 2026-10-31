import { describe, expect, it } from 'vitest'
import { cleanByline, toPlainText } from './text'

describe('toPlainText', () => {
  it('strips tags and decodes entities', () => {
    expect(toPlainText('<strong>Tom &amp; Jerry</strong> isn&#39;t here')).toBe("Tom & Jerry isn't here")
  })

  it('returns undefined for empty input', () => {
    expect(toPlainText('')).toBeUndefined()
    expect(toPlainText('<p> </p>')).toBeUndefined()
  })
})

describe('cleanByline', () => {
  it('removes a leading "By"', () => {
    expect(cleanByline('By Jane Doe')).toBe('Jane Doe')
    expect(cleanByline('Jane Doe')).toBe('Jane Doe')
    expect(cleanByline(null)).toBeUndefined()
  })
})
