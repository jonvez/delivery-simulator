# 0008 — All-GCP hosting on a free-tier e2-micro VM + Firebase Hosting

_Status: accepted · Date: 2026-06-22 · Decided by: Jon (hosting/cost call — guardrail) · Designed by: Architect_

> **Supersedes [ADR 0003](0003-deployment-and-observability.md)** for the deployment
> half (Railway backend + Postgres, Vercel frontend). The **observability** half of 0003
> (Datadog APM/logs/Postgres metrics/RUM) stays in force, with one adjustment noted below
> ("Datadog on a 1 GB box"). 0003 is otherwise retired.

## Context

The DSD demo's #1 requirement is a **working public link** for the Pepper application.
Jon has a GCP project available and has decided to host the demo **fully on GCP,
minimizing cost** (ideally $0/month). This is a hosting/cost-posture change, which is a
TEAM.md guardrail — it is Jon's call, recorded here.

The app is a monorepo: Express/Prisma/PostgreSQL backend (`apps/backend`, has a
`Dockerfile`, binds `0.0.0.0`, `/api/health`, Prisma 7 + `pg` adapter, `prisma migrate
deploy` + `npm run seed`) and a Vite/React static SPA (`apps/frontend`, API base baked
at build time from `VITE_API_BASE_URL`). Datadog is instrumented: a backend `dd-trace`
tracer that needs an agent reachable at `localhost:8126`, and RUM in `index.html`.

### GCP always-free facts (verified 2026-06-22, cloud.google.com/free)

- **1 non-preemptible `e2-micro` VM/month** free, only in **`us-west1` (Oregon),
  `us-central1` (Iowa), or `us-east1` (South Carolina)**. e2-micro = 2 vCPU (shared,
  burst) / **1 GB RAM**.
- **30 GB-months standard persistent disk** free.
- **1 GB/month** North-America outbound data transfer free (demo traffic is far under
  this; see Consequences).
- **No always-free Cloud SQL** — only a time-limited trial. Cloud SQL (db-f1-micro) is
  ~**$8–10/month** standing cost.

## Decision

### Chosen topology: **A — single free-tier e2-micro VM + Firebase Hosting**

One `e2-micro` VM in a free-tier region runs **everything server-side** — PostgreSQL,
the Express backend, and a **Caddy** reverse proxy for automatic HTTPS — via Docker
Compose. **Firebase Hosting** (free Spark plan, global CDN + auto-TLS) serves the static
SPA.

```
  Browser ──HTTPS──▶ Firebase Hosting (SPA, free, TLS)
     │
     └────HTTPS──▶ Caddy :443 on e2-micro VM  (auto Let's Encrypt cert)
                      └─▶ Express :3001 (localhost)
                            └─▶ Postgres :5432 (localhost only)
                      └─▶ dd-trace ▶ Datadog agent :8126 (localhost) ─▶ Datadog
```

The backend needs a stable DNS name for Caddy to issue a Let's Encrypt cert. We use a
**free wildcard-DNS service over the VM's static external IP** (e.g.
`api-<ip-dashed>.sslip.io` / `nip.io`), so `VITE_API_BASE_URL =
https://api-<ip>.sslip.io`. No paid domain or GCP HTTPS Load Balancer required.

### Cost / trade-off comparison (the A/B/C decision)

| | **A. All-on-one e2-micro VM** *(chosen)* | **B. Cloud Run + Postgres-on-VM via VPC connector** | **C. Cloud Run + Postgres-on-VM via public IP** |
|---|---|---|---|
| **Standing cost** | **$0** (within free tier) | **~$8–9+/mo** — Serverless VPC Access runs a managed instance group (min 2 e2-micro, billed hourly even idle) | ~$0 compute, but needs Cloud NAT or a wide firewall |
| **DB reachability** | localhost (same box) | private IP via connector | public IP — Cloud Run egress is **dynamic**, so reaching the VM means either Cloud NAT (**+cost**) or opening 5432 broadly (**reject: security**) |
| **Scale-to-zero** | No (box always on — fine for a demo) | Yes | Yes |
| **Ops burden** | You manage one box (~1 GB RAM is tight) | Two systems, connector to manage | Two systems + NAT/firewall |
| **TLS on backend** | Caddy auto-cert on the VM | Cloud Run native HTTPS | Cloud Run native HTTPS |
| **Security posture** | Postgres localhost-only; only 80/443/22 open | Good (private IP) | **Poor** — Postgres exposed to the internet, even if firewalled by a dynamic egress range |

**Why A.** It is the only genuinely **$0** topology. B is clean but the **Serverless VPC
Access connector is not free** — its instance group bills hourly (~$8–9/mo even at zero
traffic), which *undercuts the entire reason for leaving Cloud SQL* (you'd pay Cloud-SQL
money to avoid Cloud SQL). C reaches Postgres over a public IP; because Cloud Run egress
IPs are dynamic, locking the firewall to Cloud Run requires Cloud NAT (cost) or an
over-broad rule (**rejected on security grounds** — violates "no public Postgres").
A's only real cost is **operational** (one box to manage, 1 GB RAM is tight) and **no
scale-to-zero** — both acceptable for a single-reviewer portfolio demo that must simply
stay up and be cheap.

### The 1 GB RAM constraint — drop the Datadog Agent on the VM

Postgres (~150–250 MB) + Node/Express + a full **Datadog Agent container (~250–400 MB)**
on a **1 GB** box risks OOM-killing the demo. **Decision: do NOT run the `datadog-agent`
on the VM.** Instead:

- **APM traces:** `dd-trace` is initialized but **has no local agent to ship to**, so
  backend APM is effectively **off on the VM**. Acceptable: the demo's observability
  story is carried by **frontend RUM** (Datadog browser SDK, already in `index.html`,
  client-side, costs no VM RAM) plus the in-app Winston logs. The tracer stays in the
  code; it simply no-ops without a reachable agent.
