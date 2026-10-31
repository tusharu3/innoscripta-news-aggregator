import { bem } from '@/lib/bem'
import styles from './PageFallback.module.scss'

const b = bem(styles, 'page-fallback')

/**
 * Suspense fallback while a lazy route chunk loads. It mirrors the PageHeader's size, so swapping in
 * the real page causes no layout shift (CLS). Usually never seen: chunks are preloaded on link hover.
 */
export function PageFallback() {
  return (
    <div className={b()} aria-busy="true">
      <span className="sr-only" role="status">
        Loading page…
      </span>
      <div className={b('eyebrow')} />
      <div className={b('title')} />
      <div className={b('lead')} />
    </div>
  )
}
