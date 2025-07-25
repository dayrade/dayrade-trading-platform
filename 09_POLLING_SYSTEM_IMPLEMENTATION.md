# Task 09: Polling System Implementation for Zimtra API

**Task ID:** DAYRADE-009  
**Priority:** Critical  
**Dependencies:** Task 04 (Zimtra API Integration), Task 05 (Environment Configuration)  
**Estimated Duration:** 3-4 hours  
**Trae.ai Tools Required:** File System, Terminal, Web Search  

## 🎯 Task Objective

Implement the complete 60-second polling system for the Zimtra API to collect trading data, parse it into the eight dashboard metrics, aggregate historical data for chart generation, and update the leaderboard rankings. This system replaces real-time WebSocket connections with reliable polling-based data collection as specified in the Dayrade requirements.

## 📋 Requirement Cross-Reference Validation

This task implements the following polling system requirements:

- **60-Second Polling Interval**: Regular data collection from Zimtra API every minute
- **Eight Metrics Parsing**: Extract dashboard metrics from raw trading data
- **Historical Data Aggregation**: Store time-series data for chart generation
- **Leaderboard Updates**: Calculate and update tournament rankings
- **Error Handling**: Robust error recovery and retry mechanisms
- **Performance Monitoring**: Track polling performance and data quality

## 🚨 CRITICAL DIRECTIVE FOR TRAE.AI

**POLLING SYSTEM SPECIFICATIONS**

- **NOT WebSocket**: This is a polling-based system, not real-time WebSocket
- **60-Second Interval**: Exact timing requirement for data collection
- **Data Parsing**: Raw Zimtra response must be parsed into eight specific metrics
- **Historical Storage**: All polling data must be stored for chart generation
- **Leaderboard Calculation**: Rankings must be updated after each polling cycle

## ⏰ Complete Polling System Implementation

### **Core Polling Service**

