# GCP Deployment Runbook — DSD Route Manager (all-GCP, $0 target)

> **This is the live deploy procedure.** Topology and rationale: [ADR 0008](decisions/0008-gcp-hosting.md)
> (supersedes 0003). The old Railway/Vercel guide (`DEPLOYMENT_GUIDE.md`) is historical reference only.
>
> **Topology:** one free-tier `e2-micro` VM runs Postgres + Express + Caddy (auto-TLS) via Docker
> Compose; **Firebase Hosting** serves the SPA. Backend gets HTTPS over a free `sslip.io` hostname
> on the VM's static IP. Backend Datadog Agent is intentionally **omitted** (1 GB RAM); RUM stays on.
>
> **Legend:** 🧑 = **Jon-interactive** (login / project / billing — Jon runs it). 🤖 = automatable
> (orchestrator runs, or Jon pastes). Run steps **in order**.

---

## 0. Prerequisites & what's needed from Jon (before anything)

**Need from Jon to start:**
1. **GCP project id** (e.g. `dsd-demo-XXXX`).
2. Confirm **billing account is attached** to that project (free tier still requires it; it won't
   charge within free limits) and whether trial credit is active.
3. **Region** choice: `us-west1` | `us-central1` | `us-east1` (default **`us-east1`**).
4. OK to **restrict SSH (port 22) to Jon's current IP**? (recommended). Get Jon's IP:
   `curl -s https://api.ipify.org`.

**Tools (local machine):**
- `gcloud` CLI — present (`/opt/homebrew/bin/gcloud`).
- `firebase` CLI — **not installed**; install: 🤖 `npm install -g firebase-tools`.
- Code is on branch `dsd-convenience-store-demo`, tests green.

