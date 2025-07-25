import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';
import { DatabaseService } from './database.service';
import { ActivityDetectionService } from './activity-detection.service';
import { WebSocketService } from './websocket.service';

const logger = new Logger('ZimtraPollingService');

// Test trader IDs as specified in requirements
const TEST_TRADER_IDS = [
  'ZIMSTISIM05498',
  'ZIMSTISIM6FB26', 
  'ZIMSTISIM0A60E',
  'ZIMSTISIM10090'
];

// Raw Zimtra API response interface
export interface ZimtraRawTradeData {
  traderId: string;
  accountBalance: number;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  positions: Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    notionalValue: number;
  }>;
  trades: Array<{
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    timestamp: string;
    realizedPnl: number;
  }>;
  timestamp: string;
}

// Dashboard metrics interface matching the trading_performance table
export interface CreateTradingPerformanceData {
  tournament_id: string;
  user_id: string;
  participant_id: string;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  usd_balance: number;
  number_of_trades: number;
  total_shares_traded: number;
  number_of_stocks_traded: number;
  total_notional_traded: number;
  raw_zimtra_data: any;
  recorded_at: string;
}

export class ZimtraPollingService {
  private static instance: ZimtraPollingService;
  private client: AxiosInstance;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private databaseService: DatabaseService | null = null;
  private activityDetectionService: ActivityDetectionService | null = null;
  private webSocketService: WebSocketService | null = null;
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.ZIMTRA_API_KEY!;
    this.apiUrl = process.env.ZIMTRA_TRADE_API_URL!;

    if (!this.apiKey || !this.apiUrl) {
      throw new Error('Missing Zimtra API configuration. Please check ZIMTRA_API_KEY and ZIMTRA_TRADE_API_URL environment variables.');
    }

