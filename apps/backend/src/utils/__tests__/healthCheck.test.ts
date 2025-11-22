import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { checkDatabaseConnection, formatHealthCheckResponse } from '../healthCheck';

describe('Health Check Utilities', () => {
  describe('checkDatabaseConnection', () => {
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
      mockPrisma = {
        $queryRaw: jest.fn(),
      } as unknown as jest.Mocked<PrismaClient>;
    });

    it('should return connected status when database query succeeds', async () => {
      (mockPrisma.$queryRaw as any).mockResolvedValue([{ '?column?': 1 }]);

      const result = await checkDatabaseConnection(mockPrisma);

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result.timestamp).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return disconnected status when database query fails', async () => {
      const error = new Error('Connection refused');
      (mockPrisma.$queryRaw as any).mockRejectedValue(error);

      const result = await checkDatabaseConnection(mockPrisma);

      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
      expect(result.timestamp).toBeDefined();
      expect(result.error).toBe('Connection refused');
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error exceptions', async () => {
      (mockPrisma.$queryRaw as any).mockRejectedValue('String error');

      const result = await checkDatabaseConnection(mockPrisma);

      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
      expect(result.error).toBe('Unknown error');
    });

    it('should return valid ISO timestamp', async () => {
      (mockPrisma.$queryRaw as any).mockResolvedValue([{ '?column?': 1 }]);

      const result = await checkDatabaseConnection(mockPrisma);
      const timestamp = new Date(result.timestamp);

      expect(timestamp.toISOString()).toBe(result.timestamp);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('formatHealthCheckResponse', () => {
    it('should format connected health check result', () => {
      const result = {
        status: 'ok' as const,
        database: 'connected' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const formatted = formatHealthCheckResponse(result);

      expect(formatted).toEqual({
        status: 'ok',
        database: 'connected',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should format disconnected health check result without exposing error', () => {
      const result = {
        status: 'error' as const,
        database: 'disconnected' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        error: 'Database connection failed',
      };

      const formatted = formatHealthCheckResponse(result);

      expect(formatted).toEqual({
        status: 'error',
        database: 'disconnected',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
      expect(formatted).not.toHaveProperty('error');
    });

    it('should preserve timestamp format', () => {
      const timestamp = new Date().toISOString();
      const result = {
        status: 'ok' as const,
        database: 'connected' as const,
        timestamp,
      };

      const formatted = formatHealthCheckResponse(result);

      expect(formatted.timestamp).toBe(timestamp);
    });
  });
});
