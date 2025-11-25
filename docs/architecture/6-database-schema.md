# 6. Database Schema

## Prisma Schema Definition

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

## Schema Design Decisions

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

## Migration Strategy

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

## Database Connection

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
