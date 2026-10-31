import { bem } from '@/lib/bem'
import styles from './ArticleSkeletonGrid.module.scss'

const b = bem(styles, 'article-skeleton')

/**
 * Placeholder cards shown on first load. They use the same grid and card proportions as the real
 * list, so content replaces them in place without layout shift (CLS).
 */
export function ArticleSkeletonGrid({ count = 6, gridClassName }: { count?: number; gridClassName: string }) {
  return (
    <div className={gridClassName} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={b()}>
          <div className={b('media')} />
          <div className={b('body')}>
            <div className={b('line', { short: true })} />
            <div className={b('line', { title: true })} />
            <div className={b('line')} />
          </div>
        </div>
      ))}
    </div>
  )
}
