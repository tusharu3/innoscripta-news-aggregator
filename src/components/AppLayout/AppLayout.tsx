import { Suspense, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { FeedIcon, SearchIcon, SlidersIcon } from '@/components/Icons/Icons'
import { PageFallback } from '@/components/PageFallback/PageFallback'
import { APP_NAME } from '@/config/constants'
import { useRouteChangeFocus } from '@/hooks/useRouteChangeFocus'
import { bem } from '@/lib/bem'
import { cx } from '@/lib/cx'
import styles from './AppLayout.module.scss'

const layout = bem(styles, 'app-layout')
const nav = bem(styles, 'site-nav')

const NAV_ITEMS: { to: string; label: string; icon: ReactNode }[] = [
  { to: '/', label: 'For you', icon: <FeedIcon /> },
  { to: '/search', label: 'Search', icon: <SearchIcon /> },
  { to: '/preferences', label: 'Preferences', icon: <SlidersIcon /> },
]

interface AppLayoutProps {
  /** Called when the user hovers, focuses or touches a nav link: lets the router preload that page. */
  onNavigationIntent?(path: string): void
}

/**
 * One nav list, two presentations: a top bar from tablet up and a bottom tab bar on phones.
 * CSS hides whichever doesn't apply (display: none also removes it from the accessibility tree),
 * so screen readers only ever meet one navigation landmark.
 */
function SiteNav({ placement, onNavigationIntent }: { placement: 'top' | 'bottom' } & AppLayoutProps) {
  return (
    <ul role="list" className={nav('list', { [placement]: true })}>
      {NAV_ITEMS.map(({ to, label, icon }) => {
        const preload = () => onNavigationIntent?.(to)
        return (
          <li key={to}>
            <NavLink
              to={to}
              end
              onMouseEnter={preload}
              onFocus={preload}
              onTouchStart={preload}
              className={({ isActive }) => nav('link', { [placement]: true, active: isActive })}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

/** App shell: skip link, sticky header, main content (with Suspense + error boundary per route), footer. */
export function AppLayout({ onNavigationIntent }: AppLayoutProps) {
  const { pathname } = useLocation()
  const mainRef = useRouteChangeFocus<HTMLElement>()

  return (
    <div className={layout()}>
      <a href="#main" className={layout('skip-link')}>
        Skip to content
      </a>

      <header className={layout('header')}>
        <div className={cx('container', layout('header-inner'))}>
          <NavLink to="/" className={layout('brand')} aria-label={`${APP_NAME} home`}>
            {APP_NAME}
            <span className={layout('brand-dot')} aria-hidden="true">
              .
            </span>
          </NavLink>
          <nav aria-label="Main" className={nav(null, { top: true })}>
            <SiteNav placement="top" onNavigationIntent={onNavigationIntent} />
          </nav>
        </div>
      </header>

      {/* tabIndex=-1: focus target after navigation (see useRouteChangeFocus), not a tab stop. */}
      <main id="main" ref={mainRef} tabIndex={-1} className={cx('container', layout('main'))}>
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className={layout('footer')}>
        <p className="container">
          Articles from The Guardian, The New York Times, NewsAPI and BBC News. Content belongs to its
          publishers.
        </p>
      </footer>

      <nav aria-label="Main" className={nav(null, { bottom: true })}>
        <SiteNav placement="bottom" onNavigationIntent={onNavigationIntent} />
      </nav>
    </div>
  )
}
