# Delivery Simulator — Build Team & Process

_Date: 2026-06-19_

How we build and evolve the product in `SPEC.md`: a small team of persona subagents,
coordinated through a persistent board, working as independently as the harness reliably
allows. This is a **brownfield** project — the app is already built and is mid-reframe from a
restaurant **Delivery Manager** into a **Direct Store Delivery (DSD) / convenience-store**
demo (see `PLAN.md`). This process **replaces BMAD**, which was removed (ADR 0001).

> Shared paradigm: the same native team process used by the parallel project
> `dinner-and-groceries`. Persona agents are global; learnings from both feed an eventual
> extracted `build-team` skill.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Framework | **Native** — custom subagents + superpowers skills + ADR log + board. BMAD removed (ADR 0001). |
| Async tracking | **GitHub Projects** (Issues + Kanban). Agents read/write via `gh`; visible from any browser/phone. |
| Scope authority | **Product Owner agent decides within guardrails**; every call logged as an ADR for later review/override. |
| Parallelism | Up to **2 developer agents** in parallel, isolated via git worktrees. |
| Security | **Review gate**, not a standing persona: `security-review` skill at PR/merge run by a **non-author** agent; security baked into ADRs + Definition of Done. Formalize a dedicated Security Reviewer only if the surface grows. |
| Reuse | **Global persona agents** (`~/.claude/agents/`), shared with `dinner-and-groceries`. Extract a reusable `build-team` skill only **after** both projects yield learnings — discover, then extract. |
| Learnings | Keep a **running retro log** (`docs/retro/log.md`) during the build + an **agent-run retro** at the end. Comparable across both projects. |
| TDD | **Test-first discipline.** Strict test-first for domain/logic/service/API code; UI may take a thin exploratory spike but ships with tests. Enforced in the Definition of Done; uses the `test-driven-development` skill. The existing suites (74 backend, 107 frontend) are the safety net during the DSD reframe. |
| Observability | **Datadog** (APM, logs, Postgres metrics, RUM) — already instrumented on `main` (commit `50d8cd4`). No separate product-analytics layer for this demo. Never log PII / secrets to Datadog. |
| Kickoff | A formal **Adoption Gate**: the team only plans/grooms/designs under the new process until Jon explicitly says **"start"** (recorded as an ADR). That flips execution on for the DSD roadmap issues. |

## Personas

Each persona is a custom subagent with its **own tool allowlist** (front-loaded), scoped to
least-privilege per role. Personas live **globally** in `~/.claude/agents/<name>.md` so both
projects use the same team; project-specific tweaks (if any) override locally in
`.claude/agents/`.

| Persona | Responsibility | Tool scope (allowlist) |
|---------|----------------|------------------------|
| **Product Owner** (the "PM") | Owns spec→backlog, writes issues w/ acceptance criteria, accepts/rejects work, **makes scope decisions within guardrails**, logs ADRs | Read, `gh` (issues/projects), write to `docs/` + `docs/decisions/` |
| **Architect** | System/data-model design, structural reviews, tech decisions, authors ADRs | Read, write to `docs/`, `gh` (comment) |
| **Product Designer** | UX flows, wireframes, component/visual direction (uses `frontend-design` skill) | Read, write to `docs/design/`, Playwright (visual check), `gh` (comment) |
| **Developer A / B** | Implement issues TDD, in isolated worktrees; open PRs linked to issues | Read, Write, Edit, Bash, test runners, `gh` (PR/issue), worktree |
| **QA Engineer** | Writes/extends tests, runs suites, verifies acceptance criteria, files bug issues | Read, write to test dirs, Bash (run tests), Playwright (E2E), `gh` (issues) |
| **Orchestrator** (scrum-master = main session) | Assigns board items, enforces the scoping gate, dispatches personas, records status | All (coordination layer) |

## Governance

### Scoping gate (front-loaded, before any code)

1. PO + Architect produce an **open-questions list** from `SPEC.md` / `PLAN.md`.
2. Jon answers the **high-stakes** questions in a single batch (e.g. the 3 open DSD vocabulary items).
3. PO is **empowered to decide the rest** within the guardrails below.
4. Every decision (Jon's or PO's) is written to the **ADR log**.

### Guardrails (bounds on PO autonomy)

The PO may decide freely **unless** a choice would:
- contradict `SPEC.md`, `PLAN.md`, or one of Jon's batch answers,
- change MVP/demo scope (add/remove a feature), the data-model shape, or the hosting/cost posture,
- introduce a new paid service or external dependency,
- change the DSD-demo framing that the Pepper application depends on.

Anything hitting a guardrail escalates to Jon.

### Decision log (ADRs)

- One file per decision: `docs/decisions/NNNN-short-title.md` (context → decision → consequences → who decided).
- Reviewable and overridable by Jon at any time. This is the durable record of "why."

### Security gate

- Security is a **gate, not a teammate**. At PR/merge, the `security-review` skill runs over the
  pending changes, executed by an agent that is **not the author** (independent scrutiny).
