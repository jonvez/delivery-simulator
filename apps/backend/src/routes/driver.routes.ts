import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createDriverSchema, updateDriverSchema } from '../schemas/driver.schema';
import { driverService } from '../services/driver.service';
import { Prisma } from '@prisma/client';

const router = Router();

/**
 * POST /api/drivers
 * Create a new driver
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createDriverSchema.parse(req.body);
    const driver = await driverService.createDriver(data);
    res.status(201).json(driver);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.errors,
        },
      });
    }
    next(error);
  }
});

/**
 * GET /api/drivers
 * Get all drivers
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/drivers/:id
 * Get a single driver by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        error: {
          message: 'Driver not found',
        },
      });
    }

    res.json(driver);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/drivers/:id
 * Update a driver
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateDriverSchema.parse(req.body);
    const driver = await driverService.updateDriver(req.params.id, data);
    res.json(driver);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.errors,
        },
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({
        error: {
          message: 'Driver not found',
        },
      });
    }

    next(error);
  }
});

/**
 * DELETE /api/drivers/:id
 * Delete a driver
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverService.deleteDriver(req.params.id);
    res.json(driver);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({
        error: {
          message: 'Driver not found',
        },
      });
    }

    next(error);
  }
});

export default router;
