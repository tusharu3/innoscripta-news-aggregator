import type { Meta, StoryObj } from '@storybook/react-vite'
import { sampleArticles } from '@/stories/fixtures'
import { ArticleCard } from './ArticleCard'

const meta = {
  title: 'Features/ArticleCard',
  component: ArticleCard,
  args: { article: sampleArticles[0] },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArticleCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** No image: the card falls back to a brand-gradient panel with the publisher name. */
export const WithoutImage: Story = { args: { article: sampleArticles[3] } }

/** No byline: the follow footer is omitted. */
export const WithoutAuthor: Story = { args: { article: sampleArticles[2] } }

export const LongTitle: Story = {
  args: {
    article: {
      ...sampleArticles[1],
      title:
        'An unusually long headline that keeps going to check how the card wraps, balances and clamps text without breaking the layout on small screens',
    },
  },
}

/** Long byline: the author truncates with an ellipsis and the follow button stays fully visible. */
export const LongAuthor: Story = {
  args: {
    article: { ...sampleArticles[0], author: 'James Wallace (now) & Tanya Aldred (earlier) with additional reporting' },
  },
}

/** Wide container: the card switches to a media-left layout via a container query, not a media query. */
export const WideContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
}
