import { bbcSource } from './bbc'
import { guardianSource } from './guardian'
import { newsApiSource } from './newsapi'
import { nytSource } from './nyt'
import type { NewsSource } from './types'

/** The single place to register a provider. The UI derives its source list from this. */
export const defaultSources: readonly NewsSource[] = [guardianSource, nytSource, newsApiSource, bbcSource]
