import { memo, useState } from 'react'
import type { Article } from '@/domain/article'
import { isFollowing, usePreferences } from '@/features/preferences/preferencesStore'
import { bem } from '@/lib/bem'
import { formatPublished } from '@/lib/dates'
import styles from './ArticleCard.module.scss'

const b = bem(styles, 'article-card')

/** Subscribes to this one author's follow state only, so following someone re-renders just their cards. */
function FollowAuthorButton({ author }: { author: string }) {
  const following = usePreferences((state) => isFollowing(state.authors, author))
  const toggleAuthor = usePreferences((state) => state.toggleAuthor)

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? `Unfollow ${author}` : `Follow ${author}`}
      onClick={() => toggleAuthor(author)}
      className={b('follow')}
    >
      {following ? 'Following' : '+ Follow'}
    </button>
  )
}

interface ArticleCardProps {
  article: Article
  /**
   * Above-the-fold card: load its image eagerly with high fetch priority, because it is
   * the likely LCP element. Every other image lazy-loads.
   */
  priority?: boolean
}

/**
 * One article. Memoised: article objects keep their identity across "load more" pages,
 * so existing cards skip re-rendering when new ones are appended.
 */
export const ArticleCard = memo(function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = article.imageUrl && !imageFailed

  return (
    <article className={b()}>
      <div className={b('layout')}>
        {/* Decorative duplicate of the title link: hidden from keyboard and screen readers. */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className={b('media')}
        >
          {showImage ? (
            <img
              src={article.imageUrl}
              alt=""
              // Intrinsic size + CSS aspect-ratio reserve the box before the image loads (no CLS).
              width={640}
              height={360}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onError={() => setImageFailed(true)}
              className={b('image')}
            />
          ) : (
            <span className={b('placeholder')}>{article.publisher}</span>
          )}
        </a>

        <div className={b('body')}>
          <p className={b('meta')}>
            {article.publisher} ·{' '}
            <time dateTime={article.publishedAt} className={b('time')}>
              {formatPublished(article.publishedAt)}
            </time>
          </p>
          <h3 className={b('title')}>
            <a href={article.url} target="_blank" rel="noopener noreferrer" className={b('link')}>
              {article.title} <span className="sr-only">(opens in a new tab)</span>
            </a>
          </h3>
          {article.description && <p className={b('description')}>{article.description}</p>}
          {article.author && (
            <div className={b('footer')}>
              <span className={b('author')} title={article.author}>
                By {article.author}
              </span>
              <FollowAuthorButton author={article.author} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
})
