# Design document

How Newsroom looks, why it looks that way, and how the styling is built.

> Living reference: run `npm run storybook` and open **Foundations → Design tokens**. That page reads the real CSS variables, so it can't fall out of date.

---

## 1. Tokens at a glance

All values live in [`_tokens.scss`](../src/styles/abstracts/_tokens.scss). Components read them only through token functions and mixins.

| Role                         | Value                                         | Token                                      |
| ---------------------------- | --------------------------------------------- | ------------------------------------------ |
| Typeface (all text)          | Poppins 400 / 500 / 600 / 700                 | `$font-family-base`                        |
| Headings and body text       | navy `#113b53`                                | `color('text')`                            |
| Secondary text               | navy at 80% opacity                           | `color('text-muted')`                      |
| Accent (borders, large text) | `#2186ab`                                     | `color('accent')`                          |
| Links and small accent text  | `#115d78`                                     | `color('link')`                            |
| Headline highlight gradient  | `linear-gradient(87.45deg, #2b98c4, #38a09d)` | `--gradient-brand`                         |
| Page background              | `#f8f9fa`                                     | `color('canvas')`                          |
| Hairline borders             | `1px solid #ededed`                           | `color('border')`                          |
| Pill input outline           | `1px solid #b9d3dd`, radius 999px             | `color('border-strong')`, `radius('pill')` |
| Card radius                  | 20px                                          | `radius('xl')`                             |
| Control radii                | 6px / 8px                                     | `radius('sm')`, `radius('md')`             |
| Page title                   | 600, 30 → 48px fluid                          | type style `hero`                          |
| Eyebrow                      | 12.25px, uppercase, +0.08em                   | type style `eyebrow`                       |
| Button label                 | 14px, 600, uppercase, +0.035em                | type style `button`                        |
| Elevation                    | `0 4px 12px rgba(0,0,0,.1)`                   | `shadow('md')`                             |
| Focus outline                | 3px ring, accent at 30%                       | `focus-ring` mixin                         |
| Layering                     | header 100, bottom nav 110, skip link 200     | `$z-index`                                 |

## 2. Design principles

1. **Calm, editorial, trustworthy.** Mostly navy on white with generous whitespace, and colour reserved for meaning.
2. **One signature move.** The blue→turquoise gradient appears only on headline highlights, the wordmark dot and primary actions, which keeps it special.
3. **Content first.** Cards are quiet (hairline border, no shadow) until hovered, so images and headlines carry the page.
4. **Accessible by default.** Every colour pairing meets WCAG 2.2 AA. Where the brand palette didn't, we adjusted it (see §4).
5. **Responsive by construction.** Layouts adapt to the space they get: intrinsic grids, container queries and fluid type. There are no per-device templates.

## 3. Typography

Poppins, self-hosted with `@fontsource/poppins` (latin subset, 4 weights, about 32 kB as woff2). There's no third-party font request, which is better for privacy (GDPR) and means the Docker image works offline.

| Style        | Size                        | Weight | Used for                                               |
| ------------ | --------------------------- | ------ | ------------------------------------------------------ |
| `hero`       | 30 → 48px _fluid_           | 600    | Page titles                                            |
| `heading`    | 18 → 22px _fluid_           | 600    | Card titles in wide layout, section headings, wordmark |
| `card-title` | 17px                        | 600    | Article titles                                         |
| `lead`       | 16 → 18px _fluid_           | 400    | Page descriptions                                      |
| `body`       | 15px / 1.6                  | 400    | Default text                                           |
| `small`      | 14px                        | 400    | Descriptions, chips, meta                              |
| `caption`    | 12px                        | 400    | Footer, badges, tab-bar labels                         |
| `eyebrow`    | 12.25px, uppercase, +0.08em | 500    | Labels above titles, form labels                       |
| `button`     | 14px, uppercase, +0.035em   | 600    | Buttons                                                |

_Fluid_ styles use `clamp()` generated by the Sass `fluid()` function, scaling linearly between 576px and 1280px viewports. Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`, where the browser supports them.

## 4. Colour and accessibility trade-offs

Components use **semantic** tokens (`color('text')`, `color('link')`…), never raw palette values. That keeps the brand-to-role mapping in one file.

| Pairing                                    | Brand value              | Contrast                   | Our decision                                                                           |
| ------------------------------------------ | ------------------------ | -------------------------- | -------------------------------------------------------------------------------------- |
| White label on CTA gradient                | `#2b98c4 → #38a09d`      | 3.3 / **3.1:1** ✗          | **`action` gradient `#1c7393 → #277f7f`**: same hue and angle, **5.4 / 4.7:1** ✓       |
| Small accent text (links, publisher label) | `#2186ab`                | **4.1:1** ✗                | Use theme-dark **`#115d78` (7.3:1)** ✓. `#2186ab` stays for borders and large accents. |
| Secondary text                             | navy @ 60%               | **3.6:1** ✗ for small text | Body and meta use **navy @ 80% (6.5:1)** ✓. 60% only for placeholders.                 |
| Gradient headline text                     | `#2b98c4 → #38a09d`      | 3.3 / 3.1:1                | Kept: it's ≥ 24px bold (large text needs 3:1) ✓                                        |
| Warning notice                             | orange text on orange-10 | 3.6:1 ✗                    | **Navy text** on orange-10 with an orange left rule (10.8:1) ✓                         |