```typescript
// src/services/polling.service.ts
import { ZimtraService } from './zimtra.service';
import { DatabaseService } from './database.service';
import { WebSocketService } from './websocket.service';
import { MetricsCalculator } from '../utils/metrics.calculator';
import { Logger } from '../utils/logger';

export interface PollingConfig {
  interval: number;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  enableErrorRecovery: boolean;
}

export interface PollingMetrics {
  totalPolls: number;
  successfulPolls: number;
  failedPolls: number;
  averageResponseTime: number;
  lastPollTime: Date;
  nextPollTime: Date;
  isActive: boolean;
}

export class PollingService {
  private static instance: PollingService;
  private logger: Logger;
  private zimtraService: ZimtraService;
  private webSocketService: WebSocketService;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private pollingMetrics: PollingMetrics;
  private config: PollingConfig;

  constructor() {
    this.logger = new Logger('PollingService');
    this.zimtraService = ZimtraService.getInstance();
    this.webSocketService = WebSocketService.getInstance();
    
    this.config = {
      interval: parseInt(process.env.ZIMTRA_POLLING_INTERVAL || '60000'), // 60 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      batchSize: 50, // Process 50 traders at a time
      enableErrorRecovery: true
    };

    this.pollingMetrics = {
      totalPolls: 0,
      successfulPolls: 0,
      failedPolls: 0,
      averageResponseTime: 0,
      lastPollTime: new Date(),
      nextPollTime: new Date(Date.now() + this.config.interval),
      isActive: false
    };
  }

  static getInstance(): PollingService {
    if (!PollingService.instance) {
      PollingService.instance = new PollingService();
    }
    return PollingService.instance;
  }

  /**
   * Start the polling system
   */
  public async startPolling(): Promise<void> {
    if (this.isPolling) {
      this.logger.warn('Polling is already active');
      return;
    }

    this.logger.info(`Starting Zimtra API polling with ${this.config.interval}ms interval`);
    this.isPolling = true;
    this.pollingMetrics.isActive = true;

    // Initial poll
    await this.executePoll();

    // Set up recurring polling
    this.pollingInterval = setInterval(async () => {
      await this.executePoll();
    }, this.config.interval);

    this.logger.info('Polling system started successfully');
  }

  /**
   * Stop the polling system
   */
  public stopPolling(): void {
    if (!this.isPolling) {
      this.logger.warn('Polling is not active');
      return;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isPolling = false;
    this.pollingMetrics.isActive = false;
    this.logger.info('Polling system stopped');
  }

  /**
   * Execute a single polling cycle
   */
  private async executePoll(): Promise<void> {
    const startTime = Date.now();
    this.pollingMetrics.totalPolls++;

    try {
      this.logger.debug('Starting polling cycle');

      // Get all active tournament participants
      const participants = await this.getActiveParticipants();
      
      if (participants.length === 0) {
        this.logger.debug('No active participants found, skipping poll');
        return;
      }

      // Process participants in batches
      const batches = this.createBatches(participants, this.config.batchSize);
      
      for (const batch of batches) {
        await this.processBatch(batch);
      }

      // Update leaderboards for all active tournaments
      await this.updateAllLeaderboards();

      // Update polling metrics
      const responseTime = Date.now() - startTime;
      this.updatePollingMetrics(true, responseTime);

      this.logger.info(`Polling cycle completed successfully in ${responseTime}ms`);

    } catch (error) {
      this.logger.error('Polling cycle failed:', error);
      this.updatePollingMetrics(false, Date.now() - startTime);

      if (this.config.enableErrorRecovery) {
        await this.handlePollingError(error);
      }
    }
  }

  /**
   * Get all active tournament participants
   */
  private async getActiveParticipants(): Promise<Array<{
    userId: string;
    tournamentId: string;
    zimtraId: string;
  }>> {
    try {
      const result = await DatabaseService.query(
        `SELECT tp.user_id, tp.tournament_id, u.zimtra_id
         FROM tournament_participants tp
         JOIN users u ON tp.user_id = u.id
         JOIN tournaments t ON tp.tournament_id = t.id
         WHERE tp.is_active = true 
           AND t.status = 'active'
           AND u.zimtra_id IS NOT NULL`,
        []
      );

      return result.rows.map(row => ({
        userId: row.user_id,
        tournamentId: row.tournament_id,
        zimtraId: row.zimtra_id
      }));

    } catch (error) {
      this.logger.error('Failed to get active participants:', error);
      throw error;
    }
  }

  /**
   * Create batches for processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of participants
   */
  private async processBatch(participants: Array<{
    userId: string;
    tournamentId: string;
    zimtraId: string;
  }>): Promise<void> {
    const promises = participants.map(participant => 
      this.processParticipant(participant)
    );

    // Process batch with error isolation
    const results = await Promise.allSettled(promises);
    
    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to process participant ${participants[index].userId}:`,
          result.reason
        );
      }
    });
  }

  /**
   * Process a single participant
   */
  private async processParticipant(participant: {
    userId: string;
    tournamentId: string;
    zimtraId: string;
  }): Promise<void> {
    try {
      // Fetch trading data from Zimtra API
      const tradingData = await this.zimtraService.getTradingData(participant.zimtraId);

      // Parse raw data into eight metrics
      const metrics = MetricsCalculator.parseTradeDataToMetrics(tradingData);
      const additionalMetrics = MetricsCalculator.calculateAdditionalMetrics(tradingData);

      // Store performance data
      await this.storePerformanceData(participant, metrics, additionalMetrics);

      // Update tournament participant record
      await this.updateParticipantRecord(participant, metrics);

      // Send real-time update to user
      this.webSocketService.sendPerformanceUpdate(participant.userId, {
        ...metrics,
        ...additionalMetrics,
        lastUpdated: new Date().toISOString()
      });

      this.logger.debug(`Processed participant ${participant.userId} successfully`);

    } catch (error) {
      this.logger.error(`Failed to process participant ${participant.userId}:`, error);
      throw error;
    }
  }

  /**
   * Store performance data for historical tracking
   */
  private async storePerformanceData(
    participant: { userId: string; tournamentId: string; zimtraId: string },
    metrics: any,
    additionalMetrics: any
  ): Promise<void> {
    try {
      await DatabaseService.query(
        `INSERT INTO trading_performance (
          user_id, tournament_id, recorded_at,
          total_pnl, realized_pnl, unrealized_pnl, usd_balance,
          number_of_trades, total_shares_traded, number_of_stocks_traded,
          total_notional_traded, win_rate, best_trade, worst_trade,
          average_trade_size, total_commissions
        ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          participant.userId,
          participant.tournamentId,
          metrics.totalPnL,
          metrics.realizedPnL,
          metrics.unrealizedPnL,
          metrics.usdBalance,
          metrics.numberOfTrades,
          metrics.totalSharesTraded,
          metrics.numberOfStocksTraded,
          metrics.totalNotionalTraded,
          additionalMetrics.winRate,
          additionalMetrics.bestTrade,
          additionalMetrics.worstTrade,
          additionalMetrics.averageTradeSize,
          additionalMetrics.totalCommissions
        ]
      );

    } catch (error) {
      this.logger.error('Failed to store performance data:', error);
      throw error;
    }
  }

  /**
   * Update tournament participant record
   */
  private async updateParticipantRecord(
    participant: { userId: string; tournamentId: string },
    metrics: any
  ): Promise<void> {
    try {
      await DatabaseService.query(
        `UPDATE tournament_participants SET
          total_pnl = $1,
          realized_pnl = $2,
          unrealized_pnl = $3,
          current_balance = $4,
          total_trades = $5,
          total_volume = $6,
          last_updated = NOW()
         WHERE user_id = $7 AND tournament_id = $8`,
        [
          metrics.totalPnL,
          metrics.realizedPnL,
          metrics.unrealizedPnL,
          metrics.usdBalance,
          metrics.numberOfTrades,
          metrics.totalNotionalTraded,
          participant.userId,
          participant.tournamentId
        ]
      );

    } catch (error) {
      this.logger.error('Failed to update participant record:', error);
      throw error;
    }
  }

  /**
   * Update leaderboards for all active tournaments
   */
  private async updateAllLeaderboards(): Promise<void> {
    try {
      // Get all active tournaments
      const tournamentsResult = await DatabaseService.query(
        'SELECT id FROM tournaments WHERE status = $1',
        ['active']
      );

      // Update leaderboard for each tournament
      for (const tournament of tournamentsResult.rows) {
        await this.updateTournamentLeaderboard(tournament.id);
      }

    } catch (error) {
      this.logger.error('Failed to update leaderboards:', error);
      throw error;
    }
  }

  /**
   * Update leaderboard for a specific tournament
   */
  private async updateTournamentLeaderboard(tournamentId: string): Promise<void> {
    try {
      // Calculate new rankings based on total P&L
      await DatabaseService.query(
        `UPDATE tournament_participants 
         SET current_rank = ranked.new_rank
         FROM (
           SELECT user_id,
                  ROW_NUMBER() OVER (ORDER BY total_pnl DESC) as new_rank
           FROM tournament_participants 
           WHERE tournament_id = $1 AND is_active = true
         ) ranked
         WHERE tournament_participants.user_id = ranked.user_id
           AND tournament_participants.tournament_id = $1`,
        [tournamentId]
      );

      // Get updated leaderboard
      const leaderboardResult = await DatabaseService.query(
        `SELECT 
           tp.user_id, tp.current_rank, tp.total_pnl, tp.total_trades,
           u.username, u.first_name, u.last_name, u.avatar_url
         FROM tournament_participants tp
         JOIN users u ON tp.user_id = u.id
         WHERE tp.tournament_id = $1 AND tp.is_active = true
         ORDER BY tp.current_rank ASC
         LIMIT 50`,
        [tournamentId]
      );

      const leaderboard = leaderboardResult.rows.map(row => ({
        rank: row.current_rank,
        userId: row.user_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        totalPnL: parseFloat(row.total_pnl),
        totalTrades: row.total_trades
      }));

      // Broadcast leaderboard update via WebSocket
      this.webSocketService.broadcastLeaderboardUpdate(tournamentId, leaderboard);

      this.logger.debug(`Updated leaderboard for tournament ${tournamentId}`);

    } catch (error) {
      this.logger.error(`Failed to update leaderboard for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Update polling metrics
   */
  private updatePollingMetrics(success: boolean, responseTime: number): void {
    if (success) {
      this.pollingMetrics.successfulPolls++;
    } else {
      this.pollingMetrics.failedPolls++;
    }

    // Update average response time
    const totalPolls = this.pollingMetrics.successfulPolls + this.pollingMetrics.failedPolls;
    this.pollingMetrics.averageResponseTime = 
      (this.pollingMetrics.averageResponseTime * (totalPolls - 1) + responseTime) / totalPolls;

    this.pollingMetrics.lastPollTime = new Date();
    this.pollingMetrics.nextPollTime = new Date(Date.now() + this.config.interval);
  }

  /**
   * Handle polling errors with recovery mechanisms
   */
  private async handlePollingError(error: any): Promise<void> {
    this.logger.error('Implementing error recovery for polling failure:', error);

    // Implement exponential backoff for retries
    let retryCount = 0;
    while (retryCount < this.config.maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * Math.pow(2, retryCount)));
        
        // Attempt recovery poll
        await this.executePoll();
        
        this.logger.info('Polling recovery successful');
        return;

      } catch (retryError) {
        retryCount++;
        this.logger.warn(`Polling retry ${retryCount} failed:`, retryError);
      }
    }

    this.logger.error('Polling recovery failed after maximum retries');
  }

  /**
   * Get polling system status and metrics
   */
  public getPollingStatus(): PollingMetrics & {
    config: PollingConfig;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const successRate = this.pollingMetrics.totalPolls > 0 
      ? (this.pollingMetrics.successfulPolls / this.pollingMetrics.totalPolls) * 100 
      : 0;

    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (successRate < 50) {
      healthStatus = 'unhealthy';
    } else if (successRate < 90) {
      healthStatus = 'degraded';
    }

    return {
      ...this.pollingMetrics,
      config: this.config,
      healthStatus
    };
  }

  /**
   * Force a manual poll (for testing or admin triggers)
   */
  public async forcePoll(): Promise<void> {
    this.logger.info('Executing forced poll');
    await this.executePoll();
  }

  /**
   * Update polling configuration
   */
  public updateConfig(newConfig: Partial<PollingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Polling configuration updated:', this.config);

    // Restart polling with new configuration if active
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }
}
```

## 📊 Historical Data Management

### **Chart Data Service**

```typescript
// src/services/chart-data.service.ts
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

