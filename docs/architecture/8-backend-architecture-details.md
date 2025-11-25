# 8. Backend Architecture Details

## Application Structure

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

## Controllers

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

## Services

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

## Validation Middleware

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

## Route Service (Simple Route Calculation)

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

## Logging

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
