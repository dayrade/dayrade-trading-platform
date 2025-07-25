import { DatabaseService } from '../services/database.service';
import { Logger } from './logger';

const logger = new Logger('StartupValidator');

export class StartupValidator {
  static async validateDatabaseConnection(): Promise<void> {
    try {
      // Test database connection using DatabaseService
      const databaseService = DatabaseService.getInstance();
      await databaseService.testConnection();
      logger.info('Database connection validated successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw new Error(`Database connection failed: ${(error as Error).message}`);
    }
  }

  static async validateRedisConnection(): Promise<void> {
    try {
      // TODO: Implement actual Redis connection test when Redis service is implemented
      logger.info('Redis connection validation - skipped (not implemented yet)');
    } catch (error) {
      throw new Error(`Redis connection failed: ${(error as Error).message}`);
    }
  }

  static async validateExternalServices(): Promise<void> {
    // TODO: Implement external service health checks in respective tasks
    logger.info('External services validation - skipped (will be implemented in respective tasks)');
  }
}