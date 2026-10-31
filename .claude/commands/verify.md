---
description: Run the full quality gate (typecheck, lint, tests, build) and summarise the result
---

Run `npm run verify` from the repo root.

- If everything passes, reply with one line per stage (typecheck, lint, test count, bundle size) and stop.
- If a stage fails, show the first relevant error with its `file:line`, explain the cause in one sentence, and propose the smallest fix. Don't apply the fix unless the user asks.
