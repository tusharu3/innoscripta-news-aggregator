import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { aggregate, dedupeArticles } from '@/api/aggregator'
import { useNewsSources } from '@/app/providers/SourcesProvider'
import type { ArticleQuery, SourceId } from '@/domain/article'

export type ArticleFilters = Omit<ArticleQuery, 'page'>

/**
 * The single data hook behind both the search page and the personalised feed.
 *
 * TanStack Query's infinite query provides caching, request de-duplication, cancellation of
 * stale requests (via `signal`) and page-by-page loading, so there's no hand-written
 * fetching or pagination state anywhere in the UI.
 */
export function useArticles(sourceIds: readonly SourceId[], filters: ArticleFilters) {
  const allSources = useNewsSources()
  const sources = useMemo(() => {
    const selected = new Set(sourceIds)
    return allSources.filter((source) => selected.has(source.id))
  }, [allSources, sourceIds])

  const query = useInfiniteQuery({
    // Every input that changes the result is part of the key, so each combination is cached separately.
    queryKey: ['articles', sources.map((source) => source.id), filters],
    queryFn: ({ pageParam, signal }) => aggregate(sources, { ...filters, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
    enabled: sources.length > 0,
    // Keep showing the previous results while a new filter combination loads (no skeleton flash, no CLS).
    placeholderData: keepPreviousData,
  })

  const pages = query.data?.pages
  // Pages can overlap (providers shift as news is published), so de-duplicate across all of them.
  const articles = useMemo(() => dedupeArticles(pages?.flatMap((page) => page.articles) ?? []), [pages])
  // Failures from the latest page are the relevant ones (a source may recover on the next page).
  const failures = pages?.at(-1)?.failures ?? []

  return { ...query, articles, failures }
}

export type ArticlesResult = ReturnType<typeof useArticles>
