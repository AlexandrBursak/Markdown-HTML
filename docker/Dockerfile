FROM node:22-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /home/node/app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS development

COPY --chown=node:node . .
USER node
ENTRYPOINT ["/home/node/app/docker/entrypoint.sh"]
CMD ["pnpm", "dev", "--hostname", "0.0.0.0", "--port", "3000"]

FROM dependencies AS builder

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /home/node/app
COPY --from=builder --chown=nextjs:nodejs /home/node/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /home/node/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /home/node/app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /home/node/app/docker/entrypoint.sh ./docker/entrypoint.sh

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/home/node/app/docker/entrypoint.sh"]
CMD ["node", "server.js"]
