import { Order, OrderStatus, Prisma } from '@prisma/client';
import prisma from '../db/client';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order.schema';

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
   */
  async getAllOrders(filters?: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = filters?.status
      ? { status: filters.status }
      : {};

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
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
}

export const orderService = new OrderService();
