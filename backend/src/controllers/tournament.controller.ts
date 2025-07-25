import { Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';
import { RedisService } from '../services/redis.service';
import { Logger } from '../utils/logger';

const logger = new Logger('TournamentController');

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class TournamentController {
  private static instance: TournamentController;
  private dbService: DatabaseService | null = null;
  private redisService: RedisService | null = null;

  private constructor() {
    // Lazy initialization - services will be initialized when first accessed
  }

  public static getInstance(): TournamentController {
    if (!TournamentController.instance) {
      TournamentController.instance = new TournamentController();
    }
    return TournamentController.instance;
  }

  private getDbService(): DatabaseService {
    if (!this.dbService) {
      this.dbService = DatabaseService.getInstance();
    }
    return this.dbService;
  }

  private getRedisService(): RedisService | null {
    if (!this.redisService) {
      try {
        this.redisService = RedisService.getInstance();
      } catch (error) {
        logger.warn('Redis service not available, continuing without caching');
        return null;
      }
    }
    return this.redisService;
  }

  /**
   * GET /api/tournaments - List all tournaments
   */
  public async getAllTournaments(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const division = req.query.division as string;
      
      const offset = (page - 1) * limit;

      // Try to get from cache first
      const cacheKey = `tournaments:list:${page}:${limit}:${status || 'all'}:${division || 'all'}`;
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          const cached = await redisService.get(cacheKey);
          if (cached) {
            res.json(JSON.parse(cached));
            return;
          }
        } catch (error) {
          logger.warn('Redis cache read failed:', error);
        }
      }

      // Build query
      let query = this.getDbService().getClient()
        .from('tournaments')
        .select('*, tournament_participants(count)', { count: 'exact' });

      // Add filters
      if (status) {
        query = query.eq('status', status.toUpperCase());
      }
      if (division) {
        query = query.eq('division', division.toUpperCase());
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: tournaments, error, count } = await query;

      if (error) {
        logger.error('Error fetching tournaments:', error);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
        return;
      }

      // Format response with pagination info
      const response = {
        tournaments: tournaments || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1
        }
      };

      // Cache the result for 5 minutes
      const redisServiceForCache = this.getRedisService();
      if (redisServiceForCache) {
        try {
          await redisServiceForCache.set(cacheKey, JSON.stringify(response), 300);
        } catch (error) {
          logger.warn('Redis cache write failed:', error);
        }
      }

      res.json(response);
    } catch (error) {
      logger.error('Error in getAllTournaments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tournaments/:id - Get tournament details
   */
  public async getTournamentById(req: Request, res: Response): Promise<void> {
    try {
      const tournamentId = req.params.id;

      if (!tournamentId) {
        res.status(400).json({ error: 'Tournament ID is required' });
        return;
      }

      // Try to get from cache first
      const cacheKey = `tournament:${tournamentId}`;
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          const cached = await redisService.get(cacheKey);
          if (cached) {
            res.json(JSON.parse(cached));
            return;
          }
        } catch (error) {
          logger.warn('Redis cache read failed:', error);
        }
      }

      // Get tournament with participant count
      const { data: tournament, error } = await this.getDbService().getClient()
        .from('tournaments')
        .select(`
          *,
          tournament_participants(count),
          tournament_participants(
            id,
            user_id,
            joined_at,
            users(id, username, first_name, last_name, avatar_url)
          )
        `)
        .eq('id', tournamentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({ error: 'Tournament not found' });
          return;
        }
        logger.error('Error fetching tournament:', error);
        res.status(500).json({ error: 'Failed to fetch tournament' });
        return;
      }

      // Cache the result for 10 minutes
      const redisServiceForCache = this.getRedisService();
      if (redisServiceForCache) {
        try {
          await redisServiceForCache.set(cacheKey, JSON.stringify(tournament), 600);
        } catch (error) {
          logger.warn('Redis cache write failed:', error);
        }
      }

      res.json(tournament);
    } catch (error) {
      logger.error('Error in getTournamentById:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tournaments/:id/participants - Get tournament participants
   */
  public async getTournamentParticipants(req: Request, res: Response): Promise<void> {
    try {
      const tournamentId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!tournamentId) {
        res.status(400).json({ error: 'Tournament ID is required' });
        return;
      }

      const offset = (page - 1) * limit;

      // Get participants with user details
      const { data: participants, error, count } = await this.getDbService().getClient()
        .from('tournament_participants')
        .select(`
          *,
          users(id, username, first_name, last_name, avatar_url),
          tournament_performance(
            total_return,
            total_return_percentage,
            total_trades,
            win_rate,
            sharpe_ratio,
            max_drawdown
          )
        `, { count: 'exact' })
        .eq('tournament_id', tournamentId)
        .order('joined_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching tournament participants:', error);
        res.status(500).json({ error: 'Failed to fetch tournament participants' });
        return;
      }

      // Format response with pagination info
      const response = {
        participants: participants || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in getTournamentParticipants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/tournaments/:id/join - Join a tournament
   */
  public async joinTournament(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tournamentId = req.params.id;
      const userId = req.user?.id;

      if (!tournamentId) {
        res.status(400).json({ error: 'Tournament ID is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if tournament exists and is open for registration
      const { data: tournament, error: tournamentError } = await this.getDbService().getClient()
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) {
        if (tournamentError.code === 'PGRST116') {
          res.status(404).json({ error: 'Tournament not found' });
          return;
        }
        logger.error('Error fetching tournament:', tournamentError);
        res.status(500).json({ error: 'Failed to fetch tournament' });
        return;
      }

      // Check tournament status
      if (tournament.status !== 'REGISTRATION_OPEN') {
        res.status(400).json({ error: 'Tournament registration is not open' });
        return;
      }

      // Check if registration period is valid
      const now = new Date();
      const registrationOpen = new Date(tournament.registration_open_date);
      const registrationClose = new Date(tournament.registration_close_date);

      if (now < registrationOpen || now > registrationClose) {
        res.status(400).json({ error: 'Tournament registration period has ended' });
        return;
      }

      // Check if user is already registered
      const { data: existingParticipant, error: participantCheckError } = await this.getDbService().getClient()
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .single();

      if (participantCheckError && participantCheckError.code !== 'PGRST116') {
        logger.error('Error checking existing participant:', participantCheckError);
        res.status(500).json({ error: 'Failed to check registration status' });
        return;
      }

      if (existingParticipant) {
        res.status(400).json({ error: 'Already registered for this tournament' });
        return;
      }

      // Check participant limit
      const { count: participantCount, error: countError } = await this.getDbService().getClient()
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId);

      if (countError) {
        logger.error('Error counting participants:', countError);
        res.status(500).json({ error: 'Failed to check participant count' });
        return;
      }

      if (tournament.max_participants && (participantCount || 0) >= tournament.max_participants) {
        res.status(400).json({ error: 'Tournament is full' });
        return;
      }

      // Register the user
      const { data: newParticipant, error: registrationError } = await this.getDbService().getClient()
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: userId,
          joined_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (registrationError) {
        logger.error('Error registering participant:', registrationError);
        res.status(500).json({ error: 'Failed to register for tournament' });
        return;
      }

      // Clear relevant caches
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          await redisService.del(`tournament:${tournamentId}`);
          // Clear tournament list caches (simplified approach)
          const keys = await redisService.get('tournaments:list:*');
          if (keys) {
            await redisService.del(keys);
          }
        } catch (error) {
          logger.warn('Redis cache clear failed:', error);
        }
      }

      res.status(201).json({
        message: 'Successfully registered for tournament',
        participant: newParticipant
      });
    } catch (error) {
      logger.error('Error in joinTournament:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tournaments/:id/leaderboard - Tournament-specific leaderboard
   */
  public async getTournamentLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const tournamentId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!tournamentId) {
        res.status(400).json({ error: 'Tournament ID is required' });
        return;
      }

      const offset = (page - 1) * limit;

      // Try to get from cache first
      const cacheKey = `tournament:leaderboard:${tournamentId}:${page}:${limit}`;
      const redisService = this.getRedisService();
      if (redisService) {
        try {
          const cached = await redisService.get(cacheKey);
          if (cached) {
            res.json(JSON.parse(cached));
            return;
          }
        } catch (error) {
          logger.warn('Redis cache read failed:', error);
        }
      }

      // Get leaderboard data
      const { data: leaderboard, error, count } = await this.getDbService().getClient()
        .from('tournament_participants')
        .select(`
          *,
          users(id, username, first_name, last_name, avatar_url),
          tournament_performance(
            total_return,
            total_return_percentage,
            total_trades,
            winning_trades,
            losing_trades,
            win_rate,
            sharpe_ratio,
            max_drawdown,
            volatility,
            updated_at
          )
        `, { count: 'exact' })
        .eq('tournament_id', tournamentId)
        .order('tournament_performance.total_return_percentage', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching tournament leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch tournament leaderboard' });
        return;
      }

      // Add ranking to each participant
      const rankedLeaderboard = (leaderboard || []).map((participant, index) => ({
        ...participant,
        rank: offset + index + 1
      }));

      // Format response with pagination info
      const response = {
        leaderboard: rankedLeaderboard,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1
        }
      };

      // Cache the result for 2 minutes (leaderboard updates frequently)
      const redisServiceForCache = this.getRedisService();
      if (redisServiceForCache) {
        try {
          await redisServiceForCache.set(cacheKey, JSON.stringify(response), 120);
        } catch (error) {
          logger.warn('Redis cache write failed:', error);
        }
      }

      res.json(response);
    } catch (error) {
      logger.error('Error in getTournamentLeaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}