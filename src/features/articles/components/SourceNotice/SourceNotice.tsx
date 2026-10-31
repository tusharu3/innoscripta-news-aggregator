import type { SourceFailure } from '@/api/aggregator'
import { bem } from '@/lib/bem'
import styles from './SourceNotice.module.scss'

const b = bem(styles, 'source-notice')

/** Non-blocking notice listing providers that failed; results from the others still show. */
export function SourceNotice({ failures }: { failures: SourceFailure[] }) {
  if (failures.length === 0) return null
  return (
    <div role="status" className={b()}>
      <p className={b('title')}>Some sources are unavailable, showing results from the rest.</p>
      <ul className={b('list')}>
        {failures.map((failure) => (
          <li key={failure.sourceId}>
            {failure.label}: {failure.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
