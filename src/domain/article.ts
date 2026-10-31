/**
 * Source-agnostic domain model. Every adapter maps its provider's response into these types,
 * so nothing outside `src/api/sources/` knows what a Guardian or NYT payload looks like.
 */

export const CATEGORIES = [
  'general',
  'business',
  'technology',
  'science',
  'health',
  'sports',
  'entertainment',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Every supported provider. The union type is derived from this list, so they can't drift apart. */
export const SOURCE_IDS = ['guardian', 'nyt', 'newsapi', 'bbc'] as const

export type SourceId = (typeof SOURCE_IDS)[number]

export interface Article {
  /** Stable, unique across sources (used as React key and for de-duplication). */
  id: string
  title: string
  description?: string
  url: string
  imageUrl?: string
  author?: string
  /** ISO-8601 timestamp. */
  publishedAt: string
  sourceId: SourceId
  /** The outlet that published it, e.g. "BBC News" or, for NewsAPI, "Reuters". */
  publisher: string
}

export interface ArticleQuery {
  keyword?: string
  /** Empty means "any category". */
  categories: Category[]
  /** Inclusive, `YYYY-MM-DD`. */
  from?: string
  /** Inclusive, `YYYY-MM-DD`. */
  to?: string
  /** 1-based. */
  page: number
}
