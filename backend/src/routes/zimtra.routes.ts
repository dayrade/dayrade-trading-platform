import { Router, Request, Response } from 'express';
import { ZimtraPollingService } from '../services/zimtra-polling.service';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('ZimtraRoutes');

// Initialize the Zimtra polling service (database will be initialized later)
const zimtraPollingService = new ZimtraPollingService();

// Initialize the service when the module loads
zimtraPollingService.initialize().catch(error => {
  logger.error('Failed to initialize ZimtraPollingService:', error);
});

/**
 * @swagger
 * /api/zimtra/test-connection:
 *   get:
 *     summary: Test Zimtra API connection
 *     tags: [Zimtra]
 *     responses:
 *       200:
 *         description: Connection test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/test-connection', async (req: Request, res: Response) => {
  try {
    logger.info('Testing Zimtra API connection via endpoint');
    const result = await zimtraPollingService.testConnection();
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    logger.error('Error testing Zimtra connection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while testing connection',
    });
  }
});

/**
 * @swagger
 * /api/zimtra/polling/start:
 *   post:
 *     summary: Start the Zimtra data polling system
 *     tags: [Zimtra]
 *     responses:
 *       200:
 *         description: Polling started successfully
 *       400:
 *         description: Polling already active
 */
router.post('/polling/start', async (req: Request, res: Response) => {
  try {
    logger.info('Starting Zimtra polling via endpoint');
    await zimtraPollingService.startPolling();
    
    res.json({
      success: true,
      message: 'Zimtra polling system started',
      status: zimtraPollingService.getPollingStatus(),
    });
  } catch (error) {
    logger.error('Error starting Zimtra polling:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start polling system',
    });
  }
});

/**
 * @swagger
 * /api/zimtra/polling/stop:
 *   post:
 *     summary: Stop the Zimtra data polling system
 *     tags: [Zimtra]
 *     responses:
 *       200:
 *         description: Polling stopped successfully
 */
router.post('/polling/stop', (req: Request, res: Response) => {
  try {
    logger.info('Stopping Zimtra polling via endpoint');
    zimtraPollingService.stopPolling();
    
    res.json({
      success: true,
      message: 'Zimtra polling system stopped',
      status: zimtraPollingService.getPollingStatus(),
    });
  } catch (error) {
    logger.error('Error stopping Zimtra polling:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop polling system',
    });
  }
});

/**
 * @swagger
 * /api/zimtra/polling/status:
 *   get:
 *     summary: Get current polling status
 *     tags: [Zimtra]
 *     responses:
 *       200:
 *         description: Current polling status
 */
router.get('/polling/status', (req: Request, res: Response) => {
  try {
    const status = zimtraPollingService.getPollingStatus();
    
    res.json({
      success: true,
      status,
    });
  } catch (error) {
    logger.error('Error getting polling status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get polling status',
    });
  }
});

/**
 * @swagger
 * /api/zimtra/metrics/latest:
 *   get:
 *     summary: Get latest trading metrics from database
 *     tags: [Zimtra]
 *     responses:
 *       200:
 *         description: Latest trading metrics
 */
router.get('/metrics/latest', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching latest metrics via endpoint');
    const metrics = await zimtraPollingService.getLatestMetrics();
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
    });
  } catch (error) {
    logger.error('Error fetching latest metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest metrics',
    });
  }
});

/**
 * @swagger
 * /api/zimtra/process-now:
 *   post:
 *     summary: Manually trigger data processing for all traders
 *     tags: [Zimtra]
 *     responses:
 *       200:
 *         description: Data processing completed
 */
router.post('/process-now', async (req: Request, res: Response) => {
  try {
    logger.info('Manually triggering data processing via endpoint');
    await zimtraPollingService.processAndStoreAllData();
    
    res.json({
      success: true,
      message: 'Data processing completed successfully',
    });
  } catch (error) {
    logger.error('Error in manual data processing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;