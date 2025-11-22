import { PrismaClient } from '@prisma/client';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  timestamp: string;
  error?: string;
}

export async function checkDatabaseConnection(
  prisma: PrismaClient
): Promise<HealthCheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function formatHealthCheckResponse(result: HealthCheckResult): {
  status: string;
  database: string;
  timestamp: string;
} {
  return {
    status: result.status,
    database: result.database,
    timestamp: result.timestamp,
  };
}
