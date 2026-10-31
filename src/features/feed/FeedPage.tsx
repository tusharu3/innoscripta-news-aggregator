import { useMemo } from 'react'
import { Link } from 'react-router'
import { useNewsSources } from '@/app/providers/SourcesProvider'
import { ButtonLink } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { APP_NAME } from '@/config/constants'
import { CATEGORY_LABELS } from '@/domain/labels'
import { ArticleResults } from '@/features/articles/components/ArticleResults/ArticleResults'
import { useArticles } from '@/features/articles/hooks/useArticles'
import { rankByAuthors } from '@/features/feed/rankByAuthors'
import { usePreferences } from '@/features/preferences/preferencesStore'
import { bem } from '@/lib/bem'
import styles from './FeedPage.module.scss'

const b = bem(styles, 'feed-page')

/**
 * "/": the personalised feed, built from saved preferences (sources and topics), with followed
 * authors ranked first. This is the landing page, so it ships in the main bundle (not lazy) for a fast LCP.
 */
export function FeedPage() {
  // Narrow selectors: the page re-renders only when these slices change.
  const sources = usePreferences((state) => state.sources)
  const categories = usePreferences((state) => state.categories)
  const authors = usePreferences((state) => state.authors)
  const allSources = useNewsSources()

  const filters = useMemo(() => ({ categories }), [categories])
  const result = useArticles(sources, filters)
  const articles = useMemo(() => rankByAuthors(result.articles, authors), [result.articles, authors])

  const summary = [
    allSources
      .filter((source) => sources.includes(source.id))
      .map((source) => source.label)
      .join(', '),
    categories.length ? categories.map((category) => CATEGORY_LABELS[category]).join(', ') : 'all topics',
    authors.length ? `${authors.length} followed ${authors.length === 1 ? 'author' : 'authors'} first` : null,
  ].filter(Boolean)

  return (
    <>
      <title>{`Your feed · ${APP_NAME}`}</title>
      <PageHeader
        eyebrow="Your personalised briefing"
        title="Today's news,"
        highlight="tailored to you"
        description={summary.join(' · ')}
        actions={
          <ButtonLink to="/preferences" variant="secondary" size="sm">
            Personalise feed
          </ButtonLink>
        }
      />

      {categories.length === 0 && authors.length === 0 && (
        <p className={b('tip')}>
          <strong>Tip:</strong> <Link to="/preferences">choose topics</Link> or press{' '}
          <strong>+ Follow</strong> on any author to tailor this feed.
        </p>
      )}

      {sources.length === 0 ? (
        <EmptyState>
          You have no sources selected. <Link to="/preferences">Pick at least one</Link>.
        </EmptyState>
      ) : (
        <ArticleResults
          result={result}
          articles={articles}
          heading="Your articles"
          empty="Nothing here yet. Try adding more topics or sources."
        />
      )}
    </>
  )
}
