/**
 * App-wide tunables in one place, so behaviour can be adjusted (or explained in an interview)
 * without hunting through components. Values are plain constants — no runtime config needed.
 */

export const APP_NAME = 'Newsroom'

/** Articles requested per provider page (Guardian, NewsAPI). NYT has a fixed page size of 10. */
export const PAGE_SIZE = 12

/** Wait this long after the last keystroke before searching. Debounce (not throttle): we only want the final query. */
export const SEARCH_DEBOUNCE_MS = 400

/** Cached results stay fresh for 5 minutes. Free API tiers are rate-limited (NewsAPI: 100 requests/day). */
export const QUERY_STALE_TIME_MS = 5 * 60_000

/**
 * Infinite scroll auto-loads at most this many pages; after that the "Load more" button takes over.
 * Keeps the footer reachable and avoids endless DOM growth (WCAG 2.1.1 / 2.4.3).
 */
export const AUTO_LOAD_PAGE_LIMIT = 3

/** Start fetching the next page when the end of the list is this far below the viewport. */
export const INFINITE_SCROLL_ROOT_MARGIN = '800px'

/** Placeholder cards shown on first load: enough to fill the first screen on any layout. */
export const SKELETON_CARD_COUNT = 6

/** The first row of cards loads images eagerly with high priority (helps LCP); the rest lazy-load. */
export const EAGER_IMAGE_COUNT = 3

/** Versioned localStorage key for persisted preferences. Bump the version on breaking shape changes. */
export const PREFERENCES_STORAGE_KEY = 'newsroom.preferences.v1'
