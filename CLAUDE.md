# CLAUDE.md

Steering file for AI coding agents working in this repo. Humans: see [README.md](README.md).

## What this is

A React 19 + TypeScript news aggregator (Guardian, NYT, NewsAPI, BBC RSS) with keyword search and filters, a personalised feed, and a Docker/nginx runtime. It's a take-home assignment, so **clarity and correctness beat cleverness.**

## Commands

```bash
npm run dev        # http://localhost:5173 (proxy reads keys from .env)
npm test           # vitest run
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run security   # dependency audit + secret/unsafe-code scan (also runs in the pre-push hook)
npm run verify     # typecheck + lint + test + build. Must be green before you say "done".
npm run storybook  # http://localhost:6006 (design tokens, components, page states)
docker compose up --build   # http://localhost:8080
```

## Read before changing code

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): **index** of every feature and technique, plus where it lives
- [docs/DESIGN.md](docs/DESIGN.md): visual language, tokens and CSS architecture
- [docs/DATA_FLOW.md](docs/DATA_FLOW.md): where each piece of state lives
- [docs/CODE_GUIDELINES.md](docs/CODE_GUIDELINES.md): conventions and the review checklist
- [docs/TESTING.md](docs/TESTING.md): test helpers and style
- [docs/DECISIONS.md](docs/DECISIONS.md): don't re-litigate these without a new reason. Add an ADR if you change one.

## Hard rules

1. **Provider-specific code lives only in `src/api/sources/`.** The UI talks to `Article`, `ArticleQuery` and `NewsSource`.
2. **Components never import adapters.** Use `useNewsSources()` (DI via `SourcesProvider`).
3. **Server data goes through `useArticles` / TanStack Query.** No `useEffect` + `fetch`.
4. **One owner per piece of state:** URL for search filters, the Zustand store for preferences, the Query cache for articles.
5. **API keys never reach the client.** No `VITE_*` secrets. Proxy rules live in `vite.config.ts` **and** `docker/nginx.conf.template`. Change both together.
6. **Every behaviour change ships with a test.** Page tests use `renderWithProviders` with `createFakeSource`. No network mocks.
7. **Keep it small.** No new dependency, abstraction or option unless the task needs it. Mention trade-offs instead of silently picking one.
8. **BEM in SCSS modules**, read with `bem(styles, 'block')`. Comment the _why_ in every file (a one-line doc comment on each exported function and component). Put tunables in `src/config/constants.ts`, not inline.
9. **Protect Core Web Vitals:** no lazy-loading the landing route, images need `width`/`height`, skeletons must match final layout, and no unbounded effects in render paths.
10. **Match the style:** no semicolons, single quotes, named exports, `import type`, SCSS modules with design-token functions only (see docs/DESIGN.md).

## Where things go

| Adding…                | Put it in                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| a news provider        | `src/api/sources/<name>.ts` + `registry.ts` + `SOURCE_IDS` + both proxy configs (see ARCHITECTURE → “Adding a news source”) |
| a page or feature      | `src/features/<feature>/` (page at the root, `components/<Name>/`, `hooks/`)                                                |
| UI used by 2+ features | `src/components/<Name>/` (TSX + module.scss + stories)                                                                      |
| a pure helper          | `src/lib/` (no app imports); a reusable hook goes in `src/hooks/`                                                           |
| styles or tokens       | `src/styles/abstracts/_tokens.scss` (values) and `X.module.scss` next to the component                                      |
| a story                | `X.stories.tsx` next to the component. Page stories go in `src/stories/pages/`.                                             |
| a domain type          | `src/domain/`                                                                                                               |

## Definition of done

- `npm run verify` passes
- New behaviour is covered by tests, including the unhappy path
- Works from 320 px to large displays, and with the keyboard
- New or changed visual states have a Storybook story
- Docs updated if architecture, data flow or decisions changed

## Agents and commands

- `code-reviewer`: run on every non-trivial diff before calling it done
- `test-writer`: add or extend tests for a file or feature
- `story-writer`: add or extend Storybook stories for a component
- `a11y-responsive-auditor`: after UI changes
- `security-auditor`: **before every push**, and after touching dependencies, proxy, Docker or CI files
- `performance-auditor`: after changes to routing, images, fonts, lists or data fetching
- `source-adapter-builder`: to add a new provider
- `/verify`: run the full quality gate and summarise it
- `/pre-push`: security-auditor review + `npm run verify` before pushing
