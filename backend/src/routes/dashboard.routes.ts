import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('DashboardRoutes');

// Get dashboard controller instance
const dashboardController = DashboardController.getInstance();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardMetrics:
 *       type: object
 *       properties:
 *         totalPnl:
 *           type: string
 *           description: Total profit and loss
 *         totalSharesTraded:
 *           type: number
 *           description: Total number of shares traded
 *         usdBalance:
 *           type: string
 *           description: Current USD balance
 *         realizedPnl:
 *           type: string
 *           description: Realized profit and loss
 *         numberOfStocksTraded:
 *           type: number
 *           description: Number of unique stocks traded
 *         numberOfTrades:
 *           type: number
 *           description: Total number of trades
 *         unrealizedPnl:
 *           type: string
 *           description: Unrealized profit and loss
 *         totalNotionalTraded:
 *           type: string
 *           description: Total notional value traded
 *         winRate:
 *           type: string
 *           description: Win rate percentage
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     ChartDataPoint:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the data point
 *         value:
 *           type: number
 *           description: Cumulative P&L value
 *         dailyPnl:
 *           type: number
 *           description: Daily P&L change
 *         trades:
 *           type: number
 *           description: Number of trades on this date
 *     
 *     LeaderboardEntry:
 *       type: object
 *       properties:
 *         rank:
 *           type: number
 *           description: User's rank position
 *         userId:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         displayName:
 *           type: string
 *           description: User's display name
 *         avatarUrl:
 *           type: string
 *           description: User's avatar URL
 *         totalPnl:
 *           type: number
 *           description: Total profit and loss
 *         totalTrades:
 *           type: number
 *           description: Total number of trades
 *         winRate:
 *           type: number
 *           description: Win rate percentage
 *     
 *     ActivityHeatmap:
 *       type: object
 *       properties:
 *         calendar:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               value:
 *                 type: number
 *               count:
 *                 type: number
 *               level:
 *                 type: number
 *         hourly:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               hour:
 *                 type: number
 *               volume:
 *                 type: number
 *               level:
 *                 type: number
 *         daily:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *               volume:
 *                 type: number
 *               level:
 *                 type: number
 */

/**
 * @swagger
 * /api/dashboard/metrics/{userId}:
 *   get:
 *     summary: Get user trading metrics
 *     description: Retrieve 8 calculated trading metrics for a user
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Trading metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardMetrics'
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/:userId', dashboardController.getMetrics.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/chart-data/{userId}:
 *   get:
 *     summary: Get performance chart data
 *     description: Retrieve performance chart data over time
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time period for chart data
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChartDataPoint'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalReturn:
 *                       type: number
 *                     bestDay:
 *                       type: number
 *                     worstDay:
 *                       type: number
 *                     totalTradingDays:
 *                       type: number
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Internal server error
 */
router.get('/chart-data/:userId', dashboardController.getChartData.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/leaderboard:
 *   get:
 *     summary: Get tournament leaderboard
 *     description: Retrieve tournament leaderboard with rankings
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of entries to return
 *       - in: query
 *         name: tournamentId
 *         schema:
 *           type: string
 *         description: Tournament ID (optional for global leaderboard)
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 *       500:
 *         description: Internal server error
 */
router.get('/leaderboard', dashboardController.getLeaderboard.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     summary: Get trading activity heatmap data
 *     description: Retrieve trading activity heatmap data for visualization
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional if authenticated)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Time period for activity data
 *     responses:
 *       200:
 *         description: Activity data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityHeatmap'
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Internal server error
 */
router.get('/activity', dashboardController.getActivity.bind(dashboardController));

logger.info('Dashboard routes registered');

export default router;