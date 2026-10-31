# Testing

```bash
npm test            # run once
npm run test:watch  # watch mode
```

Stack: **Vitest** + **React Testing Library** + **user-event** on **jsdom**. Tests sit next to the code they cover.

## Strategy

| Level                | What                                                                   | Examples                                                                                   | How                                                   |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Unit: pure logic     | URL building, response mapping, merging, ranking, URL parsing, dates   | `sources/*.test.ts`, `aggregator.test.ts`, `searchParams.test.ts`, `rankByAuthors.test.ts` | Plain function calls with small inline fixtures       |
| Unit: state          | Preferences store                                                      | `store.test.ts`                                                                            | Call actions on `usePreferences.getState()`           |
| Unit: hooks          | Infinite scroll (IntersectionObserver double), `bem()`                 | `useInfiniteScroll.test.tsx`, `bem.test.ts`                                                | Stub the browser API, render a tiny harness           |
| Integration: routing | Lazy routes, page titles, focus after navigation                       | `routes.test.tsx`                                                                          | `renderWithProviders(<AppRoutes />)`                  |
| Integration: pages   | Real pages, real hooks, real router and query client, **fake sources** | `SearchPage.test.tsx`, `FeedPage.test.tsx`, `PreferencesPage.test.tsx`                     | `renderWithProviders(<Page />, { sources: [fake…] })` |

There are no network mocks in page tests. Because sources are injected through `SourcesProvider` (dependency inversion), a test just passes `createFakeSource(...)`. The only place `fetch` is stubbed is the adapter tests, to check HTTP error handling.

## Helpers (`src/test/`)

| Helper                                        | Use                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `makeArticle(overrides)`                      | A valid `Article` with unique id and url                                                             |
| `createFakeSource(id, respond, label)`        | A `NewsSource` whose `fetchArticles` is a `vi.fn`. `respond(query)` returns a page or throws.        |
| `renderWithProviders(ui, { sources, route })` | QueryClient (no retries), SourcesProvider and MemoryRouter. Returns `user` from `userEvent.setup()`. |
| `mockFetch(body, init)`                       | Stubs global `fetch` with one canned `Response`                                                      |

`setup.ts` runs `cleanup()` and clears `localStorage` after each test. Tests that touch preferences call `usePreferences.getState().reset()` in `beforeEach`.

## Writing good tests here

- **Query like a user.** Prefer `getByRole(name)` or `getByLabelText`. Avoid test ids and class names.
- **Assert behaviour.** What the user sees, or what a source was asked for (`toHaveBeenCalledWith(expect.objectContaining({ categories: ['science'] }))`). Not internal state.
- **One behaviour per test**, named as a sentence: _“explains failing sources while still showing the others”_.
- **Cover the unhappy paths:** provider error, empty results, invalid URL params, missing optional fields.
- **For a new adapter**, test URL building, mapping (including missing fields), and one HTTP failure.
- Async UI: use `findBy…` or `waitFor`. Never use fixed sleeps.

The `test-writer` agent follows these rules.

## Storybook as a visual and accessibility check

`npm run storybook` shows every component and page state on fake sources. The A11y panel runs axe on each story, and the viewport toolbar covers 320 px to 1920 px. CI builds Storybook, so a broken story fails the pipeline.

## Not covered (yet)

- E2E against the Docker image (Playwright). The proxy config is checked manually, as described in the README.
- Visual regression (screenshot diffs of the Storybook stories).
