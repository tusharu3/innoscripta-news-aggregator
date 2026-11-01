import { beforeEach, describe, expect, it } from 'vitest'
import { PREFERENCES_STORAGE_KEY } from '@/config/constants'
import { DEFAULT_PREFERENCES, usePreferences } from './preferencesStore'

const state = () => usePreferences.getState()

beforeEach(() => state().reset())

describe('preferences store', () => {
  it('toggles sources and categories', () => {
    state().toggleSource('nyt')
    expect(state().sources).not.toContain('nyt')
    state().toggleSource('nyt')
    expect(state().sources).toContain('nyt')

    state().toggleCategory('science')
    expect(state().categories).toEqual(['science'])
  })

  it('follows and unfollows authors case-insensitively and ignores blanks', () => {
    state().toggleAuthor('  Jane Doe ')
    expect(state().authors).toEqual(['Jane Doe'])
    state().toggleAuthor('jane doe')
    expect(state().authors).toEqual([])
    state().toggleAuthor('   ')
    expect(state().authors).toEqual([])
  })

  it('follows an author only once and never unfollows', () => {
    state().followAuthor(' Jane Doe ')
    state().followAuthor('JANE DOE')
    expect(state().authors).toEqual(['Jane Doe'])
    state().followAuthor('  ')
    expect(state().authors).toEqual(['Jane Doe'])
  })

  it('persists to localStorage', () => {
    state().toggleCategory('health')
    expect(localStorage.getItem(PREFERENCES_STORAGE_KEY)).toContain('health')
  })

  it('resets to defaults', () => {
    state().toggleCategory('health')
    state().reset()
    expect(state()).toMatchObject(DEFAULT_PREFERENCES)
  })
})
