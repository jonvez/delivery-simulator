# Delivery Simulator Plan

## Goal (branch: `dsd-convenience-store-demo`)

Reframe the restaurant **Delivery Manager** into a **Direct Store Delivery (DSD) / convenience-store distribution** demo — the portfolio / live-demo artifact for Jon's **Pepper "Founding PM, Convenience Store"** application. Pepper is building the operating system for the $1T food-distribution industry; this demo should read as "already gets DSD / C-store distribution."

> Prior effort — Datadog observability instrumentation — is committed to `main` (commit `50d8cd4`). This branch intentionally diverges to build the DSD demo. The restaurant-delivery version remains on `main`.

## Architecture / Key Decisions

- **Branch-based** (Jon's call 2026-06-18): keep the restaurant version on `main`; build the DSD demo as a distinct branch so both exist. Repo: github.com/jonvez/delivery-simulator.
- Reframe is **~90% relabeling** — the data model (Order / Driver / Assignment) is domain-agnostic; **no migration for the relabel**.
- **Terminology:** Delivery Manager → DSD Route Manager · Driver → Rep · Order → Delivery (a route = sequence of stops) · Customer → Store account · order details → items / case list · statuses display-relabeled (DB enums unchanged).
- **Seed data** → Brooklyn convenience-store accounts + DSD product cases (beverage cases, snack-rack restocks, cooler drops).
- **Signature features (BOTH, per Jon 2026-06-18):**
  1. **Per-Account view** — per-store delivery history, total drops, last visit. No migration (aggregates existing data).
  2. **Planogram-compliance check** — rep marks "planogram reviewed" + notes per stop. Small schema migration.
- **Stack** stays Node/Express + React. Pepper *prefers* Python backend (preference, not requirement; React matches) — be ready to speak to it.
- **Deploy:** Railway (backend + Postgres) + Vercel (frontend), guided click-by-click for Jon (his logins). A working live link is the #1 application requirement.

## Active Context

### Current Focus

On branch `dsd-convenience-store-demo`. Plan approved 2026-06-18. Datadog WIP committed to `main` + pushed.

**Phases:** 0 baseline (install, Postgres up, migrate, seed, build/tests green) → 1 reframe (relabel + seed) → 2 features (per-account + planogram) → 3 polish (states, README, tests green) → 4 deploy guide → 5 application framing blurb.

### Notes / Blockers

- GitHub flagged 62 Dependabot vulns on the repo (3 critical) — not blocking the demo; flag for later cleanup.
- RUM `clientToken` in `index.html` is public-by-design (not a secret).
- Deploy phase needs Jon's Railway/Vercel logins — I prep turnkey, Jon executes the auth steps.

---

## Session Log

### 2026-06-18

- Pivoted this repo into the Pepper DSD demo. Committed pre-existing uncommitted Datadog instrumentation to `main` (`50d8cd4`) and pushed, then cut branch `dsd-convenience-store-demo`.
- Reframe plan approved (branch-based; both signature features; guided redeploy). Beginning Phase 0 baseline.
