import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('TournamentService');

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TournamentDivision {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface TournamentDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  division: TournamentDivision;
  startDate: Date;
  endDate: Date;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  maxParticipants: number | null;
  entryFee: number;
  prizePool: number;
  status: TournamentStatus;
  rules: any;
  participantCount: number;
  isRegistrationOpen: boolean;
  timeUntilStart: number;
  timeUntilEnd: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  tournamentId: string;
  registeredAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface CreateTournamentRequest {
  name: string;
  slug: string;
  description?: string;
  division: TournamentDivision;
  startDate: Date;
  endDate: Date;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  maxParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  tradingSymbols: string[];
  rules?: any;
}

export class TournamentService {
  // Tournament Management
  static async createTournament(data: CreateTournamentRequest): Promise<TournamentDetails> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { data: tournament, error } = await db
        .from('tournaments')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          division: data.division,
          starts_at: data.startDate.toISOString(),
          ends_at: data.endDate.toISOString(),
          registration_starts_at: data.registrationOpenDate.toISOString(),
          registration_ends_at: data.registrationCloseDate.toISOString(),
          max_participants: data.maxParticipants || null,
          entry_fee: data.entryFee || 0,
          prize_pool: data.prizePool || 0,
          trading_symbols: data.tradingSymbols,
          rules: data.rules || null,
          status: TournamentStatus.DRAFT
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create tournament:', error);
        throw new Error('Failed to create tournament');
      }

      logger.info(`Tournament created successfully: ${tournament.id}`);

      return this.mapToTournamentDetails(tournament);
    } catch (error) {
      logger.error('Failed to create tournament:', error);
      throw error;
    }
  }

  static async getTournament(tournamentId: string): Promise<TournamentDetails> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { data: tournament, error } = await db
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error || !tournament) {
        throw new Error('Tournament not found');
      }

      return this.mapToTournamentDetails(tournament);
    } catch (error) {
      logger.error(`Failed to get tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  static async updateTournament(tournamentId: string, data: Partial<CreateTournamentRequest>): Promise<TournamentDetails> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.division) updateData.division = data.division;
      if (data.startDate) updateData.starts_at = data.startDate.toISOString();
      if (data.endDate) updateData.ends_at = data.endDate.toISOString();
      if (data.registrationOpenDate) updateData.registration_starts_at = data.registrationOpenDate.toISOString();
      if (data.registrationCloseDate) updateData.registration_ends_at = data.registrationCloseDate.toISOString();
      if (data.maxParticipants !== undefined) updateData.max_participants = data.maxParticipants;
      if (data.entryFee !== undefined) updateData.entry_fee = data.entryFee;
      if (data.prizePool !== undefined) updateData.prize_pool = data.prizePool;
      if (data.tradingSymbols) updateData.trading_symbols = data.tradingSymbols;
      if (data.rules) updateData.rules = data.rules;

      const { data: tournament, error } = await db
        .from('tournaments')
        .update(updateData)
        .eq('id', tournamentId)
        .select()
        .single();

      if (error) {
        logger.error(`Failed to update tournament ${tournamentId}:`, error);
        throw new Error('Failed to update tournament');
      }

      logger.info(`Tournament updated successfully: ${tournamentId}`);

      return this.mapToTournamentDetails(tournament);
    } catch (error) {
      logger.error(`Failed to update tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  static async deleteTournament(tournamentId: string): Promise<void> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Check if tournament has participants
      const { count } = await db
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId);

      if (count && count > 0) {
        throw new Error('Cannot delete tournament with participants');
      }

      const { error } = await db
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) {
        logger.error(`Failed to delete tournament ${tournamentId}:`, error);
        throw new Error('Failed to delete tournament');
      }

      logger.info(`Tournament deleted successfully: ${tournamentId}`);
    } catch (error) {
      logger.error(`Failed to delete tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  // Tournament Status Management
  static async startTournament(tournamentId: string): Promise<TournamentDetails> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { data: tournament, error } = await db
        .from('tournaments')
        .update({ status: TournamentStatus.ACTIVE })
        .eq('id', tournamentId)
        .eq('status', TournamentStatus.REGISTRATION_CLOSED)
        .select()
        .single();

      if (error) {
        logger.error(`Failed to start tournament ${tournamentId}:`, error);
        throw new Error('Failed to start tournament or tournament not in correct status');
      }

      logger.info(`Tournament started: ${tournamentId}`);

      return this.mapToTournamentDetails(tournament);
    } catch (error) {
      logger.error(`Failed to start tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  static async endTournament(tournamentId: string): Promise<TournamentDetails> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { data: tournament, error } = await db
        .from('tournaments')
        .update({ status: TournamentStatus.COMPLETED })
        .eq('id', tournamentId)
        .eq('status', TournamentStatus.ACTIVE)
        .select()
        .single();

      if (error) {
        logger.error(`Failed to end tournament ${tournamentId}:`, error);
        throw new Error('Failed to end tournament or tournament not active');
      }

      logger.info(`Tournament ended: ${tournamentId}`);

      return this.mapToTournamentDetails(tournament);
    } catch (error) {
      logger.error(`Failed to end tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  // Participant Management
  static async registerParticipant(tournamentId: string, userId: string): Promise<TournamentParticipant> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Check if tournament exists and is accepting registrations
      const { data: tournament, error: tournamentError } = await db
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tournamentError || !tournament) {
        throw new Error('Tournament not found');
      }

      // Check if user exists
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Validate registration eligibility
      await this.validateRegistrationEligibility(tournament, user);

      // Check if already registered
      const { data: existingParticipant } = await db
        .from('tournament_participants')
        .select('id')
        .eq('user_id', userId)
        .eq('tournament_id', tournamentId)
        .single();

      if (existingParticipant) {
        throw new Error('User already registered for this tournament');
      }

      // Create participant record
      const { data: participant, error } = await db
        .from('tournament_participants')
        .insert({
          user_id: userId,
          tournament_id: tournamentId,
          registered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error(`Failed to register participant:`, error);
        throw new Error('Failed to register participant');
      }

      logger.info(`User ${userId} registered for tournament ${tournamentId}`);

      return {
        id: participant.id,
        userId: participant.user_id,
        tournamentId: participant.tournament_id,
        registeredAt: new Date(participant.registered_at),
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        }
      };
    } catch (error) {
      logger.error(`Failed to register participant for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  static async unregisterParticipant(tournamentId: string, userId: string): Promise<void> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { error } = await db
        .from('tournament_participants')
        .delete()
        .eq('user_id', userId)
        .eq('tournament_id', tournamentId);

      if (error) {
        logger.error(`Failed to unregister participant:`, error);
        throw new Error('Failed to unregister participant');
      }

      logger.info(`User ${userId} unregistered from tournament ${tournamentId}`);
    } catch (error) {
      logger.error(`Failed to unregister participant from tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  static async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { data: participants, error } = await db
        .from('tournament_participants')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true });

      if (error) {
        logger.error(`Failed to get participants:`, error);
        throw new Error('Failed to get participants');
      }

      return participants.map(participant => ({
        id: participant.id,
        userId: participant.user_id,
        tournamentId: participant.tournament_id,
        registeredAt: new Date(participant.registered_at),
        user: {
          id: participant.users.id,
          firstName: participant.users.first_name,
          lastName: participant.users.last_name,
          email: participant.users.email
        }
      }));
    } catch (error) {
      logger.error(`Failed to get participants for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  // Utility methods
  private static async validateRegistrationEligibility(tournament: any, user: any): Promise<void> {
    const now = new Date();

    // Check if registration is open
    if (tournament.registration_starts_at && now < new Date(tournament.registration_starts_at)) {
      throw new Error('Registration has not started yet');
    }

    if (tournament.registration_ends_at && now > new Date(tournament.registration_ends_at)) {
      throw new Error('Registration has ended');
    }

    // Check tournament status
    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new Error('Tournament is not accepting registrations');
    }

    // Check participant limit
    if (tournament.max_participants) {
      const db = DatabaseService.getInstance().getClient();
      const { count } = await db
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournament.id);

      if (count && count >= tournament.max_participants) {
        throw new Error('Tournament is full');
      }
    }

    // Check user status
    if (!user.is_active || user.is_suspended) {
      throw new Error('User account is not active');
    }
  }

  private static mapToTournamentDetails(tournament: any): TournamentDetails {
    const now = new Date();
    const startDate = new Date(tournament.starts_at);
    const endDate = new Date(tournament.ends_at);
    const registrationOpenDate = new Date(tournament.registration_starts_at);
    const registrationCloseDate = new Date(tournament.registration_ends_at);
    
    return {
      id: tournament.id,
      name: tournament.name,
      slug: tournament.slug,
      description: tournament.description,
      division: tournament.division,
      startDate,
      endDate,
      registrationOpenDate,
      registrationCloseDate,
      maxParticipants: tournament.max_participants,
      entryFee: Number(tournament.entry_fee || 0),
      prizePool: Number(tournament.prize_pool || 0),
      status: tournament.status,
      rules: tournament.rules,
      participantCount: 0, // Will be populated separately if needed
      isRegistrationOpen: now >= registrationOpenDate && now <= registrationCloseDate,
      timeUntilStart: Math.max(0, startDate.getTime() - now.getTime()),
      timeUntilEnd: Math.max(0, endDate.getTime() - now.getTime()),
      createdAt: new Date(tournament.created_at),
      updatedAt: new Date(tournament.updated_at),
    };
  }
}