export interface ChartDataPoint {
  timestamp: Date;
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  numberOfTrades: number;
  usdBalance: number;
}

export interface ChartDataRequest {
  userId: string;
  tournamentId: string;
  timeframe: '1h' | '24h' | '7d' | '30d';
  granularity?: 'minute' | 'hour' | 'day';
}

export class ChartDataService {
  private static logger = new Logger('ChartDataService');

  /**
   * Get chart data for a specific user and timeframe
   */
  static async getChartData(request: ChartDataRequest): Promise<ChartDataPoint[]> {
    try {
      const { timeFilter, granularity } = this.buildTimeFilter(request.timeframe, request.granularity);
      
      const query = `
        SELECT 
          ${this.buildTimeGrouping(granularity)} as timestamp,
          AVG(total_pnl) as total_pnl,
          AVG(realized_pnl) as realized_pnl,
          AVG(unrealized_pnl) as unrealized_pnl,
          AVG(number_of_trades) as number_of_trades,
          AVG(usd_balance) as usd_balance
        FROM trading_performance 
        WHERE user_id = $1 
          AND tournament_id = $2 
          ${timeFilter}
        GROUP BY ${this.buildTimeGrouping(granularity)}
        ORDER BY timestamp ASC
      `;

      const result = await DatabaseService.query(query, [request.userId, request.tournamentId]);

      return result.rows.map(row => ({
        timestamp: new Date(row.timestamp),
        totalPnL: parseFloat(row.total_pnl),
        realizedPnL: parseFloat(row.realized_pnl),
        unrealizedPnL: parseFloat(row.unrealized_pnl),
        numberOfTrades: parseInt(row.number_of_trades),
        usdBalance: parseFloat(row.usd_balance)
      }));

    } catch (error) {
      this.logger.error('Failed to get chart data:', error);
      throw error;
    }
  }

