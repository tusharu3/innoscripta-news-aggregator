import { describe, expect, it } from 'vitest'
import { makeArticle } from '@/test/fakes'
import { rankByAuthors } from './rankByAuthors'

describe('rankByAuthors', () => {
  const a = makeArticle({ author: 'Someone Else' })
  const b = makeArticle({ author: 'Jane Doe and John Roe' })
  const c = makeArticle({ author: undefined })
  const d = makeArticle({ author: 'jane doe' })

  it('returns the list unchanged without followed authors', () => {
    expect(rankByAuthors([a, b, c], [])).toEqual([a, b, c])
  })

  it('moves followed authors (case-insensitive, co-authored) first and keeps relative order', () => {
    expect(rankByAuthors([a, b, c, d], ['Jane Doe'])).toEqual([b, d, a, c])
  })
})
