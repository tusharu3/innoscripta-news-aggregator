import type { Meta, StoryObj } from '@storybook/react-vite'
import { ButtonLink } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageHeader } from './PageHeader'

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Your personalised briefing',
    title: "Today's news,",
    highlight: 'tailored to you',
    description: 'The Guardian, The New York Times, NewsAPI, BBC News · all topics',
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    actions: (
      <ButtonLink to="/preferences" variant="secondary" size="sm">
        Personalise feed
      </ButtonLink>
    ),
  },
}

export const WithoutHighlight: Story = { args: { title: 'Preferences', highlight: undefined } }

export const Empty: StoryObj<typeof EmptyState> = {
  render: () => <EmptyState>No articles match these filters. Try a broader search.</EmptyState>,
}
