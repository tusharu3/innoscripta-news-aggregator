import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockFetch } from '@/test/fetch'
import { bbcSource, buildBbcUrls, parseBbcFeed } from './bbc'

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:media="http://search.yahoo.com/mrss/" version="2.0"><channel>
  <item>
    <title><![CDATA[Climate talks resume]]></title>
    <description><![CDATA[Leaders meet again.]]></description>
    <link>https://www.bbc.co.uk/news/articles/1</link>
    <pubDate>Wed, 01 May 2024 10:00:00 GMT</pubDate>
    <media:thumbnail width="240" height="135" url="https://ichef.bbci.co.uk/ace/standard/240/cpsprodpb/1.jpg"/>
  </item>
  <item>
    <title><![CDATA[Football final]]></title>
    <description><![CDATA[A late winner.]]></description>
    <link>https://www.bbc.co.uk/sport/2</link>
    <pubDate>Tue, 30 Apr 2024 10:00:00 GMT</pubDate>
  </item>
  <item><title>Broken item without link</title></item>
</channel></rss>`

afterEach(() => vi.unstubAllGlobals())

describe('buildBbcUrls', () => {
  it('uses the top-stories feed when no category is chosen', () => {
    expect(buildBbcUrls({ categories: [], page: 1 })).toEqual(['/api/bbc/news/rss.xml'])
  })

  it('uses one feed per category', () => {
    expect(buildBbcUrls({ categories: ['sports', 'technology'], page: 1 })).toEqual([
      '/api/bbc/sport/rss.xml',
      '/api/bbc/news/technology/rss.xml',
    ])
  })
})

describe('parseBbcFeed', () => {
  it('parses items, thumbnails and dates and skips malformed items', () => {
    const articles = parseBbcFeed(feed)
    expect(articles).toHaveLength(2)
    expect(articles[0]).toEqual({
      id: 'bbc:https://www.bbc.co.uk/news/articles/1',
      title: 'Climate talks resume',
      description: 'Leaders meet again.',
      url: 'https://www.bbc.co.uk/news/articles/1',
      imageUrl: 'https://ichef.bbci.co.uk/ace/standard/640/cpsprodpb/1.jpg',
      publishedAt: '2024-05-01T10:00:00.000Z',
      sourceId: 'bbc',
      publisher: 'BBC News',
    })
    expect(articles[1].imageUrl).toBeUndefined()
  })
})

describe('bbcSource', () => {
  it('filters by keyword and date client-side', async () => {
    mockFetch(feed)
    const page = await bbcSource.fetchArticles({ keyword: 'CLIMATE', categories: [], page: 1 })
    expect(page.articles.map((a) => a.title)).toEqual(['Climate talks resume'])

    const dated = await bbcSource.fetchArticles({ categories: [], to: '2024-04-30', page: 1 })
    expect(dated.articles.map((a) => a.title)).toEqual(['Football final'])
  })

  it('has a single page', async () => {
    const fetchMock = mockFetch(feed)
    expect(await bbcSource.fetchArticles({ categories: [], page: 2 })).toEqual({
      articles: [],
      hasMore: false,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
