# Task 07: GetStream.io Chat Integration

**Task ID:** DAYRADE-007  
**Priority:** High  
**Dependencies:** Task 03 (Authentication System), Task 05 (Environment Configuration)  
**Estimated Duration:** 4-5 hours  
**Trae.ai Tools Required:** File System, Terminal, Web Search, Preview  

## 🎯 Task Objective

Implement complete GetStream.io chat integration for the Dayrade Trading Tournament Platform, including real-time messaging, tournament-specific channels, chat moderation, and admin controls. This task establishes the foundation for community interaction and real-time communication during trading tournaments.

## 🚨 CRITICAL DIRECTIVE FOR TRAE.AI

**GETSTREAM.IO INTEGRATION SPECIFICATIONS**

- **Service Name**: GetStream.io (NOT Stream.io)
- **Demo Integration**: Use GetStream.io demo stream if available for testing
- **Real-time Messaging**: WebSocket-based chat with tournament channels
- **Moderation**: Admin controls for message moderation and user management
- **Channel Management**: Automatic tournament channel creation and management

## 🔧 Complete GetStream.io Integration

### **GetStream.io Service Configuration**

```typescript
// src/services/getstream.service.ts
import { StreamChat } from 'stream-chat';
import { Logger } from '../utils/logger';
import { EnvironmentService } from './environment.service';

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
  role: 'admin' | 'moderator' | 'participant';
  tournamentId?: string;
}

export interface ChatChannel {
  id: string;
  type: 'tournament' | 'general' | 'admin';
  name: string;
  tournamentId?: string;
  memberCount: number;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  user: ChatUser;
  timestamp: Date;
  channelId: string;
  attachments?: any[];
  reactions?: any[];
}

export class GetStreamService {
  private static instance: GetStreamService;
  private logger: Logger;
  private client: StreamChat;
  private config: {
    apiKey: string;
    apiSecret: string;
    appId: string;
    baseUrl: string;
  };

  constructor() {
    this.logger = new Logger('GetStreamService');
    
    const envConfig = EnvironmentService.getConfig();
    this.config = {
      apiKey: envConfig.apis.getStream.apiKey,
      apiSecret: envConfig.apis.getStream.apiSecret,
      appId: envConfig.apis.getStream.appId,
      baseUrl: process.env.GETSTREAM_BASE_URL || 'https://chat.stream-io-api.com'
    };

    // Initialize GetStream.io client
    this.client = StreamChat.getInstance(this.config.apiKey, this.config.apiSecret);
  }

  static getInstance(): GetStreamService {
    if (!GetStreamService.instance) {
      GetStreamService.instance = new GetStreamService();
    }
    return GetStreamService.instance;
  }

  /**
   * Initialize GetStream.io connection
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing GetStream.io connection');
      
      // Test connection
      await this.client.queryChannels({});
      
      this.logger.info('GetStream.io connection established successfully');
    } catch (error) {
      this.logger.error('Failed to initialize GetStream.io:', error);
      throw error;
    }
  }

  /**
   * Create or update a chat user
   */
  async createUser(user: ChatUser): Promise<void> {
    try {
      await this.client.upsertUser({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
        tournament_id: user.tournamentId
      });

      this.logger.debug(`Created/updated user: ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to create user ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate user token for client-side authentication
   */
  generateUserToken(userId: string): string {
    try {
      return this.client.createToken(userId);
    } catch (error) {
      this.logger.error(`Failed to generate token for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a tournament channel
   */
  async createTournamentChannel(tournamentId: string, tournamentName: string): Promise<ChatChannel> {
    try {
      const channelId = `tournament-${tournamentId}`;
      
      const channel = this.client.channel('tournament', channelId, {
        name: `${tournamentName} Chat`,
        tournament_id: tournamentId,
        created_by_id: 'system',
        members: [], // Will be populated when users join
        config: {
          typing_events: true,
          read_events: true,
          connect_events: true,
          search: true,
          reactions: true,
          replies: true,
          quotes: true,
          mutes: true
        }
      });

      await channel.create('system');

      this.logger.info(`Created tournament channel: ${channelId}`);

      return {
        id: channelId,
        type: 'tournament',
        name: `${tournamentName} Chat`,
        tournamentId,
        memberCount: 0,
        isActive: true
      };

    } catch (error) {
      this.logger.error(`Failed to create tournament channel for ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Add user to tournament channel
   */
  async addUserToTournamentChannel(userId: string, tournamentId: string): Promise<void> {
    try {
      const channelId = `tournament-${tournamentId}`;
      const channel = this.client.channel('tournament', channelId);

      await channel.addMembers([userId]);

      this.logger.debug(`Added user ${userId} to tournament channel ${channelId}`);
    } catch (error) {
      this.logger.error(`Failed to add user ${userId} to tournament channel:`, error);
      throw error;
    }
  }

  /**
   * Remove user from tournament channel
   */
  async removeUserFromTournamentChannel(userId: string, tournamentId: string): Promise<void> {
    try {
      const channelId = `tournament-${tournamentId}`;
      const channel = this.client.channel('tournament', channelId);

      await channel.removeMembers([userId]);

      this.logger.debug(`Removed user ${userId} from tournament channel ${channelId}`);
    } catch (error) {
      this.logger.error(`Failed to remove user ${userId} from tournament channel:`, error);
      throw error;
    }
  }

  /**
   * Send system message to tournament channel
   */
  async sendSystemMessage(tournamentId: string, message: string): Promise<void> {
    try {
      const channelId = `tournament-${tournamentId}`;
      const channel = this.client.channel('tournament', channelId);

      await channel.sendMessage({
        text: message,
        user_id: 'system',
        type: 'system'
      });

      this.logger.debug(`Sent system message to tournament ${tournamentId}`);
    } catch (error) {
      this.logger.error(`Failed to send system message to tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Get tournament channel messages
   */
  async getTournamentMessages(
    tournamentId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const channelId = `tournament-${tournamentId}`;
      const channel = this.client.channel('tournament', channelId);

      const response = await channel.query({
        messages: { limit, offset }
      });

      return response.messages.map(msg => ({
        id: msg.id,
        text: msg.text || '',
        user: {
          id: msg.user?.id || 'unknown',
          name: msg.user?.name || 'Unknown User',
          image: msg.user?.image,
          role: msg.user?.role || 'participant'
        },
        timestamp: new Date(msg.created_at),
        channelId,
        attachments: msg.attachments,
        reactions: msg.reaction_counts
      }));

    } catch (error) {
      this.logger.error(`Failed to get messages for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Moderate message (delete, flag, etc.)
   */
  async moderateMessage(
    messageId: string,
    action: 'delete' | 'flag' | 'unflag',
    reason?: string
  ): Promise<void> {
    try {
      switch (action) {
        case 'delete':
          await this.client.deleteMessage(messageId);
          break;
        case 'flag':
          await this.client.flagMessage(messageId, { reason });
          break;
        case 'unflag':
          await this.client.unflagMessage(messageId);
          break;
      }

      this.logger.info(`Moderated message ${messageId} with action: ${action}`);
    } catch (error) {
      this.logger.error(`Failed to moderate message ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Ban user from channel
   */
  async banUser(
    userId: string,
    channelId: string,
    timeout?: number,
    reason?: string
  ): Promise<void> {
    try {
      const channel = this.client.channel('tournament', channelId);
      
      await channel.banUser(userId, {
        timeout: timeout || 3600, // 1 hour default
        reason: reason || 'Violation of community guidelines'
      });

      this.logger.info(`Banned user ${userId} from channel ${channelId}`);
    } catch (error) {
      this.logger.error(`Failed to ban user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unban user from channel
   */
  async unbanUser(userId: string, channelId: string): Promise<void> {
    try {
      const channel = this.client.channel('tournament', channelId);
      await channel.unbanUser(userId);

      this.logger.info(`Unbanned user ${userId} from channel ${channelId}`);
    } catch (error) {
      this.logger.error(`Failed to unban user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId: string): Promise<{
    memberCount: number;
    messageCount: number;
    activeUsers: number;
    lastActivity: Date;
  }> {
    try {
      const channel = this.client.channel('tournament', channelId);
      const response = await channel.query({
        state: true,
        presence: true
      });

      return {
        memberCount: Object.keys(response.members || {}).length,
        messageCount: response.channel?.message_count || 0,
        activeUsers: Object.keys(response.watcher_count || {}).length,
        lastActivity: new Date(response.channel?.last_message_at || Date.now())
      };

    } catch (error) {
      this.logger.error(`Failed to get stats for channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Search messages across channels
   */
  async searchMessages(
    query: string,
    channelIds?: string[],
    limit: number = 20
  ): Promise<ChatMessage[]> {
    try {
      const searchOptions: any = {
        query,
        limit
      };

      if (channelIds && channelIds.length > 0) {
        searchOptions.filter_conditions = {
          cid: { $in: channelIds.map(id => `tournament:${id}`) }
        };
      }

      const response = await this.client.search(searchOptions);

      return response.results.map(result => ({
        id: result.message.id,
        text: result.message.text || '',
        user: {
          id: result.message.user?.id || 'unknown',
          name: result.message.user?.name || 'Unknown User',
          image: result.message.user?.image,
          role: result.message.user?.role || 'participant'
        },
        timestamp: new Date(result.message.created_at),
        channelId: result.message.cid?.split(':')[1] || '',
        attachments: result.message.attachments,
        reactions: result.message.reaction_counts
      }));

    } catch (error) {
      this.logger.error('Failed to search messages:', error);
      throw error;
    }
  }

  /**
   * Get user's chat activity
   */
  async getUserChatActivity(userId: string, days: number = 7): Promise<{
    messageCount: number;
    channelsActive: number;
    lastActivity: Date;
    topChannels: Array<{ channelId: string; messageCount: number }>;
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const searchResponse = await this.client.search({
        filter_conditions: {
          'user.id': userId,
          created_at: { $gte: since.toISOString() }
        },
        limit: 1000
      });

      const messages = searchResponse.results;
      const channelCounts: { [key: string]: number } = {};

      messages.forEach(result => {
        const channelId = result.message.cid?.split(':')[1] || '';
        channelCounts[channelId] = (channelCounts[channelId] || 0) + 1;
      });

      const topChannels = Object.entries(channelCounts)
        .map(([channelId, count]) => ({ channelId, messageCount: count }))
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 5);

      const lastActivity = messages.length > 0 
        ? new Date(Math.max(...messages.map(m => new Date(m.message.created_at).getTime())))
        : new Date(0);

      return {
        messageCount: messages.length,
        channelsActive: Object.keys(channelCounts).length,
        lastActivity,
        topChannels
      };

    } catch (error) {
      this.logger.error(`Failed to get chat activity for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create general chat channels
   */
  async createGeneralChannels(): Promise<void> {
    try {
      const generalChannels = [
        { id: 'general', name: 'General Discussion' },
        { id: 'trading-tips', name: 'Trading Tips & Strategies' },
        { id: 'announcements', name: 'Announcements' }
      ];

      for (const channelConfig of generalChannels) {
        const channel = this.client.channel('general', channelConfig.id, {
          name: channelConfig.name,
          created_by_id: 'system'
        });

        await channel.create('system');
        this.logger.info(`Created general channel: ${channelConfig.id}`);
      }

    } catch (error) {
      this.logger.error('Failed to create general channels:', error);
      throw error;
    }
  }

  /**
   * Setup demo stream for testing
   */
  async setupDemoStream(): Promise<void> {
    try {
      this.logger.info('Setting up GetStream.io demo stream');

      // Create demo users
      const demoUsers = [
        { id: 'demo-trader-1', name: 'Demo Trader 1', role: 'participant' as const },
        { id: 'demo-trader-2', name: 'Demo Trader 2', role: 'participant' as const },
        { id: 'demo-admin', name: 'Demo Admin', role: 'admin' as const }
      ];

      for (const user of demoUsers) {
        await this.createUser(user);
      }

      // Create demo tournament channel
      await this.createTournamentChannel('demo-tournament', 'Demo Tournament');

      // Add demo users to channel
      for (const user of demoUsers) {
        await this.addUserToTournamentChannel(user.id, 'demo-tournament');
      }

      // Send welcome message
      await this.sendSystemMessage(
        'demo-tournament',
        'Welcome to the Dayrade demo tournament chat! This is a demonstration of the GetStream.io integration.'
      );

      this.logger.info('Demo stream setup completed successfully');

    } catch (error) {
      this.logger.error('Failed to setup demo stream:', error);
      throw error;
    }
  }

  /**
   * Cleanup inactive channels
   */
  async cleanupInactiveChannels(inactiveDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);

      const channels = await this.client.queryChannels({
        type: 'tournament',
        last_message_at: { $lt: cutoffDate.toISOString() }
      });

      for (const channel of channels) {
        await channel.delete();
        this.logger.info(`Deleted inactive channel: ${channel.id}`);
      }

      this.logger.info(`Cleaned up ${channels.length} inactive channels`);

    } catch (error) {
      this.logger.error('Failed to cleanup inactive channels:', error);
      throw error;
    }
  }
}
```

## 🎮 Frontend Chat Integration

### **React Chat Components**

```typescript
// src/components/chat/ChatPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { 
  Chat, 
  Channel, 
  ChannelHeader, 
  MessageList, 
  MessageInput,
  Thread,
  Window
} from 'stream-chat-react';
import { useAuth } from '../../hooks/useAuth';
import { GetStreamService } from '../../services/getstream.service';

interface ChatPanelProps {
  tournamentId?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  tournamentId,
  isExpanded,
  onToggle
}) => {
  const { user } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getStreamService = useRef(GetStreamService.getInstance());

  useEffect(() => {
    initializeChat();
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [user, tournamentId]);

  const initializeChat = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Initialize GetStream client
      const chatClient = StreamChat.getInstance(
        process.env.REACT_APP_GETSTREAM_API_KEY!
      );

      // Generate user token
      const token = getStreamService.current.generateUserToken(user.id);

      // Connect user
      await chatClient.connectUser(
        {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          image: user.avatarUrl,
          role: user.role || 'participant'
        },
        token
      );

      setClient(chatClient);

      // Get or create channel
      if (tournamentId) {
        const tournamentChannel = chatClient.channel(
          'tournament',
          `tournament-${tournamentId}`
        );
        await tournamentChannel.watch();
        setChannel(tournamentChannel);
      } else {
        const generalChannel = chatClient.channel('general', 'general');
        await generalChannel.watch();
        setChannel(generalChannel);
      }

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to connect to chat');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={initializeChat}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return null;
  }

  return (
    <div className={`h-full bg-gray-900 text-white transition-all duration-300 ${
      isExpanded ? 'w-96' : 'w-80'
    }`}>
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">
            {tournamentId ? 'Tournament Chat' : 'General Chat'}
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? '←' : '→'}
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <Chat client={client} theme="str-chat__theme-dark">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      </div>
    </div>
  );
};
```

### **Chat Moderation Interface**

```typescript
// src/components/admin/ChatModeration.tsx
import React, { useState, useEffect } from 'react';
import { GetStreamService } from '../../services/getstream.service';
import { ChatMessage, ChatChannel } from '../../services/getstream.service';

export const ChatModeration: React.FC = () => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const getStreamService = GetStreamService.getInstance();

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages();
    }
  }, [selectedChannel]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      // Implementation would query channels from GetStream
      // For now, using mock data
      setChannels([
        {
          id: 'tournament-1',
          type: 'tournament',
          name: 'Tournament 1 Chat',
          tournamentId: '1',
          memberCount: 25,
          isActive: true
        },
        {
          id: 'general',
          type: 'general',
          name: 'General Discussion',
          memberCount: 150,
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChannel) return;

    try {
      setLoading(true);
      const channelMessages = await getStreamService.getTournamentMessages(
        selectedChannel.replace('tournament-', ''),
        50
      );
      setMessages(channelMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateMessage = async (
    messageId: string,
    action: 'delete' | 'flag'
  ) => {
    try {
      await getStreamService.moderateMessage(messageId, action);
      await loadMessages(); // Refresh messages
    } catch (error) {
      console.error('Failed to moderate message:', error);
    }
  };

  const handleBanUser = async (userId: string, timeout: number = 3600) => {
    try {
      await getStreamService.banUser(userId, selectedChannel, timeout);
      await loadMessages(); // Refresh messages
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const handleSearchMessages = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const searchResults = await getStreamService.searchMessages(
        searchQuery,
        selectedChannel ? [selectedChannel] : undefined
      );
      setMessages(searchResults);
    } catch (error) {
      console.error('Failed to search messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Chat Moderation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Channel List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Channels</h2>
              <div className="space-y-2">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedChannel === channel.id
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-sm text-gray-400">
                      {channel.memberCount} members
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages and Moderation */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-4">
              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <button
                  onClick={handleSearchMessages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              {/* Messages List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {selectedChannel ? 'No messages found' : 'Select a channel to view messages'}
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={message.user.image || '/default-avatar.png'}
                              alt={message.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="font-medium">{message.user.name}</span>
                            <span className="text-sm text-gray-400">
                              {message.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-200">{message.text}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleModerateMessage(message.id, 'flag')}
                            className="px-2 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                          >
                            Flag
                          </button>
                          <button
                            onClick={() => handleModerateMessage(message.id, 'delete')}
                            className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleBanUser(message.user.id)}
                            className="px-2 py-1 bg-red-800 text-white text-sm rounded hover:bg-red-900"
                          >
                            Ban User
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 🔧 API Integration Endpoints

### **Chat API Routes**

```typescript
// src/routes/chat.routes.ts
import { Router } from 'express';
import { GetStreamService } from '../services/getstream.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const getStreamService = GetStreamService.getInstance();

/**
 * Generate chat token for authenticated user
 */
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    
    // Create or update user in GetStream
    await getStreamService.createUser({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      image: user.avatarUrl,
      role: user.role || 'participant'
    });

    // Generate token
    const token = getStreamService.generateUserToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        userId: user.id,
        apiKey: process.env.GETSTREAM_API_KEY
      }
    });

  } catch (error) {
    console.error('Failed to generate chat token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate chat token'
    });
  }
});

/**
 * Join tournament chat
 */
router.post('/tournaments/:tournamentId/join', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const { tournamentId } = req.params;

    await getStreamService.addUserToTournamentChannel(user.id, tournamentId);

    res.json({
      success: true,
      message: 'Successfully joined tournament chat'
    });

  } catch (error) {
    console.error('Failed to join tournament chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join tournament chat'
    });
  }
});

/**
 * Leave tournament chat
 */
router.post('/tournaments/:tournamentId/leave', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const { tournamentId } = req.params;

    await getStreamService.removeUserFromTournamentChannel(user.id, tournamentId);

    res.json({
      success: true,
      message: 'Successfully left tournament chat'
    });

  } catch (error) {
    console.error('Failed to leave tournament chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave tournament chat'
    });
  }
});

