import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockFetch } from '@/test/fetch'
import { buildNewsApiUrls, mapNewsApiResponse, newsApiSource } from './newsapi'

const raw = (overrides = {}) => ({
  source: { id: 'reuters', name: 'Reuters' },
  author: 'Jane Doe',
  title: 'Headline',
  description: 'Desc',
  url: 'https://reuters.com/a',
  urlToImage: 'https://reuters.com/a.jpg',
  publishedAt: '2024-05-01T10:00:00Z',
  ...overrides,
})

afterEach(() => vi.unstubAllGlobals())

describe('buildNewsApiUrls', () => {
  it('uses /everything for keyword searches without a category', () => {
    const [url] = buildNewsApiUrls({ keyword: 'ai', from: '2024-05-01', categories: [], page: 1 })
    expect(url).toMatch(/^\/api\/newsapi\/everything\?/)
    expect(url).toContain('q=ai')
    expect(url).toContain('from=2024-05-01')
  })

  it('uses one /top-headlines request per category', () => {
    const urls = buildNewsApiUrls({ keyword: 'ai', categories: ['business', 'science'], page: 1 })
    expect(urls).toHaveLength(2)
    expect(urls[0]).toContain('top-headlines')
    expect(urls[0]).toContain('category=business')
    expect(urls[1]).toContain('category=science')
  })

  it('falls back to top headlines when nothing is specified', () => {
    expect(buildNewsApiUrls({ categories: [], page: 1 })).toEqual([
      '/api/newsapi/top-headlines?page=1&pageSize=12&country=us',
    ])
  })
})

describe('mapNewsApiResponse', () => {
  it('drops "[Removed]" placeholders and keeps the publisher name', () => {
    const page = mapNewsApiResponse({ totalResults: 2, articles: [raw(), raw({ title: '[Removed]' })] }, 1)
    expect(page.articles).toHaveLength(1)
    expect(page.articles[0]).toMatchObject({ publisher: 'Reuters', sourceId: 'newsapi', author: 'Jane Doe' })
    expect(page.hasMore).toBe(false)
  })
})

describe('newsApiSource', () => {
  it('applies the date range client-side for top-headlines', async () => {
    mockFetch({
      totalResults: 2,
      articles: [
        raw({ url: 'https://a.com/1', publishedAt: '2024-05-01T00:00:00Z' }),
        raw({ url: 'https://a.com/2', publishedAt: '2024-04-01T00:00:00Z' }),
      ],
    })
    const page = await newsApiSource.fetchArticles({ categories: ['business'], from: '2024-04-15', page: 1 })
    expect(page.articles.map((a) => a.url)).toEqual(['https://a.com/1'])
  })
})
