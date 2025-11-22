# Architecture Document: Delivery Manager Application

## 1. Introduction and High-Level Architecture

### Executive Summary

The Delivery Manager Application is a web-based system for managing restaurant delivery operations. This architecture document defines the full-stack technical design for building a clean, functional MVP that handles order management, driver coordination, and route visualization.

**Architecture Goals:**
- **Simplicity First**: Straightforward design patterns that are easy to understand and maintain
- **Type Safety**: TypeScript throughout the stack for reliability
- **Developer Experience**: Fast feedback loops with hot reload, clear error messages, and comprehensive testing
- **Future-Ready**: Clean separation of concerns allowing future enhancements without major refactoring

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        UI[React UI Components]
        State[React Context + Hooks]
        API_Client[API Client Service]
    end

    subgraph "Server Layer (Node.js)"
        Routes[Express Routes]
        Controllers[Controllers]
        Services[Business Logic Services]
        Validation[Zod Validation]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PG[(PostgreSQL)]
    end

    subgraph "External Services"
        Leaflet[Leaflet + OpenStreetMap]
        Nominatim[Nominatim Geocoding]
    end

    UI --> State
    State --> API_Client
    API_Client -->|REST API Calls| Routes
    Routes --> Validation
    Validation --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> PG

    UI --> Leaflet
    Services -.->|Fallback Geocoding| Nominatim

    classDef clientLayer fill:#e1f5ff,stroke:#01579b
    classDef serverLayer fill:#fff3e0,stroke:#e65100
    classDef dataLayer fill:#f3e5f5,stroke:#4a148c
    classDef externalLayer fill:#e8f5e9,stroke:#1b5e20

    class UI,State,API_Client clientLayer
    class Routes,Controllers,Services,Validation serverLayer
    class Prisma,PG dataLayer
    class Leaflet,Nominatim externalLayer
```

### Technology Stack Overview

- **Frontend**: React 18+ with TypeScript, Vite build tool, shadcn/ui component library
- **Backend**: Node.js with Express 4.x and TypeScript
- **Database**: PostgreSQL 14+ accessed via Prisma ORM
- **Deployment**: Vercel (frontend) + Railway (backend + database)
- **Testing**: Vitest, React Testing Library, Jest, Supertest, Playwright

### Architectural Principles

1. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access
2. **Type Safety**: Shared TypeScript types between frontend and backend
3. **Validation at Boundaries**: Input validation using Zod schemas at API entry points
4. **Stateless Backend**: REST API with no session state (ready for future scaling)
5. **Polling-Based Updates**: Simple 30-second polling for status updates (no WebSockets complexity)
6. **Error Handling**: Standardized error responses with proper HTTP status codes

---

## 2. Technology Stack

### Frontend Stack

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

### Backend Stack

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Node.js | 20 LTS | Runtime | JavaScript/TypeScript throughout stack |
| Express | 4.x | Web framework | Simple, flexible, well-documented |
| TypeScript | 5.x | Type safety | Shared types with frontend |
| Prisma | 5.x | ORM | Type-safe database access, migrations |
| Zod | 3.x | Schema validation | Runtime validation, TypeScript inference |
| Winston | 3.x | Logging | Structured logging with multiple transports |

### Database

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| PostgreSQL | 14+ | Primary database | Relational, production-ready, free |

### Development Tools

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

### External Services

| Service | Purpose | Cost |
|---------|---------|------|
| OpenStreetMap | Map tiles | Free |
| Nominatim | Geocoding (fallback) | Free (rate-limited) |

### Deployment Stack

| Layer | Platform | Purpose |
|-------|----------|---------|
| Frontend | Vercel | Static hosting, CDN, preview deployments |
| Backend | Railway | Node.js hosting, managed PostgreSQL |
| Database | Railway PostgreSQL | Managed PostgreSQL instance |
| Version Control | GitHub | Source control, CI/CD triggers |

---

## 3. Data Models

### Core Domain Models

#### Order Model

```typescript
interface Order {
  id: string;                    // UUID
  customerName: string;          // Customer full name
  customerPhone: string;         // Contact number
  deliveryAddress: string;       // Full street address
  latitude: number | null;       // Geocoded latitude (nullable)
  longitude: number | null;      // Geocoded longitude (nullable)
  orderDetails: string;          // Simple text field for order contents
  status: OrderStatus;           // Enum: PENDING | ASSIGNED | IN_TRANSIT | DELIVERED
  driverId: string | null;       // Foreign key to Driver (nullable)
  driver?: Driver;               // Relation to Driver model
  createdAt: Date;               // Order creation timestamp
  assignedAt: Date | null;       // When order was assigned to driver
  inTransitAt: Date | null;      // When driver started delivery
  deliveredAt: Date | null;      // When delivery was completed
}

