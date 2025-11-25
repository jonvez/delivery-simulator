# Deployment Guide - Delivery Manager Application

## Overview

This guide provides complete step-by-step instructions for deploying the Delivery Manager Application to production cloud hosting. The application uses a three-tier architecture that requires:

1. **PostgreSQL Database** (Railway, Render, or similar)
2. **Backend API** (Node.js/Express on Railway, Render, or Fly.io)
3. **Frontend** (React/Vite on Vercel or Netlify)

**Estimated Deployment Time:** 2-4 hours for first-time setup

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Recommended Stack: Vercel + Railway](#recommended-stack-vercel--railway)
- [Phase 1: Prepare for Deployment](#phase-1-prepare-for-deployment)
- [Phase 2: Deploy Database (Railway)](#phase-2-deploy-database-railway)
- [Phase 3: Deploy Backend (Railway)](#phase-3-deploy-backend-railway)
- [Phase 4: Deploy Frontend (Vercel)](#phase-4-deploy-frontend-vercel)
- [Phase 5: Post-Deployment Configuration](#phase-5-post-deployment-configuration)
- [Alternative Platform: Render](#alternative-platform-render)
- [Alternative Platform: Fly.io](#alternative-platform-flyio)
- [Troubleshooting](#troubleshooting)
- [Cost Estimates](#cost-estimates)
- [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

Before starting deployment, ensure you have:

- [ ] GitHub repository pushed (completed ✅)
- [ ] GitHub account with repository access
- [ ] Railway account (sign up at https://railway.app)
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Local codebase tested and working
- [ ] All tests passing (`npm test`)
- [ ] Database migrations ready (`prisma migrate`)

---

## Recommended Stack: Vercel + Railway

### Why This Stack?

**Vercel (Frontend)**
- ✅ Best-in-class for React/Vite applications
- ✅ Automatic builds from GitHub
- ✅ Free tier: 100GB bandwidth/month
- ✅ Instant deployments with preview URLs
- ✅ Built-in CDN and SSL

**Railway (Backend + Database)**
- ✅ Managed PostgreSQL with automatic backups
- ✅ Simple deployment from GitHub monorepo
- ✅ Environment variable management
- ✅ Free $5 credit, then ~$5-10/month for MVP
- ✅ Easy database migration support

**Total Cost:** $0-10/month for MVP usage

---

## Phase 1: Prepare for Deployment

### 1.1 Environment Variables Audit

Create environment variable templates for easy reference.

#### Backend Environment Variables

Create `.env.production.template` in `apps/backend/`:

```bash
# apps/backend/.env.production.template
NODE_ENV=production
PORT=3001

# Database (from Railway PostgreSQL service)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway

# CORS Configuration (your Vercel frontend URL)
CORS_ORIGIN=https://your-app-name.vercel.app

# Optional: Logging level
LOG_LEVEL=info
```

#### Frontend Environment Variables

Create `.env.production.template` in `apps/frontend/`:

```bash
# apps/frontend/.env.production.template
# Backend API URL (from Railway backend service)
VITE_API_BASE_URL=https://your-backend-name.up.railway.app
```

### 1.2 Verify Backend Production Configuration

Check `apps/backend/package.json` has production scripts:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "prisma generate"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

✅ **Your backend already has these configured!**

### 1.3 Create Railway Configuration (Optional)

Create `railway.json` in project root for advanced configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.4 Create Vercel Configuration (Optional)

Vercel auto-detects Vite, but you can create `vercel.json` in `apps/frontend/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Phase 2: Deploy Database (Railway)

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub account
3. Authorize Railway to access your repositories
4. Confirm email (if required)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Provision PostgreSQL"** from marketplace
3. Railway automatically provisions a PostgreSQL database

### Step 3: Get Database Credentials

1. Click on the **Postgres** service in your project
2. Go to **"Connect"** tab
3. Copy the **`DATABASE_URL`** (full connection string)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/railway`
4. **Save this securely** - you'll need it for backend deployment

**Example:**
```
postgresql://postgres:AbCd1234XyZ@containers-us-west-123.railway.app:5432/railway
```

### Step 4: Configure Database Settings (Optional)

In the Postgres service settings:
- **Memory Limit:** 256MB (free tier) or 512MB (paid)
- **Restart Policy:** Always restart
- **Health Check:** Enabled

### Step 5: Run Database Migrations

From your local machine, run migrations against the Railway database:

```bash
# Navigate to backend directory
cd apps/backend

# Set DATABASE_URL temporarily and run migrations
DATABASE_URL="your-railway-database-url" npx prisma migrate deploy

# Verify migration success
DATABASE_URL="your-railway-database-url" npx prisma db seed
```

**Expected Output:**
```
✓ Database migration complete
✓ Applied 3 migrations
```

### Step 6: Verify Database

1. In Railway dashboard → Postgres service → **Data** tab
2. Check tables exist: `Order`, `Driver`
3. Verify schema matches your local database

---

## Phase 3: Deploy Backend (Railway)

### Step 1: Add Backend Service to Railway Project

1. In your Railway project, click **"New Service"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `delivery-simulator` repository
4. Railway will detect it's a monorepo

### Step 2: Configure Build Settings

Railway should auto-detect, but verify these settings:

1. Click on the **backend service** → **Settings**
2. **Root Directory:** `apps/backend`
3. **Build Command:** `npm run build` (auto-detected)
4. **Start Command:** `npm run start` (auto-detected)
5. **Watch Paths:** `apps/backend/**` (Railway will only rebuild when backend changes)

### Step 3: Set Environment Variables

In backend service → **Variables** tab, add:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=[Your Railway Postgres URL from Phase 2]
CORS_ORIGIN=https://your-app.vercel.app
```

**Note:** You'll update `CORS_ORIGIN` after deploying frontend in Phase 4.

### Step 4: Deploy Backend

1. Railway automatically deploys on configuration save
2. Monitor deployment in **Deployments** tab
3. Watch build logs for errors
4. Deployment typically takes 2-3 minutes

### Step 5: Generate Public Domain

1. Backend service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Railway provides a public URL: `https://your-backend-name.up.railway.app`
4. **Save this URL** - you'll need it for frontend configuration

### Step 6: Test Backend Health Check

```bash
curl https://your-backend-name.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

If you see this, your backend is deployed successfully! ✅

### Step 7: Test API Endpoints

```bash
# Test getting all orders
curl https://your-backend-name.up.railway.app/api/orders

# Test getting all drivers
curl https://your-backend-name.up.railway.app/api/drivers
```

---

## Phase 4: Deploy Frontend (Vercel)

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose your `delivery-simulator` repository
4. Vercel detects it's a monorepo

### Step 3: Configure Build Settings

1. **Framework Preset:** Vite (auto-detected)
2. **Root Directory:** `apps/frontend`
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `dist` (auto-detected)
5. **Install Command:** `npm install` (auto-detected)

### Step 4: Set Environment Variables

In project settings → **Environment Variables**, add:

```bash
VITE_API_BASE_URL=https://your-backend-name.up.railway.app
```

**Important:** Use the Railway backend URL from Phase 3, Step 5.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys (2-3 minutes)
3. Watch build logs in deployment dashboard
4. Vercel provides a production URL: `https://your-app-name.vercel.app`

### Step 6: Update Backend CORS

Now that you have your Vercel URL:

1. Go back to **Railway** → Backend service → **Variables**
2. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```
3. Railway will automatically redeploy backend with new CORS setting

### Step 7: Verify End-to-End Functionality

1. Open your Vercel URL in a browser
2. Test creating an order
3. Test assigning a driver
4. Test map visualization
5. Verify all API calls succeed

**Troubleshooting:** Open browser DevTools (F12) → Console to check for errors.

---

## Phase 5: Post-Deployment Configuration

### 5.1 Custom Domain (Optional)

#### Vercel Custom Domain

1. Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `delivery.yourdomain.com`)
4. Follow Vercel's DNS configuration instructions
5. Vercel auto-provisions SSL certificate

**DNS Configuration** (with your registrar):
```
Type: CNAME
Name: delivery (or @ for root domain)
Value: cname.vercel-dns.com
```

#### Railway Custom Domain

1. Backend service → **Settings** → **Networking**
2. Click **"Add Custom Domain"**
3. Enter your API subdomain (e.g., `api.yourdomain.com`)
4. Add CNAME record with your registrar:
   ```
   Type: CNAME
   Name: api
   Value: [provided by Railway]
   ```

**Remember:** Update `VITE_API_BASE_URL` in Vercel if you add a custom backend domain.

### 5.2 Monitoring & Logging

#### Vercel Analytics (Free)

1. Vercel project → **Analytics**
2. Enable **Web Analytics** (free)
3. Monitor page views, performance, and errors

#### Railway Logs

1. Backend service → **Logs** tab
2. View real-time application logs
3. Filter by log level (info, error, warn)

#### Optional: Add Sentry for Error Tracking

1. Sign up at https://sentry.io (free tier available)
2. Create new project for Node.js (backend) and React (frontend)
3. Install Sentry SDKs:
   ```bash
   # Backend
   cd apps/backend
   npm install @sentry/node

   # Frontend
   cd apps/frontend
   npm install @sentry/react
   ```
4. Add Sentry DSN to environment variables
5. Initialize Sentry in your applications

### 5.3 Database Backups

#### Railway Automatic Backups

- Free tier: Manual exports only
- Paid plans ($5+): Automatic daily backups

#### Manual Backup Process

```bash
# Export database to SQL file
pg_dump [YOUR_RAILWAY_DATABASE_URL] > backup-$(date +%Y%m%d).sql

# Or use Railway CLI
railway db backup
```

**Recommendation:** Set up weekly automated backups using GitHub Actions or cron job.

### 5.4 Environment Variable Management

Create a secure document (NOT in git) with all production credentials:

```
PRODUCTION CREDENTIALS - KEEP SECURE
=====================================

Railway PostgreSQL:
- Database URL: postgresql://postgres:...
- Host: containers-us-west-123.railway.app
- Port: 5432
- Database: railway
- User: postgres
- Password: [password]

Railway Backend:
- Service URL: https://delivery-backend.up.railway.app
- Deploy Branch: main
- Node Version: 18.x

Vercel Frontend:
- Production URL: https://delivery-app.vercel.app
- Deploy Branch: main
- Framework: Vite
```

---

## Alternative Platform: Render

### Why Render?

- Similar to Railway with generous free tier
- Automatic SSL and CDN
- PostgreSQL included
- Simple monorepo support

### Render Deployment Steps

#### 1. Database Setup

1. Sign up at https://render.com
2. Create **New PostgreSQL** database
3. Copy **Internal Database URL** and **External Database URL**
4. Run migrations: `DATABASE_URL="..." npx prisma migrate deploy`

#### 2. Backend Deployment

1. Create **New Web Service**
2. Connect GitHub repository
3. Configure:
   - **Root Directory:** `apps/backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node
4. Add environment variables (DATABASE_URL, CORS_ORIGIN, etc.)
5. Deploy

#### 3. Frontend Deployment

1. Create **New Static Site**
2. Connect GitHub repository
3. Configure:
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add environment variable: `VITE_API_BASE_URL`
5. Deploy

**Cost:** Free tier available, ~$7-15/month for paid tier

---

## Alternative Platform: Fly.io

### Why Fly.io?

- Full control over deployment
- Excellent for multi-region deployments
- Built-in PostgreSQL clustering
- More complex but powerful

### Fly.io Deployment (Summary)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create Postgres: `fly postgres create --name delivery-db`
4. Deploy backend: `fly launch` (in apps/backend)
5. Deploy frontend: Use Vercel or Netlify (Fly.io less suited for static sites)

**Cost:** ~$5-10/month minimum

---

## Troubleshooting

### Common Issues

#### 1. Backend CORS Errors

**Symptom:** Frontend shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
- Verify `CORS_ORIGIN` environment variable in backend
- Ensure it matches your exact Vercel URL (no trailing slash)
- Check backend logs for CORS configuration

#### 2. Database Connection Fails

**Symptom:** Backend health check shows `{ database: "disconnected" }`

**Solution:**
- Verify `DATABASE_URL` environment variable is correct
- Check database is running in Railway/Render dashboard
- Ensure migrations have been applied
- Test connection locally: `npx prisma db push`

#### 3. Frontend Environment Variables Not Loading

**Symptom:** API calls go to `http://localhost:3001` instead of production URL

**Solution:**
- Verify environment variable is named `VITE_API_BASE_URL` (must start with `VITE_`)
- Redeploy frontend after adding environment variables
- Clear Vercel build cache: Settings → Clear Cache → Redeploy

#### 4. Build Fails - Module Not Found

**Symptom:** Build logs show `Error: Cannot find module 'xyz'`

**Solution:**
- Verify package is in `dependencies` (not `devDependencies`)
- Check `package-lock.json` is committed
- Ensure monorepo workspace configuration is correct

#### 5. Prisma Generate Fails

**Symptom:** Backend build fails with "Prisma Client not generated"

**Solution:**
- Add `"postinstall": "prisma generate"` to backend `package.json`
- Ensure `prisma` package is in `dependencies`
- Check Prisma schema is valid: `npx prisma validate`

#### 6. Map Not Loading

**Symptom:** Map container is blank or shows error

**Solution:**
- Verify Leaflet CSS is imported in frontend
- Check browser console for asset loading errors
- Ensure Leaflet marker images are included in build
- Test locally: `npm run build && npm run preview`

### Getting Help

1. **Railway Docs:** https://docs.railway.app
2. **Vercel Docs:** https://vercel.com/docs
3. **Render Docs:** https://render.com/docs
4. **Check deployment logs** in platform dashboard
5. **Enable debug logging** by setting `LOG_LEVEL=debug` in backend

---

## Cost Estimates

### Free Tier Usage (MVP)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | Free forever | 100GB bandwidth/month, unlimited deployments |
| **Railway** | $5 credit | ~500 hours execution, 1GB storage |
| **Render** | Free tier | 750 hours/month, limited resources |

**Total Cost:** $0-5/month for MVP with light usage

### Paid Tier (Production - 100 users/day)

| Service | Cost | What You Get |
|---------|------|--------------|
| **Vercel Pro** | $20/month | Unlimited bandwidth, team features |
| **Railway** | $10-20/month | Dedicated resources, daily backups |
| **Render** | $15-25/month | Dedicated resources, always-on |

**Total Cost:** $30-65/month for production deployment

### Scaling (1000+ users/day)

| Service | Cost | What You Get |
|---------|------|--------------|
| **Vercel Pro** | $20/month | (same, bandwidth sufficient) |
| **Railway** | $40-60/month | Scaled compute, database replicas |
| **CDN** | $10-20/month | Cloudflare or similar |

**Total Cost:** $70-100/month at scale

---

## Rollback Procedures

### Quick Rollback (Vercel)

1. Go to **Deployments** tab
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**
4. Instant rollback (30 seconds)

### Quick Rollback (Railway)

1. Backend service → **Deployments**
2. Find previous successful deployment
3. Click **"Redeploy"**
4. Rollback complete (1-2 minutes)

### Database Rollback

**⚠️ WARNING:** Database rollbacks are risky. Always test migrations in staging first.

```bash
# If you need to rollback a migration
cd apps/backend
DATABASE_URL="..." npx prisma migrate resolve --rolled-back [migration-name]
```

### Emergency Procedure

If site is completely broken:

1. **Disable frontend:** Vercel → Settings → Deployment Protection → Enable
2. **Stop backend:** Railway → Backend service → Settings → Stop
3. **Investigate** logs and errors
4. **Fix** issues
5. **Redeploy** when ready

---

## CI/CD Setup (Optional)

### GitHub Actions for Automated Testing

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test --workspace=apps/backend

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test --workspace=apps/frontend

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deployment triggered
        run: echo "Vercel and Railway auto-deploy on push to main"
```

This ensures tests pass before each deployment! ✅

---

## Next Steps After Deployment

1. **Test thoroughly** - Run through all user workflows
2. **Monitor logs** - Watch for errors in first 24 hours
3. **Set up alerts** - Configure Sentry or similar for error notifications
4. **Document credentials** - Save all URLs and credentials securely
5. **Plan backups** - Set up automated database backup schedule
6. **Add custom domain** - Configure DNS for professional URL
7. **Share with users** - Get feedback from real users
8. **Iterate** - Use analytics to understand usage patterns

---

## Deployment Checklist

Use this checklist when deploying:

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Database schema finalized
- [ ] Environment variables documented
- [ ] Build tested locally (`npm run build`)
- [ ] Code pushed to GitHub

### Database
- [ ] Railway/Render PostgreSQL created
- [ ] Database URL obtained and secured
- [ ] Migrations applied successfully
- [ ] Seed data loaded (if desired)

### Backend
- [ ] Railway/Render service created
- [ ] Root directory configured: `apps/backend`
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check responds: `/api/health`
- [ ] Public domain generated

### Frontend
- [ ] Vercel project imported
- [ ] Root directory configured: `apps/frontend`
- [ ] Environment variable set: `VITE_API_BASE_URL`
- [ ] Build successful
- [ ] Site accessible
- [ ] API calls work end-to-end

### Post-Deployment
- [ ] Backend CORS updated with Vercel URL
- [ ] All features tested in production
- [ ] Custom domains configured (optional)
- [ ] Monitoring/logging enabled
- [ ] Credentials documented securely
- [ ] Backup strategy established

---

## Summary

You now have a complete guide for deploying your Delivery Manager Application! The recommended path is:

1. ✅ **Code pushed to GitHub** (completed)
2. 🚀 **Deploy Database** on Railway (20-30 min)
3. 🚀 **Deploy Backend** on Railway (30-45 min)
4. 🚀 **Deploy Frontend** on Vercel (30-45 min)
5. 🔧 **Configure & Test** (30-60 min)

**Total Time:** 2-4 hours for complete deployment

When you're ready to deploy, follow this guide step-by-step. Each phase builds on the previous one, so complete them in order.

Good luck with your deployment! 🎉
