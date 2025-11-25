# 10. Development Workflow

## Initial Setup

**Prerequisites:**
- Node.js 20 LTS
- PostgreSQL 14+
- npm 10+
- Git

**Setup Steps:**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/delivery-simulator.git
cd delivery-simulator

# 2. Install all dependencies (root + workspaces)
npm install

# 3. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your DATABASE_URL

# 4. Set up database
cd apps/backend
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start development servers
cd ../..
npm run dev  # Runs both frontend and backend concurrently
```

## npm Scripts

**Root `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  }
}
```

**Frontend `apps/frontend/package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

**Backend `apps/backend/package.json` scripts:**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio"
  }
}
```

## Development Ports

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express API)
- **Database**: `localhost:5432` (PostgreSQL)

## Git Workflow

**Branch Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches (e.g., `feature/order-management`)
- `fix/*`: Bug fix branches

**Commit Convention:**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Example: `feat: add order assignment endpoint`

**PR Process:**
1. Create feature branch from `develop`
2. Make changes and commit
3. Push and open PR to `develop`
4. CI runs tests and linting
5. Code review and merge

## Code Quality Tools

**ESLint Configuration** (`.eslintrc.json`):
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

**Prettier Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Debugging

**Frontend (Chrome DevTools):**
- React DevTools extension for component inspection
- Network tab for API call debugging
- Console for errors and logs

**Backend (VS Code):**
- Use `tsx` with `--inspect` flag for Node.js debugging
- VS Code launch.json configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/apps/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Database (Prisma Studio):**
```bash
cd apps/backend
npx prisma studio
# Opens GUI at http://localhost:5555
```

---
