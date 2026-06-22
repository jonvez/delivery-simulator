import { OrderService } from '../order.service';
import { OrderStatus } from '@prisma/client';
import prisma from '../../db/client';

// Mock the Prisma client
jest.mock('../../db/client', () => ({
  __esModule: true,
  default: {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order with PENDING status', async () => {
      const mockOrderData = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: 'Leave at door',
      };

      const mockCreatedOrder = {
        id: 'test-id-123',
        ...mockOrderData,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.create as any).mockResolvedValue(mockCreatedOrder);

      const result = await orderService.createOrder(mockOrderData);

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          ...mockOrderData,
          status: OrderStatus.PENDING,
          latitude: expect.any(Number),
          longitude: expect.any(Number),
        },
      });
      expect(result).toEqual(mockCreatedOrder);
      expect(result.status).toBe(OrderStatus.PENDING);
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders without filters', async () => {
      const mockOrders = [
        {
          id: '1',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
          deliveryAddress: '123 Main St',
          orderDetails: null,
          status: OrderStatus.PENDING,
          createdAt: new Date(),
          assignedAt: null,
          inTransitAt: null,
          deliveredAt: null,
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: undefined,
        include: { driver: true },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should filter orders by status', async () => {
      const mockOrders = [
        {
          id: '1',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
          deliveryAddress: '123 Main St',
          orderDetails: null,
          status: OrderStatus.DELIVERED,
          createdAt: new Date(),
          assignedAt: new Date(),
          inTransitAt: new Date(),
          deliveredAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders({
        status: OrderStatus.DELIVERED,
      });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { status: OrderStatus.DELIVERED },
        orderBy: { createdAt: 'desc' },
        take: undefined,
        skip: undefined,
        include: { driver: true },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should apply pagination with limit and offset', async () => {
      (mockPrisma.order.findMany as any).mockResolvedValue([]);

      await orderService.getAllOrders({
        limit: 10,
        offset: 20,
      });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20,
        include: { driver: true },
      });
    });
  });

  describe('getOrderById', () => {
    it('should return an order when found', async () => {
      const mockOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('test-id-123');

      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        include: { driver: true },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      (mockPrisma.order.findUnique as any).mockResolvedValue(null);

      const result = await orderService.getOrderById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateOrder', () => {
    it('should update basic order fields', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'Jane Doe',
        customerPhone: '+9876543210',
        deliveryAddress: '456 Oak Ave',
        orderDetails: 'Ring doorbell',
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrder('test-id-123', {
        customerName: 'Jane Doe',
        customerPhone: '+9876543210',
      });

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: {
          customerName: 'Jane Doe',
          customerPhone: '+9876543210',
        },
      });
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should set assignedAt when status changes to ASSIGNED', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.ASSIGNED,
        createdAt: new Date(),
        assignedAt: new Date(),
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      await orderService.updateOrder('test-id-123', {
        status: OrderStatus.ASSIGNED,
      });

      const callArgs = (mockPrisma.order.update as any).mock.calls[0][0];
      expect(callArgs.data.status).toBe(OrderStatus.ASSIGNED);
      expect(callArgs.data.assignedAt).toBeInstanceOf(Date);
    });

    it('should set inTransitAt when status changes to IN_TRANSIT', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.IN_TRANSIT,
        createdAt: new Date(),
        assignedAt: new Date(),
        inTransitAt: new Date(),
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      await orderService.updateOrder('test-id-123', {
        status: OrderStatus.IN_TRANSIT,
      });

      const callArgs = (mockPrisma.order.update as any).mock.calls[0][0];
      expect(callArgs.data.status).toBe(OrderStatus.IN_TRANSIT);
      expect(callArgs.data.inTransitAt).toBeInstanceOf(Date);
    });

    it('should set deliveredAt when status changes to DELIVERED', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.DELIVERED,
        createdAt: new Date(),
        assignedAt: new Date(),
        inTransitAt: new Date(),
        deliveredAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      await orderService.updateOrder('test-id-123', {
        status: OrderStatus.DELIVERED,
      });

      const callArgs = (mockPrisma.order.update as any).mock.calls[0][0];
      expect(callArgs.data.status).toBe(OrderStatus.DELIVERED);
      expect(callArgs.data.deliveredAt).toBeInstanceOf(Date);
    });

    it('should not set timestamp when status is PENDING', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      await orderService.updateOrder('test-id-123', {
        status: OrderStatus.PENDING,
      });

      const callArgs = (mockPrisma.order.update as any).mock.calls[0][0];
      expect(callArgs.data.status).toBe(OrderStatus.PENDING);
      expect(callArgs.data.assignedAt).toBeUndefined();
      expect(callArgs.data.inTransitAt).toBeUndefined();
      expect(callArgs.data.deliveredAt).toBeUndefined();
    });
  });

  describe('reviewPlanogram', () => {
    it('should set planogramReviewed and planogramNotes on the order', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.PENDING,
        planogramReviewed: true,
        planogramNotes: 'Endcap reset complete',
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.reviewPlanogram('test-id-123', {
        planogramReviewed: true,
        planogramNotes: 'Endcap reset complete',
      });

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: {
          planogramReviewed: true,
          planogramNotes: 'Endcap reset complete',
        },
      });
      expect(result).toEqual(mockUpdatedOrder);
      expect(result.planogramReviewed).toBe(true);
      expect(result.planogramNotes).toBe('Endcap reset complete');
    });

    it('should allow clearing planogramNotes by passing null', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.PENDING,
        planogramReviewed: false,
        planogramNotes: null,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      await orderService.reviewPlanogram('test-id-123', {
        planogramReviewed: false,
        planogramNotes: null,
      });

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: {
          planogramReviewed: false,
          planogramNotes: null,
        },
      });
    });

    it('should update only planogramReviewed when notes are omitted', async () => {
      const mockUpdatedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.PENDING,
        planogramReviewed: true,
        planogramNotes: null,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.update as any).mockResolvedValue(mockUpdatedOrder);

      await orderService.reviewPlanogram('test-id-123', {
        planogramReviewed: true,
      });

      const callArgs = (mockPrisma.order.update as any).mock.calls[0][0];
      expect(callArgs.where).toEqual({ id: 'test-id-123' });
      expect(callArgs.data.planogramReviewed).toBe(true);
      expect(callArgs.data).not.toHaveProperty('planogramNotes');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order by id', async () => {
      const mockDeletedOrder = {
        id: 'test-id-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        deliveryAddress: '123 Main St',
        orderDetails: null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        assignedAt: null,
        inTransitAt: null,
        deliveredAt: null,
        updatedAt: new Date(),
      };

      (mockPrisma.order.delete as any).mockResolvedValue(mockDeletedOrder);

      const result = await orderService.deleteOrder('test-id-123');

      expect(mockPrisma.order.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
      expect(result).toEqual(mockDeletedOrder);
    });
  });

  describe('getOrderCountByStatus', () => {
    it('should return counts for all statuses', async () => {
      const mockCounts = [
        { status: OrderStatus.PENDING, _count: 5 },
        { status: OrderStatus.ASSIGNED, _count: 3 },
        { status: OrderStatus.IN_TRANSIT, _count: 2 },
        { status: OrderStatus.DELIVERED, _count: 10 },
      ];

      (mockPrisma.order.groupBy as any).mockResolvedValue(mockCounts);

      const result = await orderService.getOrderCountByStatus();

      expect(mockPrisma.order.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: true,
      });
      expect(result).toEqual({
        [OrderStatus.PENDING]: 5,
        [OrderStatus.ASSIGNED]: 3,
        [OrderStatus.IN_TRANSIT]: 2,
        [OrderStatus.DELIVERED]: 10,
      });
    });

    it('should return zero counts for missing statuses', async () => {
      const mockCounts = [
        { status: OrderStatus.PENDING, _count: 5 },
      ];

      (mockPrisma.order.groupBy as any).mockResolvedValue(mockCounts);

      const result = await orderService.getOrderCountByStatus();

      expect(result).toEqual({
        [OrderStatus.PENDING]: 5,
        [OrderStatus.ASSIGNED]: 0,
        [OrderStatus.IN_TRANSIT]: 0,
        [OrderStatus.DELIVERED]: 0,
      });
    });
  });

  describe('getOrdersByStore (Per-Account view aggregation)', () => {
    // Helper to build a minimal order record as Prisma would return it.
    const makeOrder = (overrides: Partial<any>): any => ({
      id: 'order-id',
      customerName: 'QuickStop #1',
      customerPhone: '+1234567890',
      deliveryAddress: '123 Main St, Brooklyn, NY 11201',
      orderDetails: null,
      status: OrderStatus.DELIVERED,
      latitude: null,
      longitude: null,
      driverId: null,
      createdAt: new Date('2026-01-01T10:00:00Z'),
      assignedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      updatedAt: new Date('2026-01-01T10:00:00Z'),
      ...overrides,
    });

    it('returns an empty array when there are no orders', async () => {
      (mockPrisma.order.findMany as any).mockResolvedValue([]);

      const result = await orderService.getOrdersByStore();

      expect(mockPrisma.order.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('aggregates one store account into total stops, total drops, and last visit', async () => {
      const orders = [
        makeOrder({
          id: 'a1',
          customerName: 'QuickStop #1',
          deliveryAddress: '123 Main St, Brooklyn, NY 11201',
          status: OrderStatus.DELIVERED,
          createdAt: new Date('2026-01-01T10:00:00Z'),
          deliveredAt: new Date('2026-01-01T12:00:00Z'),
        }),
        makeOrder({
          id: 'a2',
          customerName: 'QuickStop #1',
          deliveryAddress: '123 Main St, Brooklyn, NY 11201',
          status: OrderStatus.DELIVERED,
          createdAt: new Date('2026-01-05T10:00:00Z'),
          deliveredAt: new Date('2026-01-05T13:30:00Z'),
        }),
        makeOrder({
          id: 'a3',
          customerName: 'QuickStop #1',
          deliveryAddress: '123 Main St, Brooklyn, NY 11201',
          status: OrderStatus.PENDING,
          createdAt: new Date('2026-01-10T10:00:00Z'),
          deliveredAt: null,
        }),
      ];

      (mockPrisma.order.findMany as any).mockResolvedValue(orders);

      const result = await orderService.getOrdersByStore();

      expect(result).toHaveLength(1);
      const account = result[0];
      expect(account.storeAccount).toBe('QuickStop #1');
      expect(account.storeAddress).toBe('123 Main St, Brooklyn, NY 11201');
      // All three stops count toward total stops; only delivered ones are drops.
      expect(account.totalStops).toBe(3);
      expect(account.totalDrops).toBe(2);
      // Last visit is the most recent deliveredAt, serialized as ISO string.
      expect(account.lastVisit).toBe(new Date('2026-01-05T13:30:00Z').toISOString());
      // History contains every stop for the account, newest first.
      expect(account.history).toHaveLength(3);
      expect(account.history.map((h: any) => h.id)).toEqual(['a3', 'a2', 'a1']);
    });

    it('reports lastVisit as null when an account has no delivered stops', async () => {
      const orders = [
        makeOrder({
          id: 'b1',
          customerName: 'Corner Market',
          status: OrderStatus.PENDING,
          deliveredAt: null,
        }),
        makeOrder({
          id: 'b2',
          customerName: 'Corner Market',
          status: OrderStatus.ASSIGNED,
          deliveredAt: null,
        }),
      ];

      (mockPrisma.order.findMany as any).mockResolvedValue(orders);

      const result = await orderService.getOrdersByStore();

      expect(result).toHaveLength(1);
      expect(result[0].totalStops).toBe(2);
      expect(result[0].totalDrops).toBe(0);
      expect(result[0].lastVisit).toBeNull();
    });

    it('groups multiple store accounts and sorts them by most recent visit first', async () => {
      const orders = [
        makeOrder({
          id: 'older',
          customerName: 'Older Account',
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date('2026-01-02T09:00:00Z'),
        }),
        makeOrder({
          id: 'newer',
          customerName: 'Newer Account',
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date('2026-03-15T09:00:00Z'),
        }),
        makeOrder({
          id: 'never',
          customerName: 'Never Visited',
          status: OrderStatus.PENDING,
          deliveredAt: null,
        }),
      ];

      (mockPrisma.order.findMany as any).mockResolvedValue(orders);

      const result = await orderService.getOrdersByStore();

      expect(result.map((a: any) => a.storeAccount)).toEqual([
        'Newer Account',
        'Older Account',
        'Never Visited',
      ]);
    });
  });
});
