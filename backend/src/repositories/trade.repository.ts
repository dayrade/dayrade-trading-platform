import { 
  PrismaClient, 
  Trade, 
  TradeSide, 
  TradeStatus
} from '../types/database.types';
import type { Prisma } from '../types/database.types';
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('TradeRepository');

export interface CreateTradeData {
  tournamentId: string;
  userId: string;
  participantId: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  tradeValue: number;
  commission?: number;
  netValue: number;
  zimtraTradeId?: string;
  brokerTradeId?: string;
  marketPrice?: number;
  bidPrice?: number;
  askPrice?: number;
  rawTradeData?: any;
}

export interface UpdateTradeData {
  symbol?: string;
  side?: TradeSide;
  quantity?: number;
  price?: number;
  tradeValue?: number;
  commission?: number;
  netValue?: number;
  pnl?: number;
  zimtraTradeId?: string;
  brokerTradeId?: string;
  status?: TradeStatus;
  executedAt?: Date;
  settledAt?: Date;
  marketPrice?: number;
  bidPrice?: number;
  askPrice?: number;
  rawTradeData?: any;
}

export class TradeRepository {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
    this.logger = new Logger('TradeRepository');
  }

  async create(tradeData: CreateTradeData): Promise<Trade> {
    try {
      const trade = await this.prisma.trade.create({
        data: tradeData,
        include: {
          user: true,
          tournament: true,
          participant: true,
        },
      });
      
      this.logger.info(`Trade created successfully: ${trade.id}`);
      return trade;
    } catch (error) {
      this.logger.error('Error creating trade:', error);
      throw error;
    }
  }

  async findById(id: string, includeRelations: boolean = false): Promise<Trade | null> {
    try {
      return await this.prisma.trade.findUnique({
        where: { id },
        include: includeRelations ? {
          user: true,
          tournament: true,
          participant: true,
        } : undefined,
      });
    } catch (error) {
      this.logger.error(`Error finding trade by ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, tradeData: UpdateTradeData): Promise<Trade> {
    try {
      const trade = await this.prisma.trade.update({
        where: { id },
        data: tradeData,
        include: {
          user: true,
          tournament: true,
          participant: true,
        },
      });
      
      this.logger.info(`Trade updated successfully: ${id}`);
      return trade;
    } catch (error) {
      this.logger.error(`Error updating trade ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.trade.delete({
        where: { id },
      });
      
      this.logger.info(`Trade deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting trade ${id}:`, error);
      throw error;
    }
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: Prisma.TradeWhereInput;
    orderBy?: Prisma.TradeOrderByWithRelationInput;
    includeRelations?: boolean;
  } = {}): Promise<Trade[]> {
    try {
      const { includeRelations = false, ...queryOptions } = options;
      
      return await this.prisma.trade.findMany({
        ...queryOptions,
        include: includeRelations ? {
          user: true,
          tournament: true,
          participant: true,
        } : undefined,
      });
    } catch (error) {
      this.logger.error('Error finding trades:', error);
      throw error;
    }
  }

  async count(where?: Prisma.TradeWhereInput): Promise<number> {
    try {
      return await this.prisma.trade.count({ where });
    } catch (error) {
      this.logger.error('Error counting trades:', error);
      throw error;
    }
  }

  async findByUser(userId: string, options: {
    skip?: number;
    take?: number;
    tournamentId?: string;
    status?: TradeStatus;
    symbol?: string;
  } = {}): Promise<Trade[]> {
    try {
      const { skip, take, tournamentId, status, symbol } = options;
      
      const where: Prisma.TradeWhereInput = {
        userId,
        ...(tournamentId && { tournamentId }),
        ...(status && { status }),
        ...(symbol && { symbol }),
      };

      return await this.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding trades by user ${userId}:`, error);
      throw error;
    }
  }

  async findByTournament(tournamentId: string, options: {
    skip?: number;
    take?: number;
    userId?: string;
    status?: TradeStatus;
    symbol?: string;
  } = {}): Promise<Trade[]> {
    try {
      const { skip, take, userId, status, symbol } = options;
      
      const where: Prisma.TradeWhereInput = {
        tournamentId,
        ...(userId && { userId }),
        ...(status && { status }),
        ...(symbol && { symbol }),
      };

      return await this.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding trades by tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async findByStatus(status: TradeStatus): Promise<Trade[]> {
    try {
      return await this.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding trades by status ${status}:`, error);
      throw error;
    }
  }

  async findPendingTrades(): Promise<Trade[]> {
    try {
      return await this.findByStatus(TradeStatus.PENDING);
    } catch (error) {
      this.logger.error('Error finding pending trades:', error);
      throw error;
    }
  }

  async findExecutedTrades(options: {
    skip?: number;
    take?: number;
    userId?: string;
    tournamentId?: string;
    symbol?: string;
    fromDate?: Date;
    toDate?: Date;
  } = {}): Promise<Trade[]> {
    try {
      const { skip, take, userId, tournamentId, symbol, fromDate, toDate } = options;
      
      const where: Prisma.TradeWhereInput = {
        status: TradeStatus.EXECUTED,
        ...(userId && { userId }),
        ...(tournamentId && { tournamentId }),
        ...(symbol && { symbol }),
        ...(fromDate || toDate) && {
          executedAt: {
            ...(fromDate && { gte: fromDate }),
            ...(toDate && { lte: toDate }),
          },
        },
      };

      return await this.findMany({
        where,
        skip,
        take,
        orderBy: { executedAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error('Error finding executed trades:', error);
      throw error;
    }
  }

  async updateTradeStatus(id: string, status: TradeStatus, metadata?: any): Promise<Trade | null> {
    try {
      const updateData: UpdateTradeData = { status };
      
      if (status === TradeStatus.EXECUTED) {
        updateData.executedAt = new Date();
      } else if (status === TradeStatus.SETTLED) {
        updateData.settledAt = new Date();
      }

      if (metadata) {
        updateData.rawTradeData = metadata;
      }

      return await this.prisma.trade.update({
        where: { id },
        data: updateData,
        include: {
          tournament: true,
          user: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error('Error updating trade status:', error);
      throw error;
    }
  }

  async executeTrade(id: string, executionData: {
    price: number;
    executedAt?: Date;
    commission?: number;
    pnl?: number;
    marketPrice?: number;
    rawTradeData?: any;
  }): Promise<Trade | null> {
    try {
      return await this.prisma.trade.update({
        where: { id },
        data: {
          status: TradeStatus.EXECUTED,
          price: executionData.price,
          executedAt: executionData.executedAt || new Date(),
          commission: executionData.commission,
          pnl: executionData.pnl,
          marketPrice: executionData.marketPrice,
          rawTradeData: executionData.rawTradeData,
        },
        include: {
          tournament: true,
          user: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error('Error executing trade:', error);
      throw error;
    }
  }

  async rejectTrade(id: string, reason?: string): Promise<Trade | null> {
    try {
      return await this.prisma.trade.update({
        where: { id },
        data: {
          status: TradeStatus.REJECTED,
          rawTradeData: reason ? { rejectionReason: reason } : undefined,
        },
        include: {
          tournament: true,
          user: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error('Error rejecting trade:', error);
      throw error;
    }
  }

  async cancelTrade(id: string): Promise<Trade | null> {
    try {
      return await this.prisma.trade.update({
        where: { id },
        data: {
          status: TradeStatus.CANCELLED,
        },
        include: {
          tournament: true,
          user: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error('Error cancelling trade:', error);
      throw error;
    }
  }

  async findByZimtraTradeId(zimtraTradeId: string): Promise<Trade | null> {
    try {
      return await this.prisma.trade.findUnique({
        where: { zimtraTradeId },
        include: {
          tournament: true,
          user: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error('Error finding trade by Zimtra ID:', error);
      throw error;
    }
  }

  async getTradingStatistics(options: {
    userId?: string;
    tournamentId?: string;
    symbol?: string;
    fromDate?: Date;
    toDate?: Date;
  } = {}): Promise<{
    totalTrades: number;
    executedTrades: number;
    totalVolume: number;
    totalPnl: number;
    winningTrades: number;
    losingTrades: number;
    averageTradeSize: number;
    winRate: number;
  }> {
    try {
      const { userId, tournamentId, symbol, fromDate, toDate } = options;
      
      const where: Prisma.TradeWhereInput = {
        ...(userId && { userId }),
        ...(tournamentId && { tournamentId }),
        ...(symbol && { symbol }),
        ...(fromDate || toDate) && {
          executedAt: {
            ...(fromDate && { gte: fromDate }),
            ...(toDate && { lte: toDate }),
          },
        },
      };

      const [totalTrades, executedTrades, aggregations] = await Promise.all([
        this.prisma.trade.count({ where }),
        this.prisma.trade.count({ where: { ...where, status: TradeStatus.EXECUTED } }),
        this.prisma.trade.aggregate({
          where: { ...where, status: TradeStatus.EXECUTED },
          _sum: {
            quantity: true,
            pnl: true,
          },
          _avg: {
            quantity: true,
          },
        }),
      ]);

      const winningTrades = await this.prisma.trade.count({
        where: { 
          ...where, 
          status: TradeStatus.EXECUTED,
          pnl: { gt: 0 }
        },
      });

      const losingTrades = await this.prisma.trade.count({
        where: { 
          ...where, 
          status: TradeStatus.EXECUTED,
          pnl: { lt: 0 }
        },
      });

      return {
        totalTrades,
        executedTrades,
        totalVolume: Number(aggregations._sum?.quantity || 0),
        totalPnl: Number(aggregations._sum?.pnl || 0),
        winningTrades,
        losingTrades,
        averageTradeSize: Number(aggregations._avg?.quantity || 0),
        winRate: executedTrades > 0 ? (winningTrades / executedTrades) * 100 : 0,
      };
    } catch (error) {
      this.logger.error('Error getting trading statistics:', error);
      throw error;
    }
  }

  async getRecentTrades(limit: number = 10, tournamentId?: string): Promise<Trade[]> {
    try {
      return await this.prisma.trade.findMany({
        where: {
          status: TradeStatus.EXECUTED,
          ...(tournamentId && { tournamentId }),
        },
        take: limit,
        orderBy: { executedAt: 'desc' },
        include: {
          tournament: true,
          user: true,
          participant: true,
        },
      });
    } catch (error) {
      this.logger.error('Error getting recent trades:', error);
      throw error;
    }
  }

  async getTopTradingSymbols(options: {
    tournamentId?: string;
    userId?: string;
    limit?: number;
    fromDate?: Date;
    toDate?: Date;
  } = {}): Promise<Array<{ symbol: string; tradeCount: number; totalVolume: number }>> {
    try {
      const { tournamentId, userId, limit = 10, fromDate, toDate } = options;
      
      const where: Prisma.TradeWhereInput = {
        status: TradeStatus.EXECUTED,
        ...(tournamentId && { tournamentId }),
        ...(userId && { userId }),
        ...(fromDate || toDate) && {
          executedAt: {
            ...(fromDate && { gte: fromDate }),
            ...(toDate && { lte: toDate }),
          },
        },
      };

      const result = await this.prisma.trade.groupBy({
        by: ['symbol'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
      });

      return result.map((item: any) => ({
        symbol: item.symbol,
        tradeCount: item._count.id || 0,
        totalVolume: Number(item._sum.quantity || 0),
      }));
    } catch (error) {
      this.logger.error('Error getting top trading symbols:', error);
      throw error;
    }
  }
}