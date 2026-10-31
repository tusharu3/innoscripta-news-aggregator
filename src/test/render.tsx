import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { SourcesProvider } from '@/app/providers/SourcesProvider'
import type { NewsSource } from '@/api/sources/types'

interface Options {
  sources?: readonly NewsSource[]
  route?: string
}

/** Renders with the same providers as the app, but with injected fake sources and no retries. */
export function renderWithProviders(ui: ReactElement, { sources = [], route = '/' }: Options = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <SourcesProvider sources={sources}>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </SourcesProvider>
      </QueryClientProvider>,
    ),
  }
}
