import { Request, Response } from 'express';
import { GetStreamService } from '../integrations/getstream.service';
import { Logger } from '../utils/logger';

const logger = new Logger('ChatController');
const getStreamService = new GetStreamService();

export class ChatController {
  /**
   * Initialize user for chat
   * POST /api/chat/initialize-user
   */
  static async initializeUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, name, image, role } = req.body;

      if (!userId || !name) {
        res.status(400).json({
          success: false,
          error: 'userId and name are required'
        });
        return;
      }

      // Create or update user in GetStream
      await getStreamService.createUser({
        id: userId,
        name,
        image,
        role: role || 'user'
      });

      // Generate user token
      const token = getStreamService.generateUserToken(userId);

      res.json({
        success: true,
        data: {
          token,
          userId,
          apiKey: process.env.GETSTREAM_API_KEY
        }
      });

      logger.info(`Initialized chat user: ${userId}`);
    } catch (error) {
      logger.error('Failed to initialize chat user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize chat user'
      });
    }
  }

  /**
   * Create a new chat channel
   * POST /api/chat/channels
   */
  static async createChannel(req: Request, res: Response): Promise<void> {
    try {
      const { tournamentId, channelType, name, moderators } = req.body;

      if (!tournamentId || !channelType || !name) {
        res.status(400).json({
          success: false,
          error: 'tournamentId, channelType, and name are required'
        });
        return;
      }

      const channelId = `${tournamentId}-${channelType}`;
      
      const channel = await getStreamService.createChannel({
        type: channelType,
        id: channelId,
        name,
        custom: {
          tournament_id: tournamentId,
          moderators: moderators || []
        }
      });

      res.status(201).json({
        success: true,
        data: channel
      });

      logger.info(`Created chat channel: ${channelType}:${channelId}`);
    } catch (error) {
      logger.error('Failed to create chat channel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat channel'
      });
    }
  }

  /**
   * Get list of available channels
   * GET /api/chat/channels
   */
  static async getChannels(req: Request, res: Response): Promise<void> {
    try {
      const { tournamentId, userId } = req.query;

      // Mock response for available channels
      const mockChannels = [
        {
          id: `${tournamentId}-general`,
          type: 'general',
          name: 'General Chat',
          member_count: 45,
          last_message_at: new Date().toISOString(),
          custom: {
            tournament_id: tournamentId,
            description: 'General discussion for all participants'
          }
        },
        {
          id: `${tournamentId}-announcements`,
          type: 'announcements',
          name: 'Announcements',
          member_count: 45,
          last_message_at: new Date().toISOString(),
          custom: {
            tournament_id: tournamentId,
            description: 'Official tournament announcements'
          }
        },
        {
          id: `${tournamentId}-trading`,
          type: 'trading',
          name: 'Trading Discussion',
          member_count: 32,
          last_message_at: new Date().toISOString(),
          custom: {
            tournament_id: tournamentId,
            description: 'Discuss trading strategies and market insights'
          }
        }
      ];

      res.json({
        success: true,
        data: mockChannels
      });

      logger.info(`Retrieved channels for tournament: ${tournamentId}`);
    } catch (error) {
      logger.error('Failed to get channels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get channels'
      });
    }
  }

  /**
   * Join a chat channel
   * POST /api/chat/channels/:channelId/join
   */
  static async joinChannel(req: Request, res: Response): Promise<void> {
    try {
      const { channelId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'userId is required'
        });
        return;
      }

      // Extract channel type and ID from channelId
      const [tournamentId, channelType] = channelId.split('-');
      
      await getStreamService.addChannelMembers(channelType, channelId, [userId]);

      res.json({
        success: true,
        message: 'Successfully joined channel'
      });

      logger.info(`User ${userId} joined channel: ${channelId}`);
    } catch (error) {
      logger.error('Failed to join channel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join channel'
      });
    }
  }

  /**
   * Leave a chat channel
   * POST /api/chat/channels/:channelId/leave
   */
  static async leaveChannel(req: Request, res: Response): Promise<void> {
    try {
      const { channelId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'userId is required'
        });
        return;
      }

      // Extract channel type from channelId
      const [tournamentId, channelType] = channelId.split('-');
      
      await getStreamService.removeChannelMembers(channelType, channelId, [userId]);

      res.json({
        success: true,
        message: 'Successfully left channel'
      });

      logger.info(`User ${userId} left channel: ${channelId}`);
    } catch (error) {
      logger.error('Failed to leave channel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to leave channel'
      });
    }
  }

  /**
   * Send a message to a channel
   * POST /api/chat/messages
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { channelId, channelType, userId, text, attachments } = req.body;

      if (!channelId || !channelType || !userId || !text) {
        res.status(400).json({
          success: false,
          error: 'channelId, channelType, userId, and text are required'
        });
        return;
      }

      const message = await getStreamService.sendMessage(channelType, channelId, {
        text,
        user_id: userId,
        custom: {
          attachments: attachments || []
        }
      });

      res.status(201).json({
        success: true,
        data: message
      });

      logger.info(`Message sent to channel ${channelType}:${channelId} by user ${userId}`);
    } catch (error) {
      logger.error('Failed to send message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
  }

  /**
   * Get message history for a channel
   * GET /api/chat/history
   */
  static async getMessageHistory(req: Request, res: Response): Promise<void> {
    try {
      const { channelId, channelType, limit, before, after } = req.query;

      if (!channelId || !channelType) {
        res.status(400).json({
          success: false,
          error: 'channelId and channelType are required'
        });
        return;
      }

      const options = {
        limit: limit ? parseInt(limit as string) : 50,
        before: before as string,
        after: after as string
      };

      const messages = await getStreamService.getChannelMessages(
        channelType as string,
        channelId as string,
        options
      );

      res.json({
        success: true,
        data: messages
      });

      logger.info(`Retrieved message history for channel ${channelType}:${channelId}`);
    } catch (error) {
      logger.error('Failed to get message history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get message history'
      });
    }
  }

  /**
   * Moderate a message (flag, delete, etc.)
   * POST /api/chat/moderate
   */
  static async moderateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId, action, reason, moderatorId } = req.body;

      if (!messageId || !action || !moderatorId) {
        res.status(400).json({
          success: false,
          error: 'messageId, action, and moderatorId are required'
        });
        return;
      }

      // Validate action
      const validActions = ['flag', 'delete', 'approve'];
      if (!validActions.includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Invalid action. Must be one of: flag, delete, approve'
        });
        return;
      }

      // For mock implementation, we'll simulate moderation
      let result;
      switch (action) {
        case 'delete':
          await getStreamService.deleteMessage(messageId);
          result = { action: 'deleted', messageId };
          break;
        case 'flag':
          result = { action: 'flagged', messageId, reason };
          break;
        case 'approve':
          result = { action: 'approved', messageId };
          break;
      }

      res.json({
        success: true,
        data: result
      });

      logger.info(`Message ${messageId} moderated with action: ${action} by ${moderatorId}`);
    } catch (error) {
      logger.error('Failed to moderate message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to moderate message'
      });
    }
  }

  /**
   * Ban/unban a user from a channel
   * POST /api/chat/channels/:channelId/ban
   */
  static async banUser(req: Request, res: Response): Promise<void> {
    try {
      const { channelId } = req.params;
      const { userId, timeout, reason, moderatorId, action } = req.body;

      if (!userId || !moderatorId || !action) {
        res.status(400).json({
          success: false,
          error: 'userId, moderatorId, and action are required'
        });
        return;
      }

      // Validate action
      if (!['ban', 'unban'].includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Action must be either "ban" or "unban"'
        });
        return;
      }

      // Mock ban/unban implementation
      const result = {
        action,
        userId,
        channelId,
        timeout: timeout || null,
        reason: reason || null,
        moderatorId,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: result
      });

      logger.info(`User ${userId} ${action}ned from channel ${channelId} by ${moderatorId}`);
    } catch (error) {
      logger.error('Failed to ban/unban user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to ban/unban user'
      });
    }
  }

  /**
   * Search messages across channels
   * GET /api/chat/search
   */
  static async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { query, channelId, userId, limit } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      // Mock search results
      const mockResults = [
        {
          id: 'msg-1',
          text: `Sample message containing "${query}"`,
          user: {
            id: 'user-1',
            name: 'John Trader',
            image: 'https://example.com/avatar1.jpg'
          },
          channel: {
            id: channelId || 'tournament-123-general',
            name: 'General Chat'
          },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          relevance_score: 0.95
        },
        {
          id: 'msg-2',
          text: `Another message with "${query}" in it`,
          user: {
            id: 'user-2',
            name: 'Sarah Investor',
            image: 'https://example.com/avatar2.jpg'
          },
          channel: {
            id: channelId || 'tournament-123-trading',
            name: 'Trading Discussion'
          },
          created_at: new Date(Date.now() - 7200000).toISOString(),
          relevance_score: 0.87
        }
      ];

      res.json({
        success: true,
        data: {
          results: mockResults.slice(0, parseInt(limit as string) || 10),
          total: mockResults.length,
          query: query as string
        }
      });

      logger.info(`Searched messages with query: "${query}"`);
    } catch (error) {
      logger.error('Failed to search messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search messages'
      });
    }
  }

  /**
   * Get chat analytics for a tournament
   * GET /api/chat/analytics
   */
  static async getChatAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { tournamentId, timeframe } = req.query;

      if (!tournamentId) {
        res.status(400).json({
          success: false,
          error: 'tournamentId is required'
        });
        return;
      }

      // Mock analytics data
      const mockAnalytics = {
        totalMessages: 1247,
        activeUsers: 45,
        messagesByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 100) + 10
        })),
        topParticipants: [
          { userId: 'user-1', name: 'John Trader', messageCount: 89, rank: 1 },
          { userId: 'user-2', name: 'Sarah Investor', messageCount: 76, rank: 2 },
          { userId: 'user-3', name: 'Mike Analyst', messageCount: 65, rank: 3 }
        ],
        sentimentAnalysis: {
          positive: 0.65,
          neutral: 0.25,
          negative: 0.10
        },
        channelActivity: {
          general: 456,
          trading: 523,
          announcements: 268
        }
      };

      res.json({
        success: true,
        data: mockAnalytics
      });

      logger.info(`Retrieved chat analytics for tournament: ${tournamentId}`);
    } catch (error) {
      logger.error('Failed to get chat analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat analytics'
      });
    }
  }

  /**
   * Health check for chat service
   * GET /api/chat/health
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await getStreamService.healthCheck();
      
      res.json({
        success: true,
        data: {
          status: health.status,
          responseTime: health.responseTime,
          timestamp: new Date().toISOString(),
          service: 'GetStream Chat'
        }
      });
    } catch (error) {
      logger.error('Chat health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Chat service health check failed'
      });
    }
  }
}