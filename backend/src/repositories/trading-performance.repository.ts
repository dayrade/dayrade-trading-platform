import { PrismaClient, TradingPerformance } from '../types/database.types';
import type { Prisma } from '../types/database.types';
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

export interface CreateTradingPerformanceData {
  tournamentId: string;
  userId: string;
  participantId: string;
  recordedAt?: Date;
  dataSource?: string;
  totalPnl?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
  usdBalance?: number;
  numberOfTrades?: number;
  totalSharesTraded?: bigint;
  numberOfStocksTraded?: number;
  totalNotionalTraded?: number;
  winRate?: number;
  bestTrade?: number;
  worstTrade?: number;
  averageTradeSize?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  volatility?: number;
  currentPositions?: any;
  positionCount?: number;
  longPositions?: number;
  shortPositions?: number;
  rawZimtraData?: any;
}

export interface UpdateTradingPerformanceData {
  recordedAt?: Date;
  dataSource?: string;
  totalPnl?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
  usdBalance?: number;
  numberOfTrades?: number;
  totalSharesTraded?: bigint;
  numberOfStocksTraded?: number;
  totalNotionalTraded?: number;
  winRate?: number;
  bestTrade?: number;
  worstTrade?: number;
  averageTradeSize?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  volatility?: number;
  currentPositions?: any;
  positionCount?: number;
  longPositions?: number;
  shortPositions?: number;
  rawZimtraData?: any;
}

