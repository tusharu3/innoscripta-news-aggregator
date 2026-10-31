# Code guidelines

These rules keep the codebase consistent for both human and AI contributors. The `code-reviewer` agent checks changes against this file.

## Principles

1. **Simplest thing that works.** No speculative options, no single-use abstractions. If 200 lines could be 50, write 50.
2. **Surgical changes.** Touch only what the task needs. Don't reformat or “improve” unrelated code in the same change.
3. **Make it verifiable.** Every behaviour change comes with a test that would fail without it.
4. **Say what you assumed.** Note assumptions and trade-offs in the PR (or in `docs/DECISIONS.md` if they're architectural).

## TypeScript

- `strict` is on. No `any`. Use `unknown` and narrow it. Keep `as` casts to boundaries (provider JSON, URL params) and validate there.
- Model provider payloads with a local `interface` that has **only the fields we read**.
- Prefer union literals and `as const` arrays (`CATEGORIES`) over enums (`erasableSyntaxOnly` is on).
- Use `import type` for type-only imports (`verbatimModuleSyntax`).
- Named exports only (no `export default` in `src/`).

## React

- Function components and hooks only. Name the component file after the component (`ArticleCard.tsx`). Name hooks `useX.ts`.
- **Server data goes through TanStack Query** (`useArticles`), never through `useEffect` + `fetch`.
- **Every piece of state has one owner** (see [DATA_FLOW.md](DATA_FLOW.md#where-state-lives)). Don't mirror URL or store state into `useState`.
- Derive values instead of storing them. Use `useMemo` only when a value feeds a query key or the computation is non-trivial.
- Zustand: select the narrowest slice (`usePreferences((s) => s.authors)`) to avoid re-renders.
- Components must not import concrete adapters. Get sources from `useNewsSources()`.

## Sources (adapters)

- Keep URL building and response mapping as **pure exported functions**, so they can be unit tested without `fetch`.
- Map to `Article` at the edge. Strip HTML with `toPlainText` and clean bylines with `cleanByline`.
- `id` must be globally unique: `<sourceId>:<provider id or url>`.
- Always forward the `AbortSignal`.
- If the provider can't filter server-side, use `createQueryMatcher`. Don't write a new filter.
- Throw on failure (via `getJson`/`getText`). Never swallow errors: the aggregator reports them.

## Styling

Full rationale is in [DESIGN.md](DESIGN.md#7-css-architecture). In short:

- One `X.module.scss` next to each component, starting with `@use 'abstracts' as *;`.
- Use **token functions only**: `color('link')`, `space('4')`, `radius('xl')`, `shadow('md')`, `@include type('small')`. No raw hex, px spacing or font sizes. Unknown tokens fail the build.
- Reuse with `@extend %surface-card | %pill | %eyebrow | %field | %empty-panel` and the mixins (`mq`, `container`, `hover`, `motion-safe`, `focus-ring`, `gradient-text`).
- Mobile first: base styles are for phones, `@include mq(md) { … }` adds from tablet up. Prefer intrinsic layouts (`auto-fill`/`minmax`, `clamp()`) and `@container` over viewport breakpoints.
- Drive visual state from the DOM (`[aria-pressed='true']`, `[aria-expanded]`, `[data-open]`) instead of extra classes.
- Wrap hover effects in `@include hover` and animations in `@include motion-safe`.
- Touch targets ≥ 40px. Inputs are 16px on phones (`%field` handles it).
- **BEM** inside every module: one block per component (`.article-card`), elements `&__title`, modifiers `&--active`. In TSX use `const b = bem(styles, 'article-card')`, then `b('title')` or `b('link', { active })`. Use `cx()` only to merge an external `className`.
- Every new visual component gets a `*.stories.tsx` covering its states.

## Accessibility

- Semantic elements first (`<article>`, `<nav>`, `<form role="search">`, `<fieldset>`/`<legend>`).
- Every input has a `<label>` (visually hidden if needed). Toggle buttons use `aria-pressed`.
- Async updates are announced (`role="status"`). Loading regions are `aria-busy`.
- Decorative images use `alt=""`. Duplicate links are removed from the tab order.
- Visible focus styles. A skip link sits in `Layout`.

## Comments

- Every exported function, hook and component gets a short doc comment explaining **what it's for and why** (not a restatement of the code).
- Explain non-obvious decisions inline: performance (`// eager: likely LCP element`), accessibility (`// WCAG 2.4.3`) and provider quirks (`// NYT pages are 0-based`).
- No commented-out code and no TODOs without an issue link.

## Folders

- Organise by feature: `features/<feature>/` holds its page, `components/<Name>/`, `hooks/` and pure helpers.
- Shared UI goes in `components/<Name>/`, shared hooks in `hooks/`, pure helpers in `lib/`, network code in `api/`, tunables in `config/constants.ts`.
- There are no barrel `index.ts` files. Import the file directly via `@/…`, so "Go to definition" lands on the real code.

## Naming

| Thing        | Convention                       | Example                             |
| ------------ | -------------------------------- | ----------------------------------- |
| Components   | PascalCase, one folder each      | `ArticleResults/ArticleResults.tsx` |
| Hooks        | `useX`                           | `useSearchFilters`                  |
| Pure helpers | verb-first camelCase             | `buildNytUrl`, `rankByAuthors`      |
| Constants    | UPPER_SNAKE                      | `PAGE_SIZE`, `CATEGORY_LABELS`      |
| Tests        | next to the file, `*.test.ts(x)` | `nyt.test.ts`                       |

## Formatting and tooling

Prettier (no semicolons, single quotes, width 110) and oxlint. Run `npm run verify` before pushing. CI runs the same.

## Review checklist

- [ ] Requirement met, and nothing beyond it
- [ ] Respects the [dependency rules](ARCHITECTURE.md#dependency-rules)
- [ ] No provider-specific logic outside `src/api/sources/`
- [ ] State has a single owner. No effects syncing state.
- [ ] Loading, empty, error and partial-failure states handled
- [ ] Works from 320 px to 1920 px+. Keyboard and screen-reader friendly.
- [ ] Styles use tokens and mixins only. A story exists for new visual states.
- [ ] Tests cover the behaviour, not the implementation
- [ ] No secrets or `VITE_`-prefixed keys
- [ ] `npm run verify` is green