  /**
   * Get comparison chart data for multiple traders
   */
  static async getComparisonChartData(
    traderIds: string[],
    tournamentId: string,
    timeframe: '1h' | '24h' | '7d' | '30d'
  ): Promise<{
    [traderId: string]: ChartDataPoint[];
  }> {
    try {
      const chartData: { [traderId: string]: ChartDataPoint[] } = {};

      for (const traderId of traderIds) {
        chartData[traderId] = await this.getChartData({
          userId: traderId,
          tournamentId,
          timeframe
        });
      }

      return chartData;

    } catch (error) {
      this.logger.error('Failed to get comparison chart data:', error);
      throw error;
    }
  }

  /**
   * Get aggregated tournament performance data
   */
  static async getTournamentPerformanceData(
    tournamentId: string,
    timeframe: '1h' | '24h' | '7d' | '30d'
  ): Promise<{
    totalVolume: ChartDataPoint[];
    averagePerformance: ChartDataPoint[];
    participantCount: Array<{ timestamp: Date; count: number }>;
  }> {
    try {
      const { timeFilter, granularity } = this.buildTimeFilter(timeframe);

      // Total volume data
      const volumeQuery = `
        SELECT 
          ${this.buildTimeGrouping(granularity)} as timestamp,
          SUM(total_notional_traded) as total_volume,
          AVG(total_pnl) as avg_pnl,
          COUNT(DISTINCT user_id) as participant_count
        FROM trading_performance 
        WHERE tournament_id = $1 ${timeFilter}
        GROUP BY ${this.buildTimeGrouping(granularity)}
        ORDER BY timestamp ASC
      `;

      const volumeResult = await DatabaseService.query(volumeQuery, [tournamentId]);

      const totalVolume = volumeResult.rows.map(row => ({
        timestamp: new Date(row.timestamp),
        totalPnL: parseFloat(row.total_volume),
        realizedPnL: 0,
        unrealizedPnL: 0,
        numberOfTrades: 0,
        usdBalance: 0
      }));

      const averagePerformance = volumeResult.rows.map(row => ({
        timestamp: new Date(row.timestamp),
        totalPnL: parseFloat(row.avg_pnl),
        realizedPnL: 0,
        unrealizedPnL: 0,
        numberOfTrades: 0,
        usdBalance: 0
      }));

      const participantCount = volumeResult.rows.map(row => ({
        timestamp: new Date(row.timestamp),
        count: parseInt(row.participant_count)
      }));

      return {
        totalVolume,
        averagePerformance,
        participantCount
      };

    } catch (error) {
      this.logger.error('Failed to get tournament performance data:', error);
      throw error;
    }
  }

