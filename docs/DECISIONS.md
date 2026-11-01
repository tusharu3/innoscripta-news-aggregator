# Architecture decision records

Short records of choices that someone might reasonably question.

---

## ADR-001: Adapter per provider behind one `NewsSource` interface

**Context.** Four providers with different query syntax, pagination, payloads and capabilities.
**Decision.** Each provider gets an adapter that maps `ArticleQuery → request` and `response → Article[]`. The UI only sees `Article`.
**Consequences.** Adding or removing a provider touches one folder. Provider quirks (0-based pages, missing date filters) stay contained. The cost is a small mapping layer per provider.

## ADR-002: Same-origin proxy for all providers

**Context.** API keys would otherwise ship in the JS bundle. NewsAPI's free tier rejects browser requests from non-localhost origins. RSS feeds have no CORS headers.
**Decision.** The browser calls `/api/<source>/…`. The Vite dev proxy and nginx in Docker forward it and attach the key from env vars. Keys are deliberately **not** `VITE_`-prefixed.
**Consequences.** Keys stay server-side. One Docker image works with any keys because they are supplied at `docker run`. CORS problems disappear. The proxy rules exist twice (`vite.config.ts` and `docker/nginx.conf.template`) and must be kept in sync, so both files point at each other.

## ADR-003: BBC News via RSS

**Context.** The Guardian's public `test` key no longer works. Every keyed provider would need sign-ups before a reviewer sees any data.
**Decision.** Add BBC News (it's on the brief's list) through its free RSS feeds. It has no search API, so keyword and date filtering run client-side with the shared `createQueryMatcher`.
**Consequences.** The app shows real news with zero configuration. BBC results are limited to the latest feed items (no deep history or pagination), and this is documented.

## ADR-004: TanStack Query for server state, Zustand for preferences, URL for filters

**Context.** Three different kinds of state with different lifetimes.
**Decision.** Server data goes in TanStack Query (cache, dedupe, abort, infinite pages). Preferences go in Zustand with `persist` (tiny, no provider). Search filters go in the URL.
**Consequences.** No hand-written fetching effects, no Redux boilerplate, and shareable search links. Each piece of state has exactly one owner.

## ADR-005: `Promise.allSettled` and partial results

**Context.** Free tiers fail often (missing key, 429, 426).
**Decision.** The aggregator never rejects because one source failed. It returns `{ articles, failures }`, and the UI shows results plus a non-blocking notice.
**Consequences.** Better resilience and an honest UI. Callers must remember to render `failures`, and `ArticleResults` does this for every list.

## ADR-006: Followed authors rank rather than filter

**Context.** Only some providers expose authors, and none support querying by author consistently.
**Decision.** Fetch by sources and categories, then move followed authors' articles to the top (`rankByAuthors`).
**Consequences.** The feed is never empty because of an author preference, and following someone takes effect instantly without a request. It's less strict than a hard filter, which is noted in the README.

## ADR-007: Debounce the request, not the input

**Decision.** The search input writes to the URL on every keystroke (`replace: true`), and `SearchPage` debounces the keyword before it reaches the query key.
**Consequences.** No duplicated local state, no URL ⇄ input sync bugs, the back button works, and only one request goes out per pause in typing (covered by a test).

## ADR-008: Tooling (Vite, Vitest, oxlint)

**Decision.** Use the current Vite React-TS template defaults (oxlint, TypeScript native compiler) and Vitest sharing Vite's config.
**Consequences.** Fast feedback (the full test suite runs in about 3 s) and minimal config files.

## ADR-009: Token-based design language with SCSS Modules (replaces Tailwind)

**Context.** The UI should feel like a polished, consistent product. The styling should show a real design system: tokens, partials, inheritance, conditional logic, and modern CSS (`@layer`, `@container`, `@supports`).
**Decision.** Define the design tokens as Sass maps, compile them to CSS custom properties, and style components with CSS Modules that consume them only through token functions and mixins. Remove Tailwind.
**Consequences.** One source of truth for the brand, readable scoped CSS, and build-time errors on unknown tokens. Three brand colours were adjusted for WCAG AA (documented in DESIGN.md §4). There are more files than with utility classes, which is accepted for clarity.

## ADR-010: Storybook as the component and design-system workbench

**Decision.** Storybook 10 with only the Docs and A11y addons. Stories run inside the real providers with fake `NewsSource`s (the same DI seam the tests use). A token page reads live CSS variables.
**Consequences.** Every state (loading, partial failure, empty, phone, 4K) can be reviewed without API keys, and axe runs per story. The init's extra addons (Chromatic, vitest browser mode, MCP) were removed to keep dependencies lean.

## ADR-011: No Redux

**Context.** Redux was suggested as a "modern React" addition.
**Decision.** Don't add it. Server state lives in TanStack Query (cache, dedupe, pagination, cancellation). The only client state, preferences, is a small Zustand store with persistence.
**Consequences.** No action/reducer boilerplate and no duplicated server data in a client store. Revisit with RTK if several features come to share complex client-side workflows.

## ADR-012: Infinite scroll with a capped auto-load and a "Load more" fallback

**Decision.** IntersectionObserver auto-loads pages (prefetching 800px early) up to `AUTO_LOAD_PAGE_LIMIT = 3`, and a visible "Load more" button stays available throughout.
**Consequences.** Smooth browsing, and the footer stays reachable. It works for keyboard users and without IntersectionObserver, and the DOM can't grow without bound.

## ADR-013: Lazy secondary routes, eager landing route

**Decision.** `React.lazy` for Search and Preferences, preloaded on nav-link hover, focus or touch. The feed stays in the main bundle.
**Consequences.** A smaller initial bundle without delaying LCP. Suspense fallbacks are rarely seen, and they mirror the header size (no CLS).

## ADR-014: CSS `content-visibility` instead of a JS virtual list

**Decision.** Apply `content-visibility: auto` with `contain-intrinsic-size: auto 26rem` to grid items.
**Consequences.** Off-screen cards skip layout and paint with zero JS, and the responsive grid and container queries keep working. A JS virtualiser (TanStack Virtual) is the upgrade path if lists grow past about 500 items.

## ADR-015: BEM inside CSS Modules

**Decision.** Write BEM class names in SCSS modules and read them through a tiny `bem()` helper.
**Consequences.** Self-describing class names (`article-card__title--large`) in code and DevTools, with Modules guaranteeing no collisions. CSS Modules no longer camel-case the names.
