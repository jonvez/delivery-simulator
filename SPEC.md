# Delivery Simulator — Product Spec

> Native single source of product truth. Folds the former BMAD `brief.md` + `prd.md` into one
> spec. Build process is in `TEAM.md`; live execution context is in `PLAN.md`; deep technical
> reference is in `docs/architecture/`; decisions of record are in `docs/decisions/`.

## What this is

A standalone, web-based **delivery-management** application — order intake, driver/rep
coordination, assignment, status tracking, and map-based route visualization, with no dependency
on any POS or external system. It is **built and green** (74 backend + 107 frontend tests).

It is now being reframed from its original **restaurant Delivery Manager** framing into a
**Direct Store Delivery (DSD) / convenience-store distribution** demo — the live portfolio
artifact for Jon's *"Founding PM, Convenience Store"* application to **Pepper**. The demo must
read as "already gets DSD / C-store distribution." Both demos are kept deliberately side by side:
restaurant on `main`, DSD on branch `dsd-convenience-store-demo`. See `PLAN.md` for the live
reframe roadmap and `docs/decisions/0002` for the reframe strategy.

## Vision & value

A clean, functional delivery-management system that gives an operator at-a-glance visibility into
deliveries, reps, and routes without enterprise complexity or POS lock-in. Differentiators:
simplicity-first (learnable in minutes), standalone operation, visual route optimization, and
clear status tracking via 30-second polling.

## Users

- **Primary:** the dispatcher / route manager — a control-center operator who needs to see what
  needs attention, act in few clicks, and trust that data is current. Desktop-first, tablet
  secondary; not optimized for phones.
- Demo/sandbox mode only — all data is simulated/seeded (Brooklyn, NY). No real customers, no auth,
  single user.

## Capabilities (delivered)

Order/Delivery management, driver/rep management, assignment + reassignment, route visualization,
status tracking, data simulation, and QA automation. Functional summary (full detail in
`docs/architecture/4-api-specification.md` and `docs/prd`-derived history):

- **Orders/Deliveries:** create (customer/account, address, phone, details/case-list); list with
  status; update status through the lifecycle; mark delivered → history; lifecycle timestamps.
- **Drivers/Reps:** add with name + availability; list with availability and assignments; toggle
  availability.
- **Assignment:** assign pending deliveries to available reps; reassign; reflected in both views.
- **Route visualization:** Leaflet/OpenStreetMap map of a selected rep's stops + suggested
  sequence; pre-seeded Brooklyn coordinates (Nominatim fallback).
- **Dashboard:** orders grouped by status; 30-second polling with a last-updated indicator.
- **Data:** seed generation + reset for reproducible demos.

**Status lifecycle:** `PENDING → ASSIGNED → IN_TRANSIT → DELIVERED` (DB enum values stable; DSD
display labels: **Scheduled → Assigned → En Route → Delivered**).

## DSD reframe (active)

~90% display-label relabel, **no destructive schema changes** — the domain-agnostic Prisma model
(Order / Driver / Assignment) is retained; only the planogram feature adds a migration. Display
vocabulary (code/DB identifiers unchanged): Driver → **Rep**, Customer → **Store account**, Order
Details → **Case List**, app title → **DSD Route Manager**, etc. Full table and per-file reframe
plan live in `PLAN.md`.

**Signature features (both):**
1. **Per-Account view** — per-store delivery history, total drops, last visit (the DSD
   account-management lens). Aggregates existing data; no migration.
2. **Planogram-compliance check** — rep marks "planogram reviewed" + notes per stop. Adds a small
   migration (`Order.planogramReviewed`, `Order.planogramNotes`).

## Stack & architecture

Node.js/Express + React (TypeScript throughout), Prisma + PostgreSQL, npm-workspaces monorepo
(`apps/frontend`, `apps/backend`). Leaflet/OSM maps. shadcn/ui + Tailwind. REST API with JSON.
Deploy: **Railway** (backend + Postgres) + **Vercel** (frontend). Observability: **Datadog**
(APM, logs, Postgres metrics, RUM). Detail in `docs/architecture/`; deploy + observability
rationale in `docs/decisions/0003`.

## Demo success criteria

A reviewer can, end-to-end without errors: create a delivery → see it in the scheduled list →
assign it to an available rep → see the rep's stops + suggested route on the map → mark it
delivered → see it in history. Plus the two signature features read as DSD-fluent, and a working
**public link** exists (the #1 application requirement).

## Non-goals (out of scope)

Real-time GPS tracking; customer-facing tracking portal; POS/online-ordering integration;
TSP/advanced route optimization; rep mobile app; auth / multi-tenant; payments; ETAs;
notifications (SMS/email/push); analytics/reporting dashboards beyond Datadog observability.

## Open questions

The 3 unresolved DSD vocabulary calls (tracked as a decision issue on the board):
**Delivery vs. Stop**, **Case List vs. Items**, **On Route/Off Route vs. Active/Inactive**.
Resolve before propagating display strings to tests.

## References

- `PLAN.md` — live reframe roadmap, vocabulary table, per-file plan, dev quickstart
- `TEAM.md` — build team & process
- `docs/architecture/` — technical reference (data models, API, schema, components)
- `docs/decisions/` — ADRs (0001 baseline, 0002 DSD reframe, 0003 deploy & observability)
- `docs/DEPLOYMENT_GUIDE.md`, `docs/MANUAL_TESTING_CHECKLIST.md`
