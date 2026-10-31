import { describe, expect, it } from 'vitest'
import { buildNytUrl, mapNytResponse } from './nyt'

const doc = {
  _id: 'nyt://article/1',
  web_url: 'https://www.nytimes.com/2024/05/01/tech/story.html',
  headline: { main: 'NYT story' },
  abstract: 'Abstract',
  pub_date: '2024-05-01T10:00:00+0000',
  byline: { original: 'By Jane Doe' },
  source: 'The New York Times',
}

describe('buildNytUrl', () => {
  it('uses 0-based pages, compact dates and a section filter', () => {
    const url = new URL(
      buildNytUrl({
        keyword: 'ai',
        from: '2024-05-01',
        to: '2024-05-31',
        categories: ['business', 'health'],
        page: 1,
      }),
      'http://x',
    )
    expect(url.pathname).toBe('/api/nyt/search/v2/articlesearch.json')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.get('begin_date')).toBe('20240501')
    expect(url.searchParams.get('end_date')).toBe('20240531')
    expect(url.searchParams.get('fq')).toBe('section_name:("Business" "Health")')
  })
})

describe('mapNytResponse', () => {
  it('normalises docs and strips "By" from bylines', () => {
    const [article] = mapNytResponse({ response: { docs: [doc], meta: { hits: 1, offset: 0 } } }).articles
    expect(article).toMatchObject({
      id: 'nyt:nyt://article/1',
      title: 'NYT story',
      author: 'Jane Doe',
      publishedAt: '2024-05-01T10:00:00.000Z',
      sourceId: 'nyt',
    })
  })

  it('supports the legacy multimedia array with relative URLs', () => {
    const [article] = mapNytResponse({
      response: { docs: [{ ...doc, multimedia: [{ url: 'images/2024/x.jpg' }] }] },
    }).articles
    expect(article.imageUrl).toBe('https://www.nytimes.com/images/2024/x.jpg')
  })

  it('supports the current multimedia object shape', () => {
    const [article] = mapNytResponse({
      response: { docs: [{ ...doc, multimedia: { default: { url: 'https://static01.nyt.com/x.jpg' } } }] },
    }).articles
    expect(article.imageUrl).toBe('https://static01.nyt.com/x.jpg')
  })

  it('handles a null docs array (no results)', () => {
    expect(mapNytResponse({ response: { docs: null } })).toEqual({ articles: [], hasMore: false })
  })

  it('has more only when a full page came back and hits remain', () => {
    const docs = Array.from({ length: 10 }, (_, i) => ({ ...doc, _id: String(i) }))
    expect(mapNytResponse({ response: { docs, meta: { hits: 25, offset: 0 } } }).hasMore).toBe(true)
    expect(mapNytResponse({ response: { docs, meta: { hits: 10, offset: 0 } } }).hasMore).toBe(false)
  })
})
