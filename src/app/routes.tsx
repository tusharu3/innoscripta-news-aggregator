import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/AppLayout/AppLayout'
import { FeedPage } from '@/features/feed/FeedPage'

/*
 * Route-level code splitting.
 * - The feed ("/") is the landing page, so it ships in the main bundle: lazy-loading it would delay LCP.
 * - Search and Preferences are separate chunks, loaded on first visit…
 * - …or earlier: hovering/focusing their nav link calls the preloader, so the chunk is usually
 *   cached before the click (no visible Suspense fallback).
 */
const loadSearchPage = () => import('@/features/search/SearchPage')
const loadPreferencesPage = () => import('@/features/preferences/PreferencesPage')

const SearchPage = lazy(() => loadSearchPage().then((module) => ({ default: module.SearchPage })))
const PreferencesPage = lazy(() =>
  loadPreferencesPage().then((module) => ({ default: module.PreferencesPage })),
)

const routePreloaders: Record<string, () => Promise<unknown>> = {
  '/search': loadSearchPage,
  '/preferences': loadPreferencesPage,
}

function preloadRoute(path: string) {
  void routePreloaders[path]?.()
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout onNavigationIntent={preloadRoute} />}>
        <Route index element={<FeedPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="preferences" element={<PreferencesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
