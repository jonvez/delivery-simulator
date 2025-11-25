import { Router, Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import {
  createOrderSchema,
  updateOrderSchema,
  orderQuerySchema,
} from '../schemas/order.schema';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

const router = Router();

// POST /api/orders - Create a new order
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(validatedData);

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    next(error);
  }
});

// GET /api/orders - Get all orders with optional filtering
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedQuery = orderQuerySchema.parse(req.query);
    const orders = await orderService.getAllOrders(validatedQuery);

    res.json(orders);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors,
      });
      return;
    }
    next(error);
  }
});

// PATCH /api/orders/:id/assign - Assign order to driver
// Story 3.5: Implement Order Assignment to Drivers
// Story 3.6: Extended to support reassignment
// IMPORTANT: This route must come BEFORE /:id routes to avoid path matching issues
router.patch('/:id/assign', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId || typeof driverId !== 'string') {
      res.status(400).json({
        error: 'driverId is required and must be a string',
      });
      return;
    }

    const order = await orderService.assignOrderToDriver(id, driverId);

    res.json(order);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      if (error.message === 'Driver not found') {
        res.status(404).json({ error: 'Driver not found' });
        return;
      }
      if (error.message === 'Driver is not available for assignment') {
        res.status(400).json({ error: 'Driver is not available for assignment' });
        return;
      }
      if (error.message === 'Cannot reassign a delivered order') {
        res.status(400).json({ error: 'Cannot reassign a delivered order' });
        return;
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Order not found',
        });
        return;
      }
    }
    next(error);
  }
});

// GET /api/orders/:id - Get a single order by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
      });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id - Update an order
router.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateOrderSchema.parse(req.body);

    const order = await orderService.updateOrder(id, validatedData);

    res.json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Order not found',
        });
        return;
      }
    }
    next(error);
  }
});

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).json({
          error: 'Order not found',
        });
        return;
      }
    }
    next(error);
  }
});

export default router;
