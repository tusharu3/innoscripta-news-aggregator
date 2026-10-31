import type { ReactNode } from 'react'
import { bem } from '@/lib/bem'
import styles from './PageHeader.module.scss'

const b = bem(styles, 'page-header')

interface PageHeaderProps {
  eyebrow: string
  title: string
  /** Rendered after `title` in the brand gradient, like the innoscripta hero. */
  highlight?: string
  description?: ReactNode
  actions?: ReactNode
}

/** The page's single <h1> with eyebrow, optional gradient highlight, lead text and actions. */
export function PageHeader({ eyebrow, title, highlight, description, actions }: PageHeaderProps) {
  return (
    <header className={b()}>
      <p className={b('eyebrow')}>{eyebrow}</p>
      <h1 className={b('title')}>
        {title} {highlight && <span className={b('highlight')}>{highlight}</span>}
      </h1>
      {description && <p className={b('description')}>{description}</p>}
      {actions && <div className={b('actions')}>{actions}</div>}
    </header>
  )
}
