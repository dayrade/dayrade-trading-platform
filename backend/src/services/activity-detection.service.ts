import { Logger } from '../utils/logger';
import { DatabaseService } from './database.service';
import { ZimtraRawTradeData } from './zimtra-polling.service';

const logger = new Logger('ActivityDetectionService');

export interface ActivityScore {
  traderId: string;
  timestamp: string;
  activityLevel: number; // 0.0 to 1.0
  tradingVolume: number;
  tradeFrequency: number;
  portfolioChanges: number;
  rawScore: number;
  normalizedScore: number;
}

export interface ActivityPeriod {
  startTime: string;
  endTime: string;
  activityScores: ActivityScore[];
  averageActivity: number;
  peakActivity: number;
  totalTrades: number;
  totalVolume: number;
}

export interface ActivityHeatmapData {
  traderId: string;
  timeSlots: Array<{
    time: string;
    activity: number;
    trades: number;
    volume: number;
    color: string;
  }>;
  summary: {
    totalTrades: number;
    totalVolume: number;
    peakActivity: number;
    averageActivity: number;
  };
}

export class ActivityDetectionService {
  private databaseService: DatabaseService | null = null;
  private previousData: Map<string, ZimtraRawTradeData> = new Map();
  private activityHistory: Map<string, ActivityScore[]> = new Map();

  constructor() {}

  /**
   * Initialize the database service
   */
  async initialize(): Promise<void> {
    if (!this.databaseService) {
      this.databaseService = await DatabaseService.initialize();
    }
  }

  /**
   * Ensure database service is initialized
   */
  private async ensureDatabaseInitialized(): Promise<void> {
    if (!this.databaseService) {
      await this.initialize();
    }
  }

  /**
   * Calculate activity score based on trading data changes
   */
  calculateActivityScore(
    currentData: ZimtraRawTradeData,
    previousData?: ZimtraRawTradeData
  ): ActivityScore {
    const timestamp = new Date().toISOString();
    
    // If no previous data, calculate based on current activity
    if (!previousData) {
      const baseScore = this.calculateBaseActivityScore(currentData);
      return {
        traderId: currentData.traderId,
        timestamp,
        activityLevel: baseScore,
        tradingVolume: this.calculateTradingVolume(currentData),
        tradeFrequency: currentData.trades.length,
        portfolioChanges: currentData.positions.length,
        rawScore: baseScore,
        normalizedScore: baseScore
      };
    }

    // Calculate changes from previous data
    const volumeChange = this.calculateVolumeChange(currentData, previousData);
    const tradeFrequencyChange = this.calculateTradeFrequencyChange(currentData, previousData);
    const portfolioChange = this.calculatePortfolioChange(currentData, previousData);
    const pnlChange = Math.abs(currentData.totalPnl - previousData.totalPnl);

    // Weight different factors
    const weights = {
      volume: 0.3,
      frequency: 0.25,
      portfolio: 0.25,
      pnl: 0.2
    };

    // Calculate raw score (0-100)
    const rawScore = 
      (volumeChange * weights.volume) +
      (tradeFrequencyChange * weights.frequency) +
      (portfolioChange * weights.portfolio) +
      (Math.min(pnlChange / 1000, 100) * weights.pnl); // Normalize PnL change

    // Normalize to 0-1 scale
    const normalizedScore = Math.min(rawScore / 100, 1.0);

    return {
      traderId: currentData.traderId,
      timestamp,
      activityLevel: normalizedScore,
      tradingVolume: this.calculateTradingVolume(currentData),
      tradeFrequency: currentData.trades.length,
      portfolioChanges: currentData.positions.length,
      rawScore,
      normalizedScore
    };
  }

  /**
   * Calculate base activity score for initial data
   */
  private calculateBaseActivityScore(data: ZimtraRawTradeData): number {
    const tradeCount = data.trades.length;
    const positionCount = data.positions.length;
    const volume = this.calculateTradingVolume(data);
    
    // Base scoring algorithm
    const tradeScore = Math.min(tradeCount / 10, 1.0) * 0.4; // Max 10 trades = full score
    const positionScore = Math.min(positionCount / 5, 1.0) * 0.3; // Max 5 positions = full score
    const volumeScore = Math.min(volume / 100000, 1.0) * 0.3; // Max 100k volume = full score
    
    return tradeScore + positionScore + volumeScore;
  }

