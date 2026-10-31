import type { Article, ArticleQuery, SourceId } from '@/domain/article'

export interface SourcePage {
  articles: Article[]
  hasMore: boolean
}

/**
 * The one contract every news provider implements. The aggregator and UI depend on this
 * interface only (dependency inversion); adding a provider means adding an adapter, not
 * editing existing code (open/closed).
 */
export interface NewsSource {
  id: SourceId
  label: string
  fetchArticles(query: ArticleQuery, signal?: AbortSignal): Promise<SourcePage>
}
