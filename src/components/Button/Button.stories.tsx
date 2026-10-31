import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ButtonLink } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Load more', variant: 'primary', size: 'md', disabled: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary', children: 'Personalise feed' } }

export const Ghost: Story = { args: { variant: 'ghost', children: 'Clear all filters' } }

export const Small: Story = { args: { size: 'sm' } }

export const Disabled: Story = { args: { disabled: true, children: 'Loading…' } }

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="sm">Small</Button>
      <ButtonLink to="/preferences" variant="secondary" size="sm">
        Link as button
      </ButtonLink>
    </div>
  ),
}
