# Fullstack Auth App (NestJS + Prisma + React)

A learning fullstack app built to demonstrate **proper layered architecture**.
The feature set is deliberately simple (register, login, protected profile) — the focus
is on **how the code is organized**, not on the features themselves.

```
fullstack-auth-app/
├── apps/
│   ├── api/   → Backend: NestJS + Prisma + PostgreSQL + JWT
│   └── web/   → Frontend: React + Vite + TypeScript
├── docker-compose.yml  → PostgreSQL in Docker
└── ARCHITECTURE.md      → Architecture explained (read this first!)
```

## Quick start

### 0. Prerequisites
- Node.js 20+
- Docker (for PostgreSQL) — or your own PostgreSQL instance

### 1. Start the database
```bash
docker compose up -d
```

### 2. Backend
```bash
cd apps/api
cp .env.example .env
npm install
npx prisma migrate dev --name init   # creates the tables
npm run start:dev                     # http://localhost:3000
```

### 3. Frontend (in a new terminal)
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev                           # http://localhost:5173
```

Open http://localhost:5173 — register, log in, and you'll see the protected profile.

## API endpoints

| Method | Path             | Description                    | Auth |
|--------|------------------|---------------------------------|------|
| POST   | `/auth/register` | Register a new user             | no   |
| POST   | `/auth/login`    | Log in, returns a JWT           | no   |
| GET    | `/auth/me`       | Current user                    | yes  |
| GET    | `/users`         | List of users                   | yes  |

## What to read next
Open **ARCHITECTURE.md** — it walks through every layer in detail,
the request flow from React to the database and back, and why everything is set up this way.
