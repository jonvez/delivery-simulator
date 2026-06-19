# ADR 0002 — DSD Reframe Strategy

- **Status:** Accepted
- **Date:** 2026-06-18 (recorded 2026-06-19)
- **Decided by:** Jon (human)

## Context

The restaurant **Delivery Manager** is being repurposed as a **Direct Store Delivery (DSD) /
convenience-store distribution** demo to serve as the live portfolio artifact for Jon's
*"Founding PM, Convenience Store"* application to **Pepper** (which builds the operating system
for food distribution). The demo must read as domain-fluent in DSD/C-store distribution. A
working public link is the #1 application requirement.

## Decision

- **Branch-based, two demos kept side by side.** Restaurant version stays on `main`; the DSD demo
  lives on branch `dsd-convenience-store-demo` (origin: `jonvez/delivery-simulator`). The branch
  intentionally diverges; both are retained deliberately.
- **~90% relabel, no destructive schema changes.** The Prisma model (Order / Driver / Assignment)
  is domain-agnostic and kept. DB enum values (`PENDING/ASSIGNED/IN_TRANSIT/DELIVERED`) and code
  identifiers (`OrderStatus`, `driver`, `order`) are unchanged; only **display labels** change.
  Columns `customerName` / `orderDetails` keep their names but carry store-account / case-list
  meaning. Only the planogram feature adds a migration.
- **Coherent DSD vocabulary** derived from a single rep + route frame (display labels only):
  Driver → **Rep** (keystone), Customer → **Store account**, Order Details → **Case List**, app
  title → **DSD Route Manager**, status PENDING/IN_TRANSIT → **Scheduled/En Route**, etc. Lifecycle
  reads **Scheduled → Assigned → En Route → Delivered**. Full table in `PLAN.md`.
- **Stack stays** Node/Express + React (Pepper prefers Python backend — a preference, not a
  requirement; React matches). Speak to the preference in framing; do not rewrite.
- **Two signature features** (both): **Per-Account view** (no migration) and
  **Planogram-compliance check** (small migration).

## Open items (escalated to Jon / tracked on the board)

Three display-label calls remain open and must be decided before propagating to tests:
**Delivery vs. Stop**, **Case List vs. Items**, **On Route/Off Route vs. Active/Inactive**.

## Consequences

- Low-risk reframe: the existing test suites (74 backend / 107 frontend) remain the safety net;
  display-string changes update their assertions in tandem.
- Backend reframe is complete (seed content extracted to `dsd-seed-data.ts`, console relabeled,
  commit `c63df6b`); the frontend reframe + the two signature features + README rewrite + deploy
  are the remaining roadmap (filed as board issues).
- The DSD framing is load-bearing for the Pepper application; changes to it escalate to Jon.
