import type { ArticleQuery } from '@/domain/article'
import { getJson } from '@/api/http'
import { PAGE_SIZE } from '@/config/constants'
import { createQueryMatcher } from './queryMatcher'
import type { NewsSource, SourcePage } from './types'

// https://newsapi.org/docs/endpoints
// `/everything` supports keyword + dates but not categories; `/top-headlines` supports one category but not dates.

interface NewsApiResponse {
  totalResults: number
  articles: {
    source: { id: string | null; name: string }
    author: string | null
    title: string
    description: string | null
    url: string
    urlToImage: string | null
    publishedAt: string
  }[]
}

/** One URL per category (top-headlines takes a single category), or one URL when no category is set. */
export function buildNewsApiUrls(query: ArticleQuery): string[] {
  const paging = { page: String(query.page), pageSize: String(PAGE_SIZE) }

  if (query.categories.length === 0 && query.keyword) {
    const params = new URLSearchParams({ ...paging, q: query.keyword, sortBy: 'publishedAt', language: 'en' })
    if (query.from) params.set('from', query.from)
    if (query.to) params.set('to', query.to)
    return [`/api/newsapi/everything?${params}`]
  }

  const categories = query.categories.length ? query.categories : [undefined]
  return categories.map((category) => {
    const params = new URLSearchParams({ ...paging, country: 'us' })
    if (category) params.set('category', category)
    if (query.keyword) params.set('q', query.keyword)
    return `/api/newsapi/top-headlines?${params}`
  })
}

export function mapNewsApiResponse(json: NewsApiResponse, page: number): SourcePage {
  return {
    hasMore: page * PAGE_SIZE < json.totalResults,
    articles: json.articles
      .filter((a) => a.title !== '[Removed]')
      .map((a) => ({
        id: `newsapi:${a.url}`,
        title: a.title,
        description: a.description ?? undefined,
        url: a.url,
        imageUrl: a.urlToImage ?? undefined,
        author: a.author ?? undefined,
        publishedAt: a.publishedAt,
        sourceId: 'newsapi',
        publisher: a.source.name,
      })),
  }
}

export const newsApiSource: NewsSource = {
  id: 'newsapi',
  label: 'NewsAPI',
  async fetchArticles(query, signal) {
    const responses = await Promise.all(
      buildNewsApiUrls(query).map((url) => getJson<NewsApiResponse>(url, signal)),
    )
    const pages = responses.map((json) => mapNewsApiResponse(json, query.page))
    return {
      hasMore: pages.some((p) => p.hasMore),
      // top-headlines ignores dates, so apply them here (a no-op for /everything).
      articles: pages
        .flatMap((p) => p.articles)
        .filter(createQueryMatcher({ from: query.from, to: query.to })),
    }
  },
}
