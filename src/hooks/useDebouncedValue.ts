import { useEffect, useState } from 'react'

/**
 * Returns `value` only after it has stopped changing for `delayMs`.
 * Used for search: the input stays instant, but the request fires once per typing pause.
 * (Debounce over throttle: throttling would also send intermediate queries like "cli", "clim".)
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
