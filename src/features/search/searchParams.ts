import { CATEGORIES, type Category, type SourceId } from '@/domain/article'

/**
 * Search filters live in the URL (not component state), so results are shareable,
 * bookmarkable and survive refresh / back-forward navigation.
 */
export interface SearchFilters {
  keyword: string
  category?: Category
  from?: string
  to?: string
  sources: SourceId[]
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const asDate = (value: string | null) => (value && ISO_DATE.test(value) ? value : undefined)

/** Parses untrusted URL params; anything invalid falls back to its default. */
export function parseSearchParams(params: URLSearchParams, allSources: readonly SourceId[]): SearchFilters {
  const category = params.get('category')
  const sources = params
    .get('sources')
    ?.split(',')
    .filter((s): s is SourceId => allSources.includes(s as SourceId))

  return {
    keyword: params.get('q') ?? '',
    category: CATEGORIES.includes(category as Category) ? (category as Category) : undefined,
    from: asDate(params.get('from')),
    to: asDate(params.get('to')),
    sources: sources ?? [...allSources],
  }
}

/** Inverse of `parseSearchParams`; omits defaults to keep URLs short. */
export function toSearchParams(filters: SearchFilters, allSources: readonly SourceId[]): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.keyword) params.set('q', filters.keyword)
  if (filters.category) params.set('category', filters.category)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  const allSelected = allSources.every((s) => filters.sources.includes(s))
  if (!allSelected) params.set('sources', filters.sources.join(','))
  return params
}
