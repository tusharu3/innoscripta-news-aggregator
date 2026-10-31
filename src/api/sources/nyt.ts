import type { ArticleQuery, Category } from '@/domain/article'
import { toCompactDate } from '@/lib/dates'
import { getJson } from '@/api/http'
import { cleanByline } from '@/lib/text'
import type { NewsSource, SourcePage } from './types'

// https://developer.nytimes.com/docs/articlesearch-product/1/overview — fixed 10 results per page, 0-based.
const NYT_PAGE_SIZE = 10

const SECTIONS: Record<Category, string> = {
  general: 'World',
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  sports: 'Sports',
  entertainment: 'Arts',
}

/** Older responses use a relative-URL array, newer ones an object with absolute URLs. */
type NytMultimedia = { url?: string }[] | { default?: { url?: string }; thumbnail?: { url?: string } } | null

interface NytResponse {
  response: {
    docs:
      | {
          _id: string
          web_url: string
          headline: { main: string }
          abstract?: string
          snippet?: string
          pub_date: string
          byline?: { original?: string | null }
          source?: string
          multimedia?: NytMultimedia
        }[]
      | null
    meta?: { hits: number; offset: number }
  }
}

function imageFrom(multimedia: NytMultimedia | undefined): string | undefined {
  if (Array.isArray(multimedia)) {
    const url = multimedia.find((m) => m.url)?.url
    if (!url) return undefined
    return url.startsWith('http') ? url : `https://www.nytimes.com/${url}`
  }
  return multimedia?.default?.url ?? multimedia?.thumbnail?.url
}

export function buildNytUrl(query: ArticleQuery): string {
  const params = new URLSearchParams({ sort: 'newest', page: String(query.page - 1) })
  if (query.keyword) params.set('q', query.keyword)
  if (query.from) params.set('begin_date', toCompactDate(query.from))
  if (query.to) params.set('end_date', toCompactDate(query.to))
  if (query.categories.length) {
    params.set('fq', `section_name:(${query.categories.map((c) => `"${SECTIONS[c]}"`).join(' ')})`)
  }
  return `/api/nyt/search/v2/articlesearch.json?${params}`
}

export function mapNytResponse(json: NytResponse): SourcePage {
  const docs = json.response.docs ?? []
  const meta = json.response.meta
  return {
    // A short page means we reached the end, even if `hits` says otherwise.
    hasMore: docs.length === NYT_PAGE_SIZE && (!meta || meta.offset + docs.length < meta.hits),
    articles: docs.map((d) => ({
      id: `nyt:${d._id}`,
      title: d.headline.main,
      description: d.abstract || d.snippet || undefined,
      url: d.web_url,
      imageUrl: imageFrom(d.multimedia),
      author: cleanByline(d.byline?.original),
      publishedAt: new Date(d.pub_date).toISOString(),
      sourceId: 'nyt',
      publisher: d.source || 'The New York Times',
    })),
  }
}

export const nytSource: NewsSource = {
  id: 'nyt',
  label: 'The New York Times',
  async fetchArticles(query, signal) {
    return mapNytResponse(await getJson<NytResponse>(buildNytUrl(query), signal))
  },
}
