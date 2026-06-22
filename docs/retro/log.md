# Retro & Learnings Log — Delivery Simulator

A running record of process observations. Anyone (agent or Jon) appends retro-worthy notes **as
they happen** — friction, surprises, what the process got right/wrong. An agent-run retro after
each milestone synthesizes these into concrete process changes. Comparable across this project and
`dinner-and-groceries`; feeds the eventual `build-team` skill.

Format: `### YYYY-MM-DD — short title` then bullets.

---

### 2026-06-19 — Migrated from BMAD to the native team paradigm
- Removed BMAD (`.bmad-core/`, `.cursor/rules/bmad/`, `.claude/commands/BMad/`) and stood up the
  native process (TEAM.md, settings allowlist, ADR log, retro log) — mirroring `dinner-and-groceries`.
- This is the **second** project on the native paradigm, so it's the first real test of "is the
  process actually portable?" Open question for the end-of-milestone retro: what did we copy
  verbatim vs. have to tailor? (Tailoring so far: stack swap, security examples, Datadog instead of
  an events table, an *Adoption* Gate instead of a greenfield Kickoff Gate because this is brownfield.)
- Folded BMAD's `brief.md` + `prd.md` into a native `SPEC.md`; kept `docs/architecture/*` as reference.

### 2026-06-19 — Process lesson: stage explicit paths, never `git add -A`
- A `git add -A` while committing the BMAD migration swept in unrelated changes (Jon's uncommitted
  `package-lock.json` + local `.obsidian/` editor state); had to rewrite history to unbundle.
- **Rule:** stage explicit paths (`git add <path> …`), never `git add -A`/`git add .`, so commits
  stay atomic and we never absorb someone's unrelated working-tree changes. Revisit (Jon) for a
  durable home (global rule / hook).

### 2026-06-22 — QA: string-relabel issues need a whole-app sweep, not just the named files
- Verifying #2/PR #9 (DSD vocabulary). The PR followed PLAN.md's per-file list faithfully but two
  classes of misses slipped through: (a) **in-scope file, missed sibling strings** — `DriverList.tsx`
  relabeled "No orders…" but left "View/Hide Orders", "Loading orders…", "All Orders (n)" right beside
  it (#10); (b) **never-listed user-visible files** — `OrderForm.tsx` (descoped) and
  `DataManagement.tsx` still render restaurant copy on the live dashboard (#11).
- **Root cause for (a):** the updated test suite kept asserting the *old* copy
  (`/view orders/i`, "Loading orders…"), so the miss stayed green. A relabel where the tests assert the
  string being relabeled is self-masking.
- **Process lesson:** for vocabulary/relabel issues, (1) the acceptance check must be a **repo-wide grep
  of user-visible strings** against the confirmed table, not a per-file diff review; (2) define scope by
  "every mounted component that renders the term," not a hand-curated file list; (3) TDD red proof should
  assert the **new** term is present AND the **old** term is absent, so a partial relabel can't pass.
- **Spec lesson:** #2 had a broad AC ("ALL display strings…") over a narrow per-file Scope list — that
  gap is exactly where #11 lives. Relabel issues should either list every file or make the AC the grep.

### 2026-06-22 — Reframe issues need outcome-scoped ACs, not file lists (ADR 0006)
- QA caught two files (`OrderForm.tsx`, `DataManagement.tsx`) still rendering restaurant copy on the
  live dashboard — `OrderForm` was dropped from #2's per-file Scope list, `DataManagement` never
  listed. Root cause: the issue mixed an outcome AC ("all display strings match the table") with a
  narrower enumerated file list, which read as a scope ceiling. Lesson: scope "reframe / sweep"
  issues by the **outcome + a grep verification step**, not an enumerated file list. PO folded both
  into #2 and reworded AC #1 accordingly (ADR 0006). Precedent set for future string audits.
- Process friction: PO could not close the folded-in issue #11 — the auto-mode permission classifier
  denied `gh issue close` for an issue the PO didn't open this session (treated as a coordinator-
  authorized external write, not user-authorized). Ruling + ADR are posted on #11 and #2, and the
  work is tracked on #2, so nothing is lost — but the board now has an open issue that's really
  resolved. If PO is meant to own accept/reject end-to-end, the allowlist should let PO close issues
  it has ruled on; otherwise closing routes through the orchestrator/Jon. Flag for Jon.

### 2026-06-22 — Independent PO re-grep at the accept gate caught a missed string
- The PO's own re-grep of the PR HEAD (not taking the coordinator's "zero rendered restaurant
  copy" on faith) surfaced a residual the prior sweep missed: `OrderForm.tsx` renders "Customer
  Phone" + two matching validation strings (the "Customer" noun). Lesson: the accept-gate check
  pays for itself; an outcome-scoped AC ("all user-visible strings") is only as good as the grep
  pattern — sweeps keyed on a fixed term list (order/customer/delivery) can still miss compound
  labels like "Customer Phone". Future string-sweep ACs should grep the bare reframed nouns
  (customer/order/driver/delivery) broadly, then classify, rather than match exact known phrases.
- Judgment call: PO accepted with the phone label carved out as a tiny follow-up rather than
  rejecting — blocking the merge over one peripheral, DSD-neutral label would stall #3/#4 for low
  value. Recorded as an ADR 0006 addendum. This is the "accept against AC, but rule on severity"
  muscle the PO role is supposed to exercise.

### 2026-06-22 — Accept-gate reading caught a license misstatement the prior reviews missed
- PR #15 (README rewrite) passed dev self-check and an orchestrator full-read (which fixed two
  other factual bugs). The PO accept-gate read still caught a blocker none of the upstream passes
  flagged: README declared "License: MIT" while the repo's `LICENSE` file is GPL v3 (committed at
  initial commit; no package.json license field). Lesson: when a docs PR asserts a *fact about the
  repo* (license, versions, paths, file existence), verify the assertion against the actual
  artifact, not just read for tone/accuracy-in-prose. The dev invented a license claim that
  contradicted a committed file.
- This also surfaced a guardrail: license choice is an ownership/legal decision (Jon's), not a docs
  edit — so the PO rejected on accuracy AND escalated the underlying "which license?" question
  rather than unilaterally patching the README to match the GPL file (which may itself be an
  unreviewed default). Right separation: PO rules on the artifact defect; Jon owns the license.
