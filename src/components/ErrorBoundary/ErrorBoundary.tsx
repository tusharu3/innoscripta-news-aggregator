import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render errors and failed lazy-chunk loads (e.g. after a redeploy) for one route,
 * showing a recoverable message instead of a blank screen. Error boundaries still need a class
 * component in React 19. The layout gives it `key={pathname}`, so navigating away resets it.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div role="alert">
        <EmptyState>
          <p>Something went wrong while loading this page.</p>
          <p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </p>
        </EmptyState>
      </div>
    )
  }
}
