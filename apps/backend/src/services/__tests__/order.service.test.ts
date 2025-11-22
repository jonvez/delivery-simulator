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
});
