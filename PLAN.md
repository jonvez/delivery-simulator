# Delivery Simulator Plan

## Goal (branch: `dsd-convenience-store-demo`)

Reframe the restaurant **Delivery Manager** into a **Direct Store Delivery (DSD) / convenience-store distribution** demo — the portfolio / live-demo artifact for Jon's **Pepper "Founding PM, Convenience Store"** application (job-search project). Pepper builds the operating system for the $1T food-distribution industry; this demo must read as "already gets DSD / C-store distribution."

> The restaurant-delivery version + Datadog observability instrumentation lives on `main` (commit `50d8cd4`). This branch intentionally diverges. Both are kept deliberately (Jon's call) so the two demos exist side by side.

## Architecture / Key Decisions

- **Branch-based** (Jon, 2026-06-18): restaurant version stays on `main`; DSD demo is branch `dsd-convenience-store-demo` (pushed to origin / GitHub jonvez/delivery-simulator).
- **~90% relabel, no destructive schema changes.** The Prisma model (Order / Driver / Assignment) is domain-agnostic. Columns `customerName` / `orderDetails` keep their names but carry **store-account / case-list** meaning. Only the planogram feature adds a migration.
- **Stack stays** Node/Express + React. Pepper *prefers* Python backend (preference, not requirement; React matches) — speak to it, don't rewrite.
- **Deploy (LIVE, all-GCP, $0 — ADR 0008):** backend on a free-tier e2-micro VM (Postgres + Express + Caddy auto-TLS via Docker Compose) → `https://api-35-237-118-208.sslip.io`; frontend on **Firebase Hosting** → **`https://claude-code-mcp-486521.web.app`** (the public link — the #1 application requirement). GCP project `claude-code-mcp-486521`. (Superseded the original Railway+Vercel plan.) Runbook: `docs/` + ADR 0008.

### DSD vocabulary (display labels only — code/DB identifiers unchanged)

Rationale: pick the **rep + route** frame once; every noun + status verb derives from it (a coherent DSD model, not synonyms). Maps the generic delivery app onto the real DSD industry model so a Pepper reviewer reads domain fluency.

| Current (display) | → DSD label | Status |
|---|---|---|
| "Delivery Manager" (app title) | **DSD Route Manager** | confirmed |
| "Restaurant delivery operations" (subtitle) | **Direct Store Delivery for convenience-store distribution** | confirmed |
| Driver | **Rep** (route rep) | confirmed — keystone term |
| Order / Orders | **Stop / Stops** | confirmed (Jon 2026-06-19) |
| Customer (name) | **Store account** | confirmed (seed already does this) |
| Delivery Address | **Store Address** | confirmed |
| Order Details | **Case List** | confirmed (Jon 2026-06-19) |
| status PENDING | **Scheduled** | confirmed |
| status ASSIGNED | **Assigned** | unchanged |
| status IN_TRANSIT | **En Route** | confirmed |
| status DELIVERED | **Delivered** | unchanged |
| Rep availability Available/Unavailable | **On Route / Off Route** | confirmed (Jon 2026-06-19) |
| Order ID | **Stop ID** | confirmed (Jon 2026-06-19 — was "Delivery ID"; changed for coherence with Stop) |

Lifecycle is a clean sequence: **Scheduled → Assigned → En Route → Delivered** (a Stop ends "Delivered"). DB enum values (PENDING/ASSIGNED/IN_TRANSIT/DELIVERED) stay; only display labels change.

### Signature features (BOTH, per Jon 2026-06-18)

1. **Per-Account view** — per-store delivery history, total drops, last visit (the DSD account-management lens). No migration; aggregates existing data. Backend: aggregation in `order.service.ts` + `GET /api/orders/by-store`; frontend: new `StoreHistory` component.
2. **Planogram-compliance check** — rep marks "planogram reviewed" + notes per stop. **Adds a small migration** (`Order.planogramReviewed Boolean`, `Order.planogramNotes String?`). Surfaced as a badge/toggle in `OrderCard`.

### Role-based IA — UX reorg (Jon, 2026-06-25)

The demo is reorganized through a **jobs-to-be-done lens** into **3 role-based views** behind a
top-right "acting as…" role switcher, so a Pepper reviewer reads DSD as a back-office ↔ field
hand-off chain, not one busy screen. Uses `react-router-dom` (pinned 7.18.0). IA:
- `/dispatch` — Plan & Assign ↔ Monitor Routes (via `?mode`); state-responsive (Plan while unassigned, Monitor once rolling, Re-plan affordance).
- `/route/:repId?` — the rep's actionable route (Start / Mark Delivered wired to `PATCH /api/orders/:id`); pick-a-rep empty state.
- `/accounts` — at-risk summary + `StoreHistory`. · `/` → `/dispatch`.

Frontend-only; backend API unchanged; every existing widget reused (no React context — router
params + per-hook refetch). Roster CRUD + data-reset/health demoted to Dispatcher + a header
overflow menu. Approved plan: `~/.claude/plans/wiggly-inventing-wall.md`.

### Visual identity + guided onboarding (Jon, 2026-06-29)

- **Color theme, not a design system.** Considered a full design system; chose to just adopt a
  **brand color theme**. The accent **echoes Pepper's real brand** (emerald `#00935e` →
  `hsl(158 100% 29%)`, sampled from usepepper.com's stylesheet — their logo is a *bell* pepper, so
  the brand is green, not red) so the demo reads as built *for* them. Tokens live in
  `apps/frontend/src/index.css` `@theme`: `--color-primary` + a Pepper-derived **Stop-lifecycle
  status ramp** (`--color-status-{scheduled|assigned|enroute|delivered}` = slate / cyan `#24c0fd` /
  amber `#f79009` / emerald), surfaced via Badge `scheduled|assigned|enroute|delivered` variants and
  the dispatcher count-tile tints.
- **Guided navigation = a spotlight tour.** Of the options floated, chose a **driver.js** coachmark
  tour (pinned **1.6.0**, security-reviewed → Accept-with-hardening / LOW, logged in
  `~/.claude/third-party-inventory.md`). Auto-offered once per browser (localStorage gate) and
  relaunchable from the header "Tour" button; it threads the rep→route hand-off **across the three
  role views** (`/dispatch` → `/route` → `/accounts`), navigating the router between steps. Lives in
  `apps/frontend/src/components/tour/` with `data-tour="…"` anchors on the role switcher + each view.

## Active Context

> **Live work status → GitHub Projects board #2** — `ghpm list` (github.com/users/jonvez/projects/2).
> Status is the board's job and is **not mirrored here** (per build-team convention `evt-0002`).
> History → git log, ADRs (`docs/decisions/`), retro (`docs/retro/log.md`), and `PLAN.archive.2026-06-29.md`.

This section holds only context the board can't: env setup, known gotchas, and process.

### Local dev quickstart (verified working 2026-06-18)

```
# Postgres ONLY (do NOT `docker compose up` fully — the datadog-agent service needs DD_API_KEY)
docker compose up -d postgres
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/delivery_manager"
cd apps/backend && npx prisma migrate deploy && npx prisma generate && npm run seed
cd ../.. && npm run dev      # frontend :5173, backend :3001
# verify: npm run build  +  (cd apps/backend && npm test)  +  (CI=true npm test --workspace=apps/frontend)
```

### Known issues / gotchas (not board-tracked)

- **`docker compose up` gotcha:** start Postgres only (`-d postgres`); a bare `up` starts the `datadog-agent` service, which needs `DD_API_KEY` and fails without it.
- **RUM `clientToken`** in `index.html` is public-by-design (not a secret); `DD_API_KEY` stays in the gitignored `.env`.
- **~70 Dependabot vulns** (3 critical) — surfaced by GitHub Dependabot; flagged for later cleanup, not blocking the demo.
- **`main` branch** = the restaurant Delivery Manager + Datadog observability instrumentation (APM/logs/Postgres/RUM), committed at `50d8cd4`. This branch intentionally diverges; both are kept side by side.

### Process & cross-project

- **Native persona-subagent build process** (shared with `dinner-and-groceries`): `TEAM.md`, `SPEC.md`, `docs/decisions/` (ADRs), `docs/retro/log.md`. Work is tracked on **board #2** (six columns Backlog → Ready → In Progress → In Review → QA → Done; operate via `ghpm`). Adoption gate: the team grooms/designs until Jon says **"start."**
- This demo is the artifact for the **Pepper** application tracked in the job-search CRM (Opportunities **row 73**).
