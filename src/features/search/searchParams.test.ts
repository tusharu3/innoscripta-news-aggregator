import { describe, expect, it } from 'vitest'
import type { SourceId } from '@/domain/article'
import { parseSearchParams, toSearchParams } from './searchParams'

const all: SourceId[] = ['guardian', 'nyt', 'bbc']

describe('parseSearchParams', () => {
  it('returns defaults for an empty URL', () => {
    expect(parseSearchParams(new URLSearchParams(), all)).toEqual({
      keyword: '',
      category: undefined,
      from: undefined,
      to: undefined,
      sources: all,
    })
  })

  it('ignores invalid values from a hand-edited URL', () => {
    const filters = parseSearchParams(
      new URLSearchParams('category=nope&from=yesterday&sources=bbc,evil'),
      all,
    )
    expect(filters.category).toBeUndefined()
    expect(filters.from).toBeUndefined()
    expect(filters.sources).toEqual(['bbc'])
  })
})

describe('toSearchParams', () => {
  it('round-trips and omits defaults', () => {
    const filters = {
      keyword: 'ai',
      category: 'science' as const,
      from: '2024-01-01',
      to: undefined,
      sources: ['bbc' as const],
    }
    const params = toSearchParams(filters, all)
    expect(params.toString()).toBe('q=ai&category=science&from=2024-01-01&sources=bbc')
    expect(parseSearchParams(params, all)).toEqual(filters)
  })

  it('does not write sources when all are selected', () => {
    expect(toSearchParams({ keyword: '', sources: all }, all).toString()).toBe('')
  })
})
