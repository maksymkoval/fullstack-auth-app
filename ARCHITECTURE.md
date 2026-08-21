# Project Architecture

This document explains **why** the code is organized the way it is. Read it —
and you'll understand principles that carry over to almost any fullstack project,
not just this one.

---

## 1. The core idea: separation of concerns

The whole architecture rests on one question: **"Who is responsible for what?"**
Every file has exactly one area of responsibility. When responsibilities aren't mixed:

- it's easier to read (open a file, immediately know what it does);
- it's easier to change (a DB change doesn't touch business logic);
- it's easier to test (each layer can be mocked independently);
- it's easier to work as a team (fewer conflicts).

Bad architecture is when a SQL query, a password check, and building an HTTP
response all live in the same 200-line function. We don't do that here.

---

## 2. Backend: layered architecture

A request on the backend passes through clearly defined layers. Each layer only
talks to its immediate neighbor — it never "jumps over" several at once.

```
HTTP request
   │
   ▼
┌─────────────────┐
│   Controller    │  Knows about HTTP: URLs, methods, status codes.
│  (*.controller) │  Pulls data out of the request, calls the service, returns a response.
└────────┬────────┘  ❗ No business logic.
         │
         ▼
┌─────────────────┐
│    Service      │  Business logic: domain rules, hashing, checks.
│  (*.service)    │  Knows nothing about HTTP and nothing about SQL.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  Data access: the only place that knows about Prisma/SQL.
│ (*.repository)  │  Swap the ORM and only this layer changes.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma / DB    │  PostgreSQL.
└─────────────────┘
```

### Why three layers instead of one?

Imagine that tomorrow you decide to move off Prisma onto a different ORM.
- In a **bad** architecture, you'd have to rewrite every piece of code that runs a query.
- In **ours** — you rewrite only `*.repository.ts`. Services and controllers
  don't change at all, because they know nothing about Prisma.

The same principle holds for any swap: add caching → touch the service;
change the API's shape → touch the controller. Changes stay local instead of
rippling "across the whole project."

### A live example — the registration flow

Trace the `POST /auth/register` request through the files:

1. **`auth.controller.ts`** — accepts the HTTP request, the body is validated via
   `RegisterDto`, calls `authService.register(dto)`. Nothing else.
2. **`auth.service.ts`** — checks whether the email is free; hashes the password
   (`bcrypt`); asks `usersService` to create the user; signs a JWT. This is the business logic.
3. **`users.service.ts`** — takes the already-prepared data, calls the repository,
   turns the raw DB model into a safe `UserEntity` (no `passwordHash`).
4. **`users.repository.ts`** — runs `prisma.user.create(...)`. Only the DB.

Each step is a separate file with one responsibility. This, in practice, is what
"proper architecture" looks like.

---

## 3. Modules and Dependency Injection — the heart of NestJS

### Modules

NestJS groups code into **modules** (`@Module`). A module is a "box" around
one slice of the domain: `UsersModule`, `AuthModule`, `PrismaModule`. A module
explicitly declares:

- `providers` — what lives inside it (services, repositories);
- `controllers` — the module's HTTP endpoints;
- `imports` — which other modules it needs;
- `exports` — what it exposes to others.

An example of encapsulation: `UsersModule` **exports** `UsersService` (which
`AuthModule` uses), but does **not export** `UsersRepository`. That means DB
access stays a private implementation detail of the module — nothing outside
it can reach in. That's real encapsulation, not just "files grouped in one folder."

### Dependency Injection

Notice: classes never create their own dependencies with `new`. Instead, they
ask for them in the constructor:

```ts
constructor(
  private readonly usersService: UsersService,
  private readonly jwtService: JwtService,
) {}
```

Nest itself creates the objects that are needed and "injects" them. Why?

- **Testability.** In a test you swap in a fake `usersService` — and the
  service can be tested in isolation, with no real database.
- **A single instance (singleton).** Nest creates a service once and reuses it.
- **Loose coupling.** A class depends on a *type* (an interface), not on how
  that dependency happens to be constructed.

This is arguably NestJS's single most important idea. Understand DI, and you
understand the framework.

---

## 4. Important patterns in this codebase

### DTO — the contract for incoming data
`register.dto.ts`, `login.dto.ts` describe the shape of the data plus its
validation rules (`@IsEmail`, `@MinLength`). The global `ValidationPipe` (see
`main.ts`) checks them **automatically**, before the controller ever runs.
Invalid data → `400`, with zero lines of manual checking.

### Entity vs. the DB model
`UserEntity` is what's safe to hand back to the client. The DB model `User`
contains `passwordHash`; the entity doesn't. The service always maps one into
the other. **Rule: the password hash never leaves the backend.**

### Guard — a route's gatekeeper
`JwtAuthGuard` decides whether a request gets through. Attach
`@UseGuards(JwtAuthGuard)` to a route, and it becomes protected. The logic for
*checking* the token (`JwtStrategy`) is kept separate from the logic for
*applying* that check (the Guard).