/**
 * Get tournament messages (Admin only)
 */
router.get('/tournaments/:tournamentId/messages', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await getStreamService.getTournamentMessages(
      tournamentId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Failed to get tournament messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tournament messages'
    });
  }
});

/**
 * Moderate message (Admin only)
 */
router.post('/messages/:messageId/moderate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { action, reason } = req.body;

    await getStreamService.moderateMessage(messageId, action, reason);

    res.json({
      success: true,
      message: `Message ${action} successfully`
    });

  } catch (error) {
    console.error('Failed to moderate message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate message'
    });
  }
});

/**
 * Ban user from channel (Admin only)
 */
router.post('/channels/:channelId/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId, timeout, reason } = req.body;

    await getStreamService.banUser(userId, channelId, timeout, reason);

    res.json({
      success: true,
      message: 'User banned successfully'
    });

  } catch (error) {
    console.error('Failed to ban user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban user'
    });
  }
});

/**
 * Search messages (Admin only)
 */
router.get('/search', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { query, channels, limit = 20 } = req.query;

    const channelIds = channels ? (channels as string).split(',') : undefined;
    const messages = await getStreamService.searchMessages(
      query as string,
      channelIds,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Failed to search messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search messages'
    });
  }
});

/**
 * Get user chat activity (Admin only)
 */
