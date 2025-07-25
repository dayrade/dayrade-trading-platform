import { Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';
import { RedisService } from '../services/redis.service';
import { Logger } from '../utils/logger';

const logger = new Logger('TradingController');

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class TradingController {
  private static instance: TradingController;

  private constructor() {
    // Empty constructor - services will be initialized lazily
  }

  public static getInstance(): TradingController {
    if (!TradingController.instance) {
      TradingController.instance = new TradingController();
    }
    return TradingController.instance;
  }

  private getDbService(): DatabaseService {
    return DatabaseService.getInstance();
  }

  private getRedisService(): RedisService | null {
    try {
      return RedisService.getInstance();
    } catch (error) {
      logger.warn('Redis service not available, continuing without caching');
      return null;
    }
  }

  /**
   * GET /api/trading/performance - Historical trading performance
   */
  public async getPerformance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.query.userId as string;
      const period = req.query.period as string || '30d';
      const limit = parseInt(req.query.limit as string) || 100;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Try to get from cache first
      const cacheKey = `trading:performance:${userId}:${period}:${limit}`;
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          const cached = await redisService.get(cacheKey);
          if (cached) {
            res.json(JSON.parse(cached));
            return;
          }
        } catch (error) {
          logger.warn('Redis cache read failed:', error);
        }
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Get trading performance data
      const { data: trades, error } = await this.getDbService().getClient()
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching trading performance:', error);
        res.status(500).json({ error: 'Failed to fetch trading performance' });
        return;
      }

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(trades || []);

      // Cache the result for 10 minutes
      if (redisService) {
        try {
          await redisService.set(cacheKey, JSON.stringify(performance), 600);
        } catch (error) {
          logger.warn('Redis cache write failed:', error);
        }
      }

      res.json(performance);
    } catch (error) {
      logger.error('Error in getPerformance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/trading/metrics/:userId - User-specific metrics
   */
  public async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Try to get from cache first
      const cacheKey = `trading:metrics:${userId}`;
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          const cached = await redisService.get(cacheKey);
          if (cached) {
            res.json(JSON.parse(cached));
            return;
          }
        } catch (error) {
          logger.warn('Redis cache read failed:', error);
        }
      }

      // Get user metrics from database
      const { data: userMetrics, error: metricsError } = await this.getDbService().getClient()
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error('Error fetching user metrics:', metricsError);
        res.status(500).json({ error: 'Failed to fetch user metrics' });
        return;
      }

      // Get recent trades for additional calculations
      const { data: recentTrades, error: tradesError } = await this.getDbService().getClient()
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (tradesError) {
        logger.error('Error fetching recent trades:', tradesError);
        res.status(500).json({ error: 'Failed to fetch recent trades' });
        return;
      }

      // Calculate comprehensive metrics
      const metrics = this.calculateComprehensiveMetrics(userMetrics, recentTrades || []);

      // Cache the result for 5 minutes
      if (redisService) {
        try {
          await redisService.set(cacheKey, JSON.stringify(metrics), 300);
        } catch (error) {
          logger.warn('Redis cache write failed:', error);
        }
      }

      res.json(metrics);
    } catch (error) {
      logger.error('Error in getMetrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/trading/history/:userId - Trading history
   */
  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const symbol = req.query.symbol as string;
      const status = req.query.status as string;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const offset = (page - 1) * limit;

      // Build query
      let query = this.getDbService().getClient()
        .from('trades')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Add filters
      if (symbol) {
        query = query.eq('symbol', symbol.toUpperCase());
      }
      if (status) {
        query = query.eq('status', status);
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: trades, error, count } = await query;

      if (error) {
        logger.error('Error fetching trading history:', error);
        res.status(500).json({ error: 'Failed to fetch trading history' });
        return;
      }

      // Format response with pagination info
      const response = {
        trades: trades || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in getHistory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/trading/positions/:userId - Current positions
   */
  public async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Try to get from cache first
      const cacheKey = `trading:positions:${userId}`;
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          const cached = await redisService.get(cacheKey);
          if (cached) {
            res.json(JSON.parse(cached));
            return;
          }
        } catch (error) {
          logger.warn('Redis cache read failed:', error);
        }
      }

      // Get current positions
      const { data: positions, error } = await this.getDbService().getClient()
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching positions:', error);
        res.status(500).json({ error: 'Failed to fetch positions' });
        return;
      }

      // Calculate position summaries
      const positionSummary = this.calculatePositionSummary(positions || []);

      const response = {
        positions: positions || [],
        summary: positionSummary
      };

      // Cache the result for 2 minutes
      if (redisService) {
        try {
          await redisService.set(cacheKey, JSON.stringify(response), 120);
        } catch (error) {
          logger.warn('Redis cache write failed:', error);
        }
      }

      res.json(response);
    } catch (error) {
      logger.error('Error in getPositions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Calculate performance metrics from trades
   */
  private calculatePerformanceMetrics(trades: any[]): any {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalPnl: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        trades: []
      };
    }

    const totalTrades = trades.length;
    const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = trades.filter(t => (t.pnl || 0) < 0);
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let cumulativePnl = 0;
    
    for (const trade of trades.reverse()) {
      cumulativePnl += trade.pnl || 0;
      if (cumulativePnl > peak) {
        peak = cumulativePnl;
      }
      const drawdown = peak - cumulativePnl;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      totalTrades,
      totalPnl: totalPnl.toFixed(2),
      winRate: winRate.toFixed(1),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      grossLoss: grossLoss.toFixed(2),
      trades: trades.reverse() // Return to original order
    };
  }

  /**
   * Calculate comprehensive metrics
   */
  private calculateComprehensiveMetrics(userMetrics: any, recentTrades: any[]): any {
    const baseMetrics = userMetrics || {
      total_pnl: 0,
      total_trades: 0,
      win_rate: 0,
      total_volume: 0
    };

    // Calculate additional metrics from recent trades
    const last30DaysTrades = recentTrades.filter(trade => {
      const tradeDate = new Date(trade.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return tradeDate >= thirtyDaysAgo;
    });

    const last30DaysPnl = last30DaysTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const avgTradeSize = recentTrades.length > 0 ? 
      recentTrades.reduce((sum, trade) => sum + (trade.quantity * trade.price || 0), 0) / recentTrades.length : 0;

    return {
      ...baseMetrics,
      last30DaysPnl: last30DaysPnl.toFixed(2),
      last30DaysTrades: last30DaysTrades.length,
      avgTradeSize: avgTradeSize.toFixed(2),
      lastTradeDate: recentTrades.length > 0 ? recentTrades[0].created_at : null,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate position summary
   */
  private calculatePositionSummary(positions: any[]): any {
    if (positions.length === 0) {
      return {
        totalPositions: 0,
        totalValue: 0,
        totalUnrealizedPnl: 0,
        longPositions: 0,
        shortPositions: 0
      };
    }

    const totalPositions = positions.length;
    const totalValue = positions.reduce((sum, pos) => sum + (pos.market_value || 0), 0);
    const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0);
    const longPositions = positions.filter(pos => (pos.quantity || 0) > 0).length;
    const shortPositions = positions.filter(pos => (pos.quantity || 0) < 0).length;

    return {
      totalPositions,
      totalValue: totalValue.toFixed(2),
      totalUnrealizedPnl: totalUnrealizedPnl.toFixed(2),
      longPositions,
      shortPositions
    };
  }
}