  /**
   * Build time filter for SQL queries
   */
  private static buildTimeFilter(
    timeframe: string,
    granularity?: string
  ): { timeFilter: string; granularity: string } {
    let timeFilter = '';
    let defaultGranularity = 'hour';

    switch (timeframe) {
      case '1h':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '1 hour'";
        defaultGranularity = 'minute';
        break;
      case '24h':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '24 hours'";
        defaultGranularity = 'hour';
        break;
      case '7d':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '7 days'";
        defaultGranularity = 'hour';
        break;
      case '30d':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '30 days'";
        defaultGranularity = 'day';
        break;
      default:
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '24 hours'";
    }

    return {
      timeFilter,
      granularity: granularity || defaultGranularity
    };
  }

  /**
   * Build time grouping for SQL queries
   */
  private static buildTimeGrouping(granularity: string): string {
    switch (granularity) {
      case 'minute':
        return "DATE_TRUNC('minute', recorded_at)";
      case 'hour':
        return "DATE_TRUNC('hour', recorded_at)";
      case 'day':
        return "DATE_TRUNC('day', recorded_at)";
      default:
        return "DATE_TRUNC('hour', recorded_at)";
    }
  }

  /**
   * Clean up old performance data
   */
  static async cleanupOldData(retentionDays: number = 90): Promise<void> {
    try {
      const result = await DatabaseService.query(
        `DELETE FROM trading_performance 
         WHERE recorded_at < NOW() - INTERVAL '${retentionDays} days'`,
        []
      );

      this.logger.info(`Cleaned up ${result.rowCount} old performance records`);

    } catch (error) {
      this.logger.error('Failed to cleanup old data:', error);
      throw error;
    }
  }
}
```

## 🔄 Polling System Monitoring

### **Monitoring and Health Check Service**

```typescript
// src/services/polling-monitor.service.ts
import { PollingService } from './polling.service';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

