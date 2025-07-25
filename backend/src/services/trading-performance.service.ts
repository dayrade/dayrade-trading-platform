import { PrismaClient, TradingPerformance } from '../types/database.types';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('TradingPerformanceService');

export interface PerformanceMetrics {
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  usdBalance: number;
  numberOfTrades: number;
  totalSharesTraded: number;
  numberOfStocksTraded: number;
  totalNotionalTraded: number;
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

export interface CreatePerformanceData {
  tournamentId: string;
  userId: string;
  participantId: string;
  metrics: PerformanceMetrics;
  dataSource?: string;
}

export class TradingPerformanceService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
  }

  async recordPerformance(data: CreatePerformanceData): Promise<TradingPerformance> {
    try {
      const performance = await this.prisma.tradingPerformance.create({
        data: {
          tournamentId: data.tournamentId,
          userId: data.userId,
          participantId: data.participantId,
          dataSource: data.dataSource || 'zimtra',
          totalPnl: data.metrics.totalPnl,
          realizedPnl: data.metrics.realizedPnl,
          unrealizedPnl: data.metrics.unrealizedPnl,
          usdBalance: data.metrics.usdBalance,
          numberOfTrades: data.metrics.numberOfTrades,
          totalSharesTraded: data.metrics.totalSharesTraded,
          numberOfStocksTraded: data.metrics.numberOfStocksTraded,
          totalNotionalTraded: data.metrics.totalNotionalTraded,
          winRate: data.metrics.winRate,
          bestTrade: data.metrics.bestTrade,
          worstTrade: data.metrics.worstTrade,
          averageTradeSize: data.metrics.averageTradeSize,
          maxDrawdown: data.metrics.maxDrawdown,
          sharpeRatio: data.metrics.sharpeRatio,
          volatility: data.metrics.volatility,
          currentPositions: data.metrics.currentPositions,
          positionCount: data.metrics.positionCount || 0,
          longPositions: data.metrics.longPositions || 0,
          shortPositions: data.metrics.shortPositions || 0,
          rawZimtraData: data.metrics.rawZimtraData
        }
      });

      logger.info(`Performance recorded for participant ${data.participantId}`);
      return performance;
    } catch (error) {
      logger.error('Failed to record performance:', error);
      throw error;
    }
  }

  async getLatestPerformance(participantId: string): Promise<TradingPerformance | null> {
    try {
      return await this.prisma.tradingPerformance.findFirst({
        where: { participantId },
        orderBy: { recordedAt: 'desc' }
      });
    } catch (error) {
      logger.error(`Failed to get latest performance for participant ${participantId}:`, error);
      throw error;
    }
  }

  async getPerformanceHistory(participantId: string, limit: number = 100): Promise<TradingPerformance[]> {
    try {
      return await this.prisma.tradingPerformance.findMany({
        where: { participantId },
        orderBy: { recordedAt: 'desc' },
        take: limit
      });
    } catch (error) {
      logger.error(`Failed to get performance history for participant ${participantId}:`, error);
      throw error;
    }
  }

  async getTournamentPerformance(tournamentId: string, limit: number = 1000): Promise<TradingPerformance[]> {
    try {
      return await this.prisma.tradingPerformance.findMany({
        where: { tournamentId },
        orderBy: { recordedAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      logger.error(`Failed to get tournament performance for ${tournamentId}:`, error);
      throw error;
    }
  }

  async calculatePerformanceMetrics(participantId: string): Promise<PerformanceMetrics | null> {
    try {
      const latest = await this.getLatestPerformance(participantId);
      if (!latest) return null;

      return {
        totalPnl: Number(latest.totalPnl),
        realizedPnl: Number(latest.realizedPnl),
        unrealizedPnl: Number(latest.unrealizedPnl),
        usdBalance: Number(latest.usdBalance),
        numberOfTrades: latest.numberOfTrades,
        totalSharesTraded: Number(latest.totalSharesTraded),
        numberOfStocksTraded: latest.numberOfStocksTraded,
        totalNotionalTraded: Number(latest.totalNotionalTraded),
        winRate: latest.winRate ? Number(latest.winRate) : undefined,
        bestTrade: latest.bestTrade ? Number(latest.bestTrade) : undefined,
        worstTrade: latest.worstTrade ? Number(latest.worstTrade) : undefined,
        averageTradeSize: latest.averageTradeSize ? Number(latest.averageTradeSize) : undefined,
        maxDrawdown: latest.maxDrawdown ? Number(latest.maxDrawdown) : undefined,
        sharpeRatio: latest.sharpeRatio ? Number(latest.sharpeRatio) : undefined,
        volatility: latest.volatility ? Number(latest.volatility) : undefined,
        currentPositions: latest.currentPositions,
        positionCount: latest.positionCount,
        longPositions: latest.longPositions,
        shortPositions: latest.shortPositions,
        rawZimtraData: latest.rawZimtraData
      };
    } catch (error) {
      logger.error(`Failed to calculate performance metrics for participant ${participantId}:`, error);
      throw error;
    }
  }

  async getPerformanceSnapshot(tournamentId: string, participantId: string): Promise<{
    current: PerformanceMetrics | null;
    history: TradingPerformance[];
    rank?: number;
  }> {
    try {
      const [current, history] = await Promise.all([
        this.calculatePerformanceMetrics(participantId),
        this.getPerformanceHistory(participantId, 50)
      ]);

      // Get participant rank
      const participant = await this.prisma.tournamentParticipant.findUnique({
        where: { id: participantId },
        select: { currentRank: true }
      });

      return {
        current,
        history,
        rank: participant?.currentRank || undefined
      };
    } catch (error) {
      logger.error(`Failed to get performance snapshot for participant ${participantId}:`, error);
      throw error;
    }
  }

  async cleanupOldPerformanceData(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.tradingPerformance.deleteMany({
        where: {
          recordedAt: {
            lt: cutoffDate
          }
        }
      });

      logger.info(`Cleaned up ${result.count} old performance records`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old performance data:', error);
      throw error;
    }
  }
}