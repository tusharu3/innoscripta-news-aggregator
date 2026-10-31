import { vi } from 'vitest'
import type { Article, ArticleQuery, SourceId } from '@/domain/article'
import type { NewsSource, SourcePage } from '@/api/sources/types'

let seq = 0

export function makeArticle(overrides: Partial<Article> = {}): Article {
  seq += 1
  return {
    id: `fake:${seq}`,
    title: `Article ${seq}`,
    description: 'Description',
    url: `https://example.com/article-${seq}`,
    publishedAt: '2024-05-01T10:00:00.000Z',
    sourceId: 'guardian',
    publisher: 'Example Times',
    ...overrides,
  }
}

/** A NewsSource whose responses are controlled by the test; calls are recorded on `fetchArticles`. */
export function createFakeSource(
  id: SourceId,
  respond: (query: ArticleQuery) => SourcePage | Promise<SourcePage> = () => ({
    articles: [],
    hasMore: false,
  }),
  label = id.toUpperCase(),
) {
  return {
    id,
    label,
    fetchArticles: vi.fn(async (query: ArticleQuery) => respond(query)),
  } satisfies NewsSource
}
