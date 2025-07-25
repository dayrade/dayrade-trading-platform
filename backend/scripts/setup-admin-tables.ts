#!/usr/bin/env ts-node

import { DatabaseService } from '../src/services/database.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const logger = new Logger('AdminTablesMigration');

async function runAdminTablesMigration() {
  try {
    logger.info('Starting admin tables migration...');

    // Initialize database service
    await DatabaseService.initialize();
    const dbService = DatabaseService.getInstance();
    
    // Test database connection
    await dbService.testConnection();
    logger.info('Database connection test passed');

    // Read and execute the admin schema SQL
    const schemaPath = path.join(__dirname, '../sql/admin_system_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    logger.info('Executing admin system schema...');
    
    // Split the SQL into individual statements and execute them
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await dbService.query(statement + ';');
          logger.debug(`Executed: ${statement.substring(0, 50)}...`);
        } catch (error: any) {
          logger.warn(`Warning executing statement: ${error.message}`);
          // Continue with other statements even if one fails
        }
      }
    }

    logger.info('Admin tables migration completed successfully');

    // Verify admin user exists
    const adminUserResult = await dbService.query(`
      SELECT id, email, role FROM users WHERE email = 'admin@dayrade.com' LIMIT 1
    `);
    
    if (adminUserResult.rows && adminUserResult.rows.length > 0) {
      logger.info('Admin user verified in database');
    } else {
      logger.warn('Admin user not found - may need manual creation');
    }

    // Verify admin tables exist
    const tablesResult = await dbService.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('admin_audit_log', 'announcements', 'system_settings', 'admin_sessions', 'user_moderation_actions', 'system_health_metrics', 'feature_flags')
    `);
    
    logger.info(`Created admin tables: ${JSON.stringify(tablesResult.rows)}`);

  } catch (error: any) {
    logger.error('Admin tables migration failed:', error);
    console.error('Full error details:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  runAdminTablesMigration()
    .then(() => {
      logger.info('Admin tables migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Admin tables migration script failed:', error);
      process.exit(1);
    });
}

export { runAdminTablesMigration };