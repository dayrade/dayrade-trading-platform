import { StreamChat } from 'stream-chat';
import { Logger } from '../utils/logger';

const logger = new Logger('GetStreamService');

interface GetStreamConfig {
  apiKey: string;
  apiSecret: string;
  appId: string;
}

interface GetStreamUser {
  id: string;
  name?: string;
  role?: 'admin' | 'user' | 'guest';
  custom?: Record<string, any>;
}

interface GetStreamChannel {
  type: string;
  id: string;
  created_by_id?: string;
  members?: string[];
  custom?: Record<string, any>;
}

interface GetStreamMessage {
  text: string;
  user_id: string;
  attachments?: any[];
  custom?: Record<string, any>;
}

interface TournamentChannel {
  tournamentId: string;
  channelId: string;
  channelType: 'tournament' | 'announcement' | 'general';
}

export interface StreamUser {
  id: string;
  name: string;
  image?: string;
  role?: string;
  custom?: Record<string, any>;
}

export interface StreamChannel {
  id: string;
  type: string;
  name?: string;
  image?: string;
  members?: string[];
  custom?: Record<string, any>;
}

export interface StreamMessage {
  id: string;
  text: string;
  user: StreamUser;
  created_at: string;
  updated_at?: string;
  custom?: Record<string, any>;
}

export interface CreateChannelRequest {
  type: string;
  id: string;
  name?: string;
  image?: string;
  members?: string[];
  created_by_id?: string;
  custom?: Record<string, any>;
}

export interface SendMessageRequest {
  text: string;
  user_id: string;
  custom?: Record<string, any>;
}

export class GetStreamService {
  private config: GetStreamConfig;
  private client: StreamChat;
  private apiKey: string;
  private apiSecret: string;
  private appId: string;

  constructor() {
    this.apiKey = process.env.GETSTREAM_API_KEY!;
    this.apiSecret = process.env.GETSTREAM_API_SECRET!;
    this.appId = process.env.GETSTREAM_APP_ID!;
    
    this.config = {
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      appId: this.appId
    };
    
    // Initialize StreamChat client with API key and secret
    this.client = StreamChat.getInstance(this.config.apiKey, this.config.apiSecret);
  }

  // Getter for accessing the client (useful for debugging)
  public getClient(): StreamChat {
    return this.client;
  }



