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
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(validatedData);

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    next(error);
  }
});

// GET /api/orders - Get all orders with optional filtering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = orderQuerySchema.parse(req.query);
    const orders = await orderService.getAllOrders(validatedQuery);

    res.json(orders);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors,
      });
    }
    next(error);
  }
});

// GET /api/orders/:id - Get a single order by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id - Update an order
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateOrderSchema.parse(req.body);

    const order = await orderService.updateOrder(id, validatedData);

    res.json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Order not found',
        });
      }
    }
    next(error);
  }
});

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.deleteOrder(id);

    res.json({
      message: 'Order deleted successfully',
      order,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Order not found',
        });
      }
    }
    next(error);
  }
});

export default router;
