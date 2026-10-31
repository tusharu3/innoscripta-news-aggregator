import { useMemo } from 'react'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { APP_NAME, SEARCH_DEBOUNCE_MS } from '@/config/constants'
import { ArticleResults } from '@/features/articles/components/ArticleResults/ArticleResults'
import { useArticles, type ArticleFilters } from '@/features/articles/hooks/useArticles'
import { FilterBar } from '@/features/search/components/FilterBar/FilterBar'
import { useSearchFilters } from '@/features/search/hooks/useSearchFilters'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/** /search: keyword search with category, date and source filters. Lazy-loaded route. */
export function SearchPage() {
  const { filters, update, clear } = useSearchFilters()
  // The input updates the URL on every keystroke (instant feedback); only the request is debounced.
  const keyword = useDebouncedValue(filters.keyword.trim(), SEARCH_DEBOUNCE_MS)

  // Memoised so the query key object is stable between renders with the same filters.
  const query = useMemo<ArticleFilters>(
    () => ({
      keyword: keyword || undefined,
      categories: filters.category ? [filters.category] : [],
      from: filters.from,
      to: filters.to,
    }),
    [keyword, filters.category, filters.from, filters.to],
  )
  const result = useArticles(filters.sources, query)

  return (
    <>
      {/* React 19 hoists <title> into <head>: every route gets a unique page title (WCAG 2.4.2). */}
      <title>
        {filters.keyword ? `“${filters.keyword}” · Search · ${APP_NAME}` : `Search · ${APP_NAME}`}
      </title>
      <PageHeader
        eyebrow="Search across every source"
        title="Find the"
        highlight="stories that matter"
        description="Search The Guardian, The New York Times, NewsAPI and BBC News at once, then narrow by date, category and source."
      />

      <FilterBar filters={filters} onChange={update} onClear={clear} />

      {filters.sources.length === 0 ? (
        <EmptyState>Select at least one source to see results.</EmptyState>
      ) : (
        <ArticleResults
          result={result}
          heading="Search results"
          empty="No articles match these filters. Try a broader search."
        />
      )}
    </>
  )
}