enum OrderStatus {
  PENDING = 'PENDING',           // Order created, awaiting assignment
  ASSIGNED = 'ASSIGNED',         // Assigned to driver, not yet started
  IN_TRANSIT = 'IN_TRANSIT',     // Driver is delivering
  DELIVERED = 'DELIVERED'        // Delivery completed
}
```

#### Driver Model

```typescript
interface Driver {
  id: string;                    // UUID
  name: string;                  // Driver full name
  isAvailable: boolean;          // Availability status (true/false)
  createdAt: Date;               // Driver record creation timestamp
  orders: Order[];               // Relation: assigned orders
}
```

#### Brooklyn Address Model (Seed Data)

```typescript
interface BrooklynAddress {
  id: string;                    // UUID
  streetAddress: string;         // e.g., "123 Bedford Ave, Brooklyn, NY 11211"
  latitude: number;              // Pre-seeded Brooklyn coordinate
  longitude: number;             // Pre-seeded Brooklyn coordinate
  neighborhood: string;          // e.g., "Williamsburg", "Park Slope"
  createdAt: Date;               // Seed timestamp
}
```

### Model Relationships

```mermaid
erDiagram
    DRIVER ||--o{ ORDER : "is assigned to"

    DRIVER {
        string id PK
        string name
        boolean isAvailable
        datetime createdAt
    }

    ORDER {
        string id PK
        string customerName
        string customerPhone
        string deliveryAddress
        float latitude
        float longitude
        string orderDetails
        enum status
        string driverId FK
        datetime createdAt
        datetime assignedAt
        datetime inTransitAt
        datetime deliveredAt
    }

    BROOKLYN_ADDRESS {
        string id PK
        string streetAddress
        float latitude
        float longitude
        string neighborhood
        datetime createdAt
    }
```

### Model Validation Rules

**Order Validation:**
- `customerName`: Required, 1-100 characters
- `customerPhone`: Required, matches phone pattern (e.g., "555-1234" or "(212) 555-1234")
- `deliveryAddress`: Required, 5-200 characters
- `orderDetails`: Required, 1-500 characters
- `status`: Must be valid OrderStatus enum value
- `driverId`: Must reference existing Driver if provided

**Driver Validation:**
- `name`: Required, 1-100 characters
- `isAvailable`: Required, boolean

**Business Rules:**
- Order can only be assigned to available driver (`isAvailable = true`)
- Order status transitions must follow sequence: PENDING → ASSIGNED → IN_TRANSIT → DELIVERED
- Once order is DELIVERED, it cannot transition to other states
- Driver cannot be deleted if they have active orders (ASSIGNED or IN_TRANSIT)

---

## 4. API Specification

### API Design Principles

- **RESTful conventions**: Resources mapped to HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **JSON payloads**: All request/response bodies use JSON
- **Standard status codes**: 200 (success), 201 (created), 400 (validation error), 404 (not found), 500 (server error)
- **Error format**: Consistent error response structure
- **No authentication for MVP**: Auth deferred to post-MVP

### Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.delivery-manager.com/api` (post-MVP)

### API Endpoints

#### Orders

**GET /api/orders**
- **Description**: Retrieve all orders with optional status filtering
- **Query Params**:
  - `status` (optional): Filter by OrderStatus (e.g., `PENDING`, `ASSIGNED`)
- **Response**: `200 OK`
  ```typescript
  {
    orders: Order[]
  }
  ```

**GET /api/orders/:id**
- **Description**: Retrieve single order by ID
- **Path Params**: `id` (UUID)
- **Response**: `200 OK`
  ```typescript
  {
    order: Order
  }
  ```
- **Error**: `404 Not Found` if order doesn't exist

**POST /api/orders**
- **Description**: Create new order
- **Request Body**:
  ```typescript
  {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderDetails: string;
  }
  ```
- **Response**: `201 Created`
  ```typescript
  {
    order: Order  // Includes auto-assigned id, status=PENDING, createdAt
  }
  ```
- **Error**: `400 Bad Request` if validation fails

**PATCH /api/orders/:id/assign**
- **Description**: Assign order to driver
- **Path Params**: `id` (UUID)
- **Request Body**:
  ```typescript
  {
    driverId: string;  // UUID of driver
  }
  ```
- **Response**: `200 OK`
  ```typescript
  {
    order: Order  // Updated with driverId, status=ASSIGNED, assignedAt
  }
  ```
- **Error**:
  - `400 Bad Request` if driver unavailable or order already assigned
  - `404 Not Found` if order or driver doesn't exist

**PATCH /api/orders/:id/status**
- **Description**: Update order status (for status transitions)
- **Path Params**: `id` (UUID)
- **Request Body**:
  ```typescript
  {
    status: OrderStatus;  // New status
  }
  ```
- **Response**: `200 OK`
  ```typescript
  {
    order: Order  // Updated with new status and relevant timestamp
  }
  ```
- **Error**:
  - `400 Bad Request` if invalid status transition
  - `404 Not Found` if order doesn't exist

#### Drivers

**GET /api/drivers**
- **Description**: Retrieve all drivers
- **Query Params**:
  - `availableOnly` (optional): If `true`, return only available drivers
- **Response**: `200 OK`
  ```typescript
  {
    drivers: Driver[]
  }
  ```

**GET /api/drivers/:id**
- **Description**: Retrieve single driver by ID with assigned orders
- **Path Params**: `id` (UUID)
- **Response**: `200 OK`
  ```typescript
  {
    driver: Driver & { orders: Order[] }
  }
  ```
- **Error**: `404 Not Found` if driver doesn't exist

**POST /api/drivers**
- **Description**: Create new driver
- **Request Body**:
  ```typescript
  {
    name: string;
    isAvailable?: boolean;  // Optional, defaults to true
  }
  ```
- **Response**: `201 Created`
  ```typescript
  {
    driver: Driver
  }
  ```
- **Error**: `400 Bad Request` if validation fails

**PATCH /api/drivers/:id/availability**
- **Description**: Update driver availability
- **Path Params**: `id` (UUID)
- **Request Body**:
  ```typescript
  {
    isAvailable: boolean;
  }
  ```
- **Response**: `200 OK`
  ```typescript
  {
    driver: Driver
  }
  ```
- **Error**: `404 Not Found` if driver doesn't exist

**GET /api/drivers/:id/route**
- **Description**: Get suggested delivery route for driver's assigned orders
- **Path Params**: `id` (UUID)
- **Response**: `200 OK`
  ```typescript
  {
    driverId: string;
    orders: Order[];  // Assigned orders in suggested sequence
    coordinates: Array<{ lat: number; lng: number }>;  // Route waypoints
  }
  ```
- **Error**: `404 Not Found` if driver doesn't exist

#### Seed Data

**POST /api/seed/reset**
- **Description**: Reset database and populate with sample data
- **Request Body**: None
- **Response**: `200 OK`
  ```typescript
  {
    message: string;
    data: {
      driversCreated: number;
      ordersCreated: number;
      addressesCreated: number;
    }
  }
  ```

### Error Response Format

All error responses follow this structure:

```typescript
{
  error: {
    code: string;           // Machine-readable error code (e.g., "VALIDATION_ERROR")
    message: string;        // Human-readable error message
    details?: any;          // Optional additional error details (e.g., Zod errors)
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request body failed validation
- `NOT_FOUND`: Resource not found
- `INVALID_TRANSITION`: Invalid state transition (e.g., bad status change)
- `DRIVER_UNAVAILABLE`: Attempted to assign unavailable driver
- `INTERNAL_ERROR`: Server error

### OpenAPI Specification

The complete API will be documented using OpenAPI 3.0. The spec file will be maintained at:

```
apps/backend/src/api/openapi.yaml
```

This allows:
- Auto-generated API documentation (via Swagger UI)
- Client SDK generation
- Request/response validation
- Contract testing

---

## 5. Frontend Components

### Component Architecture

The frontend follows a hierarchical component structure with clear separation between presentational and container components.

```mermaid
graph TD
    App[App]
    App --> Layout[Layout]

    Layout --> Dashboard[DashboardPage]
    Layout --> OrdersPage[OrdersPage]
    Layout --> DriversPage[DriversPage]

    Dashboard --> OrderList[OrderList]
    Dashboard --> DriverList[DriverList]
    Dashboard --> Map[MapView]

    OrdersPage --> OrderForm[OrderForm]
    OrdersPage --> OrderList2[OrderList]
    OrdersPage --> OrderCard[OrderCard]

    DriversPage --> DriverCard[DriverCard]
    DriversPage --> DriverOrdersView[DriverOrdersView]
    DriversPage --> RouteMap[RouteMap]

    Map --> RouteMap
    OrderList --> OrderCard
    DriverList --> DriverCard

    classDef page fill:#e1f5ff,stroke:#01579b
    classDef container fill:#fff3e0,stroke:#e65100
    classDef component fill:#f3e5f5,stroke:#4a148c

    class Dashboard,OrdersPage,DriversPage page
    class Layout,OrderList,OrderList2,DriverList container
    class OrderForm,OrderCard,DriverCard,DriverOrdersView,MapView,RouteMap component
```

### Core Components

#### 1. App Component
- **Path**: `apps/frontend/src/App.tsx`
- **Purpose**: Root component, sets up routing and global providers
- **Responsibilities**:
  - React Router setup
  - Context providers (OrdersContext, DriversContext)
  - Global error boundary
- **State**: None (delegates to context providers)

#### 2. Layout Component
- **Path**: `apps/frontend/src/components/Layout.tsx`
- **Purpose**: Common page structure (header, nav, content area)
- **Responsibilities**:
  - Top navigation bar with app title
  - Navigation links (Dashboard, Orders, Drivers)
  - Content outlet for routed pages
- **Uses shadcn/ui**: `NavigationMenu`, `Card`

#### 3. DashboardPage
- **Path**: `apps/frontend/src/pages/Dashboard.tsx`
- **Purpose**: Main overview page showing orders, drivers, and map
- **Responsibilities**:
  - Display summary statistics (total orders, pending, in-transit, delivered)
  - Show recent orders list
  - Show available drivers
  - Display map with all active deliveries
- **Data Fetching**: Polls `/api/orders` and `/api/drivers` every 30 seconds
- **Uses Components**: `OrderList`, `DriverList`, `MapView`

#### 4. OrdersPage
- **Path**: `apps/frontend/src/pages/Orders.tsx`
- **Purpose**: Order management page
- **Responsibilities**:
  - Display all orders with filtering by status
  - Create new order form
  - Assign orders to drivers
  - Update order status
- **Data Fetching**: Polls `/api/orders` every 30 seconds
- **Uses Components**: `OrderForm`, `OrderList`, `OrderCard`

#### 5. DriversPage
- **Path**: `apps/frontend/src/pages/Drivers.tsx`
- **Purpose**: Driver management and route visualization
- **Responsibilities**:
  - Display all drivers with availability status
  - Show assigned orders for each driver
  - Display route map for selected driver
  - Toggle driver availability
- **Data Fetching**: Polls `/api/drivers` and `/api/drivers/:id/route` every 30 seconds
- **Uses Components**: `DriverCard`, `DriverOrdersView`, `RouteMap`

#### 6. OrderForm Component
- **Path**: `apps/frontend/src/components/OrderForm.tsx`
- **Purpose**: Form for creating new orders
- **Responsibilities**:
  - Input fields: customerName, customerPhone, deliveryAddress, orderDetails
  - Client-side validation (Zod schema)
  - Submit to POST `/api/orders`
  - Display validation errors
- **Uses shadcn/ui**: `Form`, `Input`, `Textarea`, `Button`

#### 7. OrderCard Component
- **Path**: `apps/frontend/src/components/OrderCard.tsx`
- **Purpose**: Display single order with actions
- **Props**: `order: Order`, `onAssign?: (orderId: string, driverId: string) => void`
- **Responsibilities**:
  - Show order details (customer, address, status, timestamps)
  - Display status badge with color coding
  - Assign to driver (dropdown with available drivers)
  - Update status buttons (conditional based on current status)
- **Uses shadcn/ui**: `Card`, `Badge`, `Select`, `Button`

#### 8. OrderList Component
- **Path**: `apps/frontend/src/components/OrderList.tsx`
- **Purpose**: List of orders grouped by status
- **Props**: `orders: Order[]`, `groupByStatus?: boolean`
- **Responsibilities**:
  - Render multiple `OrderCard` components
  - Optional grouping by status (Pending, Assigned, In-Transit, Delivered)
  - Handle empty state
- **Uses shadcn/ui**: `Tabs`, `ScrollArea`

#### 9. DriverCard Component
- **Path**: `apps/frontend/src/components/DriverCard.tsx`
- **Purpose**: Display single driver with availability toggle
- **Props**: `driver: Driver`, `onToggleAvailability: (driverId: string) => void`
- **Responsibilities**:
  - Show driver name and availability status
  - Display count of assigned orders
  - Toggle availability switch
- **Uses shadcn/ui**: `Card`, `Switch`, `Badge`

#### 10. DriverList Component
- **Path**: `apps/frontend/src/components/DriverList.tsx`
- **Purpose**: List all drivers
- **Props**: `drivers: Driver[]`
- **Responsibilities**:
  - Render multiple `DriverCard` components
  - Handle empty state
- **Uses shadcn/ui**: `ScrollArea`

#### 11. MapView Component
- **Path**: `apps/frontend/src/components/MapView.tsx`
- **Purpose**: Display map with delivery locations
- **Props**: `orders: Order[]`, `center?: { lat: number; lng: number }`
- **Responsibilities**:
  - Render Leaflet map with OpenStreetMap tiles
  - Plot markers for each order location
  - Color-code markers by order status
  - Show popup on marker click with order details
- **Uses**: `react-leaflet` (`MapContainer`, `TileLayer`, `Marker`, `Popup`)

#### 12. RouteMap Component
- **Path**: `apps/frontend/src/components/RouteMap.tsx`
- **Purpose**: Display suggested route for driver's deliveries
- **Props**: `driverId: string`
- **Responsibilities**:
  - Fetch route data from `/api/drivers/:id/route`
  - Render Leaflet map with route polyline
  - Plot numbered markers for delivery sequence
  - Show route waypoints
- **Uses**: `react-leaflet` (`MapContainer`, `TileLayer`, `Marker`, `Polyline`, `Popup`)

### Component Guidelines

- **Reusability**: Components should be generic and reusable where possible
- **Single Responsibility**: Each component has one clear purpose
- **Props over Context**: Prefer explicit props; use context only for global state
- **TypeScript**: All components have typed props interfaces
- **Error Boundaries**: Wrap pages in error boundaries to handle rendering errors
- **Loading States**: Show loading spinners during data fetching
- **Empty States**: Display helpful messages when no data available

---

## 6. Database Schema

### Prisma Schema Definition

**File**: `apps/backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum OrderStatus {
  PENDING
  ASSIGNED
  IN_TRANSIT
  DELIVERED
}

model Driver {
  id          String   @id @default(uuid())
  name        String
  isAvailable Boolean  @default(true)
  createdAt   DateTime @default(now())

  // Relations
  orders      Order[]

  @@map("drivers")
}

model Order {
  id              String      @id @default(uuid())
  customerName    String
  customerPhone   String
  deliveryAddress String
  latitude        Float?
  longitude       Float?
  orderDetails    String      @db.Text
  status          OrderStatus @default(PENDING)

  // Foreign Key
  driverId        String?
  driver          Driver?     @relation(fields: [driverId], references: [id], onDelete: SetNull)

  // Timestamps
  createdAt       DateTime    @default(now())
  assignedAt      DateTime?
  inTransitAt     DateTime?
  deliveredAt     DateTime?

  // Indexes
  @@index([status])
  @@index([driverId])
  @@index([createdAt])

  @@map("orders")
}

model BrooklynAddress {
  id            String   @id @default(uuid())
  streetAddress String
  latitude      Float
  longitude     Float
  neighborhood  String
  createdAt     DateTime @default(now())

  @@map("brooklyn_addresses")
}
```

### Schema Design Decisions

**Primary Keys:**
- Using UUIDs instead of auto-increment integers for all primary keys
- Rationale: Better for distributed systems, no sequence conflicts, harder to enumerate

**Timestamps:**
- `createdAt`: Auto-populated on record creation
- `assignedAt`, `inTransitAt`, `deliveredAt`: Nullable, populated on status transitions
- Rationale: Track order lifecycle for analytics and debugging

**Indexes:**
- Index on `orders.status` for fast filtering by status
- Index on `orders.driverId` for quick driver-to-orders lookups
- Index on `orders.createdAt` for time-based queries
- Rationale: Optimize common query patterns

**Nullable Fields:**
- `latitude`, `longitude`: Nullable because geocoding might fail
- `driverId`: Nullable because orders start unassigned
- Timestamp fields: Nullable until status transitions occur

**onDelete Behavior:**
- `Order.driver`: `SetNull` on driver deletion (preserve order history)
- Rationale: Don't cascade delete orders if driver is removed

**Data Types:**
- `orderDetails`: Use `@db.Text` for potentially long text content
- `latitude`, `longitude`: Float for coordinate precision

### Migration Strategy

**Initial Migration:**
```bash
npx prisma migrate dev --name init
```

This creates the initial schema and generates the Prisma Client.

**Future Migrations:**
- Use descriptive migration names (e.g., `add_customer_email_to_orders`)
- Always run migrations in development first
- Review generated SQL before applying to production
- Keep migrations small and focused

**Seed Data Script:**
- **File**: `apps/backend/prisma/seed.ts`
- **Purpose**: Populate database with sample drivers, orders, and Brooklyn addresses
- **Run**: `npx prisma db seed`

### Database Connection

**Environment Variable:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_manager?schema=public"
```

**Connection Pooling:**
- Prisma handles connection pooling automatically
- For Railway production, use connection string with pooling enabled

**Prisma Client Initialization:**
```typescript
// apps/backend/src/db/client.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

---

## 7. Frontend Architecture Details

### State Management

**Approach**: React Context API + Hooks for MVP

**Contexts:**

1. **OrdersContext** (`apps/frontend/src/contexts/OrdersContext.tsx`)
   - **State**: `orders: Order[]`, `loading: boolean`, `error: string | null`
   - **Actions**: `fetchOrders()`, `createOrder()`, `assignOrder()`, `updateOrderStatus()`
   - **Polling**: Fetches orders every 30 seconds using `useEffect` + `setInterval`

2. **DriversContext** (`apps/frontend/src/contexts/DriversContext.tsx`)
   - **State**: `drivers: Driver[]`, `loading: boolean`, `error: string | null`
   - **Actions**: `fetchDrivers()`, `createDriver()`, `toggleAvailability()`, `fetchDriverRoute(driverId)`
   - **Polling**: Fetches drivers every 30 seconds

**Why Context for MVP:**
- Simple, built-in solution (no additional dependencies)
- Sufficient for moderate state complexity
- Easy to migrate to Redux or Zustand later if needed

**Future State Management:**
- Consider Redux Toolkit or Zustand if state complexity grows
- Add optimistic updates for better UX
- Implement request deduplication and caching

### Routing

**Library**: React Router v6

**Routes**:
```typescript
// apps/frontend/src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="drivers" element={<DriversPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### API Client Service

**File**: `apps/frontend/src/services/api/client.ts`

```typescript
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error?.message || 'Request failed', response.status, error.error?.code);
    }

    return response.json();
  }

  // Orders
  async getOrders(status?: string): Promise<{ orders: Order[] }> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/orders${query}`);
  }

  async createOrder(data: CreateOrderRequest): Promise<{ order: Order }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignOrder(orderId: string, driverId: string): Promise<{ order: Order }> {
    return this.request(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId }),
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ order: Order }> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Drivers
  async getDrivers(availableOnly?: boolean): Promise<{ drivers: Driver[] }> {
    const query = availableOnly ? '?availableOnly=true' : '';
    return this.request(`/drivers${query}`);
  }

  async getDriver(driverId: string): Promise<{ driver: Driver & { orders: Order[] } }> {
    return this.request(`/drivers/${driverId}`);
  }

  async toggleDriverAvailability(driverId: string, isAvailable: boolean): Promise<{ driver: Driver }> {
    return this.request(`/drivers/${driverId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  }

  async getDriverRoute(driverId: string): Promise<DriverRoute> {
    return this.request(`/drivers/${driverId}/route`);
  }
}

export const apiClient = new ApiClient();
```

### Styling Approach

- **Tailwind CSS**: Utility-first styling for rapid development
- **shadcn/ui**: Pre-built accessible components (built on Radix UI primitives)
- **Custom Theme**: Configure Tailwind theme in `tailwind.config.js` for brand colors
- **Responsive Design**: Mobile-first approach with responsive breakpoints

**shadcn/ui Components Used:**
- `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Select`, `Tabs`, `Switch`, `ScrollArea`, `Form`, `NavigationMenu`

### Polling Implementation

**Pattern**: Use `useEffect` + `setInterval` in context providers

```typescript
// Example from OrdersContext
useEffect(() => {
  fetchOrders(); // Initial fetch

  const interval = setInterval(() => {
    fetchOrders(); // Poll every 30 seconds
  }, 30000);

  return () => clearInterval(interval); // Cleanup on unmount
}, []);
```

**Considerations:**
- Clear intervals on component unmount to prevent memory leaks
- Consider pausing polling when tab is not visible (`document.visibilityState`)
- Show last updated timestamp to user

---

## 8. Backend Architecture Details

### Application Structure

```
apps/backend/src/
├── api/
│   ├── routes/
│   │   ├── orders.routes.ts       # Order endpoints
│   │   ├── drivers.routes.ts      # Driver endpoints
│   │   └── seed.routes.ts         # Seed data endpoints
│   ├── controllers/
│   │   ├── orders.controller.ts   # Order business logic
│   │   ├── drivers.controller.ts  # Driver business logic
│   │   └── seed.controller.ts     # Seed data logic
│   └── validators/
│       ├── orders.validator.ts    # Zod schemas for orders
│       └── drivers.validator.ts   # Zod schemas for drivers
├── services/
│   ├── order.service.ts           # Order data access
│   ├── driver.service.ts          # Driver data access
│   ├── route.service.ts           # Route calculation logic
│   └── geocoding.service.ts       # Address geocoding
├── middleware/
│   ├── errorHandler.ts            # Global error handler
│   ├── requestLogger.ts           # Request logging
│   └── validateRequest.ts         # Validation middleware
├── db/
│   └── client.ts                  # Prisma client singleton
├── utils/
│   ├── logger.ts                  # Winston logger setup
│   └── errors.ts                  # Custom error classes
├── types/
│   └── index.ts                   # Shared TypeScript types
└── server.ts                      # Express app entry point
```

### Controllers

Controllers handle HTTP request/response logic and delegate business operations to services.

**Example: OrdersController** (`apps/backend/src/api/controllers/orders.controller.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { orderService } from '../../services/order.service';
import { AppError } from '../../utils/errors';

export class OrdersController {
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const orders = await orderService.findAll(status as string | undefined);
      res.json({ orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.findById(id);
      if (!order) {
        throw new AppError('NOT_FOUND', 'Order not found', 404);
      }
      res.json({ order });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({ order });
    } catch (error) {
      next(error);
    }
  }

  async assignOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      const order = await orderService.assignToDriver(id, driverId);
      res.json({ order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateStatus(id, status);
      res.json({ order });
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();
```

### Services

Services contain business logic and data access via Prisma.

**Example: OrderService** (`apps/backend/src/services/order.service.ts`)

```typescript
import prisma from '../db/client';
import { Order, OrderStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { geocodingService } from './geocoding.service';

export class OrderService {
  async findAll(status?: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { driver: true },
    });
  }

  async create(data: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderDetails: string;
  }): Promise<Order> {
    // Attempt to geocode the address
    const coordinates = await geocodingService.geocodeAddress(data.deliveryAddress);

    return prisma.order.create({
      data: {
        ...data,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      },
    });
  }

  async assignToDriver(orderId: string, driverId: string): Promise<Order> {
    // Check driver availability
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      throw new AppError('NOT_FOUND', 'Driver not found', 404);
    }
    if (!driver.isAvailable) {
      throw new AppError('DRIVER_UNAVAILABLE', 'Driver is not available', 400);
    }

    // Check order status
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('NOT_FOUND', 'Order not found', 404);
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError('INVALID_TRANSITION', 'Order is not in PENDING status', 400);
    }

    // Assign order
    return prisma.order.update({
      where: { id: orderId },
      data: {
        driverId,
        status: OrderStatus.ASSIGNED,
        assignedAt: new Date(),
      },
      include: { driver: true },
    });
  }

  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('NOT_FOUND', 'Order not found', 404);
    }

    // Validate status transition
    this.validateStatusTransition(order.status, newStatus);

    // Update with appropriate timestamp
    const updateData: any = { status: newStatus };
    if (newStatus === OrderStatus.IN_TRANSIT) {
      updateData.inTransitAt = new Date();
    } else if (newStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { driver: true },
    });
  }

  private validateStatusTransition(current: OrderStatus, next: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.ASSIGNED],
      ASSIGNED: [OrderStatus.IN_TRANSIT, OrderStatus.PENDING],
      IN_TRANSIT: [OrderStatus.DELIVERED],
      DELIVERED: [],
    };

    if (!validTransitions[current].includes(next)) {
      throw new AppError(
        'INVALID_TRANSITION',
        `Cannot transition from ${current} to ${next}`,
        400
      );
    }
  }
}

export const orderService = new OrderService();
```

### Validation Middleware

**Zod Schema Validation** (`apps/backend/src/api/validators/orders.validator.ts`)

```typescript
import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1).max(100),
    customerPhone: z.string().regex(/^[\d\s\-\(\)]+$/),
    deliveryAddress: z.string().min(5).max(200),
    orderDetails: z.string().min(1).max(500),
  }),
});

export const assignOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    driverId: z.string().uuid(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED']),
  }),
});
```

**Validation Middleware** (`apps/backend/src/middleware/validateRequest.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(new AppError('VALIDATION_ERROR', 'Request validation failed', 400, error));
    }
  };
};
```

### Route Service (Simple Route Calculation)

**File**: `apps/backend/src/services/route.service.ts`

```typescript
import { Order } from '@prisma/client';

export class RouteService {
  /**
   * Simple route calculation: orders sorted by creation time
   * Future: Implement nearest-neighbor or TSP optimization
   */
  calculateRoute(orders: Order[]): {
    orders: Order[];
    coordinates: Array<{ lat: number; lng: number }>;
  } {
    // Filter orders with valid coordinates
    const ordersWithCoords = orders.filter(o => o.latitude && o.longitude);

    // Sort by creation time (FIFO)
    const sortedOrders = [...ordersWithCoords].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    // Extract coordinates
    const coordinates = sortedOrders.map(o => ({
      lat: o.latitude!,
      lng: o.longitude!,
    }));

    return { orders: sortedOrders, coordinates };
  }
}

export const routeService = new RouteService();
```

### Logging

**Winston Logger** (`apps/backend/src/utils/logger.ts`)

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

---

## 9. Project Structure (Source Tree)

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

### Key Structural Decisions

- **Monorepo with npm workspaces**: Single repository for frontend and backend
- **Shared types package**: Common TypeScript types used by both apps (future enhancement)
- **Sharded documentation**: BMad's sharded doc structure in `docs/prd/` and `docs/architecture/`
- **Centralized testing**: E2E tests at root level; unit/integration tests colocated with apps
- **Environment files**: `.env` files in each app directory, not committed to Git

---

## 10. Development Workflow

### Initial Setup

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

### npm Scripts

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

### Development Ports

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express API)
- **Database**: `localhost:5432` (PostgreSQL)

### Git Workflow

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

### Code Quality Tools

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

### Debugging

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

## 11. Deployment Architecture

### Deployment Strategy

**MVP Deployment Plan:**
- **Frontend**: Vercel (static hosting with CDN)
- **Backend**: Railway (Node.js hosting)
- **Database**: Railway PostgreSQL (managed instance)

### Frontend Deployment (Vercel)

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

### Backend Deployment (Railway)

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

### Database Deployment (Railway PostgreSQL)

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

### CI/CD Pipeline (GitHub Actions)

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

### Monitoring & Logging (Post-MVP)

- **Application Monitoring**: Railway built-in metrics (CPU, memory, requests)
- **Logging**: Winston logs shipped to Railway logs dashboard
- **Error Tracking**: Consider Sentry integration for error monitoring
- **Uptime Monitoring**: UptimeRobot or similar for health checks

### Backup & Recovery

- **Database Backups**: Railway automatic daily backups
- **Manual Backup**: `pg_dump` via Railway CLI
- **Recovery Plan**: Restore from Railway backup or re-run migrations + seed

---

## 12. Security and Performance

### Security Considerations

#### Input Validation
- **All API inputs validated with Zod schemas** before processing
- **SQL Injection Prevention**: Prisma ORM uses parameterized queries
- **XSS Prevention**: React escapes output by default; avoid `dangerouslySetInnerHTML`

#### Environment Variables
- **Never commit `.env` files** to Git
- **Use `.env.example`** with dummy values for reference
- **Production secrets** managed in Vercel and Railway dashboards

#### CORS Configuration
```typescript
// apps/backend/src/server.ts
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

#### Content Security Policy (CSP)
- **Helmet.js** for basic security headers
- **CSP Header** to restrict script sources (prevent XSS)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

#### Rate Limiting (Post-MVP)
- Use `express-rate-limit` to prevent abuse
- Example: 100 requests per 15 minutes per IP

#### HTTPS
- **Development**: HTTP acceptable
- **Production**: Vercel and Railway enforce HTTPS automatically

### Performance Optimizations

#### Frontend Performance

**Code Splitting:**
- Vite automatically splits chunks
- Use lazy loading for routes:
  ```typescript
  const OrdersPage = React.lazy(() => import('./pages/Orders'));
  ```

**Image Optimization:**
- Serve images in modern formats (WebP)
- Use responsive images with `srcset`

**Caching:**
- Vercel CDN caches static assets
- Browser caching for API responses (Cache-Control headers)

**Bundle Size:**
- Monitor with `vite-plugin-bundle-visualizer`
- Tree-shake unused code
- Minimize dependencies

#### Backend Performance

**Database Query Optimization:**
- Use Prisma indexes on frequently queried fields (`status`, `driverId`, `createdAt`)
- Use `select` to fetch only needed fields:
  ```typescript
  prisma.order.findMany({
    select: { id: true, status: true, customerName: true },
  });
  ```
- Use `include` judiciously (avoid N+1 queries)

**Response Caching (Future):**
- Cache frequently accessed data (e.g., driver list) with Redis
- Invalidate cache on updates

**Connection Pooling:**
- Prisma handles connection pooling automatically
- Configure pool size for production:
  ```
  DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
  ```

**Pagination (Future):**
- Implement cursor-based pagination for large datasets
- Example:
  ```typescript
  prisma.order.findMany({
    take: 20,
    skip: 0,
    orderBy: { createdAt: 'desc' },
  });
  ```

#### Map Performance

**Marker Clustering:**
- Use Leaflet MarkerCluster plugin for many markers
- Reduces DOM nodes and improves rendering

**Lazy Load Maps:**
- Only load map components when needed (route lazy loading)

**Throttle Map Updates:**
- Avoid re-rendering map on every polling cycle
- Update only when data changes

### Monitoring & Metrics

**Key Metrics to Track:**
- **Response Time**: API endpoint latency (p50, p95, p99)
- **Error Rate**: Percentage of requests returning 5xx errors
- **Database Query Time**: Slow query detection
- **Frontend Load Time**: Time to Interactive (TTI)

**Tools (Post-MVP):**
- **Railway Metrics**: Built-in CPU, memory, request metrics
- **Vercel Analytics**: Frontend performance monitoring
- **Custom Logging**: Winston structured logs with request IDs for tracing

---

## 13. Testing Strategy

### Testing Pyramid

```mermaid
graph TB
    E2E[E2E Tests<br/>Playwright<br/>5-10 critical flows]
    Integration[Integration Tests<br/>Supertest + Vitest<br/>API endpoints + components]
    Unit[Unit Tests<br/>Jest + Vitest<br/>Services, utils, hooks]

    E2E --> Integration
    Integration --> Unit

    style E2E fill:#ffcccc
    style Integration fill:#ffe6cc
    style Unit fill:#ccffcc
```

**Test Distribution:**
- **Unit Tests**: 70% of test coverage
- **Integration Tests**: 20% of test coverage
- **E2E Tests**: 10% of test coverage

### Frontend Testing

#### Unit Tests (Vitest + React Testing Library)

**Test Files**: `apps/frontend/tests/unit/*.test.tsx`

**Example: OrderCard Component Test**

```typescript
// apps/frontend/tests/unit/OrderCard.test.tsx
import { render, screen } from '@testing-library/react';
import { OrderCard } from '../../src/components/OrderCard';
import { Order, OrderStatus } from '../../src/types';

describe('OrderCard', () => {
  const mockOrder: Order = {
    id: '123',
    customerName: 'John Doe',
    customerPhone: '555-1234',
    deliveryAddress: '123 Main St, Brooklyn, NY',
    orderDetails: 'Pizza and wings',
    status: OrderStatus.PENDING,
    driverId: null,
    createdAt: new Date(),
    assignedAt: null,
    inTransitAt: null,
    deliveredAt: null,
  };

  it('renders order details correctly', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Brooklyn, NY')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('shows assign button for PENDING orders', () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
  });
});
```

**Run Tests:**
```bash
npm run test --workspace=apps/frontend
```

#### Integration Tests (Vitest + React Testing Library)

**Test Files**: `apps/frontend/tests/integration/*.test.tsx`

**Example: OrdersPage Integration Test**

```typescript
// apps/frontend/tests/integration/OrdersPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrdersPage } from '../../src/pages/Orders';
import { apiClient } from '../../src/services/api/client';

jest.mock('../../src/services/api/client');

describe('OrdersPage', () => {
  it('fetches and displays orders on mount', async () => {
    const mockOrders = [
      { id: '1', customerName: 'Alice', status: 'PENDING' },
      { id: '2', customerName: 'Bob', status: 'DELIVERED' },
    ];

    (apiClient.getOrders as jest.Mock).mockResolvedValue({ orders: mockOrders });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('creates new order and refreshes list', async () => {
    (apiClient.createOrder as jest.Mock).mockResolvedValue({ order: { id: '3', customerName: 'Charlie' } });

    render(<OrdersPage />);

    const nameInput = screen.getByLabelText(/customer name/i);
    await userEvent.type(nameInput, 'Charlie');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiClient.createOrder).toHaveBeenCalled();
    });
  });
});
```

### Backend Testing

#### Unit Tests (Jest)

**Test Files**: `apps/backend/tests/unit/*.test.ts`

**Example: OrderService Unit Test**

```typescript
// apps/backend/tests/unit/order.service.test.ts
import { orderService } from '../../src/services/order.service';
import prisma from '../../src/db/client';
import { OrderStatus } from '@prisma/client';

jest.mock('../../src/db/client', () => ({
  __esModule: true,
  default: {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    driver: {
      findUnique: jest.fn(),
    },
  },
}));

describe('OrderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates order with geocoded coordinates', async () => {
      const mockOrder = {
        id: '123',
        customerName: 'John',
        customerPhone: '555-1234',
        deliveryAddress: '123 Main St',
        orderDetails: 'Pizza',
        status: OrderStatus.PENDING,
        latitude: 40.7128,
        longitude: -74.006,
      };

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.create({
        customerName: 'John',
        customerPhone: '555-1234',
        deliveryAddress: '123 Main St',
        orderDetails: 'Pizza',
      });

      expect(result).toEqual(mockOrder);
      expect(prisma.order.create).toHaveBeenCalled();
    });
  });

  describe('assignToDriver', () => {
    it('throws error if driver is unavailable', async () => {
      (prisma.driver.findUnique as jest.Mock).mockResolvedValue({
        id: 'driver-1',
        isAvailable: false,
      });

      await expect(
        orderService.assignToDriver('order-1', 'driver-1')
      ).rejects.toThrow('Driver is not available');
    });
  });
});
```

**Run Tests:**
```bash
npm run test --workspace=apps/backend
```

#### Integration Tests (Supertest)

**Test Files**: `apps/backend/tests/integration/*.test.ts`

**Example: Orders API Integration Test**

```typescript
// apps/backend/tests/integration/orders.api.test.ts
import request from 'supertest';
import app from '../../src/server';
import prisma from '../../src/db/client';

describe('Orders API', () => {
  beforeEach(async () => {
    await prisma.order.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/orders', () => {
    it('creates new order with valid data', async () => {
      const orderData = {
        customerName: 'Jane Doe',
        customerPhone: '555-5678',
        deliveryAddress: '456 Elm St, Brooklyn, NY',
        orderDetails: 'Burger and fries',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.order).toMatchObject({
        customerName: 'Jane Doe',
        status: 'PENDING',
      });
      expect(response.body.order.id).toBeDefined();
    });

    it('returns 400 for invalid data', async () => {
      const invalidData = {
        customerName: '',
        customerPhone: 'invalid',
      };

      await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PATCH /api/orders/:id/assign', () => {
    it('assigns order to available driver', async () => {
      const driver = await prisma.driver.create({
        data: { name: 'Driver 1', isAvailable: true },
      });

      const order = await prisma.order.create({
        data: {
          customerName: 'Test',
          customerPhone: '555-0000',
          deliveryAddress: 'Test St',
          orderDetails: 'Test order',
          status: 'PENDING',
        },
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/assign`)
        .send({ driverId: driver.id })
        .expect(200);

      expect(response.body.order.driverId).toBe(driver.id);
      expect(response.body.order.status).toBe('ASSIGNED');
    });
  });
});
```

### End-to-End Tests (Playwright)

**Test Files**: `tests/e2e/*.spec.ts`

**Example: Order Creation Flow**

```typescript
// tests/e2e/orders.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Order Management', () => {
  test('complete order creation and assignment flow', async ({ page }) => {
    // Navigate to orders page
    await page.goto('http://localhost:5173/orders');

    // Fill in order form
    await page.fill('input[name="customerName"]', 'E2E Test Customer');
    await page.fill('input[name="customerPhone"]', '555-9999');
    await page.fill('input[name="deliveryAddress"]', '789 Test Ave, Brooklyn, NY');
    await page.fill('textarea[name="orderDetails"]', 'Test order details');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify order appears in list
    await expect(page.locator('text=E2E Test Customer')).toBeVisible();
    await expect(page.locator('text=PENDING')).toBeVisible();

    // Assign to driver
    await page.selectOption('select[name="driverId"]', { index: 1 });
    await page.click('button:has-text("Assign")');

    // Verify status changed
    await expect(page.locator('text=ASSIGNED')).toBeVisible();
  });
});
```

**Run E2E Tests:**
```bash
npm run test:e2e
```

### Test Coverage Goals

- **Overall Coverage**: 70%+ lines covered
- **Critical Paths**: 100% coverage for core business logic (order assignment, status transitions)
- **API Endpoints**: 100% coverage for all REST endpoints
- **Components**: 80%+ coverage for UI components

**Generate Coverage Report:**
```bash
# Frontend
npm run test -- --coverage --workspace=apps/frontend

# Backend
npm run test -- --coverage --workspace=apps/backend
```

### Continuous Testing

- **Pre-commit Hook**: Run linting and format check
- **CI Pipeline**: Run all tests on every PR
- **Coverage Enforcement**: Fail CI if coverage drops below 70%

---

## 14. Coding Standards

### TypeScript Guidelines

#### Strict Mode Configuration
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

#### Type Definitions

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

#### Interface vs Type

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

### Naming Conventions

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

### Code Organization

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

### React Best Practices

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

### Backend Best Practices

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

### Code Comments

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

### Linting and Formatting

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

## 15. Error Handling Strategy

### Error Handling Flow

```mermaid
graph LR
    User[User Action]
    FE[Frontend]
    API[API Client]
    BE[Backend Route]
    Validation[Validation Middleware]
    Controller[Controller]
    Service[Service Layer]
    DB[(Database)]

    User --> FE
    FE --> API
    API -->|HTTP Request| BE
    BE --> Validation
    Validation -->|Valid| Controller
    Validation -->|Invalid| ErrorHandler[Error Handler]
    Controller --> Service
    Service --> DB
    DB -->|Error| Service
    Service -->|Business Error| Controller
    Controller --> ErrorHandler
    ErrorHandler -->|JSON Error Response| API
    API -->|Display Error| FE
    FE -->|Show to User| User

    style ErrorHandler fill:#ffcccc
    style Validation fill:#fff3e0
```

### Error Response Format

All errors follow a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: any;          // Optional additional context (e.g., validation errors)
  };
}
```

**Example Error Responses:**

```json
// Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "issues": [
        {
          "path": ["body", "customerName"],
          "message": "String must contain at least 1 character(s)"
        }
      ]
    }
  }
}

// Not Found Error
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found"
  }
}

// Business Logic Error
{
  "error": {
    "code": "DRIVER_UNAVAILABLE",
    "message": "Driver is not available for assignment"
  }
}
```

### Frontend Error Handling

#### API Client Error Handling

**Custom ApiError Class** (`apps/frontend/src/services/api/client.ts`):

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isValidationError() {
    return this.code === 'VALIDATION_ERROR';
  }

  isNotFoundError() {
    return this.statusCode === 404;
  }
}
```

**Error Handling in API Client:**

```typescript
async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error?.message || 'Request failed',
        response.status,
        errorData.error?.code,
        errorData.error?.details
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors or other issues
    throw new ApiError('Network error occurred', 0);
  }
}
```

#### Component-Level Error Handling

**Display Errors to User:**

```typescript
export function OrderForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (data: CreateOrderRequest) => {
    try {
      setError(null);
      setFieldErrors({});
      await apiClient.createOrder(data);
      // Success handling...
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.details?.issues) {
          // Map Zod errors to form fields
          const errors: Record<string, string> = {};
          err.details.issues.forEach((issue: any) => {
            const field = issue.path[issue.path.length - 1];
            errors[field] = issue.message;
          });
          setFieldErrors(errors);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert variant="destructive">{error}</Alert>}
      <Input name="customerName" error={fieldErrors.customerName} />
      {/* ... */}
    </form>
  );
}
```

#### Global Error Boundary

**React Error Boundary Component** (`apps/frontend/src/components/ErrorBoundary.tsx`):

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    // Future: Send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Backend Error Handling

#### Custom Error Classes

**File**: `apps/backend/src/utils/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400);
  }
}
```

#### Error Handler Middleware

**File**: `apps/backend/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: { issues: err.errors },
      },
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists',
          details: { fields: err.meta?.target },
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    }
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Default 500 error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : err.message,
    },
  });
}
```

#### Using Errors in Services

```typescript
import { AppError, NotFoundError, BusinessLogicError } from '../utils/errors';

