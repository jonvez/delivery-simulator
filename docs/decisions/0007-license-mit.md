# 0007 — License: MIT

_Date: 2026-06-22 · Decided by: Jon (escalated by PO during #5 acceptance)_

## Context

During acceptance of #5 (README rewrite), the PO caught a contradiction: the new README declared
**"License: MIT"**, but the repo's committed `LICENSE` file was **GNU GPL v3** (present since the
initial commit — most likely an unreviewed scaffolding default). Nothing else (e.g. a
`package.json` `license` field) declared a license either way. On a public-facing
job-application artifact, a license statement that contradicts the shipped `LICENSE` file cannot
ship. Choosing the license is an ownership/legal call reserved to Jon (a guardrail), so the PO
rejected #5 and escalated rather than self-patching.

## Decision

Jon chose **MIT**. Rationale: permissive, no copyleft — the conventional choice for portfolio /
demo code shown to a prospective employer (Pepper); signals openness and frees anyone to read or
reuse the work.

Implementation (folded into PR #15):
- Replace the `LICENSE` file contents (GPL-3.0 → standard MIT text), `Copyright (c) 2026 Jonathan Gill`.
- The README's existing "License: MIT" line is now correct — no further README change.

## Consequences

- `LICENSE` file and README now agree on MIT.
- The earlier GPL-3.0 file is superseded; this is the project's licensing decision of record.
- Reviewable/overridable by Jon at any time. If a future change reintroduces a license field
  (e.g. in `package.json`), it must say `MIT` to stay consistent.
