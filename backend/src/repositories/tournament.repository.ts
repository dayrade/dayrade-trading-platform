import { 
  PrismaClient, 
  Tournament, 
  TournamentStatus, 
  TournamentParticipant, 
  ParticipantStatus,
  TournamentDivision,
  TournamentType,
  Prisma 
} from '../types/database.types';
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('TournamentRepository');

export interface CreateTournamentData {
  name: string;
  slug: string;
  description?: string;
  division: TournamentDivision;
  tournamentType?: TournamentType;
  startDate: Date;
  endDate: Date;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  maxParticipants?: number;
  minParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  currency?: string;
  startingBalance?: number;
  tradingSymbols: string[];
  rules?: any;
  createdBy?: string;
}

export interface UpdateTournamentData {
  name?: string;
  slug?: string;
  description?: string;
  division?: TournamentDivision;
  tournamentType?: TournamentType;
  startDate?: Date;
  endDate?: Date;
  registrationOpenDate?: Date;
  registrationCloseDate?: Date;
  maxParticipants?: number;
  minParticipants?: number;
  currentParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  currency?: string;
  status?: TournamentStatus;
  startingBalance?: number;
  tradingSymbols?: string[];
  rules?: any;
  ticketsourceEventId?: string;
  zimtraTournamentId?: string;
}

export class TournamentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
  }

  async create(tournamentData: CreateTournamentData): Promise<Tournament> {
    try {
      const tournament = await this.prisma.tournament.create({
        data: tournamentData,
        include: {
          creator: true,
          participants: true,
        },
      });
      
      logger.info(`Tournament created successfully: ${tournament.id}`);
      return tournament;
    } catch (error) {
      logger.error('Failed to create tournament:', error);
      throw error;
    }
  }

  async findById(id: string, includeRelations: boolean = false): Promise<Tournament | null> {
    try {
      return await this.prisma.tournament.findUnique({
        where: { id },
        include: includeRelations ? {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
          tradingPerformance: true,
          leaderboardSnapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        } : undefined,
      });
    } catch (error) {
      logger.error(`Failed to find tournament by ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, tournamentData: UpdateTournamentData): Promise<Tournament> {
    try {
      const tournament = await this.prisma.tournament.update({
        where: { id },
        data: tournamentData,
        include: {
          participants: true,
        },
      });
      
      logger.info(`Tournament updated successfully: ${id}`);
      return tournament;
    } catch (error) {
      logger.error(`Failed to update tournament ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.tournament.delete({
        where: { id },
      });
      
      logger.info(`Tournament deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete tournament ${id}:`, error);
      throw error;
    }
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: Prisma.TournamentWhereInput;
    orderBy?: Prisma.TournamentOrderByWithRelationInput;
    includeRelations?: boolean;
  } = {}): Promise<Tournament[]> {
    try {
      const { includeRelations = false, ...queryOptions } = options;
      
      return await this.prisma.tournament.findMany({
        ...queryOptions,
        include: includeRelations ? {
          participants: {
            include: {
              user: true,
            },
          },
        } : undefined,
      });
    } catch (error) {
      logger.error('Failed to find tournaments:', error);
      throw error;
    }
  }

  async count(where?: Prisma.TournamentWhereInput): Promise<number> {
    try {
      return await this.prisma.tournament.count({ where });
    } catch (error) {
      logger.error('Failed to count tournaments:', error);
      throw error;
    }
  }

  async findByStatus(status: TournamentStatus): Promise<Tournament[]> {
    try {
      return await this.findMany({
        where: { status },
        orderBy: { startsAt: 'asc' },
      });
    } catch (error) {
      logger.error(`Failed to find tournaments by status ${status}:`, error);
      throw error;
    }
  }

  async findByDivision(division: TournamentDivision): Promise<Tournament[]> {
    try {
      return await this.findMany({
        where: { division },
        orderBy: { startsAt: 'desc' },
      });
    } catch (error) {
      logger.error(`Failed to find tournaments by division ${division}:`, error);
      throw error;
    }
  }

  async findUpcoming(limit: number = 10): Promise<Tournament[]> {
    try {
      return await this.findMany({
        where: {
          startsAt: {
            gt: new Date(),
          },
          status: {
            in: [TournamentStatus.DRAFT, TournamentStatus.REGISTRATION_OPEN],
          },
        },
        orderBy: { startsAt: 'asc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Failed to find upcoming tournaments:', error);
      throw error;
    }
  }

  async findActive(): Promise<Tournament[]> {
    try {
      return await this.findMany({
        where: { status: TournamentStatus.ACTIVE },
        orderBy: { startsAt: 'asc' },
        includeRelations: true,
      });
    } catch (error) {
      logger.error('Failed to find active tournaments:', error);
      throw error;
    }
  }

  async findCompleted(limit: number = 20): Promise<Tournament[]> {
    try {
      return await this.findMany({
        where: { status: TournamentStatus.COMPLETED },
        orderBy: { endsAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Failed to find completed tournaments:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: TournamentStatus): Promise<Tournament> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      logger.error(`Failed to update tournament status ${id}:`, error);
      throw error;
    }
  }

  async updatePrizePool(id: string, prizePool: number): Promise<Tournament> {
    try {
      return await this.update(id, { prizePool });
    } catch (error) {
      logger.error(`Failed to update prize pool for tournament ${id}:`, error);
      throw error;
    }
  }

  async searchTournaments(searchTerm: string, limit: number = 10): Promise<Tournament[]> {
    try {
      return await this.prisma.tournament.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: limit,
        orderBy: { startsAt: 'desc' },
      });
    } catch (error) {
      logger.error(`Failed to search tournaments with term "${searchTerm}":`, error);
      throw error;
    }
  }

  async findTournamentsRequiringAction(): Promise<Tournament[]> {
    try {
      const now = new Date();
      
      return await this.prisma.tournament.findMany({
        where: {
          OR: [
            // Tournaments that should start registration
            {
              status: TournamentStatus.DRAFT,
              registrationStartsAt: {
                lte: now,
              },
            },
            // Tournaments that should close registration
            {
              status: TournamentStatus.REGISTRATION_OPEN,
              registrationEndsAt: {
                lte: now,
              },
            },
            // Tournaments that should start
            {
              status: TournamentStatus.REGISTRATION_CLOSED,
              startsAt: {
                lte: now,
              },
            },
            // Tournaments that should end
            {
              status: TournamentStatus.ACTIVE,
              endsAt: {
                lte: now,
              },
            },
          ],
        },
        orderBy: { startsAt: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to find tournaments requiring action:', error);
      throw error;
    }
  }
}