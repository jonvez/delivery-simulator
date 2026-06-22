# 0006 — Frontend reframe scope: all user-visible strings, not a fixed file list

_Status: accepted · Date: 2026-06-22 · Decided by: Product Owner (within guardrails)_

## Context

QA verified PR #9 (issue #2, the DSD frontend reframe) and filed two follow-up
findings:

- **#10** — leftover "Orders" strings in `DriverList.tsx`. Clear in-scope defect; the
  developer will fix it. No ruling needed.
- **#11** — `apps/frontend/src/components/OrderForm.tsx` still renders restaurant
  vocabulary ("Create New Order", "Customer Name", "Delivery Address", "Order Details")
  and `apps/frontend/src/components/DataManagement.tsx` still renders "orders and
  drivers" copy. Both are visible on the mounted dashboard. `OrderForm.tsx` was dropped
  from #2's per-file Scope list; `DataManagement.tsx` was never listed.

This surfaces a tension in issue #2: **AC #1 ("all display strings match the confirmed
DSD vocabulary table") vs. the narrower per-file Scope list.** The PO must rule whether
these two files fold into #2 or split to a follow-up issue.

Grounding facts (verified by grep, 2026-06-22):
- `OrderForm.tsx` L108 "Create New Order", L134 "Customer Name", L176 "Delivery
  Address", L196 "Order Details (Optional)", plus placeholders L141/L182 and validation
  message strings L33–54.
- `DataManagement.tsx` L114/L133 "orders and drivers" and seed-description copy
  L134–136.
- `OrderForm.test.tsx` and the e2e specs (`e2e/delivery-workflow.spec.ts`,
  `e2e/driver-management.spec.ts`) assert old copy and must be updated in tandem.

## Decision

**Fold both files into issue #2.** Treat #2's intent as "every user-visible frontend
string matches the confirmed DSD vocabulary table," with the per-file list being
illustrative, not a scope ceiling. Specifically:

- Reword AC #1 to **"all user-visible frontend strings match the confirmed DSD
  vocabulary table, verified by a repo-wide grep (no leftover restaurant terms render on
  the mounted dashboard)."**
- Add `OrderForm.tsx` and `DataManagement.tsx` to #2's file list.
- Update the affected tests/specs in tandem (TDD): `OrderForm.test.tsx` and any e2e
  specs that assert old copy (`delivery-workflow.spec.ts`, `driver-management.spec.ts`).
- Mapping (display strings only; code identifiers `customerName` / `deliveryAddress` /
  `orderDetails` / `order` / `driver` stay): Create New Order → **Create New Stop**;
  Customer Name → **Store Account**; Delivery Address → **Store Address**; Order Details
  → **Case List**; "orders and drivers" → **stops and reps** (and the seed-description
  copy reworded to stops/reps). Validation messages reworded to the same terms.

### Why fold, not split

- A split issue would let "Create New Order" / "Customer Name" render on the live demo
  between merges. The **demo success criterion** is that a Pepper reviewer uses the live
  dashboard end-to-end; these strings visibly contradict the DSD framing the application
  depends on. That is a framing defect, not deferrable polish.
- The omission is a gap in the per-file list, not a deliberate descope — AC #1 already
  asserts "all display strings." Honoring the AC's intent is cheaper than carrying a
  framing regression and a second issue.

## Guardrails check

Within PO autonomy. Relabeling display strings does **not** change MVP/demo feature
scope, the data-model shape (DB/code identifiers unchanged), the hosting/cost posture,
or add a dependency. It *reinforces* — does not change — the DSD framing the Pepper
application depends on. No escalation required.

## Consequences

- #2 grows by two files plus their test updates; remains a single coherent "reframe the
  UI" unit of work. Slightly larger PR, but the same dev already holds the context.
- #11 is resolved by folding into #2 (not closed as wontfix); #10 proceeds independently.
- Establishes a precedent: "reframe" issues are scoped by the **outcome** (no leftover
  restaurant strings, grep-verified), not by an enumerated file list. Future string
  audits should grep the whole `apps/frontend/src` tree.
- Dependency order is unchanged: #2 still lands before #3/#4.

## Addendum — 2026-06-22, PO acceptance of PR #9 (HEAD `b367979`)

At the accept gate the PO independently re-grepped `apps/frontend/src` on the PR HEAD.
Result: the three remaining "Customer Name / Delivery Address / Order Details" hits in
`OrderForm.tsx` are JSX block comments (`{/* ... */}`), not rendered; all rendered
labels read DSD-correct ("Create New Stop", "Store Account", "Store Address", "Case
List", and `DataManagement` "stops and reps"). One residual not caught by the original
sweep: `OrderForm.tsx` still renders **"Customer Phone"** (label L155) and the matching
validation strings ("Customer phone is required" / "... must be less than 50
characters", L40/L42), which use the pre-reframe "Customer" noun.

**Ruling:** ACCEPT #2 / PR #9 and proceed to merge. The "Customer Phone" residual is a
single peripheral field label that does not read as restaurant-specific (a store account
legitimately has a contact phone), so it is **not** a framing defect that should block the
merge and stall #3/#4. It is carved out as a **tiny follow-up** (relabel the phone field's
contact noun for full consistency, e.g. "Store Phone" / "Contact Phone", + its two
validation strings + the `OrderForm.test.tsx` assertions) rather than a reject. Strict
reading of AC #1 ("all user-visible strings") is satisfied except this one label, and
the cost/benefit favors accept-with-follow-up over a re-open round. Within guardrails
(display string only). Follow-up tracked via comment on #2 for the orchestrator to file.
