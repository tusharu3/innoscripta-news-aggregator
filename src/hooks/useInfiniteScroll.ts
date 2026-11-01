import { useEffect, useRef } from 'react'
import { INFINITE_SCROLL_ROOT_MARGIN } from '@/config/constants'

interface Options {
  /** Observe only while more pages exist and no request is in flight. */
  enabled: boolean
  onLoadMore(): void
}

/**
 * Infinite scroll: returns a ref for a sentinel element placed after the list. When the sentinel
 * comes within INFINITE_SCROLL_ROOT_MARGIN of the viewport, `onLoadMore` runs (prefetching before the user hits
 * the end). A no-op without IntersectionObserver, so a "Load more" button must stay as fallback.
 *
 * Re-creating the observer whenever `enabled` flips back to true makes it re-check visibility
 * immediately, so short pages keep loading until the viewport is filled.
 */
export function useInfiniteScroll<T extends Element>({ enabled, onLoadMore }: Options) {
  const sentinelRef = useRef<T>(null)
  // Latest-callback ref: the observer always calls the current handler without being re-created.
  const onLoadMoreRef = useRef(onLoadMore)
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!enabled || !sentinel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current()
      },
      { rootMargin: INFINITE_SCROLL_ROOT_MARGIN },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled])

  return sentinelRef
}
