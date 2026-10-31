import { createQueryMatcher } from '@/api/sources/queryMatcher'
import { defaultSources } from '@/api/sources/registry'
import { SOURCE_IDS, type Article, type SourceId } from '@/domain/article'
import type { NewsSource } from '@/api/sources/types'

// Fictional sample data for Storybook. Images come from picsum.photos (placeholder service).
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

export const sampleArticles: Article[] = [
  {
    id: 'story:1',
    title: 'European research labs race to turn quantum prototypes into products',
    description:
      'A new wave of start-ups is moving quantum sensors out of university basements and into factories, hospitals and satellites.',
    url: 'https://example.com/quantum',
    imageUrl: 'https://picsum.photos/seed/quantum/640/360',
    author: 'Lena Hoffmann',
    publishedAt: hoursAgo(1),
    sourceId: 'guardian',
    publisher: 'The Guardian',
  },
  {
    id: 'story:2',
    title: 'Why mid-sized manufacturers are betting big on R&D tax incentives',
    description:
      'Finance chiefs say clearer documentation rules have made claiming research allowances far less painful.',
    url: 'https://example.com/rd-tax',
    imageUrl: 'https://picsum.photos/seed/factory/640/360',
    author: 'Marcus Webb',
    publishedAt: hoursAgo(3),
    sourceId: 'nyt',
    publisher: 'The New York Times',
  },
  {
    id: 'story:3',
    title: 'Munich’s climate-tech cluster doubles in size in two years',
    description: 'Investors cite deep engineering talent and public research funding as the main draws.',
    url: 'https://example.com/munich',
    imageUrl: 'https://picsum.photos/seed/munich/640/360',
    publishedAt: hoursAgo(5),
    sourceId: 'bbc',
    publisher: 'BBC News',
  },
  {
    id: 'story:4',
    title: 'Open-source AI models close the gap with commercial rivals',
    description:
      'Benchmarks published this week show community models matching paid offerings on reasoning tasks.',
    url: 'https://example.com/ai',
    author: 'Priya Natarajan',
    publishedAt: hoursAgo(8),
    sourceId: 'newsapi',
    publisher: 'Reuters',
  },
  {
    id: 'story:5',
    title: 'The quiet comeback of the European chip industry',
    description: 'Subsidies, new fabs and a talent push are starting to reshape semiconductor supply chains.',
    url: 'https://example.com/chips',
    imageUrl: 'https://picsum.photos/seed/chips/640/360',
    author: 'Lena Hoffmann',
    publishedAt: hoursAgo(26),
    sourceId: 'guardian',
    publisher: 'The Guardian',
  },
  {
    id: 'story:6',
    title: 'Hospitals trial software that drafts clinical notes in real time',
    description: 'Doctors in three countries report spending less time on paperwork and more with patients.',
    url: 'https://example.com/health',
    imageUrl: 'https://picsum.photos/seed/clinic/640/360',
    author: 'Sam Okafor',
    publishedAt: hoursAgo(30),
    sourceId: 'nyt',
    publisher: 'The New York Times',
  },
]

/** Labels come from the real registry, so stories always match the app. */
const LABELS = Object.fromEntries(defaultSources.map((source) => [source.id, source.label])) as Record<
  SourceId,
  string
>

interface StorySourceOptions {
  /** Simulated network latency. `Infinity` keeps the story in its loading state. */
  delayMs?: number
  /** Makes the source fail with this message, to show partial-failure UI. */
  error?: string
  /** Generate this many extra pages of synthetic articles, to demo infinite scroll. */
  extraPages?: number
}

/** Synthetic article for page `page`, slot `slot` (used by paginated stories). */
function generatedArticle(id: SourceId, page: number, slot: number): Article {
  const base = sampleArticles[(page + slot) % sampleArticles.length]
  return {
    ...base,
    id: `story:${id}:${page}:${slot}`,
    url: `https://example.com/${id}/${page}/${slot}`,
    title: `${base.title} (page ${page})`,
    imageUrl: `https://picsum.photos/seed/${id}-${page}-${slot}/640/360`,
    publishedAt: new Date(Date.now() - (page * 24 + slot) * 3_600_000).toISOString(),
    sourceId: id,
  }
}

/** A fake NewsSource backed by `sampleArticles`, honouring keyword and date filters. No network. */
export function storySource(
  id: SourceId,
  { delayMs = 300, error, extraPages = 0 }: StorySourceOptions = {},
): NewsSource {
  return {
    id,
    label: LABELS[id],
    async fetchArticles(query) {
      await new Promise((resolve) => {
        if (Number.isFinite(delayMs)) setTimeout(resolve, delayMs)
      })
      if (error) throw new Error(error)

      const matches = createQueryMatcher(query)
      const articles =
        query.page === 1
          ? sampleArticles.filter((article) => article.sourceId === id)
          : Array.from({ length: 6 }, (_, slot) => generatedArticle(id, query.page, slot))
      return { hasMore: query.page <= extraPages, articles: articles.filter(matches) }
    },
  }
}

export const allStorySources = SOURCE_IDS.map((id) => storySource(id))
