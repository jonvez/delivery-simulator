import prisma from '../db/client';

/**
 * Integration Test Setup
 * Story 5.4: Add Integration Tests for API Endpoints
 *
 * Sets up test database and cleanup utilities
 */

export const testPrisma = prisma;

/**
 * Clean all test data before each test suite
 * IMPORTANT: Delete orders first (child records) before drivers (parent records)
 * to avoid foreign key constraint violations
 */
export async function cleanDatabase() {
  await testPrisma.order.deleteMany({});
  await testPrisma.driver.deleteMany({});
}

/**
 * Setup before all tests
 */
export async function setupTests() {
  await cleanDatabase();
}

/**
 * Teardown after all tests
 */
export async function teardownTests() {
  await cleanDatabase();
  await testPrisma.$disconnect();
}