Users who ask for more contrast (`prefers-contrast: more`) get solid navy text and darker borders automatically. Windows High Contrast (`forced-colors`) keeps a visible system focus ring.

## 5. Layout and responsiveness

**Breakpoints** (mobile-first, `em` so they respect user font size): `sm` 576 · `md` 768 · `lg` 1024 · `xl` 1280 · `xxl` 1920.

| Technique                                                                         | Where                               | Why                                                                                                          |
| --------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Fluid container `min(100% - 2·gutter, 80rem)`, 100rem from `xxl`                  | `.container`                        | Comfortable line lengths from phones to 4K, no breakpoint jumps                                              |
| Fluid gutter `clamp(1rem … 2.5rem)`                                               | `--gutter`                          | Tighter on phones, airy on desktops                                                                          |
| **Intrinsic grid** `repeat(auto-fill, minmax(min(100%, 19rem), 1fr))`             | Article grid                        | 1 → 2 → 3 → 4–5 columns with **no media queries**, and never overflows at 320px                              |
| **Container queries**                                                             | `ArticleCard`, preferences sections | The card switches to media-left when _it_ is ≥ 34rem wide. That depends on its container, not on the device. |
| Bottom tab bar under `md`, top nav from `md`                                      | `Layout`                            | Thumb-reachable navigation on phones. Respects `safe-area-inset-bottom` on notched devices.                  |
| Collapsible filter panel under `md`                                               | `FilterBar`                         | The search field stays above the fold on phones. A badge shows the active filter count.                      |
| `100dvh`, 16px inputs on phones                                                   | Base, `%field`                      | No iOS address-bar jump, no zoom on focus                                                                    |
| Touch targets ≥ 40px, hover effects only for `(hover: hover) and (pointer: fine)` | `%pill`, `hover` mixin              | No sticky hover states on touch screens                                                                      |

Verified in the browser at **320, 375, 620, 700, 1440 and 2560px**, with no horizontal scroll at any width.

## 6. Components

| Component               | Anatomy and states                                                                                                                                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**              | Pill, uppercase label. `primary` (action gradient), `secondary` (white with blue-grey outline), `ghost` (link colour). Sizes `md` (44px) and `sm` (36px). Disabled at 60% opacity. `ButtonLink` shares the styles.                                              |
| **ChipToggle**          | Pill toggle. Its state comes from `aria-pressed`, which drives both a11y and styling (check icon, accent-soft fill).                                                                                                                                            |
| **PageHeader**          | Eyebrow, H1 with gradient highlight, lead, optional actions. Centred, like a landing-page hero.                                                                                                                                                                 |
| **ArticleCard**         | Media (16:9, or a gradient placeholder with the publisher name), eyebrow meta (publisher · relative time), title link, 3-line clamped description, byline + Follow pill. It lifts on hover. Keyboard focus on the title highlights the whole card via `:has()`. |
| **FilterBar**           | Pill search field plus a card with category, date fields and source chips. Collapsible on phones.                                                                                                                                                               |
| **Notice / EmptyState** | Partial-failure notice (orange rule) and a dashed empty panel.                                                                                                                                                                                                  |
| **Skeleton**            | Card-shaped shimmer, which becomes static blocks under `prefers-reduced-motion`.                                                                                                                                                                                |

## 7. CSS architecture

```
src/styles/
  abstracts/            ← no CSS output; imported by every module with `@use 'abstracts' as *`
    _tokens.scss        Sass maps: palette, semantic colours, gradients, type scale, spacing, radii, shadows, breakpoints, z-index, motion
    _functions.scss     rem(), get() (fails the build on unknown keys), color(), space(), radius(), shadow(), fluid()
    _mixins.scss        mq(), container(), hover, motion-safe, type(), gradient-text, line-clamp, focus-ring, visually-hidden, button-variant()
    _placeholders.scss  %surface-card, %pill, %eyebrow, %field, %empty-panel
    _index.scss         @forward of the above
  base/
    _root.scss          Sass maps → CSS custom properties (@each), plus prefers-contrast and reduced-motion overrides
    _reset.scss, _typography.scss, _utilities.scss
  main.scss             @layer reset, base, utilities + meta.load-css()
src/**/X.module.scss    Component styles: CSS Modules + BEM (`.article-card__title`), read via lib/bem.ts
```

