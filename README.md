# Newsroom — News Aggregator

A news aggregator built with **React 19 + TypeScript** as a frontend take-home challenge.
It searches and combines articles from **The Guardian, The New York Times, NewsAPI and BBC News** in one clean, responsive interface.

![React](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Docker](https://img.shields.io/badge/Docker-ready-2496ed)

## What it does

| Requirement            | Implementation                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Search and filter**  | Keyword search (debounced) with date-range, category and source filters. Filters are kept in the URL, so results can be shared. |
| **Personalised feed**  | Choose preferred sources and topics, and follow authors (they're ranked first). Saved on your device.                           |
| **Mobile responsive**  | Tested from 320px phones to 4K screens. Phones get a bottom tab bar and collapsible filters.                                    |
| **≥ 3 data sources**   | 4 providers behind one adapter interface. A broken or unconfigured provider never blanks the page.                              |
| **Docker**             | Multi-stage build to a non-root nginx image, which also serves as a secure API proxy                                            |
| **DRY · KISS · SOLID** | Mapped to concrete code in [docs/ARCHITECTURE.md §7](docs/ARCHITECTURE.md#7-solid-dry-kiss-in-practice)                         |

## Prerequisites

| You need                | Version                                  | Check              |
| ----------------------- | ---------------------------------------- | ------------------ |
| **Docker** (option A)   | Docker Desktop / Engine 24+ with Compose | `docker --version` |
| **Node.js** (option B)  | **22.22 or newer** (24 recommended)      | `node -v`          |
| **API keys** (optional) | Free. See below.                         | —                  |

> **No keys? It still works.** BBC News uses public RSS feeds, so you'll see real articles straight away.
> Providers without a key show a small "API key missing" notice.

### Optional: free API keys (about 2 minutes each)

| Provider           | Sign up                                                                     | Put it in `.env` as |
| ------------------ | --------------------------------------------------------------------------- | ------------------- |
| The Guardian       | <https://open-platform.theguardian.com/access/>                             | `GUARDIAN_API_KEY`  |
| The New York Times | <https://developer.nytimes.com/get-started> (enable **Article Search API**) | `NYT_API_KEY`       |
| NewsAPI            | <https://newsapi.org/register>                                              | `NEWSAPI_API_KEY`   |

```bash
cp .env.example .env    # then paste your keys
```

Keys stay on the server side (dev proxy or nginx) and **never reach the browser**.

## Run it

**Option A: Docker** (closest to production)

```bash
docker compose up --build
```

Open **<http://localhost:8080>**

**Option B: Node**

```bash
npm install
npm run dev
```

Open **<http://localhost:5173>**

**Storybook** (component library and design tokens, no keys needed):

```bash
npm run storybook
```

Open **<http://localhost:6006>**

## Useful scripts

| Command                            | What it does                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `npm test`                         | Unit and integration tests (Vitest + Testing Library)                                  |
| `npm run verify`                   | Typecheck, lint, test and production build (what CI runs)                              |
| `npm run security`                 | Dependency audit, secret scan and unsafe-code scan (also runs before every `git push`) |
| `npm run build && npm run preview` | Production build locally. Add `?vitals` to the URL to log Core Web Vitals.             |

## Highlights for reviewers

- **Architecture:** feature-based folders, provider adapters behind a `NewsSource` interface, and DI via context, so tests and Storybook run on fake sources with no network mocks.
- **Data:** TanStack Query infinite queries (cache, dedupe, cancellation), **infinite scroll** with an accessible "Load more" fallback, debounced search, and URL-driven filters.
- **Performance:** lazy routes with hover preloading, `content-visibility` virtualisation, a font preload and a metric-matched fallback font. Measured locally: **LCP 724 ms · INP 40 ms · CLS 0**.
- **Accessibility:** WCAG 2.2 AA, semantic HTML, focus management on navigation, per-page titles and AA-checked colours.
- **Styling:** SCSS design system built on design tokens. BEM in CSS Modules. Uses `@layer`, container queries, `clamp()` and `@supports`.
- **Security:** CSP and security headers, a GET-only rate-limited proxy, URL sanitisation against XSS, a non-root container, and an audit gate. See [SECURITY.md](SECURITY.md).
- **Quality gates:** strict TypeScript, oxlint, Prettier, a pre-push hook, and GitHub Actions CI (including a Docker smoke test) plus Dependabot.

## Project structure

```
src/
  app/          App shell: providers, routes (lazy + preloading), web-vitals
  api/          HTTP client, aggregator, and one adapter per news provider
  features/     articles · feed · search · preferences (each with its page, components and hooks)
  components/   Shared UI (Button, ChipToggle, PageHeader, AppLayout, …)
  hooks/        useDebouncedValue, useInfiniteScroll, useRouteChangeFocus
  styles/       Design tokens, mixins and base styles (SCSS)
  config/       All tunable constants in one file
docker/         nginx config: API proxy, security headers, SPA fallback
docs/           Detailed documentation (below)
```

## Documentation

| Doc                                                                                                        | Read it for                                                                            |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)                                                                    | **Start here.** An index of every feature and technique, with where it lives and why   |
| [DESIGN.md](docs/DESIGN.md)                                                                                | Design tokens, accessibility trade-offs, CSS architecture                              |
| [DATA_FLOW.md](docs/DATA_FLOW.md)                                                                          | From keystroke to rendered cards. Where each piece of state lives.                     |
| [DOCKER.md](docs/DOCKER.md)                                                                                | How the Docker image works, how to run it, and a verification checklist                |
| [DECISIONS.md](docs/DECISIONS.md)                                                                          | 15 short ADRs (for example why there's no Redux, and why infinite scroll has a button) |
| [TESTING.md](docs/TESTING.md) · [CODE_GUIDELINES.md](docs/CODE_GUIDELINES.md) · [SECURITY.md](SECURITY.md) | Test strategy, conventions, threat model                                               |

## AI-assisted workflow

The repo includes steering files for Claude Code. [CLAUDE.md](CLAUDE.md) holds the project rules, and [`.claude/agents`](.claude/agents) holds reusable agents: code reviewer, test writer, story writer, accessibility auditor, performance auditor, **security auditor** and source scaffolder.

## Assumptions

- "Source" means the provider. NewsAPI cards still show the real publisher (for example Reuters).
- Followed authors **rank** rather than filter, because providers can't query by author reliably.
- BBC RSS has no search API, so its keyword and date filtering happens client-side on the latest feed items.
- Preferences are stored per device (`localStorage`). There are no accounts, because none were required.
