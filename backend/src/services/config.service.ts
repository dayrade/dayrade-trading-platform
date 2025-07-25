import { PrismaClient, SystemConfiguration } from '../types/database.types';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('ConfigService');

export interface CreateConfigData {
  key: string;
  value: any;
  description?: string;
  isActive?: boolean;
}

export interface UpdateConfigData {
  value?: any;
  description?: string;
  isActive?: boolean;
}

export class ConfigService {
  private prisma: PrismaClient;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
  }

  async createConfig(data: CreateConfigData): Promise<SystemConfiguration> {
    try {
      const config = await this.prisma.systemConfiguration.create({
        data: {
          key: data.key,
          value: data.value,
          description: data.description,
          isActive: data.isActive ?? true
        }
      });

      // Clear cache for this key
      this.cache.delete(data.key);
      this.cacheExpiry.delete(data.key);

      logger.info(`Configuration created: ${data.key}`);
      return config;
    } catch (error) {
      logger.error('Failed to create configuration:', error);
      throw error;
    }
  }

  async getConfig(key: string, useCache: boolean = true): Promise<any> {
    try {
      // Check cache first
      if (useCache && this.isCacheValid(key)) {
        return this.cache.get(key);
      }

      const config = await this.prisma.systemConfiguration.findUnique({
        where: { key, isActive: true }
      });

      const value = config?.value || null;

      // Update cache
      if (useCache) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
      }

      return value;
    } catch (error) {
      logger.error(`Failed to get configuration for key ${key}:`, error);
      throw error;
    }
  }

  async updateConfig(key: string, data: UpdateConfigData): Promise<SystemConfiguration> {
    try {
      const config = await this.prisma.systemConfiguration.update({
        where: { key },
        data
      });

      // Clear cache for this key
      this.cache.delete(key);
      this.cacheExpiry.delete(key);

      logger.info(`Configuration updated: ${key}`);
      return config;
    } catch (error) {
      logger.error(`Failed to update configuration for key ${key}:`, error);
      throw error;
    }
  }

  async deleteConfig(key: string): Promise<void> {
    try {
      await this.prisma.systemConfiguration.delete({
        where: { key }
      });

      // Clear cache for this key
      this.cache.delete(key);
      this.cacheExpiry.delete(key);

      logger.info(`Configuration deleted: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete configuration for key ${key}:`, error);
      throw error;
    }
  }

  async getAllConfigs(): Promise<SystemConfiguration[]> {
    try {
      return await this.prisma.systemConfiguration.findMany({
        where: { isActive: true },
        orderBy: { key: 'asc' }
      });
    } catch (error) {
      logger.error('Failed to get all configurations:', error);
      throw error;
    }
  }

  // Specific configuration getters with defaults
  async getTournamentConfig(): Promise<{
    maxParticipants: number;
    defaultEntryFee: number;
    defaultStartingBalance: number;
    registrationWindowHours: number;
    minParticipants: number;
  }> {
    const [
      maxParticipants,
      defaultEntryFee,
      defaultStartingBalance,
      registrationWindowHours,
      minParticipants
    ] = await Promise.all([
      this.getConfig('tournament.maxParticipants') || 100,
      this.getConfig('tournament.defaultEntryFee') || 0,
      this.getConfig('tournament.defaultStartingBalance') || 100000,
      this.getConfig('tournament.registrationWindowHours') || 24,
      this.getConfig('tournament.minParticipants') || 10
    ]);

    return {
      maxParticipants,
      defaultEntryFee,
      defaultStartingBalance,
      registrationWindowHours,
      minParticipants
    };
  }

  async getTradingConfig(): Promise<{
    allowedSymbols: string[];
    tradingHours: { start: string; end: string };
    maxPositionSize: number;
    commissionRate: number;
  }> {
    const [
      allowedSymbols,
      tradingHours,
      maxPositionSize,
      commissionRate
    ] = await Promise.all([
      this.getConfig('trading.allowedSymbols') || ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
      this.getConfig('trading.hours') || { start: '09:30', end: '16:00' },
      this.getConfig('trading.maxPositionSize') || 10000,
      this.getConfig('trading.commissionRate') || 0.005
    ]);

    return {
      allowedSymbols,
      tradingHours,
      maxPositionSize,
      commissionRate
    };
  }

  async getNotificationConfig(): Promise<{
    emailEnabled: boolean;
    pushEnabled: boolean;
    rankChangeThreshold: number;
    performanceUpdateInterval: number;
  }> {
    const [
      emailEnabled,
      pushEnabled,
      rankChangeThreshold,
      performanceUpdateInterval
    ] = await Promise.all([
      this.getConfig('notifications.emailEnabled') || true,
      this.getConfig('notifications.pushEnabled') || true,
      this.getConfig('notifications.rankChangeThreshold') || 5,
      this.getConfig('notifications.performanceUpdateInterval') || 300000 // 5 minutes
    ]);

    return {
      emailEnabled,
      pushEnabled,
      rankChangeThreshold,
      performanceUpdateInterval
    };
  }

  async getSystemConfig(): Promise<{
    maintenanceMode: boolean;
    apiRateLimit: number;
    sessionTimeout: number;
    maxFileUploadSize: number;
  }> {
    const [
      maintenanceMode,
      apiRateLimit,
      sessionTimeout,
      maxFileUploadSize
    ] = await Promise.all([
      this.getConfig('system.maintenanceMode') || false,
      this.getConfig('system.apiRateLimit') || 1000,
      this.getConfig('system.sessionTimeout') || 86400000, // 24 hours
      this.getConfig('system.maxFileUploadSize') || 10485760 // 10MB
    ]);

    return {
      maintenanceMode,
      apiRateLimit,
      sessionTimeout,
      maxFileUploadSize
    };
  }

  // Cache management
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry !== undefined && Date.now() < expiry && this.cache.has(key);
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    logger.info('Configuration cache cleared');
  }

  // Initialize default configurations
  async initializeDefaults(): Promise<void> {
    try {
      const defaultConfigs = [
        { key: 'tournament.maxParticipants', value: 100, description: 'Maximum participants per tournament' },
        { key: 'tournament.defaultEntryFee', value: 0, description: 'Default entry fee for tournaments' },
        { key: 'tournament.defaultStartingBalance', value: 100000, description: 'Default starting balance for participants' },
        { key: 'tournament.registrationWindowHours', value: 24, description: 'Hours before tournament start to close registration' },
        { key: 'tournament.minParticipants', value: 10, description: 'Minimum participants required to start tournament' },
        { key: 'trading.allowedSymbols', value: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'], description: 'Allowed trading symbols' },
        { key: 'trading.hours', value: { start: '09:30', end: '16:00' }, description: 'Trading hours' },
        { key: 'trading.maxPositionSize', value: 10000, description: 'Maximum position size per trade' },
        { key: 'trading.commissionRate', value: 0.005, description: 'Commission rate per trade' },
        { key: 'notifications.emailEnabled', value: true, description: 'Enable email notifications' },
        { key: 'notifications.pushEnabled', value: true, description: 'Enable push notifications' },
        { key: 'notifications.rankChangeThreshold', value: 5, description: 'Rank change threshold for notifications' },
        { key: 'notifications.performanceUpdateInterval', value: 300000, description: 'Performance update interval in milliseconds' },
        { key: 'system.maintenanceMode', value: false, description: 'System maintenance mode' },
        { key: 'system.apiRateLimit', value: 1000, description: 'API rate limit per hour' },
        { key: 'system.sessionTimeout', value: 86400000, description: 'Session timeout in milliseconds' },
        { key: 'system.maxFileUploadSize', value: 10485760, description: 'Maximum file upload size in bytes' }
      ];

      for (const config of defaultConfigs) {
        const existing = await this.prisma.systemConfiguration.findUnique({
          where: { key: config.key }
        });

        if (!existing) {
          await this.createConfig(config);
        }
      }

      logger.info('Default configurations initialized');
    } catch (error) {
      logger.error('Failed to initialize default configurations:', error);
      throw error;
    }
  }
}