**Two required code changes must already be merged** (ADR 0008 §Security 5 & 8; file as issues or
fold into the #6 Deploy issue, TDD + non-author security gate):
- **CORS lockdown** in `apps/backend/src/server.ts`: replace `app.use(cors())` with
  `app.use(cors({ origin: process.env.CORS_ORIGIN }))` (fallback to `*` only when unset, for local dev).
- **RUM env** in `apps/frontend/index.html`: `env: 'production'` (or `'demo'`) for the deployed build.

Set shell vars used throughout (🤖, fill in the project id + region):
```bash
export GCP_PROJECT="<jon-project-id>"
export GCP_REGION="us-east1"
export GCP_ZONE="us-east1-b"
export VM_NAME="dsd-demo"
```

---

## 1. Authenticate & select project  🧑

```bash
gcloud auth login                       # 🧑 opens browser, Jon logs in
gcloud config set project "$GCP_PROJECT"  # 🧑/🤖 (needs the id from Jon)
gcloud config set compute/region "$GCP_REGION"
gcloud config set compute/zone "$GCP_ZONE"
gcloud auth list                        # 🤖 verify active account
gcloud config get-value project         # 🤖 verify project
```
If billing isn't attached, Jon links it in the Console (Billing → link account) — **🧑**.

---

## 2. Enable required APIs  🤖

```bash
gcloud services enable compute.googleapis.com
# (Firebase Hosting is set up via the firebase CLI in §7; no extra API enable needed here)
```

---

## 3. Create the free-tier VM  🤖

> `e2-micro` + a free-tier region + ≤30 GB **standard** (pd-standard) disk = $0. Debian 12.

```bash
gcloud compute instances create "$VM_NAME" \
  --zone="$GCP_ZONE" \
  --machine-type=e2-micro \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server
```

Reserve a **static external IP** (so the cert hostname is stable across reboots):
```bash
gcloud compute addresses create "${VM_NAME}-ip" --region="$GCP_REGION"
STATIC_IP=$(gcloud compute addresses describe "${VM_NAME}-ip" --region="$GCP_REGION" --format='value(address)')
echo "Static IP: $STATIC_IP"

# Point the instance's external IP at the reserved address
gcloud compute instances delete-access-config "$VM_NAME" --zone="$GCP_ZONE" \
  --access-config-name="external-nat"
gcloud compute instances add-access-config "$VM_NAME" --zone="$GCP_ZONE" \
  --access-config-name="external-nat" --address="$STATIC_IP"
```

Derive the backend hostname (sslip.io maps `<dashed-ip>.sslip.io` → that IP, free, no signup):
```bash
API_HOST="api-$(echo "$STATIC_IP" | tr '.' '-').sslip.io"
echo "Backend will be: https://$API_HOST"
```

---

## 4. Firewall — least privilege  🤖

Default GCP `http-server`/`https-server` tags open 80/443 to `0.0.0.0/0` (needed for Caddy + Let's
Encrypt). **Do not** open 5432. Restrict SSH to Jon's IP:

```bash
JON_IP=$(curl -s https://api.ipify.org)   # 🧑 run on Jon's machine

# Lock the default-allow-ssh rule (or create a scoped one) to Jon's IP only.
gcloud compute firewall-rules create allow-ssh-jon \
  --direction=INGRESS --action=ALLOW --rules=tcp:22 \
  --source-ranges="${JON_IP}/32" --priority=900

# If a broad default SSH rule exists, tighten or delete it:
gcloud compute firewall-rules list --format="table(name,sourceRanges.list(),allowed[].map().firewall_rule().list())"
# e.g. gcloud compute firewall-rules delete default-allow-ssh   # only if present & broad
```

**Verify (security gate):** confirm NO rule allows `tcp:5432` and NO `0.0.0.0/0` on `tcp:22`:
```bash
gcloud compute firewall-rules list --format="table(name,sourceRanges.list(),allowed[])"
```

---

## 5. Provision the box (Docker, app, Postgres, Caddy)  🤖

SSH in (🧑 first SSH may prompt to generate keys / confirm host):
```bash
gcloud compute ssh "$VM_NAME" --zone="$GCP_ZONE"   # 🧑 first time
```

**On the VM** — install Docker + Compose plugin + git:
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER" && newgrp docker
```

Clone the repo (DSD branch):
```bash
git clone https://github.com/jonvez/delivery-simulator.git ~/app
cd ~/app && git checkout dsd-convenience-store-demo
```

**Generate a strong Postgres password and write the prod env file** (mode 600, never committed):
```bash
cd ~/app
PG_PASS=$(openssl rand -hex 24)
cat > deploy.env <<EOF
POSTGRES_USER=dsd
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_DB=dsd_demo
DATABASE_URL=postgresql://dsd:${PG_PASS}@localhost:5432/dsd_demo
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://<FIREBASE_SITE>.web.app          # fill after §7; re-set & restart
LOG_LEVEL=info
EOF
chmod 600 deploy.env
```
> `DD_API_KEY` is **not** set here — no backend agent on this box (ADR 0008). RUM (client-side) needs
> no server secret.

**Create the production Compose file** (`deploy.compose.yml`) — Postgres bound to **localhost only**,
backend built from `apps/backend/Dockerfile`, Caddy for auto-TLS. Backend tracer no-ops with no agent.

```bash
cat > deploy.compose.yml <<'EOF'
services:
  postgres:
    image: postgres:14-alpine
    restart: unless-stopped
    env_file: ./deploy.env
    ports:
      - "127.0.0.1:5432:5432"        # localhost-only; NOT exposed externally
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "dsd"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: ./deploy.env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "127.0.0.1:3001:3001"        # localhost-only; Caddy proxies to it

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - backend

volumes:
  pgdata:
  caddy_data:
  caddy_config:
EOF
```

**Create the Caddyfile** (auto-HTTPS for the sslip.io host, reverse-proxy to backend, light rate
limit via Caddy's built-in throttling is plugin-based — for the demo a simple proxy is fine; note the
rate-limit option below). Substitute the real `$API_HOST`:

```bash
cat > Caddyfile <<EOF
${API_HOST} {
    encode gzip
    reverse_proxy backend:3001
    header {
        # don't leak server internals
        -Server
    }
}
EOF
```
> The `Dockerfile` already runs `npx prisma migrate deploy` on container start, so migrations apply
> automatically on first `up`. Seeding is a separate one-shot (§6).
>
> **Optional rate limit (ADR 0008 §Security 6):** Caddy core has no built-in rate limiter; if abuse
> is a concern, use the `caddy-ratelimit` plugin image or front with a tiny limit. For a
> single-reviewer demo, the localhost-only DB + idempotent reset is the primary control; rate-limit
> is defense-in-depth, add only if needed.

**Bring it up:**
```bash
docker compose -f deploy.compose.yml --env-file deploy.env up -d --build
docker compose -f deploy.compose.yml ps
docker compose -f deploy.compose.yml logs backend | tail -40   # confirm migrate deploy ran, server listening
```

---

## 6. Migrate (auto) + seed prod data  🤖

Migrations ran via the backend container's start command. **Seed** once:
```bash
# on the VM, in ~/app
docker compose -f deploy.compose.yml exec backend npm run seed
```
> `npm run seed` = `tsx src/scripts/seed.ts`; needs dev deps. If the production image was built
> without dev deps and `tsx` is missing, run the seed from a one-off container that installs deps, or
> temporarily add `tsx` to the image. Verify seed succeeded:
```bash
docker compose -f deploy.compose.yml exec postgres psql -U dsd -d dsd_demo -c "select count(*) from orders; select count(*) from drivers;"
```

**Smoke-test the backend over HTTPS** (from anywhere; cert may take ~30–60s on first request):
```bash
curl -s https://$API_HOST/api/health        # expect {"status":"ok","database":"connected"} (or similar)
curl -s https://$API_HOST/api/orders | head
curl -s https://$API_HOST/api/drivers | head
```

---

## 7. Build & deploy the SPA to Firebase Hosting  🧑🤖

**Install + login** (local machine):
```bash
npm install -g firebase-tools     # 🤖
firebase login                    # 🧑 opens browser
```

**Init Hosting** in the repo (or a clean dir), targeting Jon's GCP project (Firebase project = the
same GCP project):
```bash
cd /Users/jonathangill/dev/delivery-simulator/apps/frontend
firebase init hosting             # 🧑 interactive:
  # - "Use an existing project" → select $GCP_PROJECT
  # - Public directory: dist
  # - Single-page app (rewrite all to /index.html): Yes
  # - Set up automatic builds with GitHub: No
```
This creates `firebase.json` + `.firebaserc`. Confirm `firebase.json` has the SPA rewrite:
```json
{ "hosting": { "public": "dist", "ignore": ["firebase.json","**/.*","**/node_modules/**"],
  "rewrites": [ { "source": "**", "destination": "/index.html" } ] } }
```

**Build the SPA with the prod API base baked in** (Vite inlines `VITE_API_BASE_URL` at build time):
```bash
cd /Users/jonathangill/dev/delivery-simulator/apps/frontend
VITE_API_BASE_URL="https://$API_HOST" npm run build     # 🤖
```

**Deploy:**
```bash
firebase deploy --only hosting    # 🧑 (uses the login token)
```
Note the **Hosting URL** printed, e.g. `https://<GCP_PROJECT>.web.app`. That is **the public link**.

---

## 8. Wire CORS to the Firebase origin & restart backend  🤖

On the VM, set `CORS_ORIGIN` to the exact Firebase URL (no trailing slash) and restart:
```bash
# on the VM, edit ~/app/deploy.env → CORS_ORIGIN=https://<GCP_PROJECT>.web.app
docker compose -f deploy.compose.yml --env-file deploy.env up -d --force-recreate backend
```
**Verify CORS** is actually scoped (security gate):
```bash
curl -s -I -H "Origin: https://evil.example" https://$API_HOST/api/orders | grep -i access-control
# Should NOT echo Access-Control-Allow-Origin: https://evil.example
curl -s -I -H "Origin: https://<GCP_PROJECT>.web.app" https://$API_HOST/api/orders | grep -i access-control
# Should allow the Firebase origin
```

---

## 9. Smoke-test checklist (demo success criteria)  🤖🧑

Open the Firebase URL in a browser and verify the full path:

- [ ] **SPA loads** over HTTPS, no console CORS errors (DevTools → Console/Network).
- [ ] **Create** a delivery (Create New Stop) → appears in the **Scheduled** list.
- [ ] **Assign** it to an available **rep** → reflected in both views.
- [ ] Open the rep's **map** → stops + suggested route render (Leaflet/OSM, Brooklyn coords).
- [ ] Advance status → **mark delivered** → shows in **history** (En Route → Delivered).
- [ ] **Signature feature 1 — Per-Account view:** a store account shows delivery history / total
      drops / last visit.
- [ ] **Signature feature 2 — Planogram-compliance:** mark "planogram reviewed" + notes on a stop;
      persists.
- [ ] **RUM:** confirm sessions land in Datadog RUM under `service:delivery-simulator-frontend`,
      `env:production`.
- [ ] **Re-load after 30s:** dashboard polling refreshes (last-updated indicator updates).

API-level smoke (curl):
```bash
curl -s https://$API_HOST/api/health
curl -s -X POST https://$API_HOST/api/orders -H 'content-type: application/json' \
  -d '{"customerName":"Test Bodega","customerPhone":"+15551234567","deliveryAddress":"123 Test St, Brooklyn, NY"}'
```

---

## 10. Security gate sign-off (non-author) — must all pass

- [ ] No firewall rule allows `tcp:5432`; no `0.0.0.0/0` on `tcp:22` (§4 verify).
- [ ] Postgres reachable **only** via `127.0.0.1` on the VM (not on the external IP):
      `nc -vz $STATIC_IP 5432` from outside → **refused/timeout**.
- [ ] Backend + SPA both served over **HTTPS** (valid certs).
- [ ] `CORS_ORIGIN` scoped to the Firebase origin (§8 verify).
- [ ] Secrets only in `deploy.env` (mode 600) / not in git; Postgres password is the generated one,
      not `postgres/postgres`.
- [ ] No PII/secrets in Winston logs or RUM.
- [ ] No backend Datadog Agent on the box (RAM); APM-off is intentional per ADR 0008.

---

## Operations

- **Redeploy backend:** on VM → `git -C ~/app pull && docker compose -f ~/app/deploy.compose.yml up -d --build`.
- **Redeploy SPA:** local → rebuild with `VITE_API_BASE_URL` → `firebase deploy --only hosting`.
- **Reset demo data:** `docker compose -f deploy.compose.yml exec backend npm run seed` (or the in-app reset).
- **Optional backup:** `docker compose exec postgres pg_dump -U dsd dsd_demo > ~/backup-$(date +%F).sql`.
- **Cost guard:** stay e2-micro + free-tier region + ≤30 GB disk; watch the 1 GB/mo egress free
  limit (a normal demo is well under it).
