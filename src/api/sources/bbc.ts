import type { Article, ArticleQuery, Category } from '@/domain/article'
import { getText } from '@/api/http'
import { toPlainText } from '@/lib/text'
import { createQueryMatcher } from './queryMatcher'
import type { NewsSource, SourcePage } from './types'

// BBC News has no public search API, but publishes free RSS feeds per section (no key needed).
// Keyword and date filtering therefore happen client-side, and there is a single page per feed.
const FEEDS: Record<Category, string> = {
  general: 'news/rss.xml',
  business: 'news/business/rss.xml',
  technology: 'news/technology/rss.xml',
  science: 'news/science_and_environment/rss.xml',
  health: 'news/health/rss.xml',
  sports: 'sport/rss.xml',
  entertainment: 'news/entertainment_and_arts/rss.xml',
}

const MEDIA_NS = 'http://search.yahoo.com/mrss/'

/** Feeds ship 240px thumbnails; BBC's image CDN serves the same picture at any width in the path. */
function upscaleThumbnail(url: string | null | undefined): string | undefined {
  return url?.replace('/standard/240/', '/standard/640/') ?? undefined
}

export function buildBbcUrls(query: ArticleQuery): string[] {
  const categories: Category[] = query.categories.length ? query.categories : ['general']
  return categories.map((c) => `/api/bbc/${FEEDS[c]}`)
}

export function parseBbcFeed(xml: string): Article[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return Array.from(doc.getElementsByTagName('item')).flatMap((item) => {
    const text = (tag: string) => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? ''
    const url = text('link')
    const title = text('title')
    const date = new Date(text('pubDate'))
    if (!url || !title || Number.isNaN(date.getTime())) return []
    return [
      {
        id: `bbc:${url}`,
        title,
        description: toPlainText(text('description')),
        url,
        imageUrl: upscaleThumbnail(
          item.getElementsByTagNameNS(MEDIA_NS, 'thumbnail')[0]?.getAttribute('url'),
        ),
        publishedAt: date.toISOString(),
        sourceId: 'bbc' as const,
        publisher: 'BBC News',
      },
    ]
  })
}

export const bbcSource: NewsSource = {
  id: 'bbc',
  label: 'BBC News',
  async fetchArticles(query, signal): Promise<SourcePage> {
    if (query.page > 1) return { articles: [], hasMore: false }
    const feeds = await Promise.all(buildBbcUrls(query).map((url) => getText(url, signal)))
    return {
      hasMore: false,
      articles: feeds.flatMap(parseBbcFeed).filter(createQueryMatcher(query)),
    }
  },
}
