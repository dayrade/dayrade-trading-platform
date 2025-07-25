import { Request, Response } from 'express';
import { ZimtraPollingService } from '../services/zimtra-polling.service';
import { WebSocketService } from '../services/websocket.service';
import { Logger } from '../utils/logger';

const logger = new Logger('ActivityHeatmapController');

export class ActivityHeatmapController {
  private zimtraPollingService: ZimtraPollingService;
  private webSocketService: WebSocketService;

  constructor() {
    this.zimtraPollingService = ZimtraPollingService.getInstance();
    this.webSocketService = WebSocketService.getInstance();
  }

  /**
   * Get activity heatmap data for a specific trader
   */
  async getTraderHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const { traderId } = req.params;
      const { hours = 24 } = req.query;

      if (!traderId) {
        res.status(400).json({
          success: false,
          message: 'Trader ID is required'
        });
        return;
      }

      const hoursNum = parseInt(hours as string, 10);
      if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 168) { // Max 1 week
        res.status(400).json({
          success: false,
          message: 'Hours must be a positive number between 1 and 168'
        });
        return;
      }

      const heatmapData = await this.zimtraPollingService.getActivityHeatmapData(traderId, hoursNum);

      res.json({
        success: true,
        data: heatmapData,
        timestamp: new Date().toISOString()
      });

      logger.info(`Served heatmap data for trader ${traderId} (${hoursNum} hours)`);
    } catch (error) {
      logger.error('Failed to get trader heatmap:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve heatmap data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get activity heatmap data for all traders
   */
  async getAllTradersHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const { hours = 24 } = req.query;
      const hoursNum = parseInt(hours as string, 10);

      if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 168) {
        res.status(400).json({
          success: false,
          message: 'Hours must be a positive number between 1 and 168'
        });
        return;
      }

      // Get test trader IDs from environment or use defaults
      const TEST_TRADER_IDS = [
        'ZIMSTISIM05498',
        'ZIMSTISIM6FB26', 
        'ZIMSTISIM0A60E',
        'ZIMSTISIM10090'
      ];

      const heatmapPromises = TEST_TRADER_IDS.map(traderId => 
        this.zimtraPollingService.getActivityHeatmapData(traderId, hoursNum)
          .catch(error => {
            logger.error(`Failed to get heatmap for trader ${traderId}:`, error);
            return null;
          })
      );

      const heatmapResults = await Promise.all(heatmapPromises);
      const validHeatmaps = heatmapResults.filter(result => result !== null);

      res.json({
        success: true,
        data: validHeatmaps,
        totalTraders: TEST_TRADER_IDS.length,
        successfulTraders: validHeatmaps.length,
        timestamp: new Date().toISOString()
      });

      logger.info(`Served heatmap data for ${validHeatmaps.length}/${TEST_TRADER_IDS.length} traders`);
    } catch (error) {
      logger.error('Failed to get all traders heatmap:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve heatmap data for all traders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get current activity status for all traders
   */
  async getActivityStatus(req: Request, res: Response): Promise<void> {
    try {
      const activityStatus = await this.zimtraPollingService.getCurrentActivityStatus();
      const pollingStatus = this.zimtraPollingService.getPollingStatus();

      // Convert Map to object for JSON serialization
      const statusObject: Record<string, any> = {};
      activityStatus.forEach((value, key) => {
        statusObject[key] = value;
      });

      res.json({
        success: true,
        data: {
          traders: statusObject,
          polling: pollingStatus,
          connectedClients: this.webSocketService.getConnectedClientsCount(),
          timestamp: new Date().toISOString()
        }
      });

      logger.info(`Served activity status for ${activityStatus.size} traders`);
    } catch (error) {
      logger.error('Failed to get activity status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve activity status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reset activity history (for testing purposes)
   */
  async resetActivityHistory(req: Request, res: Response): Promise<void> {
    try {
      this.zimtraPollingService.resetActivityHistory();

      res.json({
        success: true,
        message: 'Activity history reset successfully',
        timestamp: new Date().toISOString()
      });

      logger.info('Activity history reset via API');
    } catch (error) {
      logger.error('Failed to reset activity history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset activity history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get WebSocket connection info
   */
  async getWebSocketInfo(req: Request, res: Response): Promise<void> {
    try {
      const connectedClients = this.webSocketService.getConnectedClientsCount();

      res.json({
        success: true,
        data: {
          connectedClients,
          websocketPort: process.env.WEBSOCKET_PORT || 3002,
          timestamp: new Date().toISOString()
        }
      });

      logger.info('Served WebSocket connection info');
    } catch (error) {
      logger.error('Failed to get WebSocket info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve WebSocket information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Trigger manual activity update (for testing)
   */
  async triggerManualUpdate(req: Request, res: Response): Promise<void> {
    try {
      // Trigger a manual polling cycle
      await this.zimtraPollingService.processAndStoreAllData();

      res.json({
        success: true,
        message: 'Manual activity update triggered successfully',
        timestamp: new Date().toISOString()
      });

      logger.info('Manual activity update triggered via API');
    } catch (error) {
      logger.error('Failed to trigger manual update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger manual update',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}