export class OrderService {
  async assignToDriver(orderId: string, driverId: string): Promise<Order> {
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundError('Driver');
    }

    if (!driver.isAvailable) {
      throw new BusinessLogicError('DRIVER_UNAVAILABLE', 'Driver is not available');
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BusinessLogicError(
        'INVALID_TRANSITION',
        'Order must be in PENDING status to assign'
      );
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { driverId, status: OrderStatus.ASSIGNED, assignedAt: new Date() },
    });
  }
}
```

### Logging Strategy

**Winston Logger Configuration** (`apps/backend/src/utils/logger.ts`):

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'delivery-manager-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
```

**Logging Examples:**

```typescript
// Info logging
logger.info('Order created', { orderId: order.id, customerId: order.customerId });

// Error logging
logger.error('Failed to assign order', {
  orderId,
  driverId,
  error: error.message
});

// Warning logging
logger.warn('Geocoding failed, using null coordinates', {
  address: order.deliveryAddress
});
```

### Error Categories

**4xx Client Errors:**
- `400 Bad Request`: Validation errors, business logic violations
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., unique constraint violation)

**5xx Server Errors:**
- `500 Internal Server Error`: Unexpected errors, database failures, unhandled exceptions

**Custom Error Codes:**
- `VALIDATION_ERROR`: Request body/params failed validation
- `NOT_FOUND`: Resource not found
- `DRIVER_UNAVAILABLE`: Driver not available for assignment
- `INVALID_TRANSITION`: Invalid order status transition
- `INTERNAL_ERROR`: Catch-all for unexpected errors

