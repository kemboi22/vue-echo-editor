#!/bin/sh
set -e

# nginx daemonizes; node stays in the foreground so the container exits (and gets restarted) if the docs server dies.
nginx
NITRO_PORT=3000 NITRO_HOST=127.0.0.1 exec node /app/docs/server/index.mjs
