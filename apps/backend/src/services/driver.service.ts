import type { Driver } from '@prisma/client';
import prisma from '../db/client';
import type { CreateDriverInput, UpdateDriverInput } from '../schemas/driver.schema';

/**
 * Driver Service
 * Story 3.1: Driver Database Schema and API Endpoints
 */
export class DriverService {
  /**
   * Create a new driver with isAvailable defaulting to true
   */
  async createDriver(data: CreateDriverInput): Promise<Driver> {
    return prisma.driver.create({
      data,
    });
  }

  /**
   * Get all drivers
   */
  async getAllDrivers(): Promise<Driver[]> {
    return prisma.driver.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single driver by ID
   */
  async getDriverById(id: string): Promise<Driver | null> {
    return prisma.driver.findUnique({
      where: { id },
    });
  }

  /**
   * Update a driver
   */
  async updateDriver(id: string, data: UpdateDriverInput): Promise<Driver> {
    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a driver
   */
  async deleteDriver(id: string): Promise<Driver> {
    return prisma.driver.delete({
      where: { id },
    });
  }
}

export const driverService = new DriverService();
