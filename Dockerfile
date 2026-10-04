# syntax=docker/dockerfile:1

# ---- build ----------------------------------------------------------------
FROM node:26-alpine AS build
WORKDIR /repo
# Node 25+ no longer ships corepack; keep in sync with `packageManager` in package.json
RUN npm install -g pnpm@10.25.0

ENV HUSKY=0 CI=true
COPY . .
RUN pnpm install --frozen-lockfile

# The library first: both the examples and the docs consume the workspace build.
RUN pnpm build:lib

# Examples are served from /examples/
# Optional AI demo endpoint, baked in at build time (Vite). Don't pass API keys here: they'd ship in the public bundle.
ARG VITE_OPENAI_BASE_URL
ARG VITE_OPENAI_MODEL
RUN pnpm --dir examples exec vite build --base=/examples/

# Docs are served from /docs/
ARG NUXT_PUBLIC_SITE_URL
ENV NUXT_APP_BASE_URL=/docs/
RUN pnpm --dir docs run build

# ---- runtime --------------------------------------------------------------
FROM node:26-alpine AS runtime
RUN apk add --no-cache nginx
WORKDIR /app

COPY --from=build /repo/docs/.output ./docs
COPY --from=build /repo/dist ./examples
COPY deploy/nginx.conf /etc/nginx/http.d/default.conf
COPY deploy/entrypoint.sh /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1/examples/ >/dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]
