import type { Article, ArticleQuery } from '@/domain/article'
import { isWithinRange } from '@/lib/dates'

export type ArticleMatcher = (article: Article) => boolean

/**
 * Builds a reusable predicate for client-side filtering, used by providers that can't filter
 * server-side (BBC RSS has no search; NewsAPI top-headlines has no date range).
 *
 * The keyword is normalised once when the matcher is created, so filtering n articles is
 * O(n · L) (L = text length) with no repeated work per article.
 */
export function createQueryMatcher({
  keyword,
  from,
  to,
}: Pick<ArticleQuery, 'keyword' | 'from' | 'to'>): ArticleMatcher {
  const needle = keyword?.trim().toLowerCase()

  return (article) => {
    if (!isWithinRange(article.publishedAt, from, to)) return false
    if (!needle) return true
    return (
      article.title.toLowerCase().includes(needle) ||
      (article.description?.toLowerCase().includes(needle) ?? false)
    )
  }
}