---

## 16. Conclusion and Next Steps

### Architecture Summary

This architecture document defines a comprehensive full-stack design for the Delivery Manager Application MVP. The system leverages:

- **Modern TypeScript Stack**: Type safety across frontend and backend
- **React + Vite Frontend**: Fast development with shadcn/ui for polished UI
- **Node.js + Express Backend**: RESTful API with clear separation of concerns
- **PostgreSQL + Prisma**: Type-safe database access with migrations
- **Polling-Based Updates**: Simple 30-second polling for status synchronization
- **Comprehensive Testing**: Full testing pyramid with unit, integration, and E2E tests
- **Deployment Ready**: Vercel (frontend) + Railway (backend + database)

### Key Architectural Strengths

1. **Simplicity**: Clean, understandable patterns suitable for MVP development
2. **Type Safety**: TypeScript throughout reduces bugs and improves DX
3. **Scalability Path**: Architecture supports future enhancements (WebSockets, caching, microservices)
4. **Developer Experience**: Fast feedback loops, hot reload, clear error messages
5. **Production Ready**: Structured logging, error handling, and deployment pipeline

### Implementation Readiness

This architecture is **ready for implementation** by the Dev agent. All major technical decisions have been documented:

- ✅ Complete data models and database schema
- ✅ Full API specification with endpoints and payloads
- ✅ Frontend component hierarchy and state management
- ✅ Backend service architecture with clear responsibilities
- ✅ Testing strategy with examples
- ✅ Deployment plan and CI/CD workflow
- ✅ Error handling and logging approach

