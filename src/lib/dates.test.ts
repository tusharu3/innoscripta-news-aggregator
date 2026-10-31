import { describe, expect, it } from 'vitest'
import { formatPublished, isWithinRange, toCompactDate } from './dates'

describe('isWithinRange', () => {
  const ts = '2024-05-10T23:30:00Z'

  it('accepts anything when no bounds are given', () => {
    expect(isWithinRange(ts)).toBe(true)
  })

  it('treats both bounds as inclusive calendar days', () => {
    expect(isWithinRange(ts, '2024-05-10', '2024-05-10')).toBe(true)
  })

  it('rejects dates outside the range', () => {
    expect(isWithinRange(ts, '2024-05-11')).toBe(false)
    expect(isWithinRange(ts, undefined, '2024-05-09')).toBe(false)
  })
})

describe('toCompactDate', () => {
  it('formats for the NYT API', () => {
    expect(toCompactDate('2024-01-31')).toBe('20240131')
  })
})

describe('formatPublished', () => {
  const now = new Date('2024-05-10T12:00:00Z')

  it('uses relative time for recent articles', () => {
    expect(formatPublished('2024-05-10T11:55:00Z', now)).toBe('5 minutes ago')
    expect(formatPublished('2024-05-10T09:00:00Z', now)).toBe('3 hours ago')
    expect(formatPublished('2024-05-09T12:00:00Z', now)).toBe('yesterday')
  })

  it('uses an absolute date for anything older than a week', () => {
    expect(formatPublished('2024-03-03T12:00:00Z', now)).toBe('Mar 3, 2024')
  })
})
