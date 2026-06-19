# Delivery Simulator Plan

## Goal (branch: `dsd-convenience-store-demo`)

Reframe the restaurant **Delivery Manager** into a **Direct Store Delivery (DSD) / convenience-store distribution** demo — the portfolio / live-demo artifact for Jon's **Pepper "Founding PM, Convenience Store"** application (job-search project). Pepper builds the operating system for the $1T food-distribution industry; this demo must read as "already gets DSD / C-store distribution."

> The restaurant-delivery version + Datadog observability instrumentation lives on `main` (commit `50d8cd4`). This branch intentionally diverges. Both are kept deliberately (Jon's call) so the two demos exist side by side.

## Architecture / Key Decisions

- **Branch-based** (Jon, 2026-06-18): restaurant version stays on `main`; DSD demo is branch `dsd-convenience-store-demo` (pushed to origin / GitHub jonvez/delivery-simulator).
- **~90% relabel, no destructive schema changes.** The Prisma model (Order / Driver / Assignment) is domain-agnostic. Columns `customerName` / `orderDetails` keep their names but carry **store-account / case-list** meaning. Only the planogram feature adds a migration.
- **Stack stays** Node/Express + React. Pepper *prefers* Python backend (preference, not requirement; React matches) — speak to it, don't rewrite.
- **Deploy:** Railway (backend + Postgres) + Vercel (frontend). Guided click-by-click for Jon's logins. A working public link is the #1 application requirement.

### DSD vocabulary (display labels only — code/DB identifiers unchanged)

Rationale: pick the **rep + route** frame once; every noun + status verb derives from it (a coherent DSD model, not synonyms). Maps the generic delivery app onto the real DSD industry model so a Pepper reviewer reads domain fluency.

| Current (display) | → DSD label | Status |
|---|---|---|
| "Delivery Manager" (app title) | **DSD Route Manager** | confirmed |
| "Restaurant delivery operations" (subtitle) | **Direct Store Delivery for convenience-store distribution** | confirmed |
| Driver | **Rep** (route rep) | confirmed — keystone term |
| Order / Orders | **Delivery / Deliveries** | OPEN: Delivery vs. Stop |
| Customer (name) | **Store account** | confirmed (seed already does this) |
| Delivery Address | **Store Address** | confirmed |
| Order Details | **Case List** | OPEN: Case List vs. Items |
| status PENDING | **Scheduled** | confirmed |
| status ASSIGNED | **Assigned** | unchanged |
| status IN_TRANSIT | **En Route** | confirmed |
| status DELIVERED | **Delivered** | unchanged |
| Rep availability Available/Unavailable | **On Route / Off Route** | OPEN vs. Active/Inactive |
| Order ID | **Delivery ID** | confirmed |

Lifecycle is a clean sequence: **Scheduled → Assigned → En Route → Delivered**. DB enum values (PENDING/ASSIGNED/IN_TRANSIT/DELIVERED) stay; only display labels change. Get Jon's call on the 3 OPEN items before propagating to tests.

### Signature features (BOTH, per Jon 2026-06-18)

1. **Per-Account view** — per-store delivery history, total drops, last visit (the DSD account-management lens). No migration; aggregates existing data. Backend: aggregation in `order.service.ts` + `GET /api/orders/by-store`; frontend: new `StoreHistory` component.
2. **Planogram-compliance check** — rep marks "planogram reviewed" + notes per stop. **Adds a small migration** (e.g., `Order.planogramReviewed Boolean`, `Order.planogramNotes String?`). Surface a badge/toggle in `OrderCard`.

## Active Context

### Status (2026-06-18)

- ✅ Datadog WIP committed to `main` (`50d8cd4`) + pushed. Branch `dsd-convenience-store-demo` cut + pushed.
- ✅ Baseline verified GREEN: build (both apps), 74 backend tests, 107 frontend tests, seeded DB.
- ✅ **Backend reframed** (commit `c63df6b`): seed content extracted to `apps/backend/src/data/dsd-seed-data.ts` (REP_NAMES, STORE_ACCOUNTS, DELIVERY_ITEMS), imported by `seed.ts` + `services/data.service.ts`; console output relabeled. Re-seed produces route reps + store deliveries + Brooklyn store locations.
- ⏳ **Frontend reframe NOT started.** Domain strings mapped (see below). Tests will need updating in tandem.

### Remaining roadmap (next session picks up here)

1. **Frontend reframe** — apply the vocabulary table to these files (display strings only; keep code identifiers like `OrderStatus`, `driver`, `order`):
   - `apps/frontend/src/App.tsx` — title (L28), subtitle (L30), card titles/descriptions (Orders L84-85, Drivers L98-99, Driver List L110-111), Route Viz text (L123-125). **Replace the dev "Completed Stories / Epics" footer (L142-187)** with a clean "About this demo" blurb (DSD framing + "built solo with Claude Code / AI-assisted").
   - `apps/frontend/src/components/OrderCard.tsx` — `statusLabels` (L23-28: Scheduled/Assigned/En Route/Delivered), "Delivery Address"→Store Address (L73), "Order Details"→Case List (L81), "Assigned Driver"→Assigned Rep (L91), "Reassign to Different Driver"→Rep (L101), "Assign to Driver"→Rep (L136), timeline "In Transit"→En Route (L179), "Order ID"→Delivery ID (L194).
   - `apps/frontend/src/components/OrderList.tsx` — `statusSections` titles/descriptions (L17-38), heading "Orders"→Deliveries (L118), counts "order(s)"→deliveries (L120, L141), empty/loading strings (L74, L102-103).
   - `apps/frontend/src/components/DriverList.tsx` — "No orders assigned yet"→deliveries (L78), "Available/Unavailable"→On Route/Off Route (L52), "Mark Available/Unavailable" (L60), heading "Drivers"→Reps (L156), count (L158), "No drivers yet…" (L144), "Loading drivers…" (L123).
   - `apps/frontend/src/components/DriverForm.tsx` — read + relabel Driver→Rep field labels/placeholders.
   - `apps/frontend/src/components/DriverMapView.tsx` — "Select Driver"→Select Rep, "driver's assigned delivery locations" (L41), header comments.
   - **Update test suites** to match new strings: `components/__tests__/OrderCard.test.tsx`, `OrderList.test.tsx`, `DriverList.test.tsx`, `DriverForm.test.tsx`, `OrderForm.test.tsx`, and `lib/__tests__/api.test.ts` if any string assertions.
2. **Feature 1 — Per-Account view** (no migration).
3. **Feature 2 — Planogram-compliance check** (small migration: `npx prisma migrate dev --name planogram_compliance`).
4. **Polish + README rewrite** (README still says "restaurant delivery"; rewrite to DSD + "built solo with AI tooling").
5. **Deploy** — Railway + Vercel; guided steps for Jon (his logins). Docs in `docs/DEPLOYMENT_GUIDE.md`. Needs `.env.example` (note: `apps/backend/.env.example` exists; verify it's DSD-clean).
6. **Pepper application framing blurb** — short "what this is / why it maps to DSD / built solo with AI" note + live link + repo link, for the job-search Pepper application (CRM row 73).

### Local dev quickstart (verified working 2026-06-18)

```
# Postgres ONLY (do NOT `docker compose up` fully — the datadog-agent service needs DD_API_KEY)
docker compose up -d postgres
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/delivery_manager"
cd apps/backend && npx prisma migrate deploy && npx prisma generate && npm run seed
cd ../.. && npm run dev      # frontend :5173, backend :3001
# verify: npm run build  +  (cd apps/backend && npm test)  +  (CI=true npm test --workspace=apps/frontend)
```

### Notes / Blockers

- GitHub flagged ~70 Dependabot vulns on the repo (3 critical) — not blocking the demo; flag for later cleanup.
- RUM `clientToken` in `index.html` is public-by-design (not a secret); `DD_API_KEY` stays in gitignored `.env`.
- 3 OPEN vocabulary calls await Jon (Delivery vs Stop · Case List vs Items · On Route/Off Route vs Active/Inactive) — confirm before propagating to tests.
- Cross-project: this demo is the artifact for the Pepper application tracked in job-search CRM (Opportunities row 73).
- **Process migrated off BMAD → native team paradigm** (shared with `dinner-and-groceries`): see `TEAM.md`, `SPEC.md`, `docs/decisions/` (ADRs 0001–0003), `docs/retro/log.md`. The remaining DSD roadmap below is being filed as GitHub Project issues. Adoption Gate: team grooms/designs until Jon says **"start."**

---

## Session Log

### 2026-06-19

- Migrated the build process from **BMAD** to the **native persona-subagent paradigm** (the same one used on `dinner-and-groceries`). Removed `.bmad-core/`, `.cursor/rules/bmad/`, `.claude/commands/BMad/`; de-BMAD'd `README.md` + `docs/architecture*`.
- Stood up native scaffolding: `TEAM.md`, `.claude/settings.json` allowlist, `docs/decisions/0001–0003`, `docs/retro/log.md`. Folded BMAD `brief.md` + `prd.md` into a native `SPEC.md`; kept `docs/architecture/*` as reference.
- Next: create GitHub Project board + file the remaining DSD roadmap as issues; then session restart + "start."

### 2026-06-18

- Pivoted repo into the Pepper DSD demo. Committed pre-existing uncommitted Datadog instrumentation to `main` (`50d8cd4`) + pushed; cut branch `dsd-convenience-store-demo` + pushed.
- Verified green baseline. Reframed backend seed layer to DSD (commit `c63df6b`).
- Reframe plan + DSD vocabulary approved (branch-based; both signature features; guided deploy). Frontend reframe mapped but not started. **Handed off to the delivery-simulator project session** with this PLAN as the pickup doc.

### (prior) Datadog integration

Datadog observability plan (APM/logs/Postgres/RUM, Phases 1-6) was implemented locally and is now committed to `main` (`50d8cd4`). See git history for detail.
