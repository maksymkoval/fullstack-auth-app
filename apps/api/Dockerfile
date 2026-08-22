# Build context is the monorepo root (see .dockerignore), since apps/api
# depends on packages/shared via the pnpm workspace.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
# Explicitly pinned: relying on corepack to read "packageManager" from
# package.json is flaky on some build hosts — it can silently fetch
# pnpm's latest version instead, which then refuses to run on Node 20.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS builder
WORKDIR /app
# bcrypt has a native addon; alpine/musl has no prebuilt binary for it,
# so it needs to compile from source during install.
RUN apk add --no-cache python3 make g++
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @fullstack-auth-app/shared build
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build
# Resolves the workspace's symlinked deps into a real, self-contained
# node_modules for just this one app — plain `cp` would copy broken symlinks.
# Not --prod: pnpm deploy reinstalls @prisma/client into the new location,
# which re-triggers its postinstall and overwrites the already-generated
# client with an uninitialized stub. Keeping the prisma CLI here lets us
# regenerate against the deployed node_modules right after.
RUN pnpm --filter api deploy /prod/api
RUN cd /prod/api && node_modules/.bin/prisma generate

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /prod/api .
USER nestjs

EXPOSE 3000
# Migrations run as a separate release step (`prisma migrate deploy`),
# never here — this only starts the already-migrated app.
CMD ["node", "dist/main"]
