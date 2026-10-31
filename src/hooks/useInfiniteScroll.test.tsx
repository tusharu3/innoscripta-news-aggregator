import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useInfiniteScroll } from './useInfiniteScroll'

type Callback = (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void

/** Minimal IntersectionObserver double that lets the test decide when the sentinel is visible. */
function stubIntersectionObserver() {
  const instances: { callback: Callback; disconnect: ReturnType<typeof vi.fn> }[] = []
  class FakeObserver {
    callback: Callback
    disconnect = vi.fn()
    observe = vi.fn()
    constructor(callback: Callback) {
      this.callback = callback
      instances.push(this)
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  return instances
}

function Harness({ enabled, onLoadMore }: { enabled: boolean; onLoadMore(): void }) {
  const ref = useInfiniteScroll<HTMLDivElement>({ enabled, onLoadMore })
  return <div ref={ref} />
}

afterEach(() => vi.unstubAllGlobals())

describe('useInfiniteScroll', () => {
  it('loads more when the sentinel becomes visible', () => {
    const observers = stubIntersectionObserver()
    const onLoadMore = vi.fn()
    render(<Harness enabled onLoadMore={onLoadMore} />)

    observers[0].callback([{ isIntersecting: false }])
    expect(onLoadMore).not.toHaveBeenCalled()

    observers[0].callback([{ isIntersecting: true }])
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not observe while disabled and disconnects when disabled later', () => {
    const observers = stubIntersectionObserver()
    const { rerender } = render(<Harness enabled={false} onLoadMore={vi.fn()} />)
    expect(observers).toHaveLength(0)

    rerender(<Harness enabled onLoadMore={vi.fn()} />)
    rerender(<Harness enabled={false} onLoadMore={vi.fn()} />)
    expect(observers[0].disconnect).toHaveBeenCalled()
  })

  it('is a safe no-op where IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    expect(() => render(<Harness enabled onLoadMore={vi.fn()} />)).not.toThrow()
  })
})
