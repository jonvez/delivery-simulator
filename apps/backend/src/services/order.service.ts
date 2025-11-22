import { Order, OrderStatus, Prisma } from '@prisma/client';
import prisma from '../db/client';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order.schema';

// Type for order with driver information - Story 3.4
type OrderWithDriver = Prisma.OrderGetPayload<{
  include: { driver: true };
}>;

export class OrderService {
  /**
   * Create a new order with status PENDING
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    return prisma.order.create({
      data: {
        ...data,
        status: OrderStatus.PENDING,
      },
    });
  }

  /**
   * Get all orders with optional status filter
   * Story 3.4: Include driver information
   */
  async getAllOrders(filters?: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
  }): Promise<OrderWithDriver[]> {
    const where: Prisma.OrderWhereInput = filters?.status
      ? { status: filters.status }
      : {};

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
      include: {
        driver: true,
      },
    });
  }

  /**
   * Get a single order by ID
   * Story 3.4: Include driver information
   */
  async getOrderById(id: string): Promise<OrderWithDriver | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        driver: true,
      },
    });
  }

  /**
   * Update an order and automatically set timestamps based on status transitions
   */
  async updateOrder(id: string, data: UpdateOrderInput): Promise<Order> {
    const updateData: Prisma.OrderUpdateInput = { ...data };

    // Automatically set timestamps when status changes
    if (data.status) {
      switch (data.status) {
        case OrderStatus.ASSIGNED:
          updateData.assignedAt = new Date();
          break;
        case OrderStatus.IN_TRANSIT:
          updateData.inTransitAt = new Date();
          break;
        case OrderStatus.DELIVERED:
          updateData.deliveredAt = new Date();
          break;
      }
    }

    return prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<Order> {
    return prisma.order.delete({
      where: { id },
    });
  }

  /**
   * Get order count by status
   */
  async getOrderCountByStatus(): Promise<Record<OrderStatus, number>> {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    const result: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.ASSIGNED]: 0,
      [OrderStatus.IN_TRANSIT]: 0,
      [OrderStatus.DELIVERED]: 0,
    };

    counts.forEach((count) => {
      result[count.status] = count._count;
    });

    return result;
  }

  /**
   * Assign an order to a driver
   * Story 3.5: Implement Order Assignment to Drivers
   */
  async assignOrderToDriver(orderId: string, driverId: string): Promise<OrderWithDriver> {
    // Verify driver exists and is available
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    if (!driver.isAvailable) {
      throw new Error('Driver is not available for assignment');
    }

    // Update order with driver assignment and set status to ASSIGNED
    return prisma.order.update({
      where: { id: orderId },
      data: {
        driverId,
        status: OrderStatus.ASSIGNED,
        assignedAt: new Date(),
      },
      include: {
        driver: true,
      },
    });
  }
}

export const orderService = new OrderService();
