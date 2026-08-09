#!/bin/sh
set -eu

if [ "${NODE_ENV:-development}" = "development" ]; then
  if [ "$(id -u)" = "0" ]; then
    if [ "$(stat -c %u /home/node/app/node_modules)" != "$(id -u node)" ]; then
      chown -R node:node /home/node/app/node_modules
    fi
    su-exec node env CI=true pnpm install --frozen-lockfile
    exec su-exec node "$@"
  fi
  CI=true pnpm install --frozen-lockfile
fi

exec "$@"
