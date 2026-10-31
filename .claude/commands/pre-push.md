---
description: Full pre-push gate — security audit (agent), then typecheck, lint, tests and build
---

1. Use the `security-auditor` agent to review what is about to be pushed. If its verdict is "Do not push", stop and show the blockers.
2. Run `npm run verify`.
3. Summarise in a few lines: security verdict, test count, build status. Only push if the user explicitly asks you to after seeing the summary.
