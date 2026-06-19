# ADR 0001 — Process & Architecture Baseline

- **Status:** Accepted
- **Date:** 2026-06-19
- **Decided by:** Jon (human)

## Context

`delivery-simulator` is an existing, built web app (a restaurant **Delivery Manager** — order
management, driver assignment, route visualization). It was originally scaffolded and documented
with the **BMAD** methodology. It is now being reframed into a **Direct Store Delivery (DSD) /
convenience-store distribution** demo — the live portfolio artifact for Jon's *"Founding PM,
Convenience Store"* application to **Pepper** (see `PLAN.md`). Concurrently, the build process is
being migrated from BMAD to the **native persona-subagent paradigm** already in use on the
parallel project `dinner-and-groceries`, so learnings from both can feed a future reusable
`build-team` skill. See `SPEC.md` for the product and `TEAM.md` for the process.

## Decision

**Product (see `SPEC.md`, `docs/architecture/`):**
- A standalone delivery-management app: orders/deliveries, drivers/reps, assignment, status
  lifecycle, map + route visualization, 30-second polling. Built and green (74 backend / 107
  frontend tests).
- Active reframe: restaurant → DSD/C-store. ~90% display-label relabel, no destructive schema
  changes; the domain-agnostic Prisma model (Order / Driver / Assignment) is retained. Two demos
  kept side-by-side: restaurant on `main`, DSD on branch `dsd-convenience-store-demo`. (Detail in ADR 0002.)
- Stack: Node/Express + React + Prisma/PostgreSQL, npm workspaces monorepo. Deploy: Railway
  (backend + Postgres) + Vercel (frontend). Observability: Datadog (APM, logs, Postgres metrics,
  RUM). (Detail in ADR 0003.)

**Process (see `TEAM.md`) — replaces BMAD:**
- Native subagent personas (PO, architect, designer, 2 devs, QA) + superpowers skills. BMAD
  framework files removed.
- Tracking: GitHub Projects (Issues + Kanban): Backlog → Ready → In Progress → In Review → QA → Done.
- Scope authority: Product Owner decides within written guardrails; all decisions logged as ADRs.
- Security: independent review *gate* (`security-review` skill, non-author) + security in ADRs/DoD.
  No standing security persona for the demo.
- TDD: test-first for domain/service/API code; existing suites are the reframe safety net.
- Reuse: persona agents are global (`~/.claude/agents/`), shared with `dinner-and-groceries`;
  extract a `build-team` skill only after both projects yield learnings.
- Learnings: running retro log at `docs/retro/log.md` + agent-run retro per milestone.

## Consequences

- BMAD is fully removed (`.bmad-core/`, `.cursor/rules/bmad/`, `.claude/commands/BMad/`); the
  BMAD `brief.md` + `prd.md` are folded into a native `SPEC.md`, and `docs/architecture/*` is
  retained as linked reference.
- The native process now governs the remaining DSD roadmap; that work is filed as issues on a
  new GitHub Project board (distinct from Jon's personal Things system, which is not used here).
- The Project board requires the `gh` `project` scope (already present).
- Because the app is brownfield, the kickoff gate becomes an **Adoption Gate**: the team plans and
  grooms under the new process but does not execute feature work until Jon says **"start."**
- The DSD framing is load-bearing for the Pepper application, so changes to it escalate to Jon.
