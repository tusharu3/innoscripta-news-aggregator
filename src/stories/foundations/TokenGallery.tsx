import { useState } from 'react'
import { bem } from '@/lib/bem'
import styles from './TokenGallery.module.scss'

const b = bem(styles, 'token-gallery')

/** Reads every custom property with `prefix` from :root at runtime, so docs never drift from the CSS. */
function readRootTokens(prefix: string): [string, string][] {
  const names = new Set<string>()
  const visit = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
        for (const prop of Array.from(rule.style)) if (prop.startsWith(prefix)) names.add(prop)
      } else if ('cssRules' in rule) {
        visit((rule as CSSGroupingRule).cssRules)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      // cross-origin stylesheet, skip
    }
  }
  const root = getComputedStyle(document.documentElement)
  return [...names].map((n) => [n, root.getPropertyValue(n).trim()])
}

// Global styles are loaded before any story renders, so reading once on mount is enough.
const useRootTokens = (prefix: string) => useState(() => readRootTokens(prefix))[0]

export function ColorSwatches({ prefix }: { prefix: '--palette-' | '--color-' | '--gradient-' }) {
  const tokens = useRootTokens(prefix)
  return (
    <div className={b('swatches')}>
      {tokens.map(([name, value]) => (
        <figure key={name} className={b('swatch')}>
          <div className={b('chip')} style={{ background: `var(${name})` }} />
          <figcaption>
            <code>{name}</code>
            <span>{value}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function SpacingScale() {
  const tokens = useRootTokens('--space-')
  return (
    <div className={b('rows')}>
      {tokens.map(([name, value]) => (
        <div key={name} className={b('row')}>
          <code>{name}</code>
          <div className={b('bar')} style={{ width: `var(${name})` }} />
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

export function RadiusAndShadow() {
  const radii = useRootTokens('--radius-')
  const shadows = useRootTokens('--shadow-')
  return (
    <div className={b('swatches')}>
      {radii.map(([name, value]) => (
        <figure key={name} className={b('swatch')}>
          <div className={b('shape')} style={{ borderRadius: `var(${name})` }} />
          <figcaption>
            <code>{name}</code>
            <span>{value}</span>
          </figcaption>
        </figure>
      ))}
      {shadows.map(([name, value]) => (
        <figure key={name} className={b('swatch')}>
          <div className={b('shape')} style={{ boxShadow: `var(${name})` }} />
          <figcaption>
            <code>{name}</code>
            <span>{value}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

const TYPE_SAMPLES = [
  ['hero', 'Today’s news, tailored to you', 'Poppins 600 · 30→48px fluid'],
  ['heading', 'Section heading', 'Poppins 600 · 18→22px fluid'],
  ['card-title', 'Card title for an article headline', 'Poppins 600 · 17px'],
  ['lead', 'Lead paragraph that introduces a page.', 'Poppins 400 · 16→18px fluid'],
  ['body', 'Body copy used for descriptions and longer text.', 'Poppins 400 · 15px / 1.6'],
  ['small', 'Small text for meta information.', 'Poppins 400 · 14px'],
  ['eyebrow', 'Eyebrow label', 'Poppins 500 · 12.25px · uppercase · 0.08em'],
  ['button', 'Button label', 'Poppins 600 · 14px · uppercase · 0.035em'],
] as const

export function TypeScale() {
  return (
    <div className={b('rows')}>
      {TYPE_SAMPLES.map(([style, sample, spec]) => (
        <div key={style} className={b('type-row')}>
          <code>{style}</code>
          <span className={b('sample', { [style]: true })}>{sample}</span>
          <small>{spec}</small>
        </div>
      ))}
    </div>
  )
}
