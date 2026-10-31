import type { Decorator, Preview } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@/styles/main.scss'
import { SourcesProvider } from '@/app/providers/SourcesProvider'
import { allStorySources } from '@/stories/fixtures'
import type { NewsSource } from '@/api/sources/types'

/**
 * Every story gets the same providers as the app, with fake sources (no network, no API keys).
 * Stories can override them with `parameters: { sources, route }`.
 */
function AppProviders({
  sources,
  route,
  children,
}: {
  sources: NewsSource[]
  route: string
  children: ReactNode
}) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return (
    <QueryClientProvider client={client}>
      <SourcesProvider sources={sources}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </SourcesProvider>
    </QueryClientProvider>
  )
}

const withAppProviders: Decorator = (Story, { parameters }) => (
  <AppProviders
    sources={(parameters.sources as NewsSource[] | undefined) ?? allStorySources}
    route={(parameters.route as string | undefined) ?? '/'}
  >
    <Story />
  </AppProviders>
)

// Viewports match the design-system breakpoints (src/styles/abstracts/_tokens.scss).
const viewports = {
  small: { name: 'Small phone · 320', styles: { width: '320px', height: '640px' } },
  phone: { name: 'Phone · 375', styles: { width: '375px', height: '812px' } },
  tablet: { name: 'Tablet · 768', styles: { width: '768px', height: '1024px' } },
  laptop: { name: 'Laptop · 1280', styles: { width: '1280px', height: '800px' } },
  wide: { name: 'Large display · 1920', styles: { width: '1920px', height: '1080px' } },
}

const preview: Preview = {
  decorators: [withAppProviders],
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        canvas: { name: 'Canvas', value: '#f8f9fa' },
        surface: { name: 'Surface', value: '#ffffff' },
      },
    },
    viewport: { options: viewports },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Fail the a11y panel check on violations (WCAG 2.x AA).
      test: 'error',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'canvas' },
  },
}

export default preview
