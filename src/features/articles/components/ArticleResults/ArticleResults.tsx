import { useId, type ReactNode } from 'react'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { AUTO_LOAD_PAGE_LIMIT, EAGER_IMAGE_COUNT } from '@/config/constants'
import type { Article } from '@/domain/article'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { bem } from '@/lib/bem'
import type { ArticlesResult } from '@/features/articles/hooks/useArticles'
import { ArticleCard } from '@/features/articles/components/ArticleCard/ArticleCard'
import { ArticleSkeletonGrid } from '@/features/articles/components/ArticleSkeletonGrid/ArticleSkeletonGrid'
import { SourceNotice } from '@/features/articles/components/SourceNotice/SourceNotice'
import styles from './ArticleResults.module.scss'

const b = bem(styles, 'article-results')

interface ArticleResultsProps {
  result: ArticlesResult
  /** Overrides `result.articles`, e.g. after re-ranking. */
  articles?: Article[]
  /** Visually hidden <h2> that names the list (keeps the h1 → h2 → h3 outline intact). */
  heading?: string
  empty: ReactNode
}

/**
 * Every article list's states in one place: loading skeletons, partial-failure notice,
 * empty state, the grid, and pagination.
 *
 * Pagination = infinite scroll + button. The first AUTO_LOAD_PAGE_LIMIT pages load automatically
 * as the user nears the end; after that (or without IntersectionObserver) the "Load more" button
 * is the way forward, so keyboard users and the footer are never trapped behind endless loading.
 */
export function ArticleResults({
  result,
  articles = result.articles,
  heading = 'Articles',
  empty,
}: ArticleResultsProps) {
  const headingId = useId()
  const loadedPages = result.data?.pages.length ?? 0
  const sentinelRef = useInfiniteScroll<HTMLDivElement>({
    enabled: Boolean(result.hasNextPage) && !result.isFetchingNextPage && loadedPages < AUTO_LOAD_PAGE_LIMIT,
    onLoadMore: () => void result.fetchNextPage(),
  })

  if (result.isPending) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading articles…
        </p>
        <ArticleSkeletonGrid gridClassName={b('grid')} />
      </>
    )
  }

  return (
    <section aria-labelledby={headingId} aria-busy={result.isPlaceholderData} className={b()}>
      <h2 id={headingId} className="sr-only">
        {heading}
      </h2>
      <SourceNotice failures={result.failures} />
      <p className="sr-only" role="status">
        {articles.length} {articles.length === 1 ? 'article' : 'articles'}
      </p>

      {articles.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <ul role="list" className={b('grid')}>
          {articles.map((article, index) => (
            <li key={article.id} className={b('item')}>
              <ArticleCard article={article} priority={index < EAGER_IMAGE_COUNT} />
            </li>
          ))}
        </ul>
      )}

      {result.hasNextPage && (
        <div className={b('more')}>
          <div ref={sentinelRef} className={b('sentinel')} aria-hidden="true" />
          <Button onClick={() => result.fetchNextPage()} disabled={result.isFetchingNextPage}>
            {result.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </section>
  )
}