- Security requirements live in the architect's ADRs and the Definition of Done: secrets in env
  (never in code — note the live `DATABASE_URL` / `DD_API_KEY` / deploy tokens), input validation
  on the Express API, no PII or secrets written to logs / Datadog, safe handling of geocoding and
  any external calls.
- Escalate a dedicated **Security Reviewer** persona only if the surface grows (auth, multi-tenant,
  payments, public write APIs).

### Test-Driven Development

- **Strict test-first** for domain logic, services, and data access — the riskiest code here:
  order/delivery **assignment + reassignment**, the status **lifecycle** (Scheduled → Assigned →
  En Route → Delivered), **per-account aggregation** (Per-Account view), the **planogram** migration
  + toggle, geocoding / route-sequence math, and 30-second polling behavior.
- **UI** may take a thin exploratory spike before the test lands, but ships *with* tests. The DSD
  string reframe must update its test assertions in tandem (display strings are asserted in
  `components/__tests__/*`).
- Developers use the `test-driven-development` skill. No implementation is "done" without tests
  written first and passing — verified by QA, not asserted.

### Definition of Done (per issue)

- Acceptance criteria met; **tests written first (TDD)** and passing (backend + frontend suites
  green); lint/typecheck clean; PR linked to the issue; QA verified; **`security-review` passed
  (non-author) for security-relevant changes**; PO accepted.

### Retro & learnings log

- A **running record** at `docs/retro/log.md`: anyone (agent or Jon) appends retro-worthy
  observations *as they happen* — friction, surprises, what the process got right/wrong.
- An **agent-run retro** after each milestone synthesizes the log into concrete process changes.
- This log is an **input to the eventual `build-team` skill** and is comparable across this
  project and `dinner-and-groceries`.

## Adoption Gate (the formal "start")

This project is brownfield — past greenfield kickoff — so the gate authorizes the **team** to
begin executing the DSD roadmap under the new process. No agent writes feature code before it.

**Pre-flight (all must be green):**
- [ ] BMAD removed; native scaffolding in place (TEAM.md, settings, ADRs, retro log)
- [ ] Scoping gate run (open questions surfaced; the 3 DSD vocab items decided or ticketed)
- [ ] GitHub Project board created; remaining DSD roadmap filed as issues
- [ ] Session restarted so the real persona agents are dispatchable

**The ceremony:** Jon raises any final questions (scope, process, restarts). When satisfied,
Jon says **"start."** That declaration is recorded as an adoption ADR
(`docs/decisions/NNNN-adoption.md`) and is the *only* trigger that lets the orchestrator begin
pulling Ready issues. Before "start," the team only plans, grooms, and designs.

## Board (GitHub Projects)

Columns map to handoffs: **Backlog → Ready → In Progress → In Review → QA → Done.**
- PO grooms Backlog → Ready (issues with acceptance criteria).
- Devs pull from Ready → In Progress, open PRs → In Review.
- QA moves In Review → QA → Done (or back with a bug issue).
- Jon watches the board async; PRs and ADRs answer "why/what's the status."

## Front-loaded permissions

Two layers, both configured once up front:
1. **Per-agent tools** — in each `~/.claude/agents/<name>.md` frontmatter (table above).
2. **Project permission allowlist** — `.claude/settings.json` `permissions.allow` for the safe,
   high-frequency commands (`gh`, `npm`/`npx`, `prisma`, `docker compose`, test runners, `git`)
   so agents don't stall on prompts mid-run. Destructive/outbound actions stay gated. Local-only
   preferences remain in `.claude/settings.local.json`.

## Orchestration model (the honest version)

Subagents are **session-scoped workers, not daemons**; durable state is **git + the board**.
- **Primary loop:** orchestrated sessions — Jon kicks off, orchestrator dispatches personas
  through the board, work lands as commits/PRs/ADRs, Jon returns and resumes.
- **Parallel:** 2 dev agents concurrently via worktrees (no file collisions).
- **Optional autonomy:** a tightly-scoped `/schedule` routine (e.g., nightly "advance the top
  Ready item") if Jon wants between-session progress — added later, not at the start.

## Setup checklist (one-time)

- [x] BMAD framework removed (`.bmad-core/`, `.cursor/rules/bmad/`, `.claude/commands/BMad/`)
- [x] `~/.claude/agents/*.md` (global) for the personas with scoped tool allowlists (shared w/ dinner-and-groceries)
- [x] `.claude/settings.json` permission allowlist (front-loaded)
- [x] `docs/decisions/` ADR directory + `0001` recording these process decisions
- [x] `docs/retro/log.md` started (running learnings record)
- [x] BMAD `brief.md` + `prd.md` folded into native `SPEC.md`; `docs/architecture/*` kept as reference
- [ ] GitHub Project board created with the 6 columns + remaining DSD roadmap filed as issues
- [ ] Scoping gate run: 3 open DSD vocab items decided
- [ ] Session restarted; Jon says **"start"**
