import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { FilterBar } from './FilterBar'
import type { SearchFilters } from '@/features/search/searchParams'

const initial: SearchFilters = { keyword: '', sources: ['guardian', 'nyt', 'newsapi', 'bbc'] }

const meta = {
  title: 'Features/FilterBar',
  component: FilterBar,
  args: { filters: initial, onChange: fn(), onClear: fn() },
} satisfies Meta<typeof FilterBar>

export default meta
type Story = StoryObj<typeof meta>

/** Fully interactive. On phone viewports the panel collapses behind a "Filters" toggle. */
export const Interactive: Story = {
  render: function Render(args) {
    const [filters, setFilters] = useState(args.filters)
    return (
      <FilterBar
        filters={filters}
        onChange={(patch) => {
          args.onChange(patch)
          setFilters((f) => ({ ...f, ...patch }))
        }}
        onClear={() => setFilters(initial)}
      />
    )
  },
}

export const WithActiveFilters: Story = {
  args: {
    filters: { keyword: 'climate', category: 'science', from: '2026-10-01', sources: ['guardian', 'bbc'] },
  },
}

export const Phone: Story = {
  ...Interactive,
  globals: { viewport: { value: 'phone' } },
}