  /**
   * Calculate trading volume from trade data
   */
  private calculateTradingVolume(data: ZimtraRawTradeData): number {
    return data.trades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);
  }

  /**
   * Calculate volume change between current and previous data
   */
  private calculateVolumeChange(current: ZimtraRawTradeData, previous: ZimtraRawTradeData): number {
    const currentVolume = this.calculateTradingVolume(current);
    const previousVolume = this.calculateTradingVolume(previous);
    const change = currentVolume - previousVolume;
    
    // Normalize to 0-100 scale (assuming max change of 50k per minute)
    return Math.min(Math.abs(change) / 50000 * 100, 100);
  }

  /**
   * Calculate trade frequency change
   */
  private calculateTradeFrequencyChange(current: ZimtraRawTradeData, previous: ZimtraRawTradeData): number {
    const currentTrades = current.trades.length;
    const previousTrades = previous.trades.length;
    const change = Math.abs(currentTrades - previousTrades);
    
    // Normalize to 0-100 scale (assuming max 10 new trades per minute)
    return Math.min(change / 10 * 100, 100);
  }

  /**
   * Calculate portfolio change (position changes)
   */
  private calculatePortfolioChange(current: ZimtraRawTradeData, previous: ZimtraRawTradeData): number {
    const currentPositions = new Set(current.positions.map(p => p.symbol));
    const previousPositions = new Set(previous.positions.map(p => p.symbol));
    
    // Calculate new positions and closed positions
    const newPositions = [...currentPositions].filter(symbol => !previousPositions.has(symbol));
    const closedPositions = [...previousPositions].filter(symbol => !currentPositions.has(symbol));
    const totalChanges = newPositions.length + closedPositions.length;
    
    // Calculate quantity changes for existing positions
    let quantityChanges = 0;
    for (const currentPos of current.positions) {
      const previousPos = previous.positions.find(p => p.symbol === currentPos.symbol);
      if (previousPos) {
        quantityChanges += Math.abs(currentPos.quantity - previousPos.quantity);
      }
    }
    
    // Normalize to 0-100 scale
    const positionChangeScore = Math.min(totalChanges / 5 * 50, 50); // Max 5 position changes = 50 points
    const quantityChangeScore = Math.min(quantityChanges / 1000 * 50, 50); // Max 1000 shares change = 50 points
    
    return positionChangeScore + quantityChangeScore;
  }

  /**
   * Process new Zimtra data and calculate activity
   */
  async processZimtraData(data: ZimtraRawTradeData[]): Promise<ActivityScore[]> {
    const activityScores: ActivityScore[] = [];

    for (const currentData of data) {
      const previousData = this.previousData.get(currentData.traderId);
      const activityScore = this.calculateActivityScore(currentData, previousData);
      
      activityScores.push(activityScore);
      
      // Store current data as previous for next iteration
      this.previousData.set(currentData.traderId, currentData);
      
      // Store activity score in history
      if (!this.activityHistory.has(currentData.traderId)) {
        this.activityHistory.set(currentData.traderId, []);
      }
      
      const history = this.activityHistory.get(currentData.traderId)!;
      history.push(activityScore);
      
      // Keep only last 24 hours of data (1440 minutes)
      if (history.length > 1440) {
        history.splice(0, history.length - 1440);
      }
    }

    // Store activity scores in database
    await this.storeActivityScores(activityScores);

    return activityScores;
  }

  /**
   * Store activity scores in database
   */
  private async storeActivityScores(scores: ActivityScore[]): Promise<void> {
    try {
      await this.ensureDatabaseInitialized();
      const supabase = this.databaseService!.getClient();

      const records = scores.map(score => ({
        trader_id: score.traderId,
        timestamp: score.timestamp,
        activity_level: score.activityLevel,
        trading_volume: score.tradingVolume,
        trade_frequency: score.tradeFrequency,
        portfolio_changes: score.portfolioChanges,
        raw_score: score.rawScore,
        normalized_score: score.normalizedScore,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('trading_activity')
        .insert(records);

      if (error) {
        throw new Error(`Failed to store activity scores: ${error.message}`);
      }

      logger.info(`Successfully stored ${scores.length} activity scores`);
    } catch (error) {
      logger.error('Failed to store activity scores:', error);
      throw error;
    }
  }

  /**
   * Get activity heatmap data for a trader
   */
  async getActivityHeatmapData(traderId: string, hours: number = 24): Promise<ActivityHeatmapData> {
    try {
      await this.ensureDatabaseInitialized();
      const supabase = this.databaseService!.getClient();

      const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('trading_activity')
        .select('*')
        .eq('trader_id', traderId)
        .gte('timestamp', fromTime)
        .order('timestamp', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch activity data: ${error.message}`);
      }

      return this.formatHeatmapData(traderId, data || []);
    } catch (error) {
      logger.error(`Failed to get activity heatmap data for trader ${traderId}:`, error);
      throw error;
    }
  }

  /**
   * Format activity data for heatmap visualization
   */
  private formatHeatmapData(traderId: string, activityData: any[]): ActivityHeatmapData {
    // Group data into time slots (30-minute intervals)
    const timeSlots: Map<string, any[]> = new Map();
    
    activityData.forEach(record => {
      const timestamp = new Date(record.timestamp);
      const slotTime = new Date(timestamp);
      slotTime.setMinutes(Math.floor(timestamp.getMinutes() / 30) * 30, 0, 0);
      const slotKey = slotTime.toISOString().substring(11, 16); // HH:MM format
      
      if (!timeSlots.has(slotKey)) {
        timeSlots.set(slotKey, []);
      }
      timeSlots.get(slotKey)!.push(record);
    });

    // Calculate aggregated data for each time slot
    const formattedSlots = Array.from(timeSlots.entries()).map(([time, records]) => {
      const avgActivity = records.reduce((sum, r) => sum + r.activity_level, 0) / records.length;
      const totalTrades = records.reduce((sum, r) => sum + r.trade_frequency, 0);
      const totalVolume = records.reduce((sum, r) => sum + r.trading_volume, 0);
      
      return {
        time,
        activity: avgActivity,
        trades: totalTrades,
        volume: totalVolume,
        color: this.getActivityColor(avgActivity)
      };
    });

    // Calculate summary statistics
    const totalTrades = activityData.reduce((sum, r) => sum + r.trade_frequency, 0);
    const totalVolume = activityData.reduce((sum, r) => sum + r.trading_volume, 0);
    const peakActivity = Math.max(...activityData.map(r => r.activity_level), 0);
    const averageActivity = activityData.length > 0 
      ? activityData.reduce((sum, r) => sum + r.activity_level, 0) / activityData.length 
      : 0;

    return {
      traderId,
      timeSlots: formattedSlots,
      summary: {
        totalTrades,
        totalVolume,
        peakActivity,
        averageActivity
      }
    };
  }

  /**
   * Get color based on activity level
   */
  private getActivityColor(activity: number): string {
    if (activity >= 0.8) return '#22c55e'; // High activity - green
    if (activity >= 0.6) return '#84cc16'; // Medium-high activity - lime
    if (activity >= 0.4) return '#eab308'; // Medium activity - yellow
    if (activity >= 0.2) return '#f97316'; // Low-medium activity - orange
    return '#6b7280'; // Low/no activity - gray
  }

  /**
   * Get current activity status for all traders
   */
  async getCurrentActivityStatus(): Promise<Map<string, ActivityScore>> {
    const currentStatus = new Map<string, ActivityScore>();
    
    for (const [traderId, history] of this.activityHistory.entries()) {
      if (history.length > 0) {
        currentStatus.set(traderId, history[history.length - 1]);
      }
    }
    
    return currentStatus;
  }

  /**
   * Reset activity history (useful for testing)
   */
  resetActivityHistory(): void {
    this.previousData.clear();
    this.activityHistory.clear();
    logger.info('Activity history reset');
  }
}