export interface PollingHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  successRate: number;
  averageResponseTime: number;
  lastSuccessfulPoll: Date;
  errorCount: number;
  participantsProcessed: number;
  tournamentsActive: number;
}

export class PollingMonitorService {
  private static logger = new Logger('PollingMonitorService');
  private static pollingService = PollingService.getInstance();

  /**
   * Get comprehensive health report
   */
  static async getHealthReport(): Promise<PollingHealthReport> {
    try {
      const pollingStatus = this.pollingService.getPollingStatus();
      
      // Get additional metrics from database
      const participantsResult = await DatabaseService.query(
        `SELECT COUNT(*) as count FROM tournament_participants tp
         JOIN tournaments t ON tp.tournament_id = t.id
         WHERE tp.is_active = true AND t.status = 'active'`,
        []
      );

      const tournamentsResult = await DatabaseService.query(
        'SELECT COUNT(*) as count FROM tournaments WHERE status = $1',
        ['active']
      );

      const successRate = pollingStatus.totalPolls > 0 
        ? (pollingStatus.successfulPolls / pollingStatus.totalPolls) * 100 
        : 0;

      const uptime = Date.now() - pollingStatus.lastPollTime.getTime();

      return {
        status: pollingStatus.healthStatus,
        uptime,
        successRate,
        averageResponseTime: pollingStatus.averageResponseTime,
        lastSuccessfulPoll: pollingStatus.lastPollTime,
        errorCount: pollingStatus.failedPolls,
        participantsProcessed: parseInt(participantsResult.rows[0].count),
        tournamentsActive: parseInt(tournamentsResult.rows[0].count)
      };

    } catch (error) {
      this.logger.error('Failed to get health report:', error);
      throw error;
    }
  }

