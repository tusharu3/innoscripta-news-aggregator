import { QueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME_MS } from '@/config/constants'

/** One QueryClient per app instance (created lazily in <App>, so tests get a fresh one each time). */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}
