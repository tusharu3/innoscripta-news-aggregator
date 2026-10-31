import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useNewsSources } from '@/app/providers/SourcesProvider'
import { parseSearchParams, toSearchParams, type SearchFilters } from '@/features/search/searchParams'

/**
 * Search filters live in the URL (single source of truth): shareable links, refresh-safe,
 * and the back button works. This hook parses them (validated) and writes patches back.
 */
export function useSearchFilters() {
  const [params, setParams] = useSearchParams()
  const sources = useNewsSources()
  const sourceIds = useMemo(() => sources.map((source) => source.id), [sources])

  const filters = useMemo(() => parseSearchParams(params, sourceIds), [params, sourceIds])

  const update = useCallback(
    (patch: Partial<SearchFilters>) =>
      // `replace` keeps each keystroke from adding a history entry.
      setParams(toSearchParams({ ...filters, ...patch }, sourceIds), { replace: true }),
    [filters, sourceIds, setParams],
  )

  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])

  return { filters, update, clear }
}
