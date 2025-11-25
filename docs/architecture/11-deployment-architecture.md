# 11. Deployment Architecture

## Deployment Strategy

**MVP Deployment Plan:**
- **Frontend**: Vercel (static hosting with CDN)
- **Backend**: Railway (Node.js hosting)
- **Database**: Railway PostgreSQL (managed instance)

## Frontend Deployment (Vercel)

**Configuration:**
- **Build Command**: `npm run build --workspace=apps/frontend`
- **Output Directory**: `apps/frontend/dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: Backend API URL (e.g., `https://api.delivery-manager.railway.app/api`)

**Deployment Workflow:**
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Add environment variables
4. Deploy automatically on push to `main`

**Custom Domain (Post-MVP):**
- Point custom domain to Vercel (e.g., `delivery-manager.app`)

## Backend Deployment (Railway)

**Configuration:**
- **Start Command**: `npm run start --workspace=apps/backend`
- **Build Command**: `npm run build --workspace=apps/backend`
- **Environment Variables**:
  - `DATABASE_URL`: Railway PostgreSQL connection string
  - `PORT`: `3001` (or Railway auto-assigned)
  - `NODE_ENV`: `production`
  - `LOG_LEVEL`: `info`

**Deployment Workflow:**
1. Connect GitHub repository to Railway
2. Create Node.js service
3. Configure build/start commands
4. Add environment variables
5. Deploy automatically on push to `main`

## Database Deployment (Railway PostgreSQL)

**Configuration:**
- **Provision Railway PostgreSQL**: Create managed Postgres instance
- **Connection String**: Automatically provided as `DATABASE_URL`
- **Migrations**: Run `npx prisma migrate deploy` in Railway build step

**Build Script** (add to `apps/backend/package.json`):
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && tsc"
  }
}
```

## CI/CD Pipeline (GitHub Actions)

**Workflow File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: delivery_manager_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Run backend tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/delivery_manager_test
        run: |
          cd apps/backend
          npx prisma migrate deploy
          npm run test

      - name: Run frontend tests
        run: npm run test --workspace=apps/frontend

      - name: Build
        run: npm run build
```

## Monitoring & Logging (Post-MVP)

- **Application Monitoring**: Railway built-in metrics (CPU, memory, requests)
- **Logging**: Winston logs shipped to Railway logs dashboard
- **Error Tracking**: Consider Sentry integration for error monitoring
- **Uptime Monitoring**: UptimeRobot or similar for health checks

## Backup & Recovery

- **Database Backups**: Railway automatic daily backups
- **Manual Backup**: `pg_dump` via Railway CLI
- **Recovery Plan**: Restore from Railway backup or re-run migrations + seed

---
