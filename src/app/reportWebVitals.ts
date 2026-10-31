import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Logs Core Web Vitals (LCP, INP, CLS) plus FCP and TTFB to the console, using Google's own
 * `web-vitals` library — the same measurement Chrome UX Report and PageSpeed Insights use.
 * Loaded on demand in development or with `?vitals` in the URL (see main.tsx), so production
 * users never download it.
 */
function log(metric: Metric) {
  const value = metric.name === 'CLS' ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`
  console.info(`[web-vitals] ${metric.name}: ${value} (${metric.rating})`)
}

export function reportWebVitals() {
  onLCP(log)
  onINP(log, { reportAllChanges: true })
  onCLS(log, { reportAllChanges: true })
  onFCP(log)
  onTTFB(log)
}
