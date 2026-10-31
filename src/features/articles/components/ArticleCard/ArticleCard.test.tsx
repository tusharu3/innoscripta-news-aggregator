import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeArticle } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { ArticleCard } from './ArticleCard'

const withImage = makeArticle({
  title: 'Headline',
  imageUrl: 'https://img.example/x.jpg',
  publisher: 'BBC News',
})

// The image is decorative (alt="") inside an aria-hidden link, so query it directly.
const image = (container: HTMLElement) => container.querySelector('img')

describe('ArticleCard', () => {
  it('lazy-loads images by default', () => {
    const { container } = renderWithProviders(<ArticleCard article={withImage} />)
    expect(image(container)).toHaveAttribute('loading', 'lazy')
    expect(image(container)).toHaveAttribute('fetchpriority', 'auto')
  })

  it('loads above-the-fold images eagerly with high priority (LCP)', () => {
    const { container } = renderWithProviders(<ArticleCard article={withImage} priority />)
    expect(image(container)).toHaveAttribute('loading', 'eager')
    expect(image(container)).toHaveAttribute('fetchpriority', 'high')
  })

  it('falls back to the publisher placeholder when the image fails', () => {
    const { container } = renderWithProviders(<ArticleCard article={withImage} />)
    fireEvent.error(image(container)!)
    expect(image(container)).toBeNull()
    expect(screen.getByText('BBC News', { selector: 'span' })).toBeInTheDocument()
  })

  it('announces that the link opens in a new tab', () => {
    renderWithProviders(<ArticleCard article={withImage} />)
    expect(screen.getByRole('link', { name: 'Headline (opens in a new tab)' })).toHaveAttribute(
      'target',
      '_blank',
    )
  })
})
