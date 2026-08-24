---
name: add-crud-resource
description: Scaffold a new CRUD resource (Prisma model + NestJS module/controller/service/repository + shared Zod schema + frontend feature folder) following this repo's existing layered conventions. Use when the user asks to add a new resource/entity/feature to the app (e.g. "add a posts feature", "add a comments resource").
---

Scaffold a new CRUD resource end-to-end, copying the exact layering this
repo already uses for `users` (see `apps/api/src/users/` and
`ARCHITECTURE.md` §2/§5) — don't invent a different structure.

## Steps

1. **Ask what's missing before touching anything**: the resource name, its
   fields (with types), and whether it's user-owned (needs a `userId`
   relation + auth guard) or global. Don't guess field types from a vague
   description.

2. **Prisma model** — add to `apps/api/prisma/schema.prisma`, matching the
   style of the existing `User` model (e.g. `@id @default(uuid())`,
   `@@map("snake_case_table_name")`). Generate a real migration:
   ```
   pnpm --filter api exec prisma migrate dev --name add_<resource>
   ```
   Never hand-write migration SQL, and never use `db push` for this — the
   project's convention is tracked migrations (see CLAUDE.md).

3. **Shared Zod schema** — add `<resource>Schema` to
   `packages/shared/src/<resource>.ts` (new file, exported from
   `packages/shared/src/index.ts` the same way `auth.ts`/`user.ts` are).
   This is the single source of truth for validation on both sides — do not
   create a separate class-validator DTO.

4. **Backend module**, mirroring `apps/api/src/users/` exactly:
   - `<resource>.repository.ts` — the only file that calls Prisma.
   - `<resource>.service.ts` — business logic, takes/returns entities, never
     touches `Request`/`Response`.
   - `<resource>.controller.ts` — HTTP only, validates via
     `ZodValidationPipe` (see `apps/api/src/common/pipes/`), protects
     mutating routes with `@UseGuards(JwtAuthGuard)` if user-owned.
   - `<resource>.module.ts` — wire it up, register in `AppModule`'s imports.

5. **Frontend feature folder** at `apps/web/src/features/<resource>/`:
   - `api.ts` — thin wrapper calling `apiRequest` (never `fetch` directly).
   - `hooks.ts` — React Query hooks (`useX`, `useCreateX`, ...), following
     `features/auth/hooks.ts`'s pattern (query keys collected in one object,
     mutations invalidate/update the cache in `onSuccess`).
   - A page/component using them, added to `App.tsx`'s routes.

6. **Playwright test** — add a spec under `apps/web/e2e/` for the resource's
   main flow, following the structure of `e2e/auth.spec.ts` (including an
   axe `withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])` check on any new page —
   see block 05 of the project's a11y pass for why that's non-negotiable
   here).

7. **Verify before handing back**: `pnpm exec turbo run build typecheck lint`
   clean, then `pnpm --filter web test` green. Report which files were
   created/changed — don't commit unless explicitly asked to.

## Do not

- Don't add a class-validator DTO — Zod in `packages/shared` only.
- Don't call Prisma from the controller or service.
- Don't skip the axe check on the new frontend page.
- Don't use `prisma db push` — always a tracked `migrate dev` migration.
