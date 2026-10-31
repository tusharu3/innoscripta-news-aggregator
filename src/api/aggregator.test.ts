import { describe, expect, it } from 'vitest'
import { HttpError } from './http'
import { createFakeSource, makeArticle } from '@/test/fakes'
import { aggregate, mergeArticles, sanitizeArticles } from './aggregator'

const query = { categories: [], page: 1 }

describe('mergeArticles', () => {
  it('sorts newest first and removes the same story syndicated under different URLs', () => {
    const older = makeArticle({ url: 'https://site.com/story?utm=a', publishedAt: '2024-05-01T00:00:00Z' })
    const newer = makeArticle({ url: 'https://other.com/x', publishedAt: '2024-05-02T00:00:00Z' })
    const dupe = makeArticle({ url: 'https://SITE.com/story/', publishedAt: '2024-05-01T00:00:00Z' })
    expect(mergeArticles([[older], [newer, dupe]])).toEqual([newer, older])
  })
})

describe('sanitizeArticles (security boundary)', () => {
  it('drops articles whose link is not http(s) and strips unsafe images', () => {
    const malicious = makeArticle({ url: 'javascript:alert(document.cookie)' })
    const badImage = makeArticle({ url: 'https://ok.example/a', imageUrl: 'javascript:alert(1)' })
    const result = sanitizeArticles([malicious, badImage])
    expect(result).toHaveLength(1)
    expect(result[0].url).toBe('https://ok.example/a')
    expect(result[0].imageUrl).toBeUndefined()
  })
})

describe('aggregate', () => {
  it('queries every source with the same query and merges results', async () => {
    const a = createFakeSource('guardian', () => ({
      articles: [makeArticle({ publishedAt: '2024-05-01T00:00:00Z' })],
      hasMore: false,
    }))
    const b = createFakeSource('bbc', () => ({
      articles: [makeArticle({ publishedAt: '2024-05-03T00:00:00Z' })],
      hasMore: true,
    }))

    const result = await aggregate([a, b], query)

    expect(a.fetchArticles).toHaveBeenCalledWith(query, undefined)
    expect(b.fetchArticles).toHaveBeenCalledWith(query, undefined)
    expect(result.articles.map((x) => x.publishedAt)).toEqual([
      '2024-05-03T00:00:00Z',
      '2024-05-01T00:00:00Z',
    ])
    expect(result.hasMore).toBe(true)
    expect(result.failures).toEqual([])
  })

  it('keeps successful results when a source fails and explains the failure', async () => {
    const ok = createFakeSource('guardian', () => ({ articles: [makeArticle()], hasMore: false }))
    const broken = createFakeSource(
      'nyt',
      () => {
        throw new HttpError(401, 'Unauthorized')
      },
      'The New York Times',
    )

    const result = await aggregate([ok, broken], query)

    expect(result.articles).toHaveLength(1)
    expect(result.failures).toEqual([
      { sourceId: 'nyt', label: 'The New York Times', message: 'API key missing or invalid.' },
    ])
  })
})