### Next Steps

**Immediate Actions:**

1. **Validate Architecture**:
   - Run `/BMad:architect-checklist` to validate completeness
   - Review any flagged gaps or concerns
   - Address any blockers before proceeding

2. **Hand Off to Dev Agent**:
   - Switch to `/BMad:agents:dev` agent
   - Dev agent will load this architecture document
   - Begin implementation of Epic 1: Project Setup and Foundation

3. **Iterative Development**:
   - Implement stories sequentially within each epic
   - Run tests continuously (TDD approach where applicable)
   - Validate each feature against acceptance criteria

**Post-MVP Enhancements** (deferred to future iterations):

- **Real-time Updates**: Replace polling with WebSockets for instant status updates
- **Smart Route Optimization**: Implement nearest-neighbor or TSP algorithms
- **Driver Mobile View**: Mobile-friendly interface for drivers
- **Customer Tracking Portal**: Public page for customers to track orders
- **Advanced Analytics**: Dashboard with delivery metrics and performance insights
- **Authentication**: User login, role-based access control
- **Multi-restaurant Support**: Tenant isolation for multiple restaurants

### Final Notes

This architecture balances **simplicity for MVP** with **extensibility for growth**. The design intentionally avoids over-engineering while maintaining clean patterns that support future iteration.

The project is now ready for hands-on development. Good luck building the Delivery Manager Application! 🚀
