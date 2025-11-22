import { DriverService } from '../driver.service';
import prisma from '../../db/client';

// Mock the Prisma client
jest.mock('../../db/client', () => ({
  __esModule: true,
  default: {
    driver: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const driverService = new DriverService();

describe('DriverService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDriver', () => {
    it('should create a driver with default isAvailable=true', async () => {
      const driverData = {
        name: 'John Doe',
      };

      const expectedDriver = {
        id: '123',
        name: 'John Doe',
        isAvailable: true,
        createdAt: new Date(),
      };

      (mockPrisma.driver.create as any).mockResolvedValue(expectedDriver);

      const driver = await driverService.createDriver(driverData);

      expect(mockPrisma.driver.create).toHaveBeenCalledWith({
        data: driverData,
      });
      expect(driver).toEqual(expectedDriver);
    });

    it('should create a driver with isAvailable=false', async () => {
      const driverData = {
        name: 'Jane Smith',
        isAvailable: false,
      };

      const expectedDriver = {
        id: '456',
        name: 'Jane Smith',
        isAvailable: false,
        createdAt: new Date(),
      };

      (mockPrisma.driver.create as any).mockResolvedValue(expectedDriver);

      const driver = await driverService.createDriver(driverData);

      expect(mockPrisma.driver.create).toHaveBeenCalledWith({
        data: driverData,
      });
      expect(driver).toEqual(expectedDriver);
    });

    it('should create a driver with isAvailable=true explicitly', async () => {
      const driverData = {
        name: 'Bob Johnson',
        isAvailable: true,
      };

      const expectedDriver = {
        id: '789',
        name: 'Bob Johnson',
        isAvailable: true,
        createdAt: new Date(),
      };

      (mockPrisma.driver.create as any).mockResolvedValue(expectedDriver);

      const driver = await driverService.createDriver(driverData);

      expect(mockPrisma.driver.create).toHaveBeenCalledWith({
        data: driverData,
      });
      expect(driver).toEqual(expectedDriver);
    });
  });

  describe('getAllDrivers', () => {
    it('should return empty array when no drivers exist', async () => {
      (mockPrisma.driver.findMany as any).mockResolvedValue([]);

      const drivers = await driverService.getAllDrivers();

      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(drivers).toEqual([]);
    });

    it('should return all drivers ordered by createdAt descending', async () => {
      const mockDrivers = [
        { id: '3', name: 'Driver 3', isAvailable: true, createdAt: new Date('2024-01-15T10:30:00Z') },
        { id: '2', name: 'Driver 2', isAvailable: true, createdAt: new Date('2024-01-15T10:20:00Z') },
        { id: '1', name: 'Driver 1', isAvailable: false, createdAt: new Date('2024-01-15T10:10:00Z') },
      ];

      (mockPrisma.driver.findMany as any).mockResolvedValue(mockDrivers);

      const drivers = await driverService.getAllDrivers();

      expect(drivers).toHaveLength(3);
      expect(drivers).toEqual(mockDrivers);
    });
  });

  describe('getDriverById', () => {
    it('should return driver when found', async () => {
      const mockDriver = {
        id: '123',
        name: 'Test Driver',
        isAvailable: true,
        createdAt: new Date(),
      };

      (mockPrisma.driver.findUnique as any).mockResolvedValue(mockDriver);

      const driver = await driverService.getDriverById('123');

      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(driver).toEqual(mockDriver);
    });

    it('should return null when driver not found', async () => {
      (mockPrisma.driver.findUnique as any).mockResolvedValue(null);

      const driver = await driverService.getDriverById('nonexistent-id');

      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
      expect(driver).toBeNull();
    });
  });

  describe('updateDriver', () => {
    it('should update driver name', async () => {
      const updatedDriver = {
        id: '123',
        name: 'Updated Name',
        isAvailable: true,
        createdAt: new Date(),
      };

      (mockPrisma.driver.update as any).mockResolvedValue(updatedDriver);

      const driver = await driverService.updateDriver('123', {
        name: 'Updated Name',
      });

      expect(mockPrisma.driver.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { name: 'Updated Name' },
      });
      expect(driver).toEqual(updatedDriver);
    });

    it('should update driver availability status', async () => {
      const updatedDriver = {
        id: '123',
        name: 'Test Driver',
        isAvailable: false,
        createdAt: new Date(),
      };

      (mockPrisma.driver.update as any).mockResolvedValue(updatedDriver);

      const driver = await driverService.updateDriver('123', {
        isAvailable: false,
      });

      expect(mockPrisma.driver.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { isAvailable: false },
      });
      expect(driver).toEqual(updatedDriver);
    });

    it('should update both name and availability', async () => {
      const updatedDriver = {
        id: '123',
        name: 'New Name',
        isAvailable: false,
        createdAt: new Date(),
      };

      (mockPrisma.driver.update as any).mockResolvedValue(updatedDriver);

      const driver = await driverService.updateDriver('123', {
        name: 'New Name',
        isAvailable: false,
      });

      expect(mockPrisma.driver.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { name: 'New Name', isAvailable: false },
      });
      expect(driver).toEqual(updatedDriver);
    });

    it('should throw error when driver not found', async () => {
      (mockPrisma.driver.update as any).mockRejectedValue(new Error('Driver not found'));

      await expect(
        driverService.updateDriver('nonexistent-id', { name: 'Test' })
      ).rejects.toThrow('Driver not found');
    });
  });

  describe('deleteDriver', () => {
    it('should delete driver', async () => {
      const deletedDriver = {
        id: '123',
        name: 'To Delete',
        isAvailable: true,
        createdAt: new Date(),
      };

      (mockPrisma.driver.delete as any).mockResolvedValue(deletedDriver);

      const driver = await driverService.deleteDriver('123');

      expect(mockPrisma.driver.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(driver).toEqual(deletedDriver);
    });

    it('should throw error when driver not found', async () => {
      (mockPrisma.driver.delete as any).mockRejectedValue(new Error('Driver not found'));

      await expect(driverService.deleteDriver('nonexistent-id')).rejects.toThrow(
        'Driver not found'
      );
    });
  });
});
