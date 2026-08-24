# CLAUDE.md

Context for working in this repo. For the full "why" behind the architecture,
read `ARCHITECTURE.md` — this file is the fast version: commands, conventions,
and what not to do.

## What this is

A pnpm/Turborepo monorepo: NestJS + Prisma/Postgres backend, React/Vite
frontend, shared Zod schemas/types package.

```
apps/api       NestJS backend (Prisma → Postgres)
apps/web       React + Vite frontend
packages/shared  Zod schemas + types imported by both apps
packages/config  Shared ESLint/Prettier/tsconfig
```

Deployed: `apps/web` on Vercel, `apps/api` on Railway (Docker), Postgres on
Neon. CI (GitHub Actions) runs typecheck/lint/build/audit on every PR, plus a
separate `e2e` job with a Postgres service container for Playwright.

## Commands (run from repo root)

```
pnpm dev              # both apps, via turbo
pnpm build             # typecheck+build the whole workspace
pnpm typecheck / lint / test
pnpm --filter api <script>    # target one workspace directly
pnpm --filter web <script>
```

`apps/web` also has `pnpm --filter web test` → Playwright e2e + axe
accessibility checks (`apps/web/e2e/`).

## Backend: layers

```
Controller (*.controller.ts)  — HTTP only. No business logic, no SQL.
Service    (*.service.ts)     — business logic. Knows nothing about HTTP or SQL.
Repository (*.repository.ts)  — the only place that touches Prisma.
```

A controller never calls Prisma directly, and a service never touches
`Request`/`Response`. See `ARCHITECTURE.md` §2 for the full walkthrough.

## Validation: Zod, not class-validator

Request bodies are validated with the Zod schemas in `packages/shared/src`,
applied per-route via `ZodValidationPipe`
(`apps/api/src/common/pipes/zod-validation.pipe.ts`):

```ts
@Post("login")
@UsePipes(new ZodValidationPipe(loginSchema))
login(@Body() dto: LoginInput) { ... }
```

The same schema drives the frontend form (`zodResolver(loginSchema)` in
React Hook Form). **If you add or change a field, edit the schema in
`packages/shared` once — never write a parallel `class-validator` DTO, and
never duplicate the validation rule directly in a controller or a form.**

## Auth: httpOnly cookie, not localStorage

The access token is set as an httpOnly, `Secure` cookie by
`apps/api/src/auth/auth.controller.ts` — never returned in a JSON body, never
read by frontend JS. `apps/web/src/lib/api.ts`'s `apiRequest` sends
`credentials: 'include'` so the browser attaches it automatically.

- Cookie flags are environment-aware (`SameSite=None` in prod because
  Vercel/Railway are different domains; `Lax` in dev). See the comment in
  `auth.controller.ts` before changing them.
- **Never** reintroduce `localStorage`/`sessionStorage` for the token, and
  never add an `Authorization: Bearer` header on the frontend — that was the
  pre-hardening design and is exactly what block 04 of the security pass
  removed.
- `res.clearCookie()` must be called with the same options used to set the
  cookie, **minus `maxAge`** — passing `maxAge` through makes Express set a
  future expiry instead of clearing it (a real bug that shipped once here).

## Frontend: feature folders

```
src/features/<name>/   api.ts, hooks.ts, *Page.tsx — everything for one feature together
src/lib/                infra shared by the whole app (api.ts — the only fetch() call site)
src/components/         reusable, cross-feature components
src/pages/               screen-level pages
```

Components call `authApi`/`apiRequest`, never `fetch` directly. Server state
(the current user, the user list) lives in React Query — there's no separate
Context for it; `useMe()` is the source of truth for "am I logged in."

## Observability & security conventions

- **Logging**: `nestjs-pino`, JSON, one line per request with a `req.id`.
  `console.log` in `apps/api/src` only belongs in `main.ts`'s boot message —
  everywhere else, use Nest's injected logger.
- **Sentry**: `apps/api/src/instrument.ts` must stay the first import in
  `main.ts` (it patches modules as they load). Errors are reported through
  `SentryExceptionFilter`, which only forwards 5xx/unhandled exceptions — a
  401 on a bad password is expected behavior, not an incident.
- **Rate limiting**: `@nestjs/throttler`, global default plus a tighter limit
  on `/auth/login`. If you add another sensitive endpoint (password reset,
  etc.), give it its own `@Throttle(...)`, don't rely on the global default.
- **Env vars**: `apps/api/src/env.validation.ts` (Zod) validates them at
  boot. Add new required vars there, not just to `.env.example` — an
  undeclared var silently defaulting is how the app used to fail at the
  first request instead of at startup.

## Agent tooling (.claude/, .mcp.json)

- `.claude/settings.json` is **committed** — team-wide permission allowlist for
  routine project commands (`pnpm dev/build/test/lint`, `git status/diff/log`,
  `docker ps`). `.claude/settings.local.json` is personal and gitignored —
  put your own overrides there, never in the shared file.
- `.mcp.json` is also committed and declares two project-scoped MCP servers:
  - **playwright** — lets the agent drive a real browser (used for the a11y
    work in `apps/web/e2e/`).
  - **postgres-local** — query/inspect the local dev Postgres directly. The
    server declaration is shared via this file, but the actual connection
    profile (host/user/password) is **not** — it's stored per-machine in
    `~/.postgres-mcp/connections.yaml` (password in the OS keychain), never in
    the repo. One-time setup per machine:
    ```
    npx @microsoft/postgres-mcp connection add local \
      "postgresql://app:app@localhost:5432/app"
    ```
    That's the general pattern for any DB-access MCP server here: what tool
    to run is project config; what it connects to and with which credentials
    is always personal/global.

## What not to do

- Don't add a new validation library or pattern — Zod via `packages/shared`
  is the one source of truth for both client and server validation.
- Don't call Prisma from a controller or service — only from a `*.repository.ts`.
- Don't add `localStorage`/`Authorization` header auth — see above.
- Don't run `prisma migrate dev` against a deployed environment — production
  migrations go through `prisma migrate deploy` as a release step, never an
  interactive dev migration.
- Don't skip `pnpm --filter web test` (Playwright + axe) when touching
  anything in `features/auth` or `pages/` — it's the only thing currently
  catching accessibility regressions.
