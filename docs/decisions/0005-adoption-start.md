# 0005 — Adoption Gate cleared: "start"

_Date: 2026-06-22 · Decided by: Jon_

## Context

`TEAM.md` defines a formal **Adoption Gate**: under the native build-team process, the team only
plans, grooms, and designs until Jon explicitly says **"start."** That declaration is the only
trigger that lets the orchestrator begin pulling Ready issues and authorizes feature code on the
DSD roadmap.

Pre-flight state at this decision:
- ✅ BMAD removed; native scaffolding in place (`TEAM.md`, `.claude/settings.json`, ADRs 0001–0004, `docs/retro/log.md`).
- ✅ Scoping gate run; the 3 open DSD vocabulary items resolved (2026-06-19): **Stop/Stops · Case List · On Route/Off Route · Stop ID**. Vocabulary table in `PLAN.md` fully confirmed.
- ✅ GitHub Project board live; remaining DSD roadmap filed as issues (#2–#8).
- ✅ Session restarted; persona agents dispatchable.
- ✅ Stale decision issue **#7** (resolve vocab) closed — the decision is settled.

## Decision

Jon said **"start"** (2026-06-22). The Adoption Gate is cleared. The orchestrator may now pull
Ready issues and dispatch persona agents to execute the DSD roadmap.

First pulls (dependency order):
1. **#2 Frontend reframe** — foundational; unblocks the visible demo. Pulled first.
2. **#3 Per-Account view** + **#4 Planogram-compliance check** — parallelizable (≤2 dev agents, worktree-isolated) once #2 lands.
3. **#5 README rewrite**, then **#6 Deploy**, then **#8 Pepper framing blurb** (needs the live link).

Grooming note: the PO reconciles each issue body against the now-confirmed vocabulary before
moving it Backlog → Ready (e.g. #2 still says "Delivery ID"/"Orders→Deliveries"; confirmed terms
are "Stop ID"/"Orders→Stops"). The `blocked-by` vocab references are now resolved.

## Consequences

- Execution is ON for the DSD roadmap under the build-team process (TEAM.md governance applies: TDD, DoD, non-author security gate, ADR log).
- Guardrails on PO autonomy remain in force; anything hitting a guardrail escalates to Jon.
- Reviewable/overridable by Jon at any time.
