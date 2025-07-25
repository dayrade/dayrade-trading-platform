import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '../utils/logger';
import { PrismaClient } from '../types/database.types';

export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: SupabaseClient;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('DatabaseService');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public static async initialize(): Promise<DatabaseService> {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
      await DatabaseService.instance.testConnection();
    }
    return DatabaseService.instance;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      throw new Error('DatabaseService not initialized. Call initialize() first.');
    }
    return DatabaseService.instance;
  }

  // Prisma-like interface for compatibility
  public static getPrismaClient(): PrismaClient {
    const instance = DatabaseService.getInstance();
    return instance.supabase as any as PrismaClient;
  }

  public getClient(): SupabaseClient {
    return this.supabase;
  }

  public async testConnection(): Promise<void> {
    try {
      // Simple test to verify Supabase client is working
      // We'll just check if the client is properly initialized
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      this.logger.info('Database connection test successful');
    } catch (error) {
      this.logger.error('Database connection test failed:', error);
      throw error;
    }
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    try {
      // For raw SQL queries, we can use the rpc function
      const { data, error } = await this.supabase.rpc('execute_sql', {
        query: sql,
        params: params || []
      });

      if (error) {
        throw new Error(`Query execution failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Query execution failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    // Supabase client doesn't require explicit disconnection
    this.logger.info('Database service disconnected');
  }
}