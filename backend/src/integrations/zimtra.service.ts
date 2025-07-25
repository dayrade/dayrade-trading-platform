import axios, { AxiosInstance, AxiosResponse } from 'axios';
import crypto from 'crypto';
import { Logger } from '../utils/logger';

const logger = new Logger('ZimtraService');

export interface ZimtraAccount {
  id: string;
  username: string;
  email: string;
  accountType: 'sim' | 'live';
  status: 'pending' | 'active' | 'suspended' | 'closed';
  balance: number;
  equity: number;
  marginUsed: number;
  marginAvailable: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ZimtraPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  openedAt: string;
}

export interface ZimtraTrade {
  id: string;
  accountId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission: number;
  netValue: number;
  executedAt: string;
  status: 'pending' | 'executed' | 'cancelled' | 'rejected';
}

export interface ZimtraPerformanceMetrics {
  accountId: string;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalVolume: number;
  maxDrawdown: number;
  sharpeRatio: number;
  calculatedAt: string;
}

export interface CreateAccountRequest {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  accountType: 'sim' | 'live';
  kycDocuments?: any[];
}

export interface WebhookPayload {
  event: string;
  accountId: string;
  data: any;
  timestamp: string;
  signature: string;
}

export class ZimtraService {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.ZIMTRA_API_KEY!;
    this.apiSecret = process.env.ZIMTRA_API_SECRET!;
    this.webhookSecret = process.env.ZIMTRA_WEBHOOK_SECRET!;

    this.client = axios.create({
      baseURL: process.env.ZIMTRA_API_URL || 'https://api.zimtra.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Date.now().toString();
        const signature = this.generateSignature(config.method!, config.url!, timestamp, config.data);
        
        config.headers['X-Timestamp'] = timestamp;
        config.headers['X-Signature'] = signature;
        
        logger.info(`Zimtra API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Zimtra API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`Zimtra API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Zimtra API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  private generateSignature(method: string, url: string, timestamp: string, data?: any): string {
    const payload = `${method.toUpperCase()}${url}${timestamp}${data ? JSON.stringify(data) : ''}`;
    return crypto.createHmac('sha256', this.apiSecret).update(payload).digest('hex');
  }

  // Account Management
  async createAccount(accountData: CreateAccountRequest): Promise<ZimtraAccount> {
    try {
      const response: AxiosResponse<ZimtraAccount> = await this.client.post('/accounts', accountData);
      logger.info(`Created Zimtra account: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create Zimtra account:', error);
      throw new Error('Failed to create Zimtra account');
    }
  }

  async getAccount(accountId: string): Promise<ZimtraAccount> {
    try {
      const response: AxiosResponse<ZimtraAccount> = await this.client.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get Zimtra account ${accountId}:`, error);
      throw new Error('Failed to get Zimtra account');
    }
  }

  async updateAccountStatus(accountId: string, status: 'active' | 'suspended' | 'closed'): Promise<ZimtraAccount> {
    try {
      const response: AxiosResponse<ZimtraAccount> = await this.client.patch(`/accounts/${accountId}/status`, { status });
      logger.info(`Updated Zimtra account ${accountId} status to ${status}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update Zimtra account ${accountId} status:`, error);
      throw new Error('Failed to update account status');
    }
  }

  // Trading Data
  async getAccountTrades(accountId: string, options?: {
    startDate?: string;
    endDate?: string;
    symbol?: string;
    limit?: number;
  }): Promise<ZimtraTrade[]> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      if (options?.symbol) params.append('symbol', options.symbol);
      if (options?.limit) params.append('limit', options.limit.toString());

      const response: AxiosResponse<ZimtraTrade[]> = await this.client.get(
        `/accounts/${accountId}/trades?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to get trades for account ${accountId}:`, error);
      throw new Error('Failed to get account trades');
    }
  }

  async getAccountPositions(accountId: string): Promise<ZimtraPosition[]> {
    try {
      const response: AxiosResponse<ZimtraPosition[]> = await this.client.get(`/accounts/${accountId}/positions`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get positions for account ${accountId}:`, error);
      throw new Error('Failed to get account positions');
    }
  }

  async getPerformanceMetrics(accountId: string): Promise<ZimtraPerformanceMetrics> {
    try {
      const response: AxiosResponse<ZimtraPerformanceMetrics> = await this.client.get(`/accounts/${accountId}/performance`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get performance metrics for account ${accountId}:`, error);
      throw new Error('Failed to get performance metrics');
    }
  }

  // Market Data
  async getMarketData(symbols: string[]): Promise<any[]> {
    try {
      const response: AxiosResponse<any[]> = await this.client.post('/market/quotes', { symbols });
      return response.data;
    } catch (error) {
      logger.error('Failed to get market data:', error);
      throw new Error('Failed to get market data');
    }
  }

  // Webhook Validation
  validateWebhook(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Failed to validate webhook signature:', error);
      return false;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'online' | 'offline'; responseTime: number }> {
    const startTime = Date.now();
    try {
      await this.client.get('/health');
      return {
        status: 'online',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'offline',
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Tournament Integration
  async notifyTournamentRegistration(accountId: string, tournamentId: string): Promise<void> {
    try {
      await this.client.post(`/accounts/${accountId}/tournaments`, {
        tournamentId,
        action: 'register',
      });
      logger.info(`Notified Zimtra of tournament registration: ${accountId} -> ${tournamentId}`);
    } catch (error) {
      logger.error('Failed to notify tournament registration:', error);
      throw new Error('Failed to notify tournament registration');
    }
  }

  async getTournamentAccounts(tournamentId: string): Promise<ZimtraAccount[]> {
    try {
      const response: AxiosResponse<ZimtraAccount[]> = await this.client.get(`/tournaments/${tournamentId}/accounts`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get tournament accounts for ${tournamentId}:`, error);
      throw new Error('Failed to get tournament accounts');
    }
  }
}

export const zimtraService = new ZimtraService();