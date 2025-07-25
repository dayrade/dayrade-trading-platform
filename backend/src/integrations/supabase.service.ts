import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '../utils/logger';

const logger = new Logger('SupabaseService');

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface RealtimeSubscription {
  id: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: any) => void;
}

export interface StorageUploadOptions {
  bucket: string;
  path: string;
  file: Buffer | File;
  options?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  };
}

export class SupabaseService {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;
  private subscriptions: Map<string, any> = new Map();

  constructor() {
    const config = this.validateConfig();
    
    // Client for user operations (with anon key)
    this.client = createClient(config.url, config.anonKey);
    
    // Service client for admin operations (with service role key)
    this.serviceClient = createClient(config.url, config.serviceRoleKey);
    
    logger.info('Supabase service initialized');
  }

  private validateConfig(): SupabaseConfig {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceRoleKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    return { url, anonKey, serviceRoleKey };
  }

  // Get client for user operations
  getClient(): SupabaseClient {
    return this.client;
  }

  // Get service client for admin operations
  getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }

  // Real-time subscriptions
  async subscribeToTable(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void,
    filter?: string
  ): Promise<string> {
    try {
      const subscriptionId = `${table}_${event}_${Date.now()}`;
      
      const channel = this.client.channel(subscriptionId);
      
      // Subscribe to database changes
      channel.on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        callback
      );

      await channel.subscribe();
      this.subscriptions.set(subscriptionId, channel);
      
      logger.info(`Subscribed to ${table} table for ${event} events`);
      return subscriptionId;
    } catch (error) {
      logger.error(`Failed to subscribe to ${table}:`, error);
      throw error;
    }
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        await this.client.removeChannel(subscription);
        this.subscriptions.delete(subscriptionId);
        logger.info(`Unsubscribed from ${subscriptionId}`);
      }
    } catch (error) {
      logger.error(`Failed to unsubscribe from ${subscriptionId}:`, error);
      throw error;
    }
  }

  // Storage operations
  async uploadFile(options: StorageUploadOptions): Promise<{
    data: { path: string } | null;
    error: any;
  }> {
    try {
      const result = await this.serviceClient.storage
        .from(options.bucket)
        .upload(options.path, options.file, options.options);

      if (result.error) {
        logger.error(`Failed to upload file to ${options.bucket}/${options.path}:`, result.error);
      } else {
        logger.info(`File uploaded successfully to ${options.bucket}/${options.path}`);
      }

      return result;
    } catch (error) {
      logger.error('File upload error:', error);
      throw error;
    }
  }

  async downloadFile(bucket: string, path: string): Promise<{
    data: Blob | null;
    error: any;
  }> {
    try {
      const result = await this.serviceClient.storage
        .from(bucket)
        .download(path);

      if (result.error) {
        logger.error(`Failed to download file from ${bucket}/${path}:`, result.error);
      }

      return result;
    } catch (error) {
      logger.error('File download error:', error);
      throw error;
    }
  }

  async deleteFile(bucket: string, paths: string[]): Promise<{
    data: any;
    error: any;
  }> {
    try {
      const result = await this.serviceClient.storage
        .from(bucket)
        .remove(paths);

      if (result.error) {
        logger.error(`Failed to delete files from ${bucket}:`, result.error);
      } else {
        logger.info(`Files deleted successfully from ${bucket}`);
      }

      return result;
    } catch (error) {
      logger.error('File deletion error:', error);
      throw error;
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Tournament-specific real-time features
  async subscribeTournamentUpdates(
    tournamentId: string,
    callback: (payload: any) => void
  ): Promise<string[]> {
    const subscriptionIds: string[] = [];

    try {
      // Subscribe to tournament updates
      const tournamentSub = await this.subscribeToTable(
        'tournaments',
        '*',
        callback,
        `id=eq.${tournamentId}`
      );
      subscriptionIds.push(tournamentSub);

      // Subscribe to participant updates
      const participantSub = await this.subscribeToTable(
        'tournament_participants',
        '*',
        callback,
        `tournament_id=eq.${tournamentId}`
      );
      subscriptionIds.push(participantSub);

      // Subscribe to trade updates
      const tradeSub = await this.subscribeToTable(
        'trades',
        '*',
        callback,
        `tournament_id=eq.${tournamentId}`
      );
      subscriptionIds.push(tradeSub);

      logger.info(`Subscribed to real-time updates for tournament ${tournamentId}`);
      return subscriptionIds;
    } catch (error) {
      // Clean up any successful subscriptions
      for (const subId of subscriptionIds) {
        await this.unsubscribe(subId);
      }
      throw error;
    }
  }

  // User presence tracking
  async trackUserPresence(
    userId: string,
    tournamentId: string,
    status: 'online' | 'offline'
  ): Promise<void> {
    try {
      const presenceData = {
        user_id: userId,
        tournament_id: tournamentId,
        status,
        last_seen: new Date().toISOString(),
      };

      // Use Supabase presence feature
      const channel = this.client.channel(`tournament_${tournamentId}`);
      
      if (status === 'online') {
        await channel.track(presenceData);
      } else {
        await channel.untrack();
      }

      logger.info(`User ${userId} presence updated to ${status} in tournament ${tournamentId}`);
    } catch (error) {
      logger.error('Failed to track user presence:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connected: boolean;
      responseTime: number;
      error?: string;
    };
  }> {
    const startTime = Date.now();

    try {
      // Test connection with a simple query
      const { data, error } = await this.serviceClient
        .from('users')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          status: 'unhealthy',
          details: {
            connected: false,
            responseTime,
            error: error.message,
          },
        };
      }

      return {
        status: 'healthy',
        details: {
          connected: true,
          responseTime,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    try {
      // Unsubscribe from all subscriptions
      for (const [subscriptionId] of this.subscriptions) {
        await this.unsubscribe(subscriptionId);
      }
      
      logger.info('Supabase service cleanup completed');
    } catch (error) {
      logger.error('Error during Supabase service cleanup:', error);
      throw error;
    }
  }
}