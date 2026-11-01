# Docker

How the production image is built, how to run it, and how to check it works. Setup and API keys are in the [README](../README.md#run-it).

## How it works

A **multi-stage build** keeps the final image small (≈ 50 MB) and free of Node, `node_modules` and source code:

1. **build** (`node:24-alpine`): `npm ci --ignore-scripts`, then `npm run build` into `dist/`.
2. **runtime** (`nginx-unprivileged`, non-root, port 8080): serves only `dist/`.

At runtime nginx does two jobs:

- **Web server.** Serves the static app and falls back to `index.html` for unknown paths, so deep links like `/search?q=climate` survive a refresh.
- **API proxy.** The browser calls same-origin `/api/<source>/…`; nginx adds the API key and forwards the request to the provider. **Keys never reach the browser.**

| File                           | Purpose                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `Dockerfile`                   | The two build stages, empty key defaults and a health check                                             |
| `docker-compose.yml`           | Port `8080:8080`, loads keys from `.env` if present, restarts unless stopped                            |
| `docker/nginx.conf.template`   | Server config. `${…_API_KEY}` placeholders are filled from the environment at container start           |
| `docker/api-proxy.conf`        | Rules for every `/api/*` route: GET only, per-IP rate limit, visitor cookies and auth are not forwarded |
| `docker/security-headers.conf` | CSP and other security headers on every response                                                        |
| `.dockerignore`                | Keeps `node_modules`, `dist`, `.git` and **`.env`** out of the build context                            |

Keys are read when the container **starts**, never at build time, so one image works in any environment and secrets never end up in an image layer.

## Run

```bash
docker compose up --build        # http://localhost:8080 (Ctrl+C to stop)
docker compose up --build -d     # in the background; stop with `docker compose down`
```

After adding or changing keys in `.env`, restart without rebuilding: `docker compose up -d --force-recreate`.
After changing code or anything in `public/`, rebuild: `docker compose up --build`.

## Verify

With the container running:

| Check                          | Command                                                                                                     | Expect                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| Healthy                        | `docker compose ps`                                                                                         | `(healthy)` after ~30 s |
| Site served                    | `curl -s -o /dev/null -w "%{http_code}\n" localhost:8080/`                                                  | `200`                   |
| SPA fallback                   | `curl -s -o /dev/null -w "%{http_code}\n" "localhost:8080/search?q=climate"`                                | `200`                   |
| Proxy works (BBC needs no key) | `curl -s localhost:8080/api/bbc/news/rss.xml \| head -c 100`                                                | `<?xml … <rss`          |
| Security headers               | `curl -sI localhost:8080/ \| grep -iE "content-security\|x-frame\|x-content-type"`                          | all three present       |
| Proxy is read-only             | `curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:8080/api/bbc/news/rss.xml`                      | `403`                   |
| Not running as root            | `docker compose exec web id -u`                                                                             | not `0` (usually `101`) |
| No secrets in the image        | `docker image inspect news-aggregator --format '{{range .Config.Env}}{{println .}}{{end}}' \| grep API_KEY` | every key empty         |

> To check that the container received your keys, avoid `docker compose exec web env`: it prints the real values to your terminal.

CI runs the same smoke test on every push (the `docker` job in [`ci.yml`](../.github/workflows/ci.yml)).

## Everyday commands

| Task                            | Command                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Logs                            | `docker compose logs -f web`                                                                        |
| Stop and remove                 | `docker compose down`                                                                               |
| Rebuild from scratch (no cache) | `docker compose build --no-cache`                                                                   |
| Shell inside the container      | `docker compose exec web sh`                                                                        |
| Without Compose                 | `docker build -t news-aggregator . && docker run --rm -p 8080:8080 --env-file .env news-aggregator` |

## Troubleshooting

| Problem                                    | Fix                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `Cannot connect to the Docker daemon`      | Start Docker Desktop and wait until it reports "running".                                  |
| `port is already allocated`                | Something else uses 8080. Change `'8080:8080'` to `'3000:8080'` and open `localhost:3000`. |
| Code or `public/` changes don't show       | Rebuild: `docker compose up --build`. Plain `up` reuses the old image.                     |
| Added keys but still see "API key missing" | `docker compose up -d --force-recreate`, and check the variable names in `.env`.           |
| Container keeps restarting                 | `docker compose logs web` shows the exact nginx error.                                     |