  /**
   * Check if polling system is healthy
   */
  static async isHealthy(): Promise<boolean> {
    try {
      const report = await this.getHealthReport();
      return report.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get polling performance metrics
   */
  static async getPerformanceMetrics(): Promise<{
    pollsPerHour: number;
    dataPointsPerHour: number;
    errorRate: number;
    averageLatency: number;
  }> {
    try {
      const pollingStatus = this.pollingService.getPollingStatus();
      
      // Calculate metrics
      const pollsPerHour = (60 * 60 * 1000) / pollingStatus.config.interval;
      const dataPointsPerHour = pollsPerHour * await this.getActiveParticipantCount();
      const errorRate = pollingStatus.totalPolls > 0 
        ? (pollingStatus.failedPolls / pollingStatus.totalPolls) * 100 
        : 0;

      return {
        pollsPerHour,
        dataPointsPerHour,
        errorRate,
        averageLatency: pollingStatus.averageResponseTime
      };

    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get active participant count
   */
  private static async getActiveParticipantCount(): Promise<number> {
    const result = await DatabaseService.query(
      `SELECT COUNT(*) as count FROM tournament_participants tp
       JOIN tournaments t ON tp.tournament_id = t.id
       WHERE tp.is_active = true AND t.status = 'active'`,
      []
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Generate health check endpoint response
   */
  static async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    polling: any;
    database: boolean;
  }> {
    try {
      const pollingHealth = await this.isHealthy();
      const databaseHealth = await this.checkDatabaseHealth();
      const pollingStatus = this.pollingService.getPollingStatus();

      return {
        status: pollingHealth && databaseHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        polling: {
          active: pollingStatus.isActive,
          successRate: pollingStatus.totalPolls > 0 
            ? (pollingStatus.successfulPolls / pollingStatus.totalPolls) * 100 
            : 0,
          lastPoll: pollingStatus.lastPollTime,
          nextPoll: pollingStatus.nextPollTime
        },
        database: databaseHealth
      };

    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        polling: { active: false, error: error.message },
        database: false
      };
    }
  }

  /**
   * Check database connectivity
   */
  private static async checkDatabaseHealth(): Promise<boolean> {
    try {
      await DatabaseService.query('SELECT 1', []);
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

## ✅ Functional Validation Testing

### **Test 9.1: Polling System Validation**

```typescript
// src/tests/polling.test.ts
import { PollingService } from '../services/polling.service';
import { ChartDataService } from '../services/chart-data.service';
import { PollingMonitorService } from '../services/polling-monitor.service';

describe('Polling System', () => {
  let pollingService: PollingService;

  beforeAll(() => {
    pollingService = PollingService.getInstance();
  });

  afterAll(async () => {
    pollingService.stopPolling();
  });

  describe('Polling Service', () => {
    test('should start polling successfully', async () => {
      await pollingService.startPolling();
      
      const status = pollingService.getPollingStatus();
      expect(status.isActive).toBe(true);
      expect(status.config.interval).toBe(60000); // 60 seconds
    });

    test('should execute manual poll', async () => {
      await pollingService.forcePoll();
      
      const status = pollingService.getPollingStatus();
      expect(status.totalPolls).toBeGreaterThan(0);
    });

    test('should update polling configuration', () => {
      pollingService.updateConfig({ interval: 30000 });
      
      const status = pollingService.getPollingStatus();
      expect(status.config.interval).toBe(30000);
    });

    test('should stop polling successfully', () => {
      pollingService.stopPolling();
      
      const status = pollingService.getPollingStatus();
      expect(status.isActive).toBe(false);
    });
  });

  describe('Chart Data Service', () => {
    test('should get chart data for user', async () => {
      const chartData = await ChartDataService.getChartData({
        userId: 'test-user-id',
        tournamentId: 'test-tournament-id',
        timeframe: '24h'
      });

      expect(Array.isArray(chartData)).toBe(true);
      if (chartData.length > 0) {
        expect(chartData[0]).toHaveProperty('timestamp');
        expect(chartData[0]).toHaveProperty('totalPnL');
        expect(chartData[0]).toHaveProperty('numberOfTrades');
      }
    });

    test('should get comparison chart data', async () => {
      const comparisonData = await ChartDataService.getComparisonChartData(
        ['trader1-id', 'trader2-id'],
        'test-tournament-id',
        '24h'
      );

      expect(typeof comparisonData).toBe('object');
      expect(comparisonData).toHaveProperty('trader1-id');
      expect(comparisonData).toHaveProperty('trader2-id');
    });

    test('should get tournament performance data', async () => {
      const performanceData = await ChartDataService.getTournamentPerformanceData(
        'test-tournament-id',
        '7d'
      );

      expect(performanceData).toHaveProperty('totalVolume');
      expect(performanceData).toHaveProperty('averagePerformance');
      expect(performanceData).toHaveProperty('participantCount');
    });
  });

  describe('Polling Monitor Service', () => {
    test('should get health report', async () => {
      const healthReport = await PollingMonitorService.getHealthReport();

      expect(healthReport).toHaveProperty('status');
      expect(healthReport).toHaveProperty('successRate');
      expect(healthReport).toHaveProperty('averageResponseTime');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthReport.status);
    });

    test('should check if system is healthy', async () => {
      const isHealthy = await PollingMonitorService.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });

    test('should get performance metrics', async () => {
      const metrics = await PollingMonitorService.getPerformanceMetrics();

      expect(metrics).toHaveProperty('pollsPerHour');
      expect(metrics).toHaveProperty('dataPointsPerHour');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('averageLatency');
    });

    test('should perform health check', async () => {
      const healthCheck = await PollingMonitorService.healthCheck();

      expect(healthCheck).toHaveProperty('status');
      expect(healthCheck).toHaveProperty('timestamp');
      expect(healthCheck).toHaveProperty('polling');
      expect(healthCheck).toHaveProperty('database');
    });
  });
});
```

### **Test 9.2: Metrics Calculation Integration**

```typescript
// src/tests/polling-integration.test.ts
import { PollingService } from '../services/polling.service';
import { MetricsCalculator } from '../utils/metrics.calculator';
import { DatabaseService } from '../services/database.service';

describe('Polling Integration', () => {
  const mockZimtraResponse = {
    account: { cashBalance: 100000, totalValue: 150000, buyingPower: 200000 },
    positions: [
      {
        symbol: 'AAPL',
        quantity: 100,
        averagePrice: 150,
        currentPrice: 155,
        currentValue: 15500,
        costBasis: 15000,
        unrealizedPnL: 500
      }
    ],
    trades: [
      {
        id: 'trade1',
        symbol: 'AAPL',
        quantity: 100,
        price: 150,
        side: 'buy',
        executedAt: '2025-07-25T10:00:00Z',
        commission: 1
      }
    ],
    closedPositions: [
      { symbol: 'MSFT', realizedGainLoss: 1000, closedAt: '2025-07-25T09:00:00Z' }
    ],
    openPositions: [
      { symbol: 'AAPL', quantity: 100, averagePrice: 150, currentPrice: 155 }
    ]
  };

  test('should parse Zimtra data correctly', () => {
    const metrics = MetricsCalculator.parseTradeDataToMetrics(mockZimtraResponse);

    expect(metrics.totalPnL).toBe(1500); // 1000 realized + 500 unrealized
    expect(metrics.totalSharesTraded).toBe(100);
    expect(metrics.usdBalance).toBe(100000);
    expect(metrics.realizedPnL).toBe(1000);
    expect(metrics.numberOfStocksTraded).toBe(1);
    expect(metrics.numberOfTrades).toBe(1);
    expect(metrics.unrealizedPnL).toBe(500);
    expect(metrics.totalNotionalTraded).toBe(15000);
  });

  test('should store performance data correctly', async () => {
    const metrics = MetricsCalculator.parseTradeDataToMetrics(mockZimtraResponse);
    const additionalMetrics = MetricsCalculator.calculateAdditionalMetrics(mockZimtraResponse);

    // This would be called by the polling service
    await DatabaseService.query(
      `INSERT INTO trading_performance (
        user_id, tournament_id, recorded_at,
        total_pnl, realized_pnl, unrealized_pnl, usd_balance,
        number_of_trades, total_shares_traded, number_of_stocks_traded,
        total_notional_traded, win_rate, best_trade, worst_trade
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        'test-user-id',
        'test-tournament-id',
        metrics.totalPnL,
        metrics.realizedPnL,
        metrics.unrealizedPnL,
        metrics.usdBalance,
        metrics.numberOfTrades,
        metrics.totalSharesTraded,
        metrics.numberOfStocksTraded,
        metrics.totalNotionalTraded,
        additionalMetrics.winRate,
        additionalMetrics.bestTrade,
        additionalMetrics.worstTrade
      ]
    );

    // Verify data was stored
    const result = await DatabaseService.query(
      'SELECT * FROM trading_performance WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1',
      ['test-user-id']
    );

    expect(result.rows.length).toBe(1);
    expect(parseFloat(result.rows[0].total_pnl)).toBe(1500);
  });
});
```

## 🎯 Explicit Completion Declaration

**Task 09 Completion Criteria:**

- [x] Complete 60-second polling system implementation
- [x] Zimtra API data collection and parsing into eight metrics
- [x] Historical data storage for chart generation
- [x] Leaderboard calculation and ranking updates
- [x] Error handling and recovery mechanisms
- [x] Performance monitoring and health checks
- [x] Chart data service for historical visualization
- [x] Batch processing for scalable participant handling
- [x] WebSocket integration for real-time updates
- [x] Comprehensive test suite for polling functionality
- [x] Polling configuration management and monitoring
- [x] Data cleanup and retention management

**Deliverables:**
1. PollingService class with complete 60-second polling implementation
2. ChartDataService for historical data aggregation and visualization
3. PollingMonitorService for system health and performance monitoring
4. Error handling and recovery mechanisms with exponential backoff
5. Comprehensive test suite for polling system validation
6. Integration with WebSocket service for real-time updates

**Next Step Validation:**
Task 09 is complete and ready for Task 10 (GetStream.io Chat Integration). The polling system provides reliable data collection and processing foundation for all real-time platform features.

## 📞 Stakeholder Communication Template

**Status Update for Project Stakeholders:**

"Task 09 (Polling System Implementation) has been completed successfully. The complete 60-second polling system is now operational with Zimtra API data collection, eight metrics parsing, historical data aggregation, and leaderboard updates. The system includes robust error handling, performance monitoring, and comprehensive testing coverage for reliable data processing."

**Technical Summary:**
- 60-second polling system with Zimtra API integration
- Eight dashboard metrics calculation and storage
- Historical data aggregation for chart generation
- Leaderboard calculation and ranking updates
- Error handling and recovery mechanisms
- Performance monitoring and health checks

**Ready for Next Phase:** GetStream.io Chat Integration (Task 10)

