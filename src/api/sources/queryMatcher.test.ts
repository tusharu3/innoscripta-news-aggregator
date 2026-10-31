import { describe, expect, it } from 'vitest'
import { makeArticle } from '@/test/fakes'
import { createQueryMatcher } from './queryMatcher'

describe('createQueryMatcher', () => {
  const article = makeArticle({
    title: 'Climate talks resume',
    description: 'Leaders meet in Bonn',
    publishedAt: '2024-05-10T12:00:00Z',
  })

  it('matches everything when the query is empty', () => {
    expect(createQueryMatcher({})(article)).toBe(true)
  })

  it('matches the keyword case-insensitively in title or description', () => {
    expect(createQueryMatcher({ keyword: '  CLIMATE ' })(article)).toBe(true)
    expect(createQueryMatcher({ keyword: 'bonn' })(article)).toBe(true)
    expect(createQueryMatcher({ keyword: 'football' })(article)).toBe(false)
  })

  it('applies the inclusive date range', () => {
    expect(createQueryMatcher({ from: '2024-05-10', to: '2024-05-10' })(article)).toBe(true)
    expect(createQueryMatcher({ from: '2024-05-11' })(article)).toBe(false)
  })

  it('handles articles without a description', () => {
    expect(createQueryMatcher({ keyword: 'leaders' })({ ...article, description: undefined })).toBe(false)
  })
})
