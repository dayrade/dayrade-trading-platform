import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';
import { TournamentRepository } from '../repositories/tournament.repository';
import { Logger } from '../utils/logger';
import { TournamentParticipant } from '../types/database.types';

const logger = new Logger('LeaderboardService');

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  userId: string;
  username: string;
  totalPnl: number;
  currentBalance: number;
  totalTrades: number;
  winRate: number;
  isActive: boolean;
}

export interface TournamentLeaderboard {
  tournamentId: string;
  tournamentName: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: Date;
}

export class LeaderboardService {
  private participantRepository: TournamentParticipantRepository;
  private tournamentRepository: TournamentRepository;

  constructor() {
    this.participantRepository = new TournamentParticipantRepository();
    this.tournamentRepository = new TournamentRepository();
  }

  async getTournamentLeaderboard(tournamentId: string, limit: number = 50): Promise<TournamentLeaderboard> {
    try {
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const participants = await this.participantRepository.getLeaderboard(tournamentId, {
        limit,
        offset: 0
      });

      const entries: LeaderboardEntry[] = participants.map((participant, index) => ({
        rank: index + 1,
        participantId: participant.id,
        userId: participant.userId,
        username: `User ${participant.userId.slice(0, 8)}`, // Simplified username
        totalPnl: Number(participant.totalPnl),
        currentBalance: Number(participant.currentBalance),
        totalTrades: participant.totalTrades,
        winRate: participant.winningTrades > 0 ? 
          (participant.winningTrades / participant.totalTrades) * 100 : 0,
        isActive: participant.isActive
      }));

      const totalParticipants = await this.participantRepository.count({
        tournamentId
      });

      return {
        tournamentId,
        tournamentName: tournament.name,
        entries,
        totalParticipants,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error(`Failed to get leaderboard for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async updateParticipantRanking(tournamentId: string): Promise<void> {
    try {
      // Get all participants ordered by total PnL
      const participants = await this.participantRepository.findMany({
        where: { tournamentId },
        orderBy: { totalPnl: 'desc' }
      });

      // Update rankings
      for (let i = 0; i < participants.length; i++) {
        const newRank = i + 1;
        if (participants[i].currentRank !== newRank) {
          await this.participantRepository.updateRanking(participants[i].id, newRank);
        }
      }

      logger.info(`Updated rankings for tournament ${tournamentId}`);
    } catch (error) {
      logger.error(`Failed to update rankings for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  async getParticipantRank(participantId: string): Promise<number | null> {
    try {
      const participant = await this.participantRepository.findById(participantId);
      return participant?.currentRank || null;
    } catch (error) {
      logger.error(`Failed to get rank for participant ${participantId}:`, error);
      throw error;
    }
  }

  async getTopPerformers(tournamentId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const leaderboard = await this.getTournamentLeaderboard(tournamentId, limit);
      return leaderboard.entries.slice(0, limit);
    } catch (error) {
      logger.error(`Failed to get top performers for tournament ${tournamentId}:`, error);
      throw error;
    }
  }
}