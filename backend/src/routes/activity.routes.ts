import { Router } from 'express';
import { ActivityHeatmapController } from '../controllers/activity-heatmap.controller';

const router = Router();
const activityHeatmapController = new ActivityHeatmapController();

/**
 * @route GET /api/activity/heatmap/:traderId
 * @desc Get activity heatmap data for a specific trader
 * @access Public
 */
router.get('/heatmap/:traderId', async (req, res) => {
  await activityHeatmapController.getTraderHeatmap(req, res);
});

/**
 * @route GET /api/activity/heatmap
 * @desc Get activity heatmap data for all traders
 * @access Public
 */
router.get('/heatmap', async (req, res) => {
  await activityHeatmapController.getAllTradersHeatmap(req, res);
});

/**
 * @route GET /api/activity/status
 * @desc Get current activity status for all traders
 * @access Public
 */
router.get('/status', async (req, res) => {
  await activityHeatmapController.getActivityStatus(req, res);
});

/**
 * @route POST /api/activity/reset
 * @desc Reset activity history (for testing)
 * @access Public
 */
router.post('/reset', async (req, res) => {
  await activityHeatmapController.resetActivityHistory(req, res);
});

/**
 * @route GET /api/activity/websocket
 * @desc Get WebSocket connection information
 * @access Public
 */
router.get('/websocket', async (req, res) => {
  await activityHeatmapController.getWebSocketInfo(req, res);
});

/**
 * @route POST /api/activity/trigger-update
 * @desc Trigger manual activity update (for testing)
 * @access Public
 */
router.post('/trigger-update', async (req, res) => {
  await activityHeatmapController.triggerManualUpdate(req, res);
});

export default router;