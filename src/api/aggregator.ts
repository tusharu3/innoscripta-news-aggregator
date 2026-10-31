import type { NewsSource } from '@/api/sources/types'
import type { Article, ArticleQuery, SourceId } from '@/domain/article'
import { toSafeHttpUrl } from '@/lib/url'
import { describeError } from './http'

export interface SourceFailure {
  sourceId: SourceId
  label: string
  message: string
}

export interface AggregatedPage {
  articles: Article[]
  hasMore: boolean
  failures: SourceFailure[]
}

/** URL without query string, hash or trailing slash — the same story syndicated twice dedupes. */
function canonicalUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}${u.pathname.replace(/\/$/, '')}`.toLowerCase()
  } catch {
    return url
  }
}

/** Drops later duplicates, keeping the original order. */
export function dedupeArticles(articles: Article[]): Article[] {
  const seen = new Set<string>()
  return articles.filter((article) => {
    const key = canonicalUrl(article.url)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Security boundary for provider data: every article passes through here before reaching the UI.
 * Articles without a safe http(s) link are dropped; unsafe image URLs are removed (card shows its placeholder).
 */
export function sanitizeArticles(articles: Article[]): Article[] {
  const safe: Article[] = []
  for (const article of articles) {
    const url = toSafeHttpUrl(article.url)
    if (url) safe.push({ ...article, url, imageUrl: toSafeHttpUrl(article.imageUrl) })
  }
  return safe
}

/** Sanitises, de-duplicates and sorts newest-first: O(n log n) for the sort, O(n) for the rest. */
export function mergeArticles(lists: Article[][]): Article[] {
  return dedupeArticles(sanitizeArticles(lists.flat())).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  )
}

/**
 * Queries every source in parallel. One slow or broken provider never blocks the others:
 * successes are merged newest-first, failures are reported alongside so the UI can explain them.
 */
export async function aggregate(
  sources: readonly NewsSource[],
  query: ArticleQuery,
  signal?: AbortSignal,
): Promise<AggregatedPage> {
  const results = await Promise.allSettled(sources.map((source) => source.fetchArticles(query, signal)))

  const lists: Article[][] = []
  const failures: SourceFailure[] = []
  let hasMore = false

  results.forEach((result, index) => {
    const source = sources[index]
    if (result.status === 'fulfilled') {
      lists.push(result.value.articles)
      hasMore ||= result.value.hasMore
    } else {
      failures.push({ sourceId: source.id, label: source.label, message: describeError(result.reason) })
    }
  })

  return { articles: mergeArticles(lists), hasMore, failures }
}
