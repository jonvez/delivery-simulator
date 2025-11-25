# 14. Coding Standards

## TypeScript Guidelines

### Strict Mode Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Type Definitions

**Always define explicit types for:**
- Function parameters and return values
- Component props
- API request/response payloads
- State variables in contexts

**Example:**
```typescript
// Good
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // ...
}

// Avoid
function calculateDistance(lat1, lon1, lat2, lon2) {
  // ...
}
```

### Interface vs Type

- **Use `interface`** for object shapes, especially when extending
- **Use `type`** for unions, intersections, and primitives

```typescript
// Interface for object shapes
interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
}

// Type for unions
type OrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
```

## Naming Conventions

**Variables and Functions:**
- `camelCase` for variables, functions, and methods
- Descriptive names that indicate purpose
- Boolean variables prefixed with `is`, `has`, `should`

```typescript
const orderCount = 10;
const isAvailable = true;
const hasAssignedOrders = driver.orders.length > 0;

function assignOrderToDriver(orderId: string, driverId: string) { }
```

**Components:**
- `PascalCase` for React components
- Descriptive names indicating component purpose

```typescript
function OrderCard({ order }: OrderCardProps) { }
function DriverList({ drivers }: DriverListProps) { }
```

**Constants:**
- `UPPER_SNAKE_CASE` for global constants
- Group related constants in enums or objects

```typescript
const MAX_ORDERS_PER_DRIVER = 5;
const API_BASE_URL = 'http://localhost:3001/api';

enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
}
```

**Files and Directories:**
- `kebab-case` for file names (e.g., `order-card.tsx`, `api-client.ts`)
- `PascalCase` for component files (e.g., `OrderCard.tsx`)
- Directory names match their purpose (e.g., `components/`, `services/`)

## Code Organization

**File Structure:**
1. Imports (grouped: external, internal, types)
2. Type definitions
3. Constants
4. Main code (component, service, etc.)
5. Exports

**Example:**
```typescript
// External imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports
import { apiClient } from '../services/api/client';
import { OrderCard } from '../components/OrderCard';

// Types
import type { Order, OrderStatus } from '../types';

// Constants
const POLLING_INTERVAL = 30000;

// Component
export function OrdersPage() {
  // ...
}
```

**Single Responsibility Principle:**
- Each function/component has one clear purpose
- Keep functions small (< 50 lines ideally)
- Extract complex logic into separate functions

**DRY (Don't Repeat Yourself):**
- Extract common logic into utility functions
- Use shared types and constants
- Avoid duplicating validation or business rules

## React Best Practices

**Component Structure:**
```typescript
interface Props {
  order: Order;
  onAssign?: (orderId: string, driverId: string) => void;
}

export function OrderCard({ order, onAssign }: Props) {
  // Hooks first
  const [isAssigning, setIsAssigning] = useState(false);
  const navigate = useNavigate();

  // Event handlers
  const handleAssign = (driverId: string) => {
    setIsAssigning(true);
    onAssign?.(order.id, driverId);
  };

  // Early returns for conditional rendering
  if (!order) {
    return null;
  }

  // Main render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

**Hooks Guidelines:**
- Follow Rules of Hooks (only at top level, only in function components)
- Use custom hooks for reusable stateful logic
- Name custom hooks with `use` prefix (e.g., `useOrders`, `usePolling`)

**Props:**
- Use destructuring for props
- Define prop types with TypeScript interfaces
- Use optional props sparingly (prefer required props with defaults)

## Backend Best Practices

**Error Handling:**
- Always use try-catch in async functions
- Pass errors to `next()` in Express middleware
- Use custom error classes for different error types

```typescript
async createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json({ order });
  } catch (error) {
    next(error); // Let error handler middleware deal with it
  }
}
```

**Database Queries:**
- Use Prisma's type-safe API
- Always handle null/undefined returns from `findUnique`
- Use transactions for multi-step operations

```typescript
const order = await prisma.order.findUnique({ where: { id: orderId } });
if (!order) {
  throw new AppError('NOT_FOUND', 'Order not found', 404);
}
```

**Service Layer:**
- Keep controllers thin (request/response handling only)
- Put business logic in services
- Services should not know about HTTP (no `req`, `res` references)

## Code Comments

**When to Comment:**
- Complex algorithms or business rules
- Non-obvious design decisions
- TODO/FIXME notes for future improvements
- Public API documentation (JSDoc for exported functions)

**When NOT to Comment:**
- Self-explanatory code
- Redundant descriptions (e.g., `// Increment counter` for `counter++`)

**Example:**
```typescript
/**
 * Calculates suggested delivery route for a driver's assigned orders.
 *
 * Current implementation: Simple FIFO (First In, First Out) based on order creation time.
 * Future: Implement nearest-neighbor or TSP optimization.
 *
 * @param orders - Array of orders assigned to the driver
 * @returns Sorted orders and route coordinates
 */
function calculateRoute(orders: Order[]): Route {
  // Filter orders with valid coordinates (some may fail geocoding)
  const validOrders = orders.filter(o => o.latitude && o.longitude);

  // TODO: Replace with nearest-neighbor algorithm
  return validOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
```

## Linting and Formatting

**ESLint Rules:**
- Enforce TypeScript types (`@typescript-eslint/no-explicit-any` → error)
- Enforce consistent code style (indent, quotes, semicolons)
- Detect common bugs (unused vars, unreachable code)

**Prettier Formatting:**
- Auto-format on save in IDE
- Run `npm run format` before committing

**Pre-commit Hook:**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---
