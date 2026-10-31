import type { Article } from '@/domain/article'

/**
 * Moves articles by followed authors to the top, keeping newest-first order within each group.
 * We rank rather than filter: few providers can query by author, so strict filtering would
 * usually leave the feed empty.
 *
 * One pass, stable partition: O(n · a) for n articles and a followed authors (a is tiny),
 * with author names lower-cased once up front rather than per comparison.
 * Substring match, so "Jane Doe" also matches the co-authored byline "Jane Doe and John Roe".
 */
export function rankByAuthors(articles: Article[], authors: readonly string[]): Article[] {
  if (authors.length === 0) return articles

  const followedNames = authors.map((name) => name.toLowerCase())
  const followed: Article[] = []
  const others: Article[] = []

  for (const article of articles) {
    const byline = article.author?.toLowerCase()
    const isFollowed = byline !== undefined && followedNames.some((name) => byline.includes(name))
    ;(isFollowed ? followed : others).push(article)
  }
  return followed.concat(others)
}
