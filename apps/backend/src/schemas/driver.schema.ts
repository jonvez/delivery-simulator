import { z } from 'zod';

/**
 * Schema for creating a new driver
 * Story 3.1: Driver Database Schema and API Endpoints
 */
export const createDriverSchema = z.object({
  name: z.string().min(1, 'Driver name is required').max(255, 'Driver name must be less than 255 characters'),
  isAvailable: z.boolean().default(true),
});

/**
 * Schema for updating a driver
 */
export const updateDriverSchema = z.object({
  name: z.string().min(1, 'Driver name is required').max(255, 'Driver name must be less than 255 characters').optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateDriverInput = z.input<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