  // User Management
  async createUser(user: StreamUser): Promise<any> {
    try {
      logger.info(`Creating GetStream user: ${user.id}`);
      
      const userData = {
        id: user.id,
        name: user.name,
        role: user.role || 'user',
        ...user.custom
      };

      const response = await this.client.upsertUser(userData);
      logger.info(`Successfully created GetStream user: ${user.id}`);
      return response;
    } catch (error) {
      logger.error(`Failed to create GetStream user ${user.id}:`, error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<StreamUser>): Promise<any> {
    try {
      logger.info(`Updating GetStream user: ${userId}`);
      
      const userData = {
        id: userId,
        ...updates
      };

      const response = await this.client.partialUpdateUser({
        id: userId,
        set: userData
      });
      
      logger.info(`Successfully updated GetStream user: ${userId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to update GetStream user ${userId}:`, error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      logger.info(`Deleting GetStream user: ${userId}`);
      
      const response = await this.client.deleteUser(userId, {
        mark_messages_deleted: true,
        hard_delete: false
      });
      
      logger.info(`Successfully deleted GetStream user: ${userId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to delete GetStream user ${userId}:`, error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const response = await this.client.queryUsers({ id: userId });
      return response.users[0];
    } catch (error) {
      logger.error(`Failed to get GetStream user ${userId}:`, error);
      throw error;
    }
  }

  // Channel Management
  async createChannel(channelData: CreateChannelRequest): Promise<any> {
    try {
      logger.info(`Creating GetStream channel: ${channelData.type}:${channelData.id}`);
      
      // Prepare channel options
      const channelOptions: any = {
        members: channelData.members,
        ...channelData.custom
      };

      // Add created_by_id if provided, otherwise use the first member as creator
      if (channelData.created_by_id) {
        channelOptions.created_by_id = channelData.created_by_id;
      } else if (channelData.members && channelData.members.length > 0) {
        channelOptions.created_by_id = channelData.members[0];
      }
      
      const channelInstance = this.client.channel(channelData.type, channelData.id, channelOptions);

      const response = await channelInstance.create();
      logger.info(`Successfully created GetStream channel: ${channelData.type}:${channelData.id}`);
      return response;
    } catch (error) {
      logger.error(`Failed to create GetStream channel ${channelData.type}:${channelData.id}:`, error);
      throw error;
    }
  }

  async updateChannel(channelType: string, channelId: string, channelData: Partial<StreamChannel>): Promise<any> {
    try {
      logger.info(`Updating GetStream channel: ${channelType}:${channelId}`);
      
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.update(channelData);
      
      logger.info(`Successfully updated GetStream channel: ${channelType}:${channelId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to update GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  async deleteChannel(channelType: string, channelId: string): Promise<any> {
    try {
      logger.info(`Deleting GetStream channel: ${channelType}:${channelId}`);
      
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.delete();
      
      logger.info(`Successfully deleted GetStream channel: ${channelType}:${channelId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to delete GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  async getChannel(channelType: string, channelId: string): Promise<any> {
    try {
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.query();
      return response.channel;
    } catch (error) {
      logger.error(`Failed to get GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  async addChannelMembers(channelType: string, channelId: string, userIds: string[]): Promise<any> {
    try {
      logger.info(`Adding members to GetStream channel ${channelType}:${channelId}: ${userIds.join(', ')}`);
      
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.addMembers(userIds);
      
      logger.info(`Successfully added members to GetStream channel: ${channelType}:${channelId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to add members to GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  async removeChannelMembers(channelType: string, channelId: string, userIds: string[]): Promise<any> {
    try {
      logger.info(`Removing members from GetStream channel ${channelType}:${channelId}: ${userIds.join(', ')}`);
      
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.removeMembers(userIds);
      
      logger.info(`Successfully removed members from GetStream channel: ${channelType}:${channelId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to remove members from GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  // Message Management
  async sendMessage(channelType: string, channelId: string, messageData: SendMessageRequest): Promise<any> {
    try {
      logger.info(`Sending message to GetStream channel ${channelType}:${channelId}`);
      
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.sendMessage({
        text: messageData.text,
        user_id: messageData.user_id,
        ...messageData.custom
      });
      
      logger.info(`Successfully sent message to GetStream channel: ${channelType}:${channelId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to send message to GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  async updateMessage(messageId: string, messageData: Partial<StreamMessage>): Promise<any> {
    try {
      logger.info(`Updating GetStream message: ${messageId}`);
      
      const response = await this.client.updateMessage({
        id: messageId,
        ...messageData
      });
      
      logger.info(`Successfully updated GetStream message: ${messageId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to update GetStream message ${messageId}:`, error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<any> {
    try {
      logger.info(`Deleting GetStream message: ${messageId}`);
      
      const response = await this.client.deleteMessage(messageId);
      
      logger.info(`Successfully deleted GetStream message: ${messageId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to delete GetStream message ${messageId}:`, error);
      throw error;
    }
  }

  async getChannelMessages(
    channelType: string,
    channelId: string,
    options?: {
      limit?: number;
      offset?: number;
      before?: string;
      after?: string;
    }
  ): Promise<any[]> {
    try {
      logger.info(`Getting messages for GetStream channel ${channelType}:${channelId}`);
      
      const channelInstance = this.client.channel(channelType, channelId);
      const response = await channelInstance.query({
        messages: {
          limit: options?.limit || 25,
          offset: options?.offset || 0,
          id_lt: options?.before,
          id_gt: options?.after
        }
      });
      
      logger.info(`Successfully retrieved messages for GetStream channel: ${channelType}:${channelId}`);
      return response.messages || [];
    } catch (error) {
      logger.error(`Failed to get messages for GetStream channel ${channelType}:${channelId}:`, error);
      throw error;
    }
  }

  // Token Generation for Client-Side
  generateUserToken(userId: string, expirationTime?: number): string {
    try {
      logger.info(`Generating GetStream token for user: ${userId}`);
      
      const token = this.client.createToken(userId, expirationTime);
      
      logger.info(`Successfully generated GetStream token for user: ${userId}`);
      return token;
    } catch (error) {
      logger.error(`Failed to generate GetStream token for user ${userId}:`, error);
      throw error;
    }
  }

  // Tournament-specific methods
  async createTournamentChannel(tournamentId: string, tournamentName: string, participants: string[]): Promise<any> {
    try {
      logger.info(`Creating tournament channel for tournament: ${tournamentId}`);
      
      // Prepare channel options with created_by_id
      const channelOptions: any = {
        members: participants
      };

      // Use the first participant as the creator, or a system user if no participants
      if (participants && participants.length > 0) {
        channelOptions.created_by_id = participants[0];
      } else {
        // Create a system user if no participants
        channelOptions.created_by_id = 'system';
      }
      
      const channelInstance = this.client.channel('messaging', `tournament-${tournamentId}`, channelOptions);

      const response = await channelInstance.create();
      
      logger.info(`Successfully created tournament channel: tournament-${tournamentId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to create tournament channel for ${tournamentId}:`, error);
      throw error;
    }
  }

  async addParticipantToTournament(tournamentId: string, userId: string): Promise<any> {
    return this.addChannelMembers('messaging', `tournament-${tournamentId}`, [userId]);
  }

  async removeParticipantFromTournament(tournamentId: string, userId: string): Promise<any> {
    return this.removeChannelMembers('messaging', `tournament-${tournamentId}`, [userId]);
  }

  async sendTournamentMessage(tournamentId: string, userId: string, message: string): Promise<any> {
    return this.sendMessage('messaging', `tournament-${tournamentId}`, {
      text: message,
      user_id: userId,
    });
  }

  async sendTournamentAnnouncement(tournamentId: string, message: string): Promise<any> {
    return this.sendMessage('messaging', `tournament-${tournamentId}`, {
      text: message,
      user_id: 'system',
      custom: {
        type: 'announcement',
      },
    });
  }

  async getTournamentMessages(tournamentId: string): Promise<any[]> {
    return this.getChannelMessages('messaging', `tournament-${tournamentId}`);
  }

  async getTournamentParticipants(tournamentId: string): Promise<any[]> {
    try {
      logger.info(`Getting participants for tournament: ${tournamentId}`);
      
      const channelInstance = this.client.channel('messaging', `tournament-${tournamentId}`);
      const response = await channelInstance.query();
      
      logger.info(`Successfully retrieved participants for tournament: ${tournamentId}`);
      return response.members || [];
    } catch (error) {
      logger.error(`Failed to get participants for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'online' | 'offline'; responseTime: number }> {
    const startTime = Date.now();
    try {
      logger.info('Performing GetStream health check');
      
      // Use a simple query to test connectivity
      await this.client.queryUsers({ id: { $exists: true } }, {}, { limit: 1 });
      
      const responseTime = Date.now() - startTime;
      logger.info(`GetStream health check successful - Response time: ${responseTime}ms`);
      
      return {
        status: 'online',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error(`GetStream health check failed - Response time: ${responseTime}ms:`, error);
      
      return {
        status: 'offline',
        responseTime,
      };
    }
  }
}

// Class is already exported in the declaration above