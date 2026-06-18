# Delivery Simulator Plan

## Goal

Jon is interviewing at Datadog and wants hands-on experience with the product. The delivery-simulator has existing Winston logging and a health check endpoint but no observability tooling — perfect canvas for Datadog.

## Architecture / Key Decisions

**Datadog account:** Trial, US5 region (`us5.datadoghq.com`)

### Phase 1: Datadog Agent via Docker

The Agent is the foundation — APM traces, logs, and Postgres metrics all route through it.

**Modify:** `docker-compose.yml`
- Add `datadog-agent` service (image `gcr.io/datadoghq/agent:7`)
- Publish port 8126 (APM) and 8125/udp (DogStatsD) to host — required because the backend runs on the host, not in Docker
- Mount `./datadog/conf.d` for integration configs
- Mount `./logs` read-only for log tailing
- macOS note: skip `/proc/` and `/sys/fs/cgroup/` mounts (don't exist on macOS) — host metrics are limited but APM/logs/Postgres all work fine
- Mount Docker socket for container discovery

**Create:** `datadog/conf.d/` directory (Agent integration config home)

**Modify:** `.env` (already gitignored) — add:
- `DD_API_KEY` — from Datadog > Organization Settings > API Keys
- `DD_SITE=us5.datadoghq.com` (US5 region)
- `DD_ENV=development`, `DD_SERVICE=delivery-simulator`, `DD_VERSION=0.1.0`

**Verify:** `docker compose up -d` → host appears at app.us5.datadoghq.com/infrastructure within 2-3 min

### Phase 2: APM Tracing with dd-trace

Highest-value feature. dd-trace auto-instruments Express routes, pg queries, and HTTP calls.

**Install:** `dd-trace` in backend workspace

**Create:** `apps/backend/src/tracer.ts`
- Calls `dd-trace.init()` with `logInjection: true` (for log-trace correlation), `runtimeMetrics: true` (Node.js heap/GC/event loop metrics), `profiling: true`
- This file must load before any app code

**Modify:** `apps/backend/package.json`
- Change `dev` script to: `NODE_OPTIONS='--require ./src/tracer.ts' tsx watch src/server.ts`
- This ensures dd-trace patches modules before Express/pg/Prisma load

**No changes to `server.ts`** — dd-trace auto-instruments Express and pg without code changes.

**Verify:** Start app, hit `GET /api/orders` a few times → traces appear at app.us5.datadoghq.com/apm/traces

### Phase 3: Log Management

Connect Winston logs to Datadog via file-based shipping through the Agent. Enables log-trace correlation (clicking a log jumps to its APM trace).

**Modify:** `apps/backend/src/server.ts`
- Add a `winston.transports.File` transport writing JSON to `logs/app.log` (with rotation)
- Keep the existing Console transport unchanged
- `logInjection: true` from Phase 2 automatically injects `dd.trace_id`, `dd.span_id` into every log record

**Create:** `datadog/conf.d/app_logs.yaml`
- Tells the Agent to tail `/host/app/logs/app.log` (mapped via volume mount)
- Sets `service: delivery-simulator`, `source: nodejs`

**Modify:** `docker-compose.yml`
- Add `./logs:/host/app/logs:ro` volume mount to the Agent service

**Create:** `logs/.gitkeep` (directory already in .gitignore)

**Verify:** Generate traffic → logs appear at app.us5.datadoghq.com/logs with trace IDs attached

### Phase 4: PostgreSQL Infrastructure Monitoring

The Agent scrapes `pg_stat_*` views for query performance, connections, index usage, etc.

**Create:** `datadog/postgres/init-datadog-user.sql`
- Creates read-only `datadog` user with `pg_monitor` role
- Note: init scripts only run on fresh volumes — for existing volumes, exec the SQL manually

**Create:** `datadog/conf.d/postgres.d/conf.yaml`
- Points Agent at `postgres:5432` (Docker service name) with the datadog user
- Enables `collect_activity_metrics` and `collect_database_size_metrics`

**Modify:** `docker-compose.yml`
- Mount init SQL into postgres service at `/docker-entrypoint-initdb.d/`

**Verify:** PostgreSQL metrics appear at app.us5.datadoghq.com/dash/integration/postgresql

### Phase 5: RUM (Real User Monitoring)

Browser SDK captures page loads, user sessions, Core Web Vitals, JS errors, and XHR timing.

**Prereq (Datadog UI):** Create a RUM Application → get `clientToken` and `applicationId`

**Modify:** `apps/frontend/index.html`
- Add Datadog RUM SDK script tag in `<head>` before Vite's module script
- Configure with `sessionSampleRate: 100`, `trackUserInteractions: true`, `trackResources: true`
- Use US5 RUM SDK URL

**Verify:** Open app in browser → sessions appear at app.us5.datadoghq.com/rum/sessions

### Phase 6: Dashboard + Monitor

**In Datadog UI (no code changes):**
- Create custom dashboard combining:
  - APM: request latency p50/p95/p99, error rate, throughput
  - Logs: error log stream
  - Infrastructure: PostgreSQL connections, query performance
  - RUM: Core Web Vitals
- Create a Monitor: alert when p99 latency > 500ms for 5 minutes
- This gives a concrete "I set up SLO alerting on p99 latency" talking point

### Files Summary

| Action | File |
|--------|------|
| Modify | `docker-compose.yml` — Agent service, volume mounts, init SQL mount |
| Modify | `apps/backend/package.json` — dev script, dd-trace dependency |
| Modify | `apps/backend/src/server.ts` — add File transport to Winston |
| Modify | `apps/frontend/index.html` — RUM SDK script tag |
| Create | `apps/backend/src/tracer.ts` — dd-trace init |
| Create | `datadog/conf.d/app_logs.yaml` — log tailing config |
| Create | `datadog/conf.d/postgres.d/conf.yaml` — Postgres integration |
| Create | `datadog/postgres/init-datadog-user.sql` — read-only DB user |
| Create | `logs/.gitkeep` — log output directory |

### Verification (end-to-end)

1. `docker compose up -d` (Agent + Postgres)
2. `npm run dev` from monorepo root (backend + frontend)
3. Hit several API endpoints to generate traffic
4. Check Datadog UI:
   - Infrastructure: host visible
   - APM > Traces: Express spans with pg sub-spans
   - Logs: structured JSON with trace IDs → click through to trace
   - Infrastructure > PostgreSQL: connection and query metrics
   - RUM > Sessions: browser session with resource timing
5. Build dashboard combining all of the above

### Interview Talking Points

- **Distributed tracing**: "I correlated a slow API response to a specific Prisma/pg query using the APM waterfall view"
- **Log-trace correlation**: "I configured Winston with `logInjection: true` so every log record carries the trace ID — clicking a log jumps directly to the trace"
- **Infrastructure + APM correlation**: "I can see a spike in PostgreSQL connection count aligned with a latency increase in the APM service map"
- **RUM**: "I can show you a session replay of a user hitting an API error, and trace it through to the backend span"
- **Runtime metrics**: "dd-trace's `runtimeMetrics: true` gives me Node.js heap usage, GC pause times, and event loop lag in the same dashboard"

## Active Context

### Current Focus

Datadog integration plan is fully documented (Phases 1-6), ready to implement. No phases have been started yet.

### Key References

- `docker-compose.yml` — will be modified for Agent service and volume mounts
- `.env` — will hold DD_API_KEY and Datadog config (gitignored)
- `apps/backend/src/tracer.ts` — to be created for dd-trace init
- Datadog US5 dashboard: `app.us5.datadoghq.com`

---

## Session Log

### 2026-03-12

- Reformatted PLAN.md to standard format (Goal / Architecture / Active Context / Session Log)
- Preserved all Datadog integration details (Phases 1-6, files summary, verification steps, interview talking points) under Architecture / Key Decisions
- No implementation changes; plan status remains "documented, ready to implement"
