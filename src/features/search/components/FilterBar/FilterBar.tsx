import { useId, useState } from 'react'
import { useNewsSources } from '@/app/providers/SourcesProvider'
import { Button } from '@/components/Button/Button'
import { ChipToggle } from '@/components/ChipToggle/ChipToggle'
import { FilterIcon, SearchIcon } from '@/components/Icons/Icons'
import { CATEGORIES, type Category } from '@/domain/article'
import { CATEGORY_LABELS } from '@/domain/labels'
import type { SearchFilters } from '@/features/search/searchParams'
import { bem } from '@/lib/bem'
import { toggleItem } from '@/lib/collections'
import { todayIso } from '@/lib/dates'
import styles from './FilterBar.module.scss'

const b = bem(styles, 'filter-bar')

interface FilterBarProps {
  filters: SearchFilters
  onChange(patch: Partial<SearchFilters>): void
  onClear(): void
}

/**
 * Keyword field plus filters (category, date range, sources). It is controlled: values come
 * from the URL via props and every change is reported upward, so it holds no data state itself.
 * On phones the filter panel collapses behind a disclosure button (WAI-ARIA disclosure pattern).
 */
export function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
  const sources = useNewsSources()
  const panelId = useId()
  // UI-only state: whether the phone disclosure is open. CSS ignores it from tablet up.
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const today = todayIso()

  const activeFilterCount = [
    filters.category,
    filters.from,
    filters.to,
    filters.sources.length !== sources.length,
  ].filter(Boolean).length

  return (
    <form role="search" aria-label="Articles" onSubmit={(event) => event.preventDefault()} className={b()}>
      <div className={b('search')}>
        <SearchIcon />
        <label htmlFor="keyword" className="sr-only">
          Search articles
        </label>
        <input
          id="keyword"
          type="search"
          placeholder="Search articles, e.g. “climate”"
          value={filters.keyword}
          onChange={(event) => onChange({ keyword: event.target.value })}
          className={b('search-input')}
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      <button
        type="button"
        className={b('toggle')}
        aria-expanded={isPanelOpen}
        aria-controls={panelId}
        onClick={() => setIsPanelOpen((open) => !open)}
      >
        <FilterIcon />
        Filters
        {activeFilterCount > 0 && (
          <span className={b('badge')}>
            {activeFilterCount}
            <span className="sr-only"> active</span>
          </span>
        )}
      </button>

      <div id={panelId} className={b('panel', { open: isPanelOpen })}>
        <div className={b('fields')}>
          <div className={b('field')}>
            <label htmlFor="category" className={b('label')}>
              Category
            </label>
            <select
              id="category"
              value={filters.category ?? ''}
              onChange={(event) =>
                onChange({ category: (event.target.value || undefined) as Category | undefined })
              }
              className={b('control', { select: true })}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
          <div className={b('field')}>
            <label htmlFor="from" className={b('label')}>
              From
            </label>
            <input
              id="from"
              type="date"
              value={filters.from ?? ''}
              max={filters.to ?? today}
              onChange={(event) => onChange({ from: event.target.value || undefined })}
              className={b('control')}
            />
          </div>
          <div className={b('field')}>
            <label htmlFor="to" className={b('label')}>
              To
            </label>
            <input
              id="to"
              type="date"
              value={filters.to ?? ''}
              min={filters.from}
              max={today}
              onChange={(event) => onChange({ to: event.target.value || undefined })}
              className={b('control')}
            />
          </div>
        </div>

        <fieldset className={b('sources')}>
          <legend className={b('label')}>Sources</legend>
          <div className={b('chips')}>
            {sources.map((source) => (
              <ChipToggle
                key={source.id}
                pressed={filters.sources.includes(source.id)}
                onToggle={() => onChange({ sources: toggleItem(filters.sources, source.id) })}
              >
                {source.label}
              </ChipToggle>
            ))}
          </div>
        </fieldset>

        {(activeFilterCount > 0 || filters.keyword) && (
          <Button variant="ghost" size="sm" onClick={onClear} className={b('clear')}>
            Clear all filters
          </Button>
        )}
      </div>
    </form>
  )
}
