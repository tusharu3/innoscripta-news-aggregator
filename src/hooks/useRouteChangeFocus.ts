import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/**
 * After client-side navigation, scroll to the top and move focus to the returned element
 * (the page's <main>), so keyboard and screen-reader users start at the new content instead of
 * staying on the clicked link (WCAG 2.4.3 Focus Order). The initial page load is left untouched.
 */
export function useRouteChangeFocus<T extends HTMLElement>() {
  const targetRef = useRef<T>(null)
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    window.scrollTo({ top: 0 })
    targetRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return targetRef
}
