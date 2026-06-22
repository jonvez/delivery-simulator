# DSD Route Manager

**Direct Store Delivery (DSD) for convenience-store distribution.** A standalone,
web-based route-operations demo: schedule store stops, coordinate route reps, assign work,
track each stop through its lifecycle, and view live routes on a map — with **no POS or
external-system dependency**.

Built solo with [Claude Code](https://claude.com/claude-code) / AI-assisted tooling, reframed
from a generic delivery app into the DSD / convenience-store domain.

- **Live demo:** _coming soon_ (Railway backend + Postgres · Vercel frontend — see
  [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md))
- **Repo:** https://github.com/jonvez/delivery-simulator
- **Product spec:** [`SPEC.md`](SPEC.md) · **Process:** [`TEAM.md`](TEAM.md) ·
  **Decisions:** [`docs/decisions/`](docs/decisions/) · **Architecture:** [`docs/architecture/`](docs/architecture/)

---

## What it does

A dispatcher / route manager gets at-a-glance control of a DSD operation:

- **Stop intake** — create store stops with a Store Account, Store Address, and Case List.
- **Rep & route coordination** — manage route reps and their On Route / Off Route status.
- **Assignment** — assign (and reassign) stops to reps.
- **Status tracking** — every stop moves through the lifecycle
  **Scheduled → Assigned → En Route → Delivered**, refreshed via 30-second polling.
- **Route visualization** — interactive Leaflet / OpenStreetMap map of a rep's assigned
  stops and their sequence.

### DSD vocabulary

The UI speaks the DSD operating model (display labels; the underlying schema stays
domain-agnostic):

| Term | Meaning |
|------|---------|
| **Stop** | A scheduled store delivery |
| **Rep** | A route rep who runs the stops |
| **Store Account** | The convenience store being served |
| **Store Address** | Where the stop is delivered |
| **Case List** | What's being dropped at the stop |
| **Stop ID** | Stable identifier for a stop |
| **On Route / Off Route** | A rep's availability |
| **Scheduled → Assigned → En Route → Delivered** | Stop lifecycle |

## Signature features

1. **Per-Account view** — manage the account, not just the drop. Per-store delivery history,
   total drops, and last visit, aggregated from existing stops.
   Backend `GET /api/orders/by-store`; frontend `StoreHistory` component.
2. **Planogram-compliance check** — a rep marks a stop "planogram reviewed" and adds notes, a
   DSD merchandising touch surfaced as a badge/toggle on the stop card.
   Backend `PATCH /api/orders/:id/planogram` (small Prisma migration adds
   `planogramReviewed` / `planogramNotes`).

## Tech stack

- **Frontend:** React 18 + TypeScript (Vite), shadcn/ui + Tailwind CSS, Leaflet / OpenStreetMap,
  React Query (30s polling)
- **Backend:** Node.js 20 + Express + TypeScript, Zod validation, Winston logging
- **Data:** PostgreSQL + Prisma ORM
- **Monorepo:** npm workspaces (`apps/frontend`, `apps/backend`)
- **Observability:** Datadog — APM tracing, log management, PostgreSQL metrics, and RUM

---

## Local development

Verified quickstart (macOS / Docker):

```bash
# 1. Postgres only — the datadog-agent service needs a DD_API_KEY, so don't bring up the
#    whole compose stack.
docker compose up -d postgres

# 2. Point the backend at the database.
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/delivery_manager"

# 3. Migrate, generate the Prisma client, and seed DSD demo data.
cd apps/backend
npx prisma migrate deploy
npx prisma generate
npm run seed

# 4. Start both apps from the repo root.
cd ../..
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Seeding produces route reps, store-account stops, and Brooklyn, NY store locations.

### Tests, build & lint

```bash
npm run build                                  # build both workspaces (TypeScript)
cd apps/backend && npm test                    # backend (Jest + Supertest)
CI=true npm test --workspace=apps/frontend     # frontend (Vitest + Testing Library)
npm run lint                                   # ESLint across the monorepo
```

End-to-end tests (Playwright) live under `tests/e2e/` and require both servers running and a
seeded database: `npm run test:e2e`.

---

## Deployment

The intended hosting is a public deployment: **Railway** for the backend + PostgreSQL and
**Vercel** for the frontend. Step-by-step instructions (including the environment variables and
guided logins) are in [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

Configuration lives in env vars, never in code — see `apps/backend/.env.example` and
`apps/frontend/.env.example`. The Datadog `DATABASE_URL`, `DD_API_KEY`, and deploy tokens are
secrets and stay out of the repo.

---

## Project structure

```
delivery-simulator/
├── apps/
│   ├── frontend/          # React + Vite UI (shadcn/ui, Leaflet, React Query)
│   └── backend/           # Express + Prisma API
│       └── prisma/        # schema + migrations
├── tests/e2e/             # Playwright end-to-end tests
├── datadog/               # Datadog Agent integration configs
├── docs/
│   ├── architecture/      # Sharded technical architecture
│   ├── decisions/         # ADR log
│   └── DEPLOYMENT_GUIDE.md
├── SPEC.md                # Product spec (single source of product truth)
├── TEAM.md                # Build team & process
└── PLAN.md                # Live execution context for the DSD reframe
```

## How it's built

This is a brownfield app being evolved by a small team of Claude Code persona subagents
(Product Owner, Architect, Designer, Developers, QA) coordinated through a GitHub Projects board
and an ADR log, working test-first. See [`TEAM.md`](TEAM.md) for the process and
[`SPEC.md`](SPEC.md) for the product spec.

## License

MIT
</content>
</invoke>
