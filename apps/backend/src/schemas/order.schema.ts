import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// Order status enum schema
export const orderStatusSchema = z.nativeEnum(OrderStatus);

// Create order schema - for POST /api/orders
export const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(255),
  customerPhone: z.string().min(1, 'Customer phone is required').max(50),
  deliveryAddress: z.string().min(1, 'Delivery address is required').max(500),
  orderDetails: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Update order schema - for PATCH /api/orders/:id
export const updateOrderSchema = z.object({
  customerName: z.string().min(1).max(255).optional(),
  customerPhone: z.string().min(1).max(50).optional(),
  deliveryAddress: z.string().min(1).max(500).optional(),
  orderDetails: z.string().max(1000).optional().nullable(),
  status: orderStatusSchema.optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// Planogram-compliance review schema - for PATCH /api/orders/:id/planogram (Issue #4)
// `planogramReviewed` is REQUIRED. We accept a real boolean or the string forms
// "true"/"false" (form/query sources) but do NOT use `z.coerce.boolean()`, which
// would silently turn a missing field into `false` instead of failing validation.
// Notes are length-bounded to avoid unbounded storage / log volume.
const coercedBoolean = z.union([
  z.boolean(),
  z.literal('true').transform(() => true),
  z.literal('false').transform(() => false),
]);

export const reviewPlanogramSchema = z.object({
  planogramReviewed: coercedBoolean,
  planogramNotes: z.string().max(1000, 'Notes must be 1000 characters or fewer').nullable().optional(),
});

export type ReviewPlanogramInput = z.infer<typeof reviewPlanogramSchema>;

// Query params schema - for GET /api/orders
export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
