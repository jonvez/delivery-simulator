import { Router, Request, Response } from 'express';
import { resetData } from '../services/data.service';

/**
 * Data Management Routes
 * Story 5.3: Implement Data Reset Functionality
 */

const router = Router();

/**
 * POST /api/data/reset
 * Reset all data and regenerate seed data
 */
router.post('/reset', async (req: Request, res: Response) => {
  try {
    console.log('Resetting all data...');

    const result = await resetData();

    console.log(`Data reset complete: ${result.driversCreated} drivers, ${result.ordersCreated} orders created`);

    res.status(200).json({
      message: 'Data reset successful',
      driversCreated: result.driversCreated,
      ordersCreated: result.ordersCreated,
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({
      error: 'Failed to reset data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
