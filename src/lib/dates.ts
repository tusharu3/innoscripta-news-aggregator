/** `2024-05-01` -> `20240501` (NYT's date format). */
export function toCompactDate(isoDate: string): string {
  return isoDate.replaceAll('-', '')
}

export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** True when the timestamp's calendar day lies within the inclusive [from, to] range. */
export function isWithinRange(publishedAt: string, from?: string, to?: string): boolean {
  const day = publishedAt.slice(0, 10)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const absolute = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' })

/** "5 minutes ago", "yesterday", or "3 Mar 2024" for anything older than a week. */
export function formatPublished(publishedAt: string, now: Date = new Date()): string {
  const date = new Date(publishedAt)
  const diff = date.getTime() - now.getTime()
  if (Math.abs(diff) >= 7 * 86_400_000) return absolute.format(date)
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit)
  }
  return 'just now'
}
