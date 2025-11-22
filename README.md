# Delivery Manager Application

A web-based system for managing restaurant delivery operations, built as a learning project using the BMad methodology.

## Overview

The Delivery Manager Application provides dispatchers with a centralized dashboard to manage:
- Order intake and lifecycle tracking
- Driver assignment and availability
- Route visualization on interactive maps
- Real-time status updates via polling

## Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** component library with Tailwind CSS
- **Leaflet** for map visualization
- **React Router** for client-side routing

### Backend
- **Node.js 20 LTS** with Express
- **TypeScript** for type safety
- **PostgreSQL 14+** with Prisma ORM
- **Zod** for runtime validation
- **Winston** for logging

### Testing
- **Vitest** + React Testing Library (frontend)
- **Jest** + Supertest (backend)
- **Playwright** (end-to-end)

## Project Structure

```
delivery-simulator/
├── apps/
│   ├── frontend/          # React frontend application
│   └── backend/           # Node.js Express backend
├── packages/              # Shared packages (future)
├── tests/
│   └── e2e/              # Playwright E2E tests
├── docs/                  # Project documentation
│   ├── brief.md          # Project brief
│   ├── prd.md            # Product requirements
│   └── architecture.md   # Technical architecture
└── .bmad-core/           # BMad methodology configuration
```

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10+
- Docker (recommended) OR PostgreSQL 14+ installed locally
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd delivery-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your database credentials
```

4. Start the PostgreSQL database:

**Option A: Using Docker (Recommended)**
```bash
docker compose up -d
```

**Option B: Using Local PostgreSQL**
```bash
# Ensure PostgreSQL 14+ is installed and running
createdb delivery_manager
```

5. Run database migrations:
```bash
cd apps/backend
npx prisma migrate dev
```

6. Start development servers:
```bash
cd ../..
npm run dev
```

This will start both frontend (http://localhost:5173) and backend (http://localhost:3001).

## Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend dev servers
- `npm run build` - Build all workspaces
- `npm test` - Run tests in all workspaces
- `npm run lint` - Lint all TypeScript files
- `npm run format` - Format code with Prettier

### Frontend (`apps/frontend`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm test` - Run Vitest tests
- `npm run lint` - Lint frontend code

### Backend (`apps/backend`)
- `npm run dev` - Start backend with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm test` - Run Jest tests

## Development Workflow

This project follows the BMad methodology with clearly defined phases:
1. **Analyst** - Project brief creation
2. **PM** - Product requirements and user stories
3. **Architect** - Technical design and architecture
4. **Dev** - Implementation (current phase)
5. **QA** - Quality assurance and testing

## Documentation

- [Project Brief](docs/brief.md) - Executive summary and problem statement
- [PRD](docs/prd.md) - Detailed product requirements
- [Architecture](docs/architecture.md) - Full technical architecture

## MVP Scope

The MVP includes:
- ✅ Order management (create, view, update status)
- ✅ Driver management (add, view availability, assign orders)
- ✅ Interactive map with delivery locations
- ✅ Route visualization with suggested sequences
- ✅ Dashboard with status-grouped orders
- ✅ 30-second polling for real-time updates
- ✅ Seed data with Brooklyn, NY addresses
- ✅ Comprehensive test suite

## Future Enhancements

Post-MVP features planned:
- Real-time updates via WebSockets
- Smart route optimization algorithms
- Driver mobile interface
- Customer tracking portal
- Analytics dashboard
- User authentication

## License

MIT

## Contributing

This is a learning project built with the BMad methodology. Contributions welcome!
