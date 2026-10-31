import type { ReactNode } from 'react'
import { CheckIcon } from '@/components/Icons/Icons'
import { bem } from '@/lib/bem'
import styles from './ChipToggle.module.scss'

const b = bem(styles, 'chip-toggle')

interface ChipToggleProps {
  pressed: boolean
  onToggle(): void
  children: ReactNode
}

/**
 * On/off pill for multi-select filters. A native <button> with `aria-pressed`
 * (WAI-ARIA toggle button pattern): keyboard and screen-reader support come for free.
 */
export function ChipToggle({ pressed, onToggle, children }: ChipToggleProps) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onToggle} className={b()}>
      <span className={b('check')}>
        <CheckIcon />
      </span>
      {children}
    </button>
  )
}
