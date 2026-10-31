import { describe, expect, it } from 'vitest'
import { bem } from './bem'

// Simulates a CSS Module: BEM names → hashed names.
const styles = {
  card: 'card_x1',
  card__title: 'card__title_x2',
  'card__title--large': 'card__title--large_x3',
  'card--wide': 'card--wide_x4',
}

describe('bem', () => {
  const b = bem(styles, 'card')

  it('returns the block and element class names', () => {
    expect(b()).toBe('card_x1')
    expect(b('title')).toBe('card__title_x2')
  })

  it('adds only enabled modifiers', () => {
    expect(b('title', { large: true, hidden: false })).toBe('card__title_x2 card__title--large_x3')
    expect(b(null, { wide: true })).toBe('card_x1 card--wide_x4')
  })

  it('ignores names missing from the module', () => {
    expect(b('missing', { nope: true })).toBe('')
  })
})
