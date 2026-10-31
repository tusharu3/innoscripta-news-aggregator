import { createContext, use, type ReactNode } from 'react'
import { defaultSources } from '@/api/sources/registry'
import type { NewsSource } from '@/api/sources/types'

/**
 * Dependency injection for news providers. Components ask for "the sources" instead of importing
 * adapters, so tests and Storybook can pass fakes without mocking modules or the network.
 */
const SourcesContext = createContext<readonly NewsSource[]>(defaultSources)

export function SourcesProvider({
  sources,
  children,
}: {
  sources: readonly NewsSource[]
  children: ReactNode
}) {
  return <SourcesContext value={sources}>{children}</SourcesContext>
}

// React 19: `use()` reads context (and, unlike useContext, may be called conditionally).
// eslint-disable-next-line react/only-export-components
export function useNewsSources(): readonly NewsSource[] {
  return use(SourcesContext)
}
