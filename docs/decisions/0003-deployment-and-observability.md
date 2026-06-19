# ADR 0003 — Deployment & Observability

- **Status:** Accepted
- **Date:** 2026-06-18 (recorded 2026-06-19)
- **Decided by:** Jon (human)

## Context

The DSD demo's #1 requirement is a **working public link**. The app is a monorepo (React frontend
+ Express/Prisma/Postgres backend). Observability was added to demonstrate production-grade
practice for the Pepper application.

## Decision

**Deployment:**
- **Railway** hosts the backend + PostgreSQL. Prisma migrations run on container startup; server
  binds explicitly to `0.0.0.0`.
- **Vercel** hosts the frontend.
- Deploy is **guided click-by-click for Jon's logins** (his accounts). Steps live in
  `docs/DEPLOYMENT_GUIDE.md`. Needs a verified DSD-clean `apps/backend/.env.example`.

**Observability (committed on `main`, commit `50d8cd4`):**
- **Datadog** — APM (tracing), logs, PostgreSQL metrics, and RUM (frontend real-user monitoring).
- The `datadog-agent` service requires `DD_API_KEY`; **local dev runs Postgres only**
  (`docker compose up -d postgres`) and does *not* bring up the full compose stack.

## Consequences

- Secrets (`DATABASE_URL`, `DD_API_KEY`, Railway/Vercel tokens) live in env, never in code —
  enforced by the security gate (see `TEAM.md`). No PII or secrets in logs/Datadog.
- No separate product-analytics layer for the demo; Datadog covers observability.
- The two-environment split (Railway API + Vercel SPA) means CORS / API base URL config is part of
  the deploy checklist.
- Datadog instrumentation lives on `main`; the DSD branch inherits it on merge/rebase as needed.
