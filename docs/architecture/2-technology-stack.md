# 2. Technology Stack

## Frontend Stack

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| React | 18+ | UI framework | Industry standard, required for shadcn/ui |
| TypeScript | 5.x | Type safety | Catch bugs at compile time, better DX |
| Vite | 5.x | Build tool | Fast HMR, modern ESM-based bundler |
| shadcn/ui | Latest | Component library | Accessible, customizable, Tailwind-based |
| Tailwind CSS | 3.x | Styling | Utility-first, rapid UI development |
| React Router | 6.x | Client-side routing | Standard React routing solution |
| Leaflet | 1.9+ | Map rendering | Free, no API key, mature library |
| react-leaflet | 4.x | React bindings for Leaflet | Clean React integration for Leaflet |

## Backend Stack

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Node.js | 20 LTS | Runtime | JavaScript/TypeScript throughout stack |
| Express | 4.x | Web framework | Simple, flexible, well-documented |
| TypeScript | 5.x | Type safety | Shared types with frontend |
| Prisma | 5.x | ORM | Type-safe database access, migrations |
| Zod | 3.x | Schema validation | Runtime validation, TypeScript inference |
| Winston | 3.x | Logging | Structured logging with multiple transports |

## Database

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| PostgreSQL | 14+ | Primary database | Relational, production-ready, free |

## Development Tools

| Tool | Purpose |
|------|---------|
| npm workspaces | Monorepo management |
| ESLint | Code linting (TypeScript, React rules) |
| Prettier | Code formatting |
| Vitest | Frontend unit tests |
| React Testing Library | Frontend component tests |
| Jest | Backend unit tests |
| Supertest | Backend API integration tests |
| Playwright | End-to-end tests |

## External Services

| Service | Purpose | Cost |
|---------|---------|------|
| OpenStreetMap | Map tiles | Free |
| Nominatim | Geocoding (fallback) | Free (rate-limited) |

## Deployment Stack

| Layer | Platform | Purpose |
|-------|----------|---------|
| Frontend | Vercel | Static hosting, CDN, preview deployments |
| Backend | Railway | Node.js hosting, managed PostgreSQL |
| Database | Railway PostgreSQL | Managed PostgreSQL instance |
| Version Control | GitHub | Source control, CI/CD triggers |

---
