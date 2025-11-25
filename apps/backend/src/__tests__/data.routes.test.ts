import request from 'supertest';
import app from '../server';
import { setupTests, teardownTests, cleanDatabase, testPrisma } from './setup';
import { OrderStatus } from '@prisma/client';

/**
 * Integration Tests for Data Routes
 * Story 5.4: Add Integration Tests for API Endpoints
 *
 * Tests data management endpoints (reset functionality)
 */

describe('Data Routes Integration Tests', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/data/reset', () => {
    it('should reset all data and generate new seed data', async () => {
      // Create some existing data
      await testPrisma.driver.create({
        data: { name: 'Old Driver', isAvailable: true },
      });

      await testPrisma.order.create({
        data: {
          customerName: 'Old Customer',
          customerPhone: '+11111111111',
          deliveryAddress: 'Old Address',
          status: OrderStatus.PENDING,
        },
      });

      const response = await request(app)
        .post('/api/data/reset')
        .expect(200);

      expect(response.body.message).toBe('Data reset successful');
      expect(response.body.driversCreated).toBeGreaterThan(0);
      expect(response.body.ordersCreated).toBeGreaterThan(0);

      // Verify old data is gone and new data exists
      const drivers = await testPrisma.driver.findMany();
      const orders = await testPrisma.order.findMany();

      expect(drivers.length).toBe(response.body.driversCreated);
      expect(orders.length).toBe(response.body.ordersCreated);

      // Verify old driver is gone
      const oldDriver = await testPrisma.driver.findFirst({
        where: { name: 'Old Driver' },
      });
      expect(oldDriver).toBeNull();
    });

    it('should generate drivers within expected range (5-8)', async () => {
      const response = await request(app)
        .post('/api/data/reset')
        .expect(200);

      expect(response.body.driversCreated).toBeGreaterThanOrEqual(5);
      expect(response.body.driversCreated).toBeLessThanOrEqual(8);
    });

    it('should generate orders within expected range (15-25)', async () => {
      const response = await request(app)
        .post('/api/data/reset')
        .expect(200);

      expect(response.body.ordersCreated).toBeGreaterThanOrEqual(15);
      expect(response.body.ordersCreated).toBeLessThanOrEqual(25);
    });

    it('should create orders with varied statuses', async () => {
      await request(app)
        .post('/api/data/reset')
        .expect(200);

      const orders = await testPrisma.order.findMany();

      const statuses = new Set(orders.map(o => o.status));

      // Should have multiple different statuses
      expect(statuses.size).toBeGreaterThan(1);

      // Should have all possible statuses represented
      const hasStatus = {
        pending: orders.some(o => o.status === OrderStatus.PENDING),
        assigned: orders.some(o => o.status === OrderStatus.ASSIGNED),
        inTransit: orders.some(o => o.status === OrderStatus.IN_TRANSIT),
        delivered: orders.some(o => o.status === OrderStatus.DELIVERED),
      };

      // At least 3 of the 4 statuses should be present
      const statusCount = Object.values(hasStatus).filter(Boolean).length;
      expect(statusCount).toBeGreaterThanOrEqual(3);
    });

    it('should assign some orders to drivers', async () => {
      await request(app)
        .post('/api/data/reset')
        .expect(200);

      const assignedOrders = await testPrisma.order.findMany({
        where: {
          driverId: { not: null },
        },
      });

      expect(assignedOrders.length).toBeGreaterThan(0);
    });

    it('should set appropriate timestamps for order statuses', async () => {
      await request(app)
        .post('/api/data/reset')
        .expect(200);

      const assignedOrders = await testPrisma.order.findMany({
        where: { status: OrderStatus.ASSIGNED },
      });

      const inTransitOrders = await testPrisma.order.findMany({
        where: { status: OrderStatus.IN_TRANSIT },
      });

      const deliveredOrders = await testPrisma.order.findMany({
        where: { status: OrderStatus.DELIVERED },
      });

      // Assigned orders should have assignedAt
      assignedOrders.forEach(order => {
        expect(order.assignedAt).not.toBeNull();
      });

      // In-transit orders should have assignedAt and inTransitAt
      inTransitOrders.forEach(order => {
        expect(order.assignedAt).not.toBeNull();
        expect(order.inTransitAt).not.toBeNull();
      });

      // Delivered orders should have all timestamps
      deliveredOrders.forEach(order => {
        expect(order.assignedAt).not.toBeNull();
        expect(order.inTransitAt).not.toBeNull();
        expect(order.deliveredAt).not.toBeNull();
      });
    });

    it('should be idempotent (can be called multiple times)', async () => {
      // First reset
      const response1 = await request(app)
        .post('/api/data/reset')
        .expect(200);

      // Second reset
      const response2 = await request(app)
        .post('/api/data/reset')
        .expect(200);

      // Both should succeed with similar data counts
      expect(response1.body.driversCreated).toBeGreaterThan(0);
      expect(response2.body.driversCreated).toBeGreaterThan(0);

      // Final count should match second reset
      const finalDrivers = await testPrisma.driver.findMany();
      const finalOrders = await testPrisma.order.findMany();

      expect(finalDrivers.length).toBe(response2.body.driversCreated);
      expect(finalOrders.length).toBe(response2.body.ordersCreated);
    });
  });
});
