import { PrismaClient, TournamentParticipant } from '../types/database.types';
import type { Prisma } from '../types/database.types';
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

export interface CreateParticipantData {
  tournamentId: string;
  userId: string;
  registeredAt?: Date;
  registrationSource?: string;
  ticketsourceBookingId?: string;
  zimtraAccountId?: string;
  startingBalance?: number;
  currentBalance?: number;
  totalPnl?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  totalVolume?: number;
  currentRank?: number;
  bestRank?: number;
  finalRank?: number;
  finalPnl?: number;
  isActive?: boolean;
  disqualified?: boolean;
  disqualificationReason?: string;
}

export interface UpdateParticipantData {
  registeredAt?: Date;
  registrationSource?: string;
  ticketsourceBookingId?: string;
  zimtraAccountId?: string;
  startingBalance?: number;
  currentBalance?: number;
  totalPnl?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  totalVolume?: number;
  currentRank?: number;
  bestRank?: number;
  finalRank?: number;
  finalPnl?: number;
  isActive?: boolean;
  disqualified?: boolean;
  disqualificationReason?: string;
}

export interface ParticipantWhereInput {
  id?: string;
  tournamentId?: string;
  userId?: string;
  registeredAt?: {
    gte?: Date;
    lte?: Date;
  };
  currentRank?: {
    gte?: number;
    lte?: number;
  };
  totalPnl?: {
    gte?: number;
    lte?: number;
  };
}

