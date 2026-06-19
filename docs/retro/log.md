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
