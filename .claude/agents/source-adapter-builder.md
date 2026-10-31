---
name: source-adapter-builder
description: Adds a new news provider to the aggregator end to end (adapter, registry, proxy routes for dev and Docker, env var, tests, docs). Use when asked to "add <provider> as a source". Demonstrates the open/closed design: no existing UI code should change.
tools: Read, Grep, Glob, Edit, Write, Bash, WebFetch
---

You add one news provider to this aggregator, following the existing adapters exactly.

## Steps

1. **Study the pattern.** Read `src/api/sources/types.ts`, `src/api/sources/guardian.ts` (keyed JSON API), `src/api/sources/bbc.ts` (RSS, client-side filtering), `src/api/sources/queryMatcher.ts`, and the "Adding a news source" section of `docs/ARCHITECTURE.md`.
2. **Study the provider.** Fetch its official API docs. Note: base URL, auth (query param or header), keyword/date/category params, pagination (0- or 1-based, page size), response shape, rate limits, and CORS. Write these down as a short comment block at the top of the adapter.
3. **Write `src/api/sources/<id>.ts`:**
   - a local `interface` for only the response fields you read
   - a category map `Record<Category, …>` covering every `Category`
   - `build<Name>Url(query)` (pure; returns a same-origin path under `/api/<id>/`)
   - `map<Name>Response(json)` (pure; uses `toPlainText` and `cleanByline`; ids are `<id>:<unique>`)
   - `export const <id>Source: NewsSource` forwarding the `signal`
   - `createQueryMatcher` for any filter the provider can't apply server-side
4. **Register it.** Add the id to `SOURCE_IDS` in `src/domain/article.ts` (the `SourceId` type and default preferences derive from it), and add the source to `src/api/sources/registry.ts`.
5. **Proxy, in both places.**
   - `vite.config.ts`: add to `buildProxy` (use `withQueryKey` for query-param keys, or `headers` for header keys)
   - `docker/nginx.conf.template`: matching `location /api/<id>/` block. Add the key to the `ENV` defaults in `Dockerfile` and to `.env.example` with its sign-up URL.
6. **Tests:** create `src/api/sources/<id>.test.ts` covering URL building (all params), mapping (including missing optional fields), pagination end, and one HTTP failure (`mockFetch`).
7. **Docs:** add a row to the API-keys table and the requirement table in `README.md`, and a row to the provider mapping table in `docs/DATA_FLOW.md`.
8. **Verify:** `npm run verify` must pass. Confirm with `git diff --stat` that no file under `src/features/` or `src/components/` changed. If one had to, explain why.

## Rules

- Never put the API key in client code or in a `VITE_` variable.
- No new dependencies (use `DOMParser` for XML, `fetch` via `getJson`/`getText`).
- If the provider can't support a filter at all, document it in the adapter comment and in the README assumptions. Don't fake it.

Report: the files changed, provider limitations you found, and how to get a key.
