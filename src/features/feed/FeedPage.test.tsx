import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeSource, makeArticle } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { usePreferences } from '@/features/preferences/preferencesStore'
import { FeedPage } from './FeedPage'

beforeEach(() => usePreferences.getState().reset())

describe('FeedPage', () => {
  it('queries only preferred sources with preferred categories', async () => {
    usePreferences.setState({ sources: ['guardian'], categories: ['science', 'health'] })
    const guardian = createFakeSource('guardian')
    const bbc = createFakeSource('bbc')

    renderWithProviders(<FeedPage />, { sources: [guardian, bbc] })

    await waitFor(() =>
      expect(guardian.fetchArticles).toHaveBeenCalledWith(
        expect.objectContaining({ categories: ['science', 'health'], page: 1 }),
        expect.anything(),
      ),
    )
    expect(bbc.fetchArticles).not.toHaveBeenCalled()
  })

  it('shows followed authors first and lets the reader follow from a card', async () => {
    const source = createFakeSource('guardian', () => ({
      articles: [
        makeArticle({ title: 'Newest', author: 'Someone Else', publishedAt: '2024-05-02T00:00:00Z' }),
        makeArticle({ title: 'Older', author: 'Jane Doe', publishedAt: '2024-05-01T00:00:00Z' }),
      ],
      hasMore: false,
    }))
    const { user } = renderWithProviders(<FeedPage />, { sources: [source] })

    await screen.findByRole('link', { name: /^Newest/ })
    const titles = () =>
      screen
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent?.replace(' (opens in a new tab)', ''))
    expect(titles()).toEqual(['Newest', 'Older'])

    await user.click(screen.getByRole('button', { name: 'Follow Jane Doe' }))

    expect(usePreferences.getState().authors).toEqual(['Jane Doe'])
    expect(titles()).toEqual(['Older', 'Newest'])
    expect(screen.getByRole('button', { name: 'Unfollow Jane Doe' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('asks the reader to pick a source when none are selected', () => {
    usePreferences.setState({ sources: [] })
    renderWithProviders(<FeedPage />, { sources: [createFakeSource('bbc')] })
    expect(screen.getByText(/no sources selected/i)).toBeInTheDocument()
  })
})
