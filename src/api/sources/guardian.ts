import type { ArticleQuery, Category } from '@/domain/article'
import { getJson } from '@/api/http'
import { cleanByline, toPlainText } from '@/lib/text'
import { PAGE_SIZE } from '@/config/constants'
import type { NewsSource, SourcePage } from './types'

// https://open-platform.theguardian.com/documentation/search
const SECTIONS: Record<Category, string> = {
  general: 'world',
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'society',
  sports: 'sport',
  entertainment: 'culture',
}

interface GuardianResponse {
  response: {
    currentPage: number
    pages: number
    results: {
      id: string
      webTitle: string
      webUrl: string
      webPublicationDate: string
      fields?: { thumbnail?: string; trailText?: string; byline?: string }
    }[]
  }
}

export function buildGuardianUrl(query: ArticleQuery): string {
  const params = new URLSearchParams({
    'page-size': String(PAGE_SIZE),
    page: String(query.page),
    'order-by': 'newest',
    'show-fields': 'thumbnail,trailText,byline',
  })
  if (query.keyword) params.set('q', query.keyword)
  if (query.from) params.set('from-date', query.from)
  if (query.to) params.set('to-date', query.to)
  if (query.categories.length) params.set('section', query.categories.map((c) => SECTIONS[c]).join('|'))
  return `/api/guardian/search?${params}`
}

export function mapGuardianResponse(json: GuardianResponse): SourcePage {
  const { results, currentPage, pages } = json.response
  return {
    hasMore: currentPage < pages,
    articles: results.map((r) => ({
      id: `guardian:${r.id}`,
      title: r.webTitle,
      description: toPlainText(r.fields?.trailText),
      url: r.webUrl,
      imageUrl: r.fields?.thumbnail,
      author: cleanByline(r.fields?.byline),
      publishedAt: r.webPublicationDate,
      sourceId: 'guardian',
      publisher: 'The Guardian',
    })),
  }
}

export const guardianSource: NewsSource = {
  id: 'guardian',
  label: 'The Guardian',
  async fetchArticles(query, signal) {
    return mapGuardianResponse(await getJson<GuardianResponse>(buildGuardianUrl(query), signal))
  },
}
