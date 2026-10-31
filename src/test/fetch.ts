import { vi } from 'vitest'

/** Stubs global fetch with a single canned response and returns the mock for URL assertions. */
export function mockFetch(body: unknown, init: ResponseInit = { status: 200 }) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  const fetchMock = vi.fn(async () => new Response(payload, init))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
