import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppRoutes } from '@/app/routes'
import { storySource } from '@/stories/fixtures'

/** Full screens (layout + page) running on fake sources. Use the viewport toolbar to check breakpoints. */
const meta = {
  title: 'Pages/App',
  component: AppRoutes,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppRoutes>

export default meta
type Story = StoryObj<typeof meta>

export const Feed: Story = { parameters: { route: '/' } }

export const Search: Story = { parameters: { route: '/search?q=european' } }

export const Preferences: Story = { parameters: { route: '/preferences' } }

/** Two providers fail (e.g. missing API key); results from the others still render. */
export const PartialFailure: Story = {
  parameters: {
    route: '/',
    sources: [
      storySource('guardian'),
      storySource('nyt', { error: 'API key missing or invalid.' }),
      storySource('newsapi', { error: 'Rate limit reached, try again later.' }),
      storySource('bbc'),
    ],
  },
}

/** Two pages load automatically as you scroll (infinite scroll), then "Load more" takes over. */
export const InfiniteScroll: Story = {
  parameters: { route: '/', sources: [storySource('guardian', { extraPages: 5 })] },
}

export const Loading: Story = {
  parameters: { route: '/', sources: [storySource('guardian', { delayMs: Infinity })] },
}

export const NoResults: Story = { parameters: { route: '/search?q=zzzz-no-match' } }

export const FeedOnPhone: Story = {
  parameters: { route: '/' },
  globals: { viewport: { value: 'phone' } },
}

export const FeedOnLargeDisplay: Story = {
  parameters: { route: '/' },
  globals: { viewport: { value: 'wide' } },
}