- If backend APM is later wanted without RAM cost, use **`DD_TRACE_AGENTLESS` / a managed
  remote agent**, or move APM to the (paid) Cloud Run path — out of scope for the $0 demo.
- **RUM stays on.** RUM's `env` should read `production` (or `demo`), not the hardcoded
  `development` — see security/DoD below.

## Security requirements (the security gate's checklist for this deploy)

1. **Postgres is never on the public internet.** No `0.0.0.0/0` firewall rule on 5432.
   Postgres binds **localhost only** (Compose: bind `127.0.0.1:5432`, do not publish the
   port to the host's external interface). It is reachable only by Express on the same box.
2. **Firewall (VPC):** allow ingress **only** on **80** and **443** (Caddy) and **22**
   (SSH). **Restrict 22** to Jon's IP (or use IAP-tunneled SSH) — no `0.0.0.0/0` on 22 if
   avoidable. Everything else denied (default-deny applies).
3. **HTTPS everywhere on public endpoints.** Firebase Hosting terminates TLS for the SPA.
   **Caddy** terminates TLS for the backend with an auto-provisioned Let's Encrypt cert
   over the sslip.io/nip.io hostname. No plain-HTTP public endpoint (Caddy auto-redirects
   80→443).
4. **Secrets never in git.** `DATABASE_URL`, `DD_API_KEY`, and any deploy creds live in a
   VM-side `.env` file (mode `600`, owned by the deploy user) consumed by Compose — or GCP
   Secret Manager. The Postgres password is a freshly generated strong secret, **not** the
   `postgres/postgres` dev default in `docker-compose.yml`. The DB is **not** reachable
   externally regardless.
5. **CORS lockdown.** `app.use(cors())` in `apps/backend/src/server.ts` is currently
   **wide-open** (reflects any origin). For prod, CORS must be restricted to the Firebase
   Hosting origin via a `CORS_ORIGIN` env var. **This is a required code change before
   deploy** (small: `cors({ origin: process.env.CORS_ORIGIN })`), and is in-scope for the
   security gate. Until that lands, the runbook sets `CORS_ORIGIN` and the deployer must
   confirm the server actually honors it.
6. **No-auth demo, bounded abuse (SPEC non-goal: auth).** Do **not** add auth. But the
   write endpoints (`POST /api/orders`, `/api/data/reset`, etc.) are public. To keep abuse
   within demo tolerance: the SPA's destructive **reset** is seed-only/idempotent;
   recommend a light **rate limit** at Caddy (e.g. per-IP request cap) so a stranger can't
   hammer the box. Input validation already exists (Zod schemas) — keep it. This is
   defense-in-depth, not auth.
7. **No PII/secrets in logs or Datadog** (carried from 0003 — still in force). Winston
   logs request metadata only; verify no secret/PII fields are logged. RUM is client-side
   telemetry only.
8. **RUM env label.** `index.html` hardcodes `env: 'development'` and `version: '0.1.0'`.
   Set `env: 'production'` (or `'demo'`) for the deployed build so RUM data isn't
   mislabeled. Not a security blocker, but a correctness item bundled into the deploy.

## Consequences

- **$0/month standing cost** as long as the VM stays e2-micro in a free-tier region, disk
  ≤ 30 GB, and egress stays under the (narrow) 1 GB/mo free allowance. A single reviewer's
  session is well under 1 GB of outbound; **risk: low**. Watch-item: if the demo ever goes
  viral or runs heavy traffic, egress past 1 GB bills at standard rates (cents). Flagged
  for Jon as the only path to a non-zero bill under A.
- **No scale-to-zero / no managed backups.** The box is always on (fine for free tier).
  Data is reproducible via `prisma migrate deploy` + `npm run seed`, so DB loss is a
  re-seed, not a disaster — acceptable for a seeded demo. A weekly `pg_dump` is optional.
- **Backend APM is off on the VM** (no agent, to fit 1 GB). Observability for the demo =
  **frontend RUM + Winston logs**. This is a deliberate trade of the 0003 APM scope for
  the $0 goal. Documented so the security/observability reviewer doesn't read missing APM
  as a regression-by-accident.
- **Two required code changes before deploy** (both small, both go through TDD + the
  non-author security gate): (a) **CORS restricted** to `CORS_ORIGIN`; (b) **RUM `env`**
  set to production for the deployed build. The orchestrator should file these as issues
  (or fold into the #6 Deploy issue) before executing the runbook.
- **Single point of failure / hand-managed box.** Mitigation: Compose with
  `restart: unless-stopped`, and the VM survives reboots. Re-deploy is `git pull` +
  `docker compose up -d --build` on the box.
- **`docs/DEPLOYMENT_GUIDE.md`** (Railway/Vercel) is now **historical reference only**;
  the live runbook is **`docs/DEPLOYMENT_GUIDE_GCP.md`**.
- `SPEC.md` "Stack & architecture" still names Railway+Vercel; PO should update it to
  point at this ADR on the DSD branch.

## Open questions for Jon / PO

- **GCP project id** + confirm **billing is enabled** on it (the always-free tier still
  requires a billing account attached; it just won't charge within free limits) and
  whether any trial credit is active.
- **Region preference** among the three free-tier regions (`us-west1` / `us-central1` /
  `us-east1`) — default to **`us-east1`** (closest to NYC/Brooklyn demo data and likely
  Pepper reviewers) unless Jon prefers otherwise.
- **SSH lockdown:** OK to restrict port 22 to Jon's current IP (and re-open if it
  changes), or prefer IAP-tunneled SSH?
