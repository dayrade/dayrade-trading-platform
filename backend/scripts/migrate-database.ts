#!/usr/bin/env ts-node

import { PrismaClient } from '../generated/prisma';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('DatabaseMigration');
const prisma = new PrismaClient();

async function runMigrations() {
  try {
    logger.info('Starting database migration...');

    // Connect to the database
    await prisma.$connect();
    logger.info('Connected to database successfully');

    // Check if database is accessible
    await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('Database accessibility test passed');

    // Enable required extensions
    logger.info('Enabling required PostgreSQL extensions...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    logger.info('Extensions enabled successfully');

    // Create updated_at trigger function
    logger.info('Creating database functions...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Create triggers for updated_at columns
    const tablesWithUpdatedAt = [
      'users',
      'user_sessions',
      'tournaments',
      'tournament_participants',
      'trading_performance',
      'trades',
      'chat_messages',
      'leaderboard_snapshots',
      'notifications',
      'audit_logs',
      'system_configurations'
    ];

    for (const table of tablesWithUpdatedAt) {
      try {
        await prisma.$executeRaw`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        `;
        await prisma.$executeRaw`
          CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `;
        logger.info(`Created updated_at trigger for ${table} table`);
      } catch (error) {
        logger.warn(`Failed to create trigger for ${table}:`, error);
      }
    }

    // Create indexes for better performance
    logger.info('Creating additional indexes...');
    
    // User indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`;
    
    // Tournament indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_tournaments_end_date ON tournaments(end_date)`;
    
    // Tournament participants indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id)`;
    
    // Trading performance indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_trading_performance_tournament_id ON trading_performance(tournament_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_trading_performance_user_id ON trading_performance(user_id)`;
    
    // Trades indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_trades_tournament_id ON trades(tournament_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at)`;
    
    // Chat messages indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_chat_messages_tournament_id ON chat_messages(tournament_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)`;
    
    // Notifications indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`;
    
    // Audit logs indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)`;

    logger.info('Database indexes created successfully');

    // Insert default system configurations
    logger.info('Inserting default system configurations...');
    
    const defaultConfigs = [
      {
        key: 'PLATFORM_MAINTENANCE_MODE',
        value: 'false',
        description: 'Enable/disable platform maintenance mode'
      },
      {
        key: 'MAX_TOURNAMENT_PARTICIPANTS',
        value: '1000',
        description: 'Maximum number of participants per tournament'
      },
      {
        key: 'DEFAULT_TOURNAMENT_DURATION_HOURS',
        value: '24',
        description: 'Default tournament duration in hours'
      },
      {
        key: 'MIN_TRADE_AMOUNT',
        value: '1.00',
        description: 'Minimum trade amount in USD'
      },
      {
        key: 'MAX_TRADE_AMOUNT',
        value: '100000.00',
        description: 'Maximum trade amount in USD'
      },
      {
        key: 'CHAT_MESSAGE_MAX_LENGTH',
        value: '500',
        description: 'Maximum length for chat messages'
      },
      {
        key: 'LEADERBOARD_UPDATE_INTERVAL_MINUTES',
        value: '5',
        description: 'Interval for leaderboard updates in minutes'
      }
    ];

    for (const config of defaultConfigs) {
      await prisma.systemConfiguration.upsert({
        where: { key: config.key },
        update: {},
        create: config
      });
    }

    logger.info('Default system configurations inserted successfully');

    logger.info('Database migration completed successfully!');

  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { runMigrations };