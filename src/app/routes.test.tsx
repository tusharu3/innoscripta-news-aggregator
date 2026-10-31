import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePreferences } from '@/features/preferences/preferencesStore'
import { createFakeSource } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { AppRoutes } from './routes'

beforeEach(() => {
  usePreferences.getState().reset()
  vi.stubGlobal('scrollTo', vi.fn()) // jsdom doesn't implement window.scrollTo
})

const sources = [createFakeSource('bbc', undefined, 'BBC News')]

describe('AppRoutes', () => {
  it('renders the feed with a unique document title', async () => {
    renderWithProviders(<AppRoutes />, { sources })
    expect(screen.getByRole('heading', { level: 1, name: /tailored to you/ })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Your feed · Newsroom'))
  })

  it('lazy-loads a route on navigation and moves focus to the main content', async () => {
    const { user } = renderWithProviders(<AppRoutes />, { sources })

    // Both nav presentations exist in the DOM (CSS shows one); use the first.
    await user.click(screen.getAllByRole('link', { name: 'Search' })[0])

    expect(await screen.findByRole('heading', { level: 1, name: /stories that matter/ })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
    expect(window.scrollTo).toHaveBeenCalled()
    await waitFor(() => expect(document.title).toBe('Search · Newsroom'))
  })

  it('redirects unknown paths to the feed', () => {
    renderWithProviders(<AppRoutes />, { sources, route: '/does-not-exist' })
    expect(screen.getByRole('heading', { level: 1, name: /tailored to you/ })).toBeInTheDocument()
  })
})