### Sass features in use

| Feature                            | Example                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Variables and maps**             | `$palette`, `$type-scale: ('hero': (min: 1.875rem, max: 3rem, …))`                                                  |
| **Partials and the module system** | `_tokens.scss` and friends, `@use` / `@forward`. No global `@import`.                                               |
| **Inheritance**                    | `%surface-card`, `%pill`, `%eyebrow`, `%field` shared with `@extend` (selectors are grouped, not duplicated)        |
| **Mixins with arguments**          | `@include type('hero')`, `@include mq(md)`, `@include container(34rem, card)`                                       |
| **Conditionals**                   | `@if/@else if` in `button-variant()`, `type()` (fluid vs fixed) and `mq()`. `@error` on unknown tokens or variants. |
| **Loops**                          | `@each` to emit all custom properties, button variant classes and the Storybook type samples                        |
| **Functions and math**             | `fluid()` computes `clamp()` slope and intercept with `sass:math`. `rem()`. `str-replace()`.                        |
| **`meta.load-css`**                | Wraps partials in cascade layers from `main.scss`                                                                   |

### Native CSS features in use

| Feature                            | Example                                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Custom properties**              | All tokens at runtime (`var(--color-link)`), with responsive overrides (`--header-height`, `--bottom-nav-height`) |
| **Cascade layers** `@layer`        | `reset < base < utilities < modules`: precedence that doesn't depend on import order                              |
| **Container queries** `@container` | Card and preferences-section layouts                                                                              |
| **Feature queries** `@supports`    | `backdrop-filter` header, `background-clip: text`, `text-wrap`, `:has()` fallback                                 |
| **User-preference media queries**  | `prefers-reduced-motion`, `prefers-contrast`, `hover`/`pointer`, `forced-colors`, `print`                         |
| **Modern selectors**               | `:has()`, `:focus-within`, `:focus-visible`, `[aria-pressed='true']`, `[data-open='false']`                       |
| **Math and sizing functions**      | `clamp()`, `min()`, `env(safe-area-inset-bottom)`, `dvh`, `aspect-ratio`                                          |

### Rules

- Components use **only** token functions (`color()`, `space()`, `radius()`, …) and mixins. No raw hex values or magic numbers.
- **State comes from the DOM** (`aria-pressed`, `aria-expanded`, `aria-busy`, `data-open`) rather than extra modifier classes.
- **Mobile first.** Use `mq(md)` for “from md up”, and use `$until` only for phone-only behaviour.
- A component may only style its own elements. Layout between components is the parent's job.
- **BEM naming**: `.block`, `.block__element`, `.block--modifier`, written with Sass nesting (`&__title`, `&--active`) and read in TSX through `bem(styles, 'block')`. CSS Modules scope the names (hashed in production), so BEM gives readability and Modules give isolation.

## 8. Storybook

`npm run storybook` → http://localhost:6006

- **Foundations / Design tokens:** live colour, gradient, type, spacing, radius and shadow galleries
- **Components:** Button, ChipToggle, PageHeader, EmptyState (with controls)
- **Features:** ArticleCard (image, no image, no author, long title, long author, wide container), FilterBar (interactive, active filters, phone)
- **Pages:** full app screens on fake sources: Feed, Search, Preferences, **Partial failure**, **Loading**, **No results**, phone and large-display variants

Every story runs inside the real app providers with fake `NewsSource`s, so there is no network access and no keys are needed. Toolbar viewports match the breakpoints. The **a11y addon** runs axe on every story.

## 9. Trade-offs and what I'd do next

| Decision                         | Trade-off                                                                                                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCSS Modules instead of Tailwind | More files, but the brief and the brand call for a real token system, inheritance and conditional logic. Class names are scoped and readable, and the CSS bundle is about 23 kB (5 kB gzipped). |
| Darkened action gradient         | Slightly deeper than the brand gradient, in exchange for AA-compliant labels.                                                                                                                   |
| No dark mode                     | Out of scope for now. The token layer is ready for it: a `[data-theme='dark']` block overriding `--color-*` would be enough.                                                                    |
| Picsum images in Storybook       | External placeholder service. It's for documentation only and never used by the app.                                                                                                            |

Next: visual regression tests on the Storybook stories (Chromatic or Playwright screenshots), and a dark theme behind `prefers-color-scheme`.
