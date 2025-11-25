# 9. Project Structure (Source Tree)

```
delivery-simulator/
├── apps/
│   ├── frontend/                    # React frontend application
│   │   ├── public/
│   │   │   └── vite.svg
│   │   ├── src/
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderList.tsx
│   │   │   │   ├── OrderForm.tsx
│   │   │   │   ├── DriverCard.tsx
│   │   │   │   ├── DriverList.tsx
│   │   │   │   ├── MapView.tsx
│   │   │   │   └── RouteMap.tsx
│   │   │   ├── pages/               # Page-level components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Drivers.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   ├── contexts/            # React contexts for state
│   │   │   │   ├── OrdersContext.tsx
│   │   │   │   └── DriversContext.tsx
│   │   │   ├── services/            # API client and utilities
│   │   │   │   └── api/
│   │   │   │       └── client.ts
│   │   │   ├── types/               # TypeScript type definitions
│   │   │   │   └── index.ts
│   │   │   ├── lib/                 # shadcn/ui utilities
│   │   │   │   └── utils.ts
│   │   │   ├── App.tsx              # Root component with routing
│   │   │   ├── main.tsx             # Vite entry point
│   │   │   └── index.css            # Global styles + Tailwind
│   │   ├── tests/
│   │   │   ├── unit/                # Component unit tests
│   │   │   └── integration/         # Integration tests
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── components.json          # shadcn/ui config
│   │
│   └── backend/                     # Node.js Express backend
│       ├── src/
│       │   ├── api/
│       │   │   ├── routes/          # Express route definitions
│       │   │   │   ├── orders.routes.ts
│       │   │   │   ├── drivers.routes.ts
│       │   │   │   └── seed.routes.ts
│       │   │   ├── controllers/     # Request handlers
│       │   │   │   ├── orders.controller.ts
│       │   │   │   ├── drivers.controller.ts
│       │   │   │   └── seed.controller.ts
│       │   │   └── validators/      # Zod validation schemas
│       │   │       ├── orders.validator.ts
│       │   │       └── drivers.validator.ts
│       │   ├── services/            # Business logic layer
│       │   │   ├── order.service.ts
│       │   │   ├── driver.service.ts
│       │   │   ├── route.service.ts
│       │   │   └── geocoding.service.ts
│       │   ├── middleware/          # Express middleware
│       │   │   ├── errorHandler.ts
│       │   │   ├── requestLogger.ts
│       │   │   └── validateRequest.ts
│       │   ├── db/                  # Database client
│       │   │   └── client.ts
│       │   ├── utils/               # Shared utilities
│       │   │   ├── logger.ts
│       │   │   └── errors.ts
│       │   ├── types/               # TypeScript types
│       │   │   └── index.ts
│       │   └── server.ts            # Express app setup
│       ├── prisma/
│       │   ├── schema.prisma        # Database schema
│       │   ├── seed.ts              # Seed data script
│       │   └── migrations/          # Database migrations
│       ├── tests/
│       │   ├── unit/                # Service unit tests
│       │   ├── integration/         # API integration tests
│       │   └── helpers/             # Test utilities
│       ├── logs/                    # Winston log files
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── packages/                        # Shared packages (future)
│   └── shared-types/                # Shared TypeScript types
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                            # Project documentation
│   ├── brief.md                     # Project Brief
│   ├── prd.md                       # Product Requirements Document
│   ├── architecture.md              # Architecture Document (this file)
│   ├── prd/                         # Sharded PRD (epics)
│   ├── architecture/                # Sharded architecture docs
│   └── qa/                          # QA test plans
│
├── .bmad-core/                      # BMad framework configuration
│   ├── core-config.yaml
│   ├── tasks/
│   ├── templates/
│   ├── checklists/
│   └── data/
│
├── tests/
│   └── e2e/                         # Playwright E2E tests
│       ├── orders.spec.ts
│       ├── drivers.spec.ts
│       └── playwright.config.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI pipeline
│       └── deploy.yml               # Deployment workflow
│
├── package.json                     # Root package.json (workspaces)
├── package-lock.json
├── tsconfig.json                    # Root TypeScript config
├── .gitignore
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## Key Structural Decisions

- **Monorepo with npm workspaces**: Single repository for frontend and backend
- **Shared types package**: Common TypeScript types used by both apps (future enhancement)
- **Sharded documentation**: BMad's sharded doc structure in `docs/prd/` and `docs/architecture/`
- **Centralized testing**: E2E tests at root level; unit/integration tests colocated with apps
- **Environment files**: `.env` files in each app directory, not committed to Git

---