router.get('/users/:userId/activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const activity = await getStreamService.getUserChatActivity(
      userId,
      parseInt(days as string)
    );

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Failed to get user chat activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user chat activity'
    });
  }
});

export default router;
```

## ✅ Functional Validation Testing

### **Test 7.1: GetStream.io Integration Validation**

```typescript
// src/tests/getstream.test.ts
import { GetStreamService } from '../services/getstream.service';

describe('GetStream.io Integration', () => {
  let getStreamService: GetStreamService;

  beforeAll(async () => {
    getStreamService = GetStreamService.getInstance();
    await getStreamService.initialize();
  });

  describe('User Management', () => {
    test('should create user successfully', async () => {
      const testUser = {
        id: 'test-user-1',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        role: 'participant' as const
      };

      await expect(getStreamService.createUser(testUser)).resolves.not.toThrow();
    });

    test('should generate user token', () => {
      const token = getStreamService.generateUserToken('test-user-1');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('Channel Management', () => {
    test('should create tournament channel', async () => {
      const channel = await getStreamService.createTournamentChannel(
        'test-tournament-1',
        'Test Tournament'
      );

      expect(channel.id).toBe('tournament-test-tournament-1');
      expect(channel.type).toBe('tournament');
      expect(channel.name).toBe('Test Tournament Chat');
    });

    test('should add user to tournament channel', async () => {
      await expect(
        getStreamService.addUserToTournamentChannel('test-user-1', 'test-tournament-1')
      ).resolves.not.toThrow();
    });

    test('should send system message', async () => {
      await expect(
        getStreamService.sendSystemMessage('test-tournament-1', 'Welcome to the tournament!')
      ).resolves.not.toThrow();
    });

    test('should get tournament messages', async () => {
      const messages = await getStreamService.getTournamentMessages('test-tournament-1');
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe('Moderation Features', () => {
    test('should moderate message', async () => {
      // This would require a real message ID in practice
      const mockMessageId = 'test-message-id';
      
      await expect(
        getStreamService.moderateMessage(mockMessageId, 'flag', 'Test moderation')
      ).resolves.not.toThrow();
    });

    test('should ban user from channel', async () => {
      await expect(
        getStreamService.banUser('test-user-1', 'tournament-test-tournament-1', 3600, 'Test ban')
      ).resolves.not.toThrow();
    });

    test('should search messages', async () => {
      const results = await getStreamService.searchMessages('welcome');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Demo Stream', () => {
    test('should setup demo stream successfully', async () => {
      await expect(getStreamService.setupDemoStream()).resolves.not.toThrow();
    });
  });
});
```

### **Test 7.2: Chat API Endpoints Validation**

```typescript
// src/tests/chat-api.test.ts
import request from 'supertest';
import { app } from '../app';
import { generateTestToken } from '../utils/test-helpers';

describe('Chat API Endpoints', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    authToken = generateTestToken({ id: 'test-user', role: 'participant' });
    adminToken = generateTestToken({ id: 'admin-user', role: 'admin' });
  });

  describe('POST /api/chat/token', () => {
    test('should generate chat token for authenticated user', async () => {
      const response = await request(app)
        .post('/api/chat/token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('apiKey');
    });

    test('should reject unauthenticated requests', async () => {
      await request(app)
        .post('/api/chat/token')
        .expect(401);
    });
  });

  describe('POST /api/chat/tournaments/:tournamentId/join', () => {
    test('should allow user to join tournament chat', async () => {
      const response = await request(app)
        .post('/api/chat/tournaments/test-tournament/join')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/chat/tournaments/:tournamentId/messages', () => {
    test('should allow admin to get tournament messages', async () => {
      const response = await request(app)
        .get('/api/chat/tournaments/test-tournament/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should reject non-admin requests', async () => {
      await request(app)
        .get('/api/chat/tournaments/test-tournament/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('POST /api/chat/messages/:messageId/moderate', () => {
    test('should allow admin to moderate messages', async () => {
      const response = await request(app)
        .post('/api/chat/messages/test-message/moderate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'flag', reason: 'Test moderation' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/chat/search', () => {
    test('should allow admin to search messages', async () => {
      const response = await request(app)
        .get('/api/chat/search')
        .query({ query: 'test', limit: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

## 🎯 Explicit Completion Declaration

**Task 07 Completion Criteria:**

- [x] Complete GetStream.io service integration with chat functionality
- [x] User management and authentication with GetStream.io
- [x] Tournament channel creation and management
- [x] Real-time messaging with WebSocket support
- [x] Chat moderation features for admins
- [x] Message search and user activity tracking
- [x] Frontend React components for chat interface
- [x] Admin chat moderation interface
- [x] API endpoints for chat functionality
- [x] Demo stream setup for testing and demonstration
- [x] Comprehensive test suite for chat integration
- [x] Error handling and user experience optimization

**Deliverables:**
1. GetStreamService class with complete chat functionality
2. React ChatPanel component for user interface
3. Admin chat moderation interface
4. API routes for chat management and moderation
5. Demo stream setup for testing
6. Comprehensive test suite for chat features

**Next Step Validation:**
Task 07 is complete and ready for Task 08 (API Endpoints Specification). The GetStream.io integration provides robust real-time chat functionality with moderation capabilities for the Dayrade platform.

## 📞 Stakeholder Communication Template

**Status Update for Project Stakeholders:**

"Task 07 (GetStream.io Chat Integration) has been completed successfully. The complete chat system is now operational with real-time messaging, tournament-specific channels, admin moderation controls, and demo stream functionality. The integration includes comprehensive user management, message moderation, and search capabilities for effective community management."

**Technical Summary:**
- GetStream.io integration with real-time messaging
- Tournament channel management and user authentication
- Admin moderation interface with message and user controls
- Demo stream setup for testing and demonstration
- Comprehensive API endpoints for chat functionality
- Complete test suite for chat system validation

**Ready for Next Phase:** API Endpoints Specification (Task 08)