export class TournamentParticipantRepository {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
    this.logger = new Logger('TournamentParticipantRepository');
  }

  async create(participantData: CreateParticipantData): Promise<TournamentParticipant> {
    try {
      const participant = await this.prisma.tournamentParticipant.create({
        data: participantData,
        include: {
          user: true,
          tournament: true,
        },
      });
      
      this.logger.info(`Tournament participant created successfully: ${participant.id}`);
      return participant;
    } catch (error) {
      this.logger.error('Error creating tournament participant:', error);
      throw error;
    }
  }

  async findById(id: string, includeRelations: boolean = false): Promise<TournamentParticipant | null> {
    try {
      return await this.prisma.tournamentParticipant.findUnique({
        where: { id },
        include: includeRelations ? {
          user: true,
          tournament: true,
          tradingPerformance: true,
          trades: true,
        } : undefined,
      });
    } catch (error) {
      this.logger.error(`Error finding participant by ID ${id}:`, error);
      throw error;
    }
  }

  async findByUserAndTournament(userId: string, tournamentId: string): Promise<TournamentParticipant | null> {
    try {
      return await this.prisma.tournamentParticipant.findUnique({
        where: {
          tournamentId_userId: {
            tournamentId,
            userId,
          },
        },
        include: {
          user: true,
          tournament: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error finding participant by user ${userId} and tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async update(id: string, participantData: UpdateParticipantData): Promise<TournamentParticipant> {
    try {
      const participant = await this.prisma.tournamentParticipant.update({
        where: { id },
        data: participantData,
        include: {
          user: true,
          tournament: true,
        },
      });
      
      this.logger.info(`Tournament participant updated successfully: ${id}`);
      return participant;
    } catch (error) {
      this.logger.error(`Error updating participant ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.tournamentParticipant.delete({
        where: { id },
      });
      
      this.logger.info(`Tournament participant deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting participant ${id}:`, error);
      throw error;
    }
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: Prisma.TournamentParticipantWhereInput;
    orderBy?: Prisma.TournamentParticipantOrderByWithRelationInput;
    includeRelations?: boolean;
  } = {}): Promise<TournamentParticipant[]> {
    try {
      const { includeRelations = false, ...queryOptions } = options;
      
      return await this.prisma.tournamentParticipant.findMany({
        ...queryOptions,
        include: includeRelations ? {
          user: true,
          tournament: true,
          tradingPerformance: true,
          trades: true,
        } : undefined,
      });
    } catch (error) {
      this.logger.error('Error finding participants:', error);
      throw error;
    }
  }

  async count(where?: Prisma.TournamentParticipantWhereInput): Promise<number> {
    try {
      return await this.prisma.tournamentParticipant.count({ where });
    } catch (error) {
      this.logger.error('Error counting participants:', error);
      throw error;
    }
  }

  async findByTournament(tournamentId: string, options: {
    skip?: number;
    take?: number;
    orderBy?: 'rank' | 'pnl' | 'registeredAt';
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<TournamentParticipant[]> {
    try {
      const { skip, take, orderBy = 'rank', orderDirection = 'asc' } = options;
      
      const orderByClause = (() => {
        switch (orderBy) {
          case 'pnl':
            return { totalPnl: orderDirection };
          case 'registeredAt':
            return { registeredAt: orderDirection };
          default:
            return { currentRank: orderDirection };
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
      this.logger.error(`Error finding participants by tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async findByUser(userId: string, options: {
    skip?: number;
    take?: number;
    includeCompleted?: boolean;
  } = {}): Promise<TournamentParticipant[]> {
    try {
      const { skip, take, includeCompleted = true } = options;
      
      const where: Prisma.TournamentParticipantWhereInput = {
        userId,
        ...(includeCompleted ? {} : {
          tournament: {
            status: {
              in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ACTIVE'],
            },
          },
        }),
      };

      return await this.findMany({
        where,
        skip,
        take,
        orderBy: { registeredAt: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error finding participants by user ${userId}:`, error);
      throw error;
    }
  }

  async getLeaderboard(tournamentId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<TournamentParticipant[]> {
    try {
      const { limit = 50, offset = 0 } = options;
      
      return await this.findMany({
        where: { tournamentId },
        skip: offset,
        take: limit,
        orderBy: { currentRank: 'asc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error getting leaderboard for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async updatePerformanceMetrics(id: string, metrics: {
    currentBalance?: number;
    totalPnl?: number;
    realizedPnl?: number;
    unrealizedPnl?: number;
    numberOfTrades?: number;
    totalSharesTraded?: number;
    numberOfStocksTraded?: number;
    totalNotionalTraded?: number;
    winRate?: number;
    bestTrade?: number;
    worstTrade?: number;
    averageTradeSize?: number;
    maxDrawdown?: number;
    sharpeRatio?: number;
    volatility?: number;
    positionCount?: number;
    longPositions?: number;
    shortPositions?: number;
    lastTradeAt?: Date;
    rawZimtraData?: any;
  }): Promise<TournamentParticipant> {
    try {
      return await this.update(id, metrics);
    } catch (error) {
      this.logger.error(`Error updating performance metrics for participant ${id}:`, error);
      throw error;
    }
  }

  async updateRanking(id: string, newRank: number): Promise<TournamentParticipant> {
    try {
      const participant = await this.findById(id);
      if (!participant) {
        throw new Error(`Participant ${id} not found`);
      }

      const updateData: UpdateParticipantData = {
        currentRank: newRank,
      };

      // Update best rank if this is better
      if (!participant.bestRank || newRank < participant.bestRank) {
        updateData.bestRank = newRank;
      }

      return await this.update(id, updateData);
    } catch (error) {
      this.logger.error(`Error updating ranking for participant ${id}:`, error);
      throw error;
    }
  }

  async findByZimtraAccountId(zimtraAccountId: string): Promise<TournamentParticipant | null> {
    try {
      return await this.prisma.tournamentParticipant.findFirst({
        where: { zimtraAccountId },
        include: {
          user: true,
          tournament: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error finding participant by Zimtra account ID ${zimtraAccountId}:`, error);
      throw error;
    }
  }

  async getTopPerformers(tournamentId: string, limit: number = 10): Promise<TournamentParticipant[]> {
    try {
      return await this.findMany({
        where: { tournamentId },
        take: limit,
        orderBy: { totalPnl: 'desc' },
        includeRelations: true,
      });
    } catch (error) {
      this.logger.error(`Error getting top performers for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async getTournamentStatistics(tournamentId: string): Promise<{
    totalParticipants: number;
    averagePnl: number;
    totalTrades: number;
    totalVolume: number;
    topPerformerPnl: number;
    bottomPerformerPnl: number;
  }> {
    try {
      const [participantCount, aggregations] = await Promise.all([
        this.count({ tournamentId }),
        this.prisma.tournamentParticipant.aggregate({
          where: { tournamentId },
          _avg: {
            totalPnl: true,
          },
          _sum: {
            totalTrades: true,
            totalVolume: true,
          },
          _max: {
            totalPnl: true,
          },
          _min: {
            totalPnl: true,
          },
        }),
      ]);

      return {
        totalParticipants: participantCount,
        averagePnl: Number(aggregations._avg?.totalPnl || 0),
        totalTrades: aggregations._sum?.totalTrades || 0,
        totalVolume: Number(aggregations._sum?.totalVolume || 0),
        topPerformerPnl: Number(aggregations._max?.totalPnl || 0),
        bottomPerformerPnl: Number(aggregations._min?.totalPnl || 0),
      };
    } catch (error) {
      this.logger.error(`Error getting tournament statistics for ${tournamentId}:`, error);
      throw error;
    }
  }
}