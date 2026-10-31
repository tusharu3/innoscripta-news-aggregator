import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HttpError } from '@/api/http'
import { createFakeSource, makeArticle } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { SearchPage } from './SearchPage'

function setup(route = '/search') {
  const guardian = createFakeSource(
    'guardian',
    (q) => ({ articles: [makeArticle({ title: `Guardian: ${q.keyword ?? 'latest'}` })], hasMore: false }),
    'The Guardian',
  )
  const bbc = createFakeSource(
    'bbc',
    () => ({ articles: [makeArticle({ title: 'BBC story', url: 'https://bbc.co.uk/1' })], hasMore: false }),
    'BBC News',
  )
  return { guardian, bbc, ...renderWithProviders(<SearchPage />, { sources: [guardian, bbc], route }) }
}

describe('SearchPage', () => {
  it('shows merged results from all sources', async () => {
    setup()
    expect(await screen.findByRole('link', { name: /^Guardian: latest/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^BBC story/ })).toBeInTheDocument()
  })

  it('searches by keyword after the user stops typing (debounced)', async () => {
    const { guardian, user } = setup()
    await screen.findByRole('link', { name: /^Guardian: latest/ })

    await user.type(screen.getByRole('searchbox', { name: /search articles/i }), 'climate')

    expect(await screen.findByRole('link', { name: /^Guardian: climate/ })).toBeInTheDocument()
    // One initial request + one for the final keyword — not one per keystroke.
    expect(guardian.fetchArticles).toHaveBeenCalledTimes(2)
  })

  it('passes category and date filters to the sources', async () => {
    const { guardian, user } = setup()
    await user.selectOptions(screen.getByLabelText('Category'), 'science')

    await waitFor(() =>
      expect(guardian.fetchArticles).toHaveBeenLastCalledWith(
        expect.objectContaining({ categories: ['science'] }),
        expect.anything(),
      ),
    )
  })

  it('restores filters from the URL', async () => {
    const { guardian } = setup('/search?q=ai&category=business&from=2024-01-01')
    expect(screen.getByRole('searchbox')).toHaveValue('ai')
    await waitFor(() =>
      expect(guardian.fetchArticles).toHaveBeenCalledWith(
        { keyword: 'ai', categories: ['business'], from: '2024-01-01', to: undefined, page: 1 },
        expect.anything(),
      ),
    )
  })

  it('only queries the selected sources', async () => {
    const { bbc, user } = setup()
    await screen.findByRole('link', { name: /^BBC story/ })
    bbc.fetchArticles.mockClear()

    await user.click(screen.getByRole('button', { name: 'BBC News', pressed: true }))

    await waitFor(() => expect(screen.queryByRole('link', { name: /^BBC story/ })).not.toBeInTheDocument())
    expect(bbc.fetchArticles).not.toHaveBeenCalled()
  })

  it('explains failing sources while still showing the others', async () => {
    const broken = createFakeSource(
      'nyt',
      () => {
        throw new HttpError(429, 'Too many requests')
      },
      'The New York Times',
    )
    const ok = createFakeSource('bbc', () => ({
      articles: [makeArticle({ title: 'Still here' })],
      hasMore: false,
    }))
    renderWithProviders(<SearchPage />, { sources: [broken, ok], route: '/search' })

    expect(await screen.findByRole('link', { name: /^Still here/ })).toBeInTheDocument()
    const notice = screen.getByText(/some sources are unavailable/i).closest('div')!
    expect(within(notice).getByText(/The New York Times: Rate limit reached/)).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    const empty = createFakeSource('bbc')
    renderWithProviders(<SearchPage />, { sources: [empty], route: '/search' })
    expect(await screen.findByText(/no articles match/i)).toBeInTheDocument()
  })

  it('loads the next page on demand', async () => {
    const paged = createFakeSource('guardian', (q) => ({
      articles: [makeArticle({ title: `Page ${q.page}` })],
      hasMore: q.page < 2,
    }))
    const { user } = renderWithProviders(<SearchPage />, { sources: [paged], route: '/search' })

    await user.click(await screen.findByRole('button', { name: 'Load more' }))

    expect(await screen.findByRole('link', { name: /^Page 2/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Page 1/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })
})