export class TradingPerformanceRepository {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
    this.logger = new Logger('TradingPerformanceRepository');
  }

  async create(performanceData: CreateTradingPerformanceData): Promise<TradingPerformance> {
    try {
      const performance = await this.prisma.tradingPerformance.create({
        data: performanceData,
        include: {
          user: true,
          tournament: true,
          participant: true,
        },
      });
      
      this.logger.info(`Trading performance record created successfully: ${performance.id}`);
      return performance;
    } catch (error) {
      this.logger.error('Error creating trading performance record:', error);
      throw error;
    }
  }

  async findById(id: string, includeRelations: boolean = false): Promise<TradingPerformance | null> {
    try {
      return await this.prisma.tradingPerformance.findUnique({
        where: { id },
        include: includeRelations ? {
          user: true,
          tournament: true,
          participant: true,
        } : undefined,
      });
    } catch (error) {
      this.logger.error(`Error finding trading performance by ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, performanceData: UpdateTradingPerformanceData): Promise<TradingPerformance> {
    try {
      const performance = await this.prisma.tradingPerformance.update({
        where: { id },
        data: performanceData,
        include: {
          user: true,
          tournament: true,
          participant: true,
        },
      });
      
      this.logger.info(`Trading performance updated successfully: ${id}`);
      return performance;
    } catch (error) {
      this.logger.error(`Error updating trading performance ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.tradingPerformance.delete({
        where: { id },
      });
      
      this.logger.info(`Trading performance deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting trading performance ${id}:`, error);
      throw error;
    }
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: Prisma.TradingPerformanceWhereInput;
    orderBy?: Prisma.TradingPerformanceOrderByWithRelationInput;
    includeRelations?: boolean;
  } = {}): Promise<TradingPerformance[]> {
    try {
      const { includeRelations = false, ...queryOptions } = options;
      
      return await this.prisma.tradingPerformance.findMany({
        ...queryOptions,
        include: includeRelations ? {
          user: true,
          tournament: true,
          participant: true,
        } : undefined,
      });
    } catch (error) {
      this.logger.error('Error finding trading performance records:', error);
      throw error;
    }
  }

  async count(where?: Prisma.TradingPerformanceWhereInput): Promise<number> {
    try {
      return await this.prisma.tradingPerformance.count({ where });
    } catch (error) {
      this.logger.error('Error counting trading performance records:', error);
      throw error;
    }
  }

  async findByTournament(tournamentId: string, options: {
    skip?: number;
    take?: number;
    orderBy?: 'recordedAt' | 'totalPnl';
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<TradingPerformance[]> {
    try {
      const { skip, take, orderBy = 'recordedAt', orderDirection = 'desc' } = options;
      
      const orderByClause = (() => {
        switch (orderBy) {
          case 'totalPnl':
            return { totalPnl: orderDirection };
          default:
            return { recordedAt: orderDirection };
        }
      })();

      return await this.findMany({
        where: { tournamentId },
        skip,
        take,
        orderBy: orderByClause,
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding trading performance by tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async findByUser(userId: string, options: {
    skip?: number;
    take?: number;
    tournamentId?: string;
  } = {}): Promise<TradingPerformance[]> {
    try {
      const { skip, take, tournamentId } = options;
      
      const where: Prisma.TradingPerformanceWhereInput = {
        userId,
        ...(tournamentId && { tournamentId }),
      };

      return await this.findMany({
        where,
        skip,
        take,
        orderBy: { recordedAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding trading performance by user ${userId}:`, error);
      throw error;
    }
  }

  async findByParticipant(participantId: string, options: {
    skip?: number;
    take?: number;
    orderBy?: 'recordedAt' | 'totalPnl';
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<TradingPerformance[]> {
    try {
      const { skip, take, orderBy = 'recordedAt', orderDirection = 'desc' } = options;
      
      const orderByClause = (() => {
        switch (orderBy) {
          case 'totalPnl':
            return { totalPnl: orderDirection };
          default:
            return { recordedAt: orderDirection };
        }
      })();

      return await this.findMany({
        where: { participantId },
        skip,
        take,
        orderBy: orderByClause,
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding trading performance by participant ${participantId}:`, error);
      throw error;
    }
  }

  async getLatestPerformance(participantId: string): Promise<TradingPerformance | null> {
    try {
      return await this.prisma.tradingPerformance.findFirst({
        where: { participantId },
        orderBy: { recordedAt: 'desc' },
        include: {
          user: true,
          tournament: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error getting latest performance for participant ${participantId}:`, error);
      throw error;
    }
  }

  async getPerformanceHistory(participantId: string, options: {
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  } = {}): Promise<TradingPerformance[]> {
    try {
      const { fromDate, toDate, limit = 100 } = options;
      
      const where: Prisma.TradingPerformanceWhereInput = {
        participantId,
        ...(fromDate && { recordedAt: { gte: fromDate } }),
        ...(toDate && { recordedAt: { lte: toDate } }),
      };

      return await this.findMany({
        where,
        take: limit,
        orderBy: { recordedAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error getting performance history for participant ${participantId}:`, error);
      throw error;
    }
  }

  async getTournamentPerformanceSnapshot(tournamentId: string, atDate?: Date): Promise<TradingPerformance[]> {
    try {
      const targetDate = atDate || new Date();
      
      // Get the latest performance record for each participant before or at the target date
      const performances = await this.prisma.tradingPerformance.findMany({
        where: {
          tournamentId,
          recordedAt: { lte: targetDate },
        },
        orderBy: [
          { participantId: 'asc' },
          { recordedAt: 'desc' },
        ],
        include: {
          user: true,
          tournament: true,
          participant: true,
        },
      });

      // Group by participant and take the latest record for each
      const latestPerformances = new Map<string, TradingPerformance>();
      
      for (const performance of performances) {
        if (!latestPerformances.has(performance.participantId)) {
          latestPerformances.set(performance.participantId, performance);
        }
      }

      return Array.from(latestPerformances.values());
    } catch (error) {
      this.logger.error(`Error getting tournament performance snapshot for ${tournamentId}:`, error);
      throw error;
    }
  }

  async getPerformanceMetrics(participantId: string): Promise<{
    currentPnl: number;
    totalTrades: number;
    winRate: number;
    sharpeRatio: number | null;
    maxDrawdown: number | null;
    bestTrade: number | null;
    worstTrade: number | null;
    averageTradeSize: number | null;
  } | null> {
    try {
      const latest = await this.getLatestPerformance(participantId);
      
      if (!latest) {
        return null;
      }

      return {
        currentPnl: Number(latest.totalPnl),
        totalTrades: latest.numberOfTrades,
        winRate: Number(latest.winRate || 0),
        sharpeRatio: latest.sharpeRatio ? Number(latest.sharpeRatio) : null,
        maxDrawdown: latest.maxDrawdown ? Number(latest.maxDrawdown) : null,
        bestTrade: latest.bestTrade ? Number(latest.bestTrade) : null,
        worstTrade: latest.worstTrade ? Number(latest.worstTrade) : null,
        averageTradeSize: latest.averageTradeSize ? Number(latest.averageTradeSize) : null,
      };
    } catch (error) {
      this.logger.error(`Error getting performance metrics for participant ${participantId}:`, error);
      throw error;
    }
  }

  async bulkCreate(performanceDataArray: CreateTradingPerformanceData[]): Promise<number> {
    try {
      const result = await this.prisma.tradingPerformance.createMany({
        data: performanceDataArray,
        skipDuplicates: true,
      });
      
      this.logger.info(`Bulk created ${result.count} trading performance records`);
      return result.count;
    } catch (error) {
      this.logger.error('Error bulk creating trading performance records:', error);
      throw error;
    }
  }

  async deleteOldRecords(beforeDate: Date): Promise<number> {
    try {
      const result = await this.prisma.tradingPerformance.deleteMany({
        where: {
          recordedAt: { lt: beforeDate },
        },
      });
      
      this.logger.info(`Deleted ${result.count} old trading performance records`);
      return result.count;
    } catch (error) {
      this.logger.error('Error deleting old trading performance records:', error);
      throw error;
    }
  }

  async getTournamentLeaderboard(tournamentId: string, options: {
    limit?: number;
    offset?: number;
    atDate?: Date;
  } = {}): Promise<TradingPerformance[]> {
    try {
      const { limit = 50, offset = 0, atDate } = options;
      
      const snapshot = await this.getTournamentPerformanceSnapshot(tournamentId, atDate);
      
      // Sort by total PnL descending
      const sorted = snapshot.sort((a, b) => Number(b.totalPnl) - Number(a.totalPnl));
      
      return sorted.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error(`Error getting tournament leaderboard for ${tournamentId}:`, error);
      throw error;
    }
  }
}