### Strategy — how exactly to check
`JwtStrategy` pulls the token out of the header, verifies its signature, and
returns the user. Nest puts whatever it returns into `request.user`, which the
`@CurrentUser` decorator then reads.

---

## 5. Frontend: feature-based structure

The frontend is organized **around features**, not around technical file types.

```
src/
├── lib/            → Infrastructure shared across the whole app
│   └── api.ts         The HTTP client (the only place with fetch and the token)
├── features/       → Code grouped by feature
│   └── auth/         Everything about authentication, in one place:
│       ├── api.ts        auth endpoint calls
│       ├── types.ts      types (mirroring the backend's contracts)
│       ├── hooks.ts      React Query hooks (useLogin, useMe, useRegister…)
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
├── components/     → Reusable components (ProtectedRoute)
├── pages/          → Screen-level pages (DashboardPage)
└── App.tsx         → Routing (which URL maps to which component)
```

**Why feature-based instead of "all components in /components, all hooks in /hooks"?**
When you're working on authentication, all the code you need is in one folder,
`features/auth`. No jumping between five directories. As the project grows, you
just add a new folder under `features/` (say, `features/posts`) without
touching what's already there. It scales.

### Mirrored layers on the frontend

Notice the symmetry with the backend? The same principles apply:

| Backend                        | Frontend                          | Shared role                       |
|---------------------------------|------------------------------------|------------------------------------|
| `*.repository` (DB access)     | `lib/api.ts` (backend access)     | the single place that "talks" to data |
| `*.service` (logic)            | `hooks.ts` (React Query)          | holds the logic and the state     |
| `*.controller` (HTTP)          | page components                   | a "thin" presentation layer       |
| `Guard` (route protection)     | `ProtectedRoute`                  | keeps unauthenticated users out   |

Components **never** call `fetch` directly — only through `authApi`, which goes
through `apiRequest`. Same as a controller never writes SQL — it goes through
the service.

### Auth state lives in the React Query cache
There's no separate `AuthContext` — the current user is just the result of the
`useMe()` query. Any component can read it via that hook, and React Query
handles caching, refetching, and invalidation for it like any other server data.

---

## 6. End-to-end flow: from a click to protected data

```
1. The user types in email + password → LoginPage
2. LoginPage calls useLogin().mutate()          [features/auth/hooks.ts]
3. The mutation calls authApi.login()           [features/auth/api.ts]
4. authApi goes through apiRequest → fetch       [lib/api.ts]
   ─────────────── network ───────────────►
5. POST /auth/login is received by AuthController  [backend: controller]
6. AuthService checks the password with bcrypt.compare  [backend: service]
7. UsersRepository fetches the user from the DB          [backend: repository]
8. AuthService signs a JWT and returns token + user
   ◄────────────── network ────────────────
9. onSuccess stores the token in localStorage    [lib/api.ts, tokenStorage]
   and puts the user straight into the React Query cache
10. ProtectedRoute sees a user → allows access to DashboardPage
11. DashboardPage calls GET /users; apiRequest
    automatically attaches "Authorization: Bearer <token>"
12. On the backend, JwtAuthGuard + JwtStrategy verify the token → return the data
```

Every numbered step is one clear responsibility in one file. That's what clean
architecture looks like in motion.

---

## 7. Security — in brief

- Passwords are stored **only as a bcrypt hash**, never in plaintext.
- `passwordHash` never makes it into a response (it's mapped away into `UserEntity`).
- On login, the same message is returned for "no such email" and "wrong password" —
  so an attacker can't use it to figure out which emails exist.
- The JWT is signed with a secret from `.env`; in production that secret must
  be long and random.
- `ProtectedRoute` on the frontend is a UX convenience only. **The real
  protection lives on the backend** (`JwtAuthGuard`). A client-side check is
  trivial to bypass, so it never substitutes for server-side enforcement.

---

## 8. Good next steps for extending this

1. **A new "Posts" feature.** Backend: `posts.module/controller/service/repository`
   + a `Post` model in Prisma related to `User`. Frontend: a
   `features/posts` folder. Copy the shape of `auth` and you'll immediately
   know where everything goes.
2. **Roles (RBAC).** Add a `role` field to `User`, plus a custom `RolesGuard`
   and a `@Roles('admin')` decorator.
3. **Refresh tokens.** A short-lived access token plus a long-lived refresh
   token, for safer sessions.
4. **Tests.** Unit tests for the services (mock the repository) + e2e tests
   against the endpoints. This is exactly why the layers were split in the first place.

---

## One-sentence summary

**Every file has one responsibility; layers only talk to their neighbors; data
access (the DB on the backend, the network on the frontend) is hidden behind
its own dedicated layer.** Understand and apply that, and any fullstack
project becomes predictable.
