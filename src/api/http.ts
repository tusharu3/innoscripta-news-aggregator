export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init)
  if (res.ok) return res

  // Providers usually explain failures in a JSON `message`; fall back to the status text.
  let message = res.statusText || `Request failed with ${res.status}`
  try {
    const body = (await res.json()) as { message?: unknown }
    if (typeof body.message === 'string') message = body.message
  } catch {
    // non-JSON error body — keep the status text
  }
  throw new HttpError(res.status, message)
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await request(url, { signal })
  return (await res.json()) as T
}

export async function getText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await request(url, { signal })
  return res.text()
}

/** Turns any failure into a sentence a reader understands. */
export function describeError(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 403) return 'API key missing or invalid.'
    if (error.status === 429) return 'Rate limit reached, try again later.'
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Unknown error.'
}
