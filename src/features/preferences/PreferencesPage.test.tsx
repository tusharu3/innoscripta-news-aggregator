import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeSource } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { PreferencesPage } from './PreferencesPage'
import { usePreferences } from './preferencesStore'

beforeEach(() => usePreferences.getState().reset())

function setup() {
  return renderWithProviders(<PreferencesPage />, {
    sources: [
      createFakeSource('guardian', undefined, 'The Guardian'),
      createFakeSource('bbc', undefined, 'BBC News'),
    ],
  })
}

describe('PreferencesPage', () => {
  it('toggles sources and topics', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'BBC News', pressed: true }))
    await user.click(screen.getByRole('button', { name: 'Science', pressed: false }))

    expect(usePreferences.getState().sources).not.toContain('bbc')
    expect(usePreferences.getState().categories).toEqual(['science'])
    expect(screen.getByRole('button', { name: 'Science' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('adds and removes authors', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('Author name'), 'Jane Doe{Enter}')
    expect(screen.getByRole('list', { name: 'Followed authors' })).toHaveTextContent('Jane Doe')

    // Adding the same author again (different case) does not unfollow or duplicate.
    await user.type(screen.getByLabelText('Author name'), 'jane doe{Enter}')
    expect(usePreferences.getState().authors).toEqual(['Jane Doe'])

    await user.click(screen.getByRole('button', { name: 'Unfollow Jane Doe' }))
    expect(screen.queryByRole('list', { name: 'Followed authors' })).not.toBeInTheDocument()
  })
})