    // Initialize axios client with base configuration
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`Making API request to: ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`API response received: ${response.status}`);
        return response;
      },
      (error) => {
         logger.error('API response error:', { status: error.response?.status, data: error.response?.data });
         return Promise.reject(error);
       }
    );
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ZimtraPollingService {
    if (!ZimtraPollingService.instance) {
      ZimtraPollingService.instance = new ZimtraPollingService();
    }
    return ZimtraPollingService.instance;
  }

  /**
   * Initialize the database service and related services
   */
  async initialize(): Promise<void> {
    if (!this.databaseService) {
      this.databaseService = await DatabaseService.initialize();
    }
    
    if (!this.activityDetectionService) {
      this.activityDetectionService = new ActivityDetectionService();
      await this.activityDetectionService.initialize();
    }
    
    if (!this.webSocketService) {
      this.webSocketService = WebSocketService.getInstance();
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
   * Fetch trading data for a single trader
   */
  async fetchTraderData(traderId: string): Promise<ZimtraRawTradeData> {
    try {
      logger.info(`Fetching data for trader: ${traderId}`);
      
      const response = await this.client.get(`/trader/${traderId}/data`);
      
      if (!response.data) {
        throw new Error(`No data received for trader ${traderId}`);
      }

      return response.data as ZimtraRawTradeData;
    } catch (error) {
      logger.error(`Failed to fetch data for trader ${traderId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch trading data for all test traders
   */
  async fetchAllTradersData(): Promise<ZimtraRawTradeData[]> {
    try {
      logger.info('Fetching data for all test traders');
      
      const promises = TEST_TRADER_IDS.map(traderId => this.fetchTraderData(traderId));
      const results = await Promise.allSettled(promises);
      
      const successfulResults: ZimtraRawTradeData[] = [];
      const failedResults: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value);
        } else {
          failedResults.push(TEST_TRADER_IDS[index]);
          logger.error(`Failed to fetch data for trader ${TEST_TRADER_IDS[index]}:`, result.reason);
        }
      });
      
      if (failedResults.length > 0) {
        logger.warn(`Failed to fetch data for ${failedResults.length} traders: ${failedResults.join(', ')}`);
      }
      
      logger.info(`Successfully fetched data for ${successfulResults.length} traders`);
      return successfulResults;
    } catch (error) {
      logger.error('Failed to fetch data for all traders:', error);
      throw error;
    }
  }

  /**
   * Calculate dashboard metrics from raw Zimtra data
   */
  calculateMetrics(rawData: ZimtraRawTradeData): CreateTradingPerformanceData {
    const totalSharesTraded = rawData.trades.reduce((sum, trade) => sum + trade.quantity, 0);
    const numberOfStocksTraded = new Set(rawData.trades.map(trade => trade.symbol)).size;
    const totalNotionalTraded = rawData.trades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);

    return {
      tournament_id: 'placeholder-tournament-id', // TODO: Get from context
      user_id: 'placeholder-user-id', // TODO: Map from trader ID
      participant_id: 'placeholder-participant-id', // TODO: Map from trader ID
      total_pnl: rawData.totalPnl,
      realized_pnl: rawData.realizedPnl,
      unrealized_pnl: rawData.unrealizedPnl,
      usd_balance: rawData.accountBalance,
      number_of_trades: rawData.trades.length,
      total_shares_traded: totalSharesTraded,
      number_of_stocks_traded: numberOfStocksTraded,
      total_notional_traded: totalNotionalTraded,
      raw_zimtra_data: rawData,
      recorded_at: new Date().toISOString()
    };
  }

  /**
   * Store calculated metrics in Supabase
   */
  async storeMetrics(metrics: CreateTradingPerformanceData): Promise<void> {
    try {
      await this.ensureDatabaseInitialized();
      const supabase = this.databaseService!.getClient();
      
      const { data, error } = await supabase
        .from('trading_performance')
        .insert(metrics);

      if (error) {
        throw new Error(`Failed to store metrics: ${error.message}`);
      }

      logger.info(`Successfully stored metrics for trader`);
    } catch (error) {
      logger.error('Failed to store metrics:', error);
      throw error;
    }
  }

  /**
   * Process and store data for all traders with activity detection
   */
  async processAndStoreAllData(): Promise<void> {
    try {
      logger.info('Starting data processing and storage cycle');
      
      const rawDataArray = await this.fetchAllTradersData();
      
      // Store trading performance metrics for each trader
      for (const rawData of rawDataArray) {
        try {
          const metrics = this.calculateMetrics(rawData);
          await this.storeMetrics(metrics);
        } catch (error) {
          logger.error(`Failed to process data for trader ${rawData.traderId}:`, error);
          // Continue processing other traders even if one fails
        }
      }
      
      // Process activity detection for all traders at once if service is available
       if (this.activityDetectionService && rawDataArray.length > 0) {
         try {
           const activityScores = await this.activityDetectionService.processZimtraData(rawDataArray);
           
           logger.info(`Processed activity scores for ${activityScores.length} traders`);
           
           // Broadcast activity updates via WebSocket if service is available
           if (this.webSocketService && activityScores.length > 0) {
             try {
               this.webSocketService.broadcastActivityUpdate(activityScores);
               logger.info(`Broadcasted activity updates for ${activityScores.length} traders`);
             } catch (error) {
               logger.error('Failed to broadcast activity updates:', error);
             }
           }
         } catch (error) {
           logger.error('Failed to process activity detection:', error);
         }
       }
      
      logger.info('Completed data processing and storage cycle');
    } catch (error) {
      logger.error('Failed to process and store data:', error);
      throw error;
    }
  }

  /**
   * Start the polling system (60-second intervals)
   */
  async startPolling(): Promise<void> {
    if (this.isPolling) {
      logger.warn('Polling is already active');
      return;
    }

    try {
      logger.info('Starting Zimtra data polling (60-second intervals)');
      this.isPolling = true;

      // Process data immediately
      await this.processAndStoreAllData();

      // Set up recurring polling
      this.pollingInterval = setInterval(async () => {
        try {
          await this.processAndStoreAllData();
        } catch (error) {
          logger.error('Error during polling cycle:', error);
        }
      }, 60000); // 60 seconds

      logger.info('Zimtra data polling started successfully');
    } catch (error) {
      this.isPolling = false;
      logger.error('Failed to start polling:', error);
      throw error;
    }
  }

  /**
   * Stop the polling system
   */
  stopPolling(): void {
    if (!this.isPolling) {
      logger.warn('Polling is not active');
      return;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isPolling = false;
    logger.info('Zimtra data polling stopped');
  }

  /**
   * Get current polling status
   */
  getPollingStatus(): { isPolling: boolean; intervalMs: number } {
    return {
      isPolling: this.isPolling,
      intervalMs: 60000
    };
  }

  /**
   * Test connection to Zimtra API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Testing Zimtra API connection');
      
      // Try to fetch data for the first test trader
      await this.fetchTraderData(TEST_TRADER_IDS[0]);
      
      logger.info('Zimtra API connection test successful');
      return {
        success: true,
        message: 'Successfully connected to Zimtra API'
      };
    } catch (error) {
      logger.error('Zimtra API connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get latest metrics from database
   */
  async getLatestMetrics(): Promise<any[]> {
    try {
      await this.ensureDatabaseInitialized();
      const supabase = this.databaseService!.getClient();
      
      const { data, error } = await supabase
        .from('trading_performance')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch latest metrics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch latest metrics:', error);
      throw error;
    }
  }

  /**
   * Get activity heatmap data for a trader
   */
  async getActivityHeatmapData(traderId: string, hours: number = 24): Promise<any> {
    try {
      if (!this.activityDetectionService) {
        throw new Error('Activity detection service not initialized');
      }
      
      return await this.activityDetectionService.getActivityHeatmapData(traderId, hours);
    } catch (error) {
      logger.error(`Failed to get activity heatmap data for trader ${traderId}:`, error);
      throw error;
    }
  }

  /**
   * Get current activity status for all traders
   */
  async getCurrentActivityStatus(): Promise<Map<string, any>> {
    try {
      if (!this.activityDetectionService) {
        return new Map();
      }
      
      return await this.activityDetectionService.getCurrentActivityStatus();
    } catch (error) {
      logger.error('Failed to get current activity status:', error);
      throw error;
    }
  }

  /**
   * Reset activity history (useful for testing)
   */
  resetActivityHistory(): void {
    try {
      if (this.activityDetectionService) {
        this.activityDetectionService.resetActivityHistory();
        logger.info('Activity history reset via ZimtraPollingService');
      }
    } catch (error) {
      logger.error('Failed to reset activity history:', error);
    }
  }

  /**
   * Get WebSocket service instance
   */
  getWebSocketService(): WebSocketService | null {
    return this.webSocketService;
  }

  /**
   * Get activity detection service instance
   */
  getActivityDetectionService(): ActivityDetectionService | null {
    return this.activityDetectionService;
  }
}