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
- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run build` - Build for production
- `npm test` - Run Vitest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run lint` - Lint frontend code

### Backend (`apps/backend`)
- `npm run dev` - Start backend with hot reload (http://localhost:3001)
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server
- `npm test` - Run Jest unit tests
- `npm run test:integration` - Run API integration tests
- `npm run seed:data` - Seed database with sample Brooklyn data
- `npm run reset:data` - Clear all data from database

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

---

## Running Tests

### Unit Tests

**Frontend Unit Tests (Vitest + React Testing Library)**
```bash
cd apps/frontend
npm test                    # Run tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report (target: >70%)
```

**Backend Unit Tests (Jest)**
```bash
cd apps/backend
npm test                    # Run all backend tests
```

### Integration Tests

Tests API endpoints with a real database:
```bash
cd apps/backend
npm run test:integration
```

This will:
- Start a test database
- Run migrations
- Test all CRUD operations
- Clean up test data

### End-to-End Tests

Tests complete user workflows with Playwright:
```bash
cd apps/frontend
npm run test:e2e            # Run E2E tests in headless mode
npm run test:e2e:ui         # Run with Playwright UI for debugging
npm run test:e2e:debug      # Run in debug mode with step-by-step execution
```

**Prerequisites for E2E tests:**
- Both frontend and backend servers must be running
- Database should be seeded with test data

### Running All Tests

From the project root:
```bash
npm test                    # Runs tests in all workspaces
```

---

## Managing Demo Data

### Seeding Data

Populate the database with sample orders and drivers using Brooklyn, NY addresses:

```bash
cd apps/backend
npm run seed:data
```

This creates:
- 10 sample orders with various statuses
- 5 sample drivers
- All addresses are valid Brooklyn locations
- Data is suitable for testing and demos

### Resetting Data

Clear all orders and drivers from the database:

```bash
cd apps/backend
npm run reset:data
```

**Warning:** This permanently deletes all data. Use with caution!

**Use Cases:**
- Start fresh for demos
- Clear test data
- Reset to known state before manual testing

---

## Architecture

This application follows a modern full-stack architecture with clear separation of concerns:

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Vite)                                 │ │
│  │  - shadcn/ui Components                                │ │
│  │  - Leaflet Maps                                        │ │
│  │  - React Query (30s polling)                           │ │
│  └─────────────────┬──────────────────────────────────────┘ │
└────────────────────┼────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│  Backend Server (Node.js + Express + TypeScript)            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  REST API Layer                                       │  │
│  │  - Order Management Endpoints                         │  │
│  │  - Driver Management Endpoints                        │  │
│  │  - Zod Validation                                     │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼────────────────────────────────────┐  │
│  │  Service Layer                                        │  │
│  │  - Business Logic                                     │  │
│  │  - Data Transformations                               │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼────────────────────────────────────┐  │
│  │  Prisma ORM                                           │  │
│  │  - Type-safe database access                          │  │
│  │  - Migrations                                         │  │
│  └──────────────────┬────────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│  PostgreSQL Database                                         │
│  - Orders, Drivers, Assignments                              │
│  - Relational data with foreign keys                         │
└──────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Monorepo Structure**: Uses npm workspaces for frontend/backend separation
2. **TypeScript Throughout**: End-to-end type safety from database to UI
3. **Polling vs WebSockets**: Simple 30-second polling for MVP (WebSockets planned for v2)
4. **RESTful API**: Standard REST endpoints for CRUD operations
5. **Prisma ORM**: Type-safe database access with automatic migrations
6. **Component-Based UI**: Reusable shadcn/ui components with Tailwind CSS

For detailed architecture documentation, see:
- [Full Architecture Doc](docs/architecture.md)
- [Data Models](apps/backend/prisma/schema.prisma)

---

## Known Limitations

### Current MVP Limitations

1. **No Real-Time Updates**
   - Uses 30-second polling instead of WebSockets
   - Updates may appear delayed by up to 30 seconds
   - Planned for post-MVP

2. **Basic Route Visualization**
   - Routes shown are simple point-to-point lines
   - No actual turn-by-turn directions
   - No route optimization algorithm
   - Planned: Integration with routing APIs (OSRM, Google Maps)

3. **No Authentication**
   - Application is open to anyone with the URL
   - No user accounts or permissions
   - Planned: JWT-based authentication with role-based access

4. **Limited Map Functionality**
   - Map is view-only (no drawing/editing)
   - No live driver location tracking
   - Addresses must be manually geocoded
   - Planned: Live GPS tracking, geofence alerts

5. **Brooklyn-Only Test Data**
   - Seed data uses only Brooklyn, NY addresses
   - No validation for addresses outside Brooklyn
   - Application works globally but test data is localized

6. **No Order History Search**
   - Limited filtering and search capabilities
   - All orders shown in single list
   - Planned: Advanced filtering, date ranges, search

7. **Basic Error Handling**
   - Generic error messages
   - Limited retry logic
   - Planned: Detailed error states, automatic retries

8. **Performance with Large Datasets**
   - Not optimized for 1000+ orders
   - Map may slow down with many markers
   - Planned: Pagination, clustering, virtual scrolling

---

## Contributing

We welcome contributions to this learning project! Here's how to get started:

### Code Style

This project follows strict TypeScript and React best practices:

**TypeScript**
- Use strict mode (`"strict": true` in tsconfig.json)
- Avoid `any` types - use proper typing or `unknown`
- Prefer interfaces over types for object shapes
- Use Zod for runtime validation

**React/Frontend**
- Use functional components with hooks
- Follow React Query best practices for data fetching
- Use shadcn/ui components when possible
- Keep components small and focused (Single Responsibility)
- Use React Testing Library for component tests

**Backend**
- Follow REST API best practices
- Use Prisma for all database access
- Validate all inputs with Zod schemas
- Use proper HTTP status codes
- Write integration tests for all endpoints

**General**
- Use ESLint and Prettier for formatting
- Run `npm run lint` and `npm run format` before committing
- Write meaningful commit messages
- Keep functions small (<50 lines when possible)

### Pull Request Process

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/delivery-simulator.git
   cd delivery-simulator
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following the style guide above
   - Add tests for new features
   - Update documentation if needed
   - Ensure all tests pass locally

3. **Test Your Changes**
   ```bash
   npm run lint                      # Check for lint errors
   npm test                          # Run all tests
   cd apps/frontend && npm run test:coverage  # Check coverage >70%
   cd apps/frontend && npm run test:e2e       # Run E2E tests
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill in the PR template with:
     - Description of changes
     - Related issue numbers (if any)
     - Testing performed
     - Screenshots (for UI changes)

6. **Code Review**
   - Address any feedback from reviewers
   - Keep PR scope focused and small
   - Respond to comments promptly

### Commit Message Convention

Follow conventional commits format:
- `feat: add new feature`
- `fix: resolve bug in order assignment`
- `docs: update README with new instructions`
- `test: add unit tests for DriverList`
- `refactor: simplify order status logic`
- `chore: update dependencies`

### Testing Guidelines

All PRs must include appropriate tests:
- **Unit tests**: For new components, utilities, or business logic
- **Integration tests**: For new API endpoints
- **E2E tests**: For new user-facing features or critical workflows
- Maintain >70% code coverage for frontend and backend

### Questions?

- Check existing issues and discussions
- Review the [PRD](docs/prd.md) for feature context
- Consult the [Architecture doc](docs/architecture.md) for technical decisions

---

## Manual Testing

For comprehensive manual testing procedures, see [Manual Testing Checklist](docs/MANUAL_TESTING_CHECKLIST.md).

The checklist covers:
- Order management workflows
- Driver management and assignment
- Map visualization
- Error handling
- Cross-browser compatibility
- Performance testing

---

## License

MIT

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [docs](docs/) folder for detailed documentation
- Review the PRD for product context
