import type { ReactNode } from 'react'
import { bem } from '@/lib/bem'
import styles from './EmptyState.module.scss'

const b = bem(styles, 'empty-state')

/** Neutral message panel for empty results, missing selections and error fallbacks. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={b()}>{children}</div>
}
