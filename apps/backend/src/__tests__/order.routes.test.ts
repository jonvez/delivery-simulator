import request from 'supertest';
import app from '../server';
import { setupTests, teardownTests, cleanDatabase, testPrisma } from './setup';
import { OrderStatus } from '@prisma/client';

/**
 * Integration Tests for Order Routes
 * Story 5.4: Add Integration Tests for API Endpoints
 *
 * Tests all order endpoints with real database operations
 */

describe('Order Routes Integration Tests', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerPhone: '+11234567890',
        deliveryAddress: '123 Main St, Brooklyn, NY 11201',
        orderDetails: '2 Large Pizzas',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toMatchObject({
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        orderDetails: orderData.orderDetails,
        status: OrderStatus.PENDING,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should create order without optional orderDetails', async () => {
      const orderData = {
        customerName: 'Jane Smith',
        customerPhone: '+19876543210',
        deliveryAddress: '456 Elm St, Brooklyn, NY 11215',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.orderDetails).toBeNull();
      expect(response.body.status).toBe(OrderStatus.PENDING);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        customerName: 'Test User',
        // Missing customerPhone and deliveryAddress
      };

      await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);
    });

    it('should geocode Brooklyn addresses automatically', async () => {
      const orderData = {
        customerName: 'Test User',
        customerPhone: '+11111111111',
        deliveryAddress: '123 Bedford Ave, Brooklyn, NY 11249',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // Should have coordinates from Brooklyn addresses
      expect(response.body.latitude).toBeDefined();
      expect(response.body.longitude).toBeDefined();
    });
  });

  describe('GET /api/orders', () => {
    it('should return empty array when no orders exist', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all orders', async () => {
      // Create test orders
      await testPrisma.order.createMany({
        data: [
          {
            customerName: 'User 1',
            customerPhone: '+11111111111',
            deliveryAddress: 'Address 1',
            status: OrderStatus.PENDING,
          },
          {
            customerName: 'User 2',
            customerPhone: '+12222222222',
            deliveryAddress: 'Address 2',
            status: OrderStatus.DELIVERED,
          },
        ],
      });

      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].customerName).toBeDefined();
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a specific order by ID', async () => {
      const order = await testPrisma.order.create({
        data: {
          customerName: 'Specific User',
          customerPhone: '+13333333333',
          deliveryAddress: 'Specific Address',
          status: OrderStatus.PENDING,
        },
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .expect(200);

      expect(response.body.id).toBe(order.id);
      expect(response.body.customerName).toBe('Specific User');
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/api/orders/${fakeId}`)
        .expect(404);
    });
  });

  describe('PATCH /api/orders/:id', () => {
    it('should update order status', async () => {
      const order = await testPrisma.order.create({
        data: {
          customerName: 'Update Test',
          customerPhone: '+14444444444',
          deliveryAddress: 'Update Address',
          status: OrderStatus.PENDING,
        },
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}`)
        .send({ status: OrderStatus.IN_TRANSIT })
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.IN_TRANSIT);
      expect(response.body.inTransitAt).toBeDefined();
    });

    it('should update assignedAt timestamp when status changes to ASSIGNED', async () => {
      const driver = await testPrisma.driver.create({
        data: { name: 'Test Driver', isAvailable: true },
      });

      const order = await testPrisma.order.create({
        data: {
          customerName: 'Test',
          customerPhone: '+15555555555',
          deliveryAddress: 'Test Address',
          status: OrderStatus.PENDING,
        },
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/assign`)
        .send({
          driverId: driver.id,
        })
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.ASSIGNED);
      expect(response.body.driverId).toBe(driver.id);
      expect(response.body.assignedAt).toBeDefined();
    });

    it('should update deliveredAt timestamp when status changes to DELIVERED', async () => {
      const order = await testPrisma.order.create({
        data: {
          customerName: 'Delivered Test',
          customerPhone: '+16666666666',
          deliveryAddress: 'Delivered Address',
          status: OrderStatus.IN_TRANSIT,
        },
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.DELIVERED);
      expect(response.body.deliveredAt).toBeDefined();
    });

    it('should return 404 when updating non-existent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .patch(`/api/orders/${fakeId}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete an order', async () => {
      const order = await testPrisma.order.create({
        data: {
          customerName: 'Delete Test',
          customerPhone: '+17777777777',
          deliveryAddress: 'Delete Address',
          status: OrderStatus.PENDING,
        },
      });

      await request(app)
        .delete(`/api/orders/${order.id}`)
        .expect(204);

      // Verify order is deleted
      const deletedOrder = await testPrisma.order.findUnique({
        where: { id: order.id },
      });
      expect(deletedOrder).toBeNull();
    });

    it('should return 404 when deleting non-existent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .delete(`/api/orders/${fakeId}`)
        .expect(404);
    });
  });

  describe('Order Assignment Workflow', () => {
    it('should assign order to available driver', async () => {
      const driver = await testPrisma.driver.create({
        data: { name: 'Available Driver', isAvailable: true },
      });

      const order = await testPrisma.order.create({
        data: {
          customerName: 'Assignment Test',
          customerPhone: '+18888888888',
          deliveryAddress: 'Assignment Address',
          status: OrderStatus.PENDING,
        },
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/assign`)
        .send({
          driverId: driver.id,
        })
        .expect(200);

      expect(response.body.driverId).toBe(driver.id);
      expect(response.body.status).toBe(OrderStatus.ASSIGNED);
    });

    it('should allow reassigning order to different driver', async () => {
      const driver1 = await testPrisma.driver.create({
        data: { name: 'Driver 1', isAvailable: true },
      });

      const driver2 = await testPrisma.driver.create({
        data: { name: 'Driver 2', isAvailable: true },
      });

      const order = await testPrisma.order.create({
        data: {
          customerName: 'Reassign Test',
          customerPhone: '+19999999999',
          deliveryAddress: 'Reassign Address',
          status: OrderStatus.ASSIGNED,
          driverId: driver1.id,
        },
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/assign`)
        .send({ driverId: driver2.id })
        .expect(200);

      expect(response.body.driverId).toBe(driver2.id);
    });
  });
});
