import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { CATEGORIES } from '@/domain/article'
import { CATEGORY_LABELS } from '@/domain/labels'
import { toggleItem } from '@/lib/collections'
import { ChipToggle } from './ChipToggle'

const meta = {
  title: 'Components/ChipToggle',
  component: ChipToggle,
  args: { children: 'Technology', pressed: false, onToggle: fn() },
} satisfies Meta<typeof ChipToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {}

export const On: Story = { args: { pressed: true } }

/** Interactive multi-select group, as used for topics and sources. */
export const Group: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['technology'])
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CATEGORIES.map((c) => (
          <ChipToggle
            key={c}
            pressed={selected.includes(c)}
            onToggle={() => setSelected(toggleItem(selected, c))}
          >
            {CATEGORY_LABELS[c]}
          </ChipToggle>
        ))}
      </div>
    )
  },
}
