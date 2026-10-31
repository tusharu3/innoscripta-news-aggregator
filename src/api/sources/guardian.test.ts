import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockFetch } from '@/test/fetch'
import { buildGuardianUrl, guardianSource, mapGuardianResponse } from './guardian'

const response = {
  response: {
    currentPage: 1,
    pages: 3,
    results: [
      {
        id: 'world/2024/may/01/story',
        webTitle: 'A story',
        webUrl: 'https://www.theguardian.com/world/2024/may/01/story',
        webPublicationDate: '2024-05-01T10:00:00Z',
        fields: {
          thumbnail: 'https://i.guim.co.uk/x.jpg',
          trailText: '<p>Trail &amp; more</p>',
          byline: 'Jane Doe',
        },
      },
    ],
  },
}

afterEach(() => vi.unstubAllGlobals())

describe('buildGuardianUrl', () => {
  it('maps keyword, dates and categories to Guardian params', () => {
    const url = new URL(
      buildGuardianUrl({
        keyword: 'ai',
        from: '2024-05-01',
        to: '2024-05-31',
        categories: ['technology', 'sports'],
        page: 2,
      }),
      'http://x',
    )
    expect(url.pathname).toBe('/api/guardian/search')
    expect(url.searchParams.get('q')).toBe('ai')
    expect(url.searchParams.get('from-date')).toBe('2024-05-01')
    expect(url.searchParams.get('to-date')).toBe('2024-05-31')
    expect(url.searchParams.get('section')).toBe('technology|sport')
    expect(url.searchParams.get('page')).toBe('2')
  })

  it('omits optional params when not set', () => {
    const url = new URL(buildGuardianUrl({ categories: [], page: 1 }), 'http://x')
    expect(url.searchParams.has('q')).toBe(false)
    expect(url.searchParams.has('section')).toBe(false)
  })
})

describe('mapGuardianResponse', () => {
  it('normalises results into articles', () => {
    const page = mapGuardianResponse(response)
    expect(page.hasMore).toBe(true)
    expect(page.articles[0]).toEqual({
      id: 'guardian:world/2024/may/01/story',
      title: 'A story',
      description: 'Trail & more',
      url: 'https://www.theguardian.com/world/2024/may/01/story',
      imageUrl: 'https://i.guim.co.uk/x.jpg',
      author: 'Jane Doe',
      publishedAt: '2024-05-01T10:00:00Z',
      sourceId: 'guardian',
      publisher: 'The Guardian',
    })
  })

  it('reports no more pages on the last page', () => {
    expect(mapGuardianResponse({ response: { ...response.response, currentPage: 3 } }).hasMore).toBe(false)
  })
})

describe('guardianSource', () => {
  it('surfaces HTTP failures with their status', async () => {
    mockFetch({ message: 'Unauthorized' }, { status: 401 })
    await expect(guardianSource.fetchArticles({ categories: [], page: 1 })).rejects.toMatchObject({
      status: 401,
    })
  })
})
