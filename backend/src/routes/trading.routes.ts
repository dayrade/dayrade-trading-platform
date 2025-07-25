import { Router } from 'express';
import { TradingController } from '../controllers/trading.controller';
import { authenticateUser } from '../middleware/tournament.middleware';

const router = Router();
const tradingController = TradingController.getInstance();

/**
 * @swagger
 * /api/trading/performance:
 *   get:
 *     summary: Get historical trading performance
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
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
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Time period for performance data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of trades to return
 *     responses:
 *       200:
 *         description: Trading performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTrades:
 *                   type: integer
 *                 totalPnl:
 *                   type: string
 *                 winRate:
 *                   type: string
 *                 avgWin:
 *                   type: string
 *                 avgLoss:
 *                   type: string
 *                 profitFactor:
 *                   type: string
 *                 maxDrawdown:
 *                   type: string
 *                 trades:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/performance', authenticateUser, tradingController.getPerformance.bind(tradingController));

/**
 * @swagger
 * /api/trading/metrics/{userId}:
 *   get:
 *     summary: Get user-specific trading metrics
 *     tags: [Trading]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_pnl:
 *                   type: number
 *                 total_trades:
 *                   type: integer
 *                 win_rate:
 *                   type: number
 *                 total_volume:
 *                   type: number
 *                 last30DaysPnl:
 *                   type: string
 *                 last30DaysTrades:
 *                   type: integer
 *                 avgTradeSize:
 *                   type: string
 *                 lastTradeDate:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/:userId', tradingController.getMetrics.bind(tradingController));

/**
 * @swagger
 * /api/trading/history/{userId}:
 *   get:
 *     summary: Get trading history for a user
 *     tags: [Trading]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of trades per page
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Filter by trading symbol
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by trade status
 *     responses:
 *       200:
 *         description: Trading history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trades:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/history/:userId', tradingController.getHistory.bind(tradingController));

/**
 * @swagger
 * /api/trading/positions/{userId}:
 *   get:
 *     summary: Get current positions for a user
 *     tags: [Trading]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Current positions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 positions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalPositions:
 *                       type: integer
 *                     totalValue:
 *                       type: string
 *                     totalUnrealizedPnl:
 *                       type: string
 *                     longPositions:
 *                       type: integer
 *                     shortPositions:
 *                       type: integer
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/positions/:userId', tradingController.getPositions.bind(tradingController));

export default router;