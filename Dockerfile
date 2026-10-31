# ---- build: install, bundle ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: dependency install scripts never run during the image build (supply-chain hardening).
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ---- runtime: static files + reverse proxy that injects API keys ----
# Unprivileged variant: nginx runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
# Keys are read at container start (not build time), so one image works for any environment
# and secrets never end up in an image layer. Empty defaults keep envsubst from leaving
# unresolved ${...} in the nginx config.
ENV GUARDIAN_API_KEY="" \
    NYT_API_KEY="" \
    NEWSAPI_API_KEY=""
COPY docker/security-headers.conf docker/api-proxy.conf /etc/nginx/snippets/
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
