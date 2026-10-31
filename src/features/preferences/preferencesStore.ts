import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PREFERENCES_STORAGE_KEY } from '@/config/constants'
import { SOURCE_IDS, type Category, type SourceId } from '@/domain/article'
import { toggleItem } from '@/lib/collections'

/**
 * Reader preferences for the personalised feed, persisted to localStorage by Zustand's `persist`
 * middleware. Small, synchronous client state: a full Redux setup would add ceremony with no benefit.
 */
export interface Preferences {
  sources: SourceId[]
  categories: Category[]
  authors: string[]
}

interface PreferencesState extends Preferences {
  toggleSource(id: SourceId): void
  toggleCategory(category: Category): void
  /** Follows the author if not followed yet, otherwise unfollows. Case-insensitive. */
  toggleAuthor(name: string): void
  reset(): void
}

export const DEFAULT_PREFERENCES: Preferences = {
  sources: [...SOURCE_IDS],
  categories: [],
  authors: [],
}

/** Case- and whitespace-insensitive check, so "jane doe " and "Jane Doe" are the same author. */
export function isFollowing(authors: readonly string[], name: string): boolean {
  const needle = name.trim().toLowerCase()
  return authors.some((a) => a.toLowerCase() === needle)
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      toggleSource: (id) => set((s) => ({ sources: toggleItem(s.sources, id) })),
      toggleCategory: (category) => set((s) => ({ categories: toggleItem(s.categories, category) })),
      toggleAuthor: (name) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          return isFollowing(s.authors, trimmed)
            ? { authors: s.authors.filter((a) => a.toLowerCase() !== trimmed.toLowerCase()) }
            : { authors: [...s.authors, trimmed] }
        }),
      reset: () => set(DEFAULT_PREFERENCES),
    }),
    { name: PREFERENCES_STORAGE_KEY },
  ),
)
