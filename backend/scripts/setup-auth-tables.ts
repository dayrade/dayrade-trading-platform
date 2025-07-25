#!/usr/bin/env ts-node

import { DatabaseService } from '../src/services/database.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('AuthTablesMigration');

async function createAuthTables() {
  try {
    logger.info('Starting authentication tables migration...');

    // Initialize database service
    const databaseService = await DatabaseService.initialize();
    const supabase = databaseService.getClient();

    // Create email_verification_codes table
    logger.info('Creating email_verification_codes table...');
    const { error: verificationError } = await supabase.rpc('create_email_verification_codes_table');
    
    if (verificationError) {
      logger.info('email_verification_codes table creation failed or already exists:', verificationError.message);
      
      // Try to check if table exists by querying it
      const { error: checkError } = await supabase
        .from('email_verification_codes')
        .select('id')
        .limit(1);
        
      if (checkError) {
        logger.error('email_verification_codes table does not exist and could not be created');
        logger.info('Please create the table manually using the SQL commands below:');
        logger.info(`
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at ON email_verification_codes(expires_at);
        `);
      } else {
        logger.info('email_verification_codes table exists and is accessible');
      }
    } else {
      logger.info('email_verification_codes table created successfully');
    }

    // Create password_reset_tokens table
    logger.info('Creating password_reset_tokens table...');
    const { error: resetError } = await supabase.rpc('create_password_reset_tokens_table');
    
    if (resetError) {
      logger.info('password_reset_tokens table creation failed or already exists:', resetError.message);
      
      // Try to check if table exists by querying it
      const { error: checkError } = await supabase
        .from('password_reset_tokens')
        .select('id')
        .limit(1);
        
      if (checkError) {
        logger.error('password_reset_tokens table does not exist and could not be created');
        logger.info('Please create the table manually using the SQL commands below:');
        logger.info(`
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
        `);
      } else {
        logger.info('password_reset_tokens table exists and is accessible');
      }
    } else {
      logger.info('password_reset_tokens table created successfully');
    }

    logger.info('Authentication tables migration completed');
    return true;

  } catch (error) {
    logger.error('Authentication tables migration failed:', error);
    throw error;
  }
}

async function runAuthTablesMigration() {
  try {
    logger.info('Starting complete authentication tables migration...');

    // Create tables
    await createAuthTables();

    logger.info('✅ Authentication tables migration completed successfully!');
    logger.info('Created tables:');
    logger.info('  - email_verification_codes');
    logger.info('  - password_reset_tokens');
    logger.info('Available auth endpoints:');
    logger.info('  - POST /api/auth/send-verification-code');
    logger.info('  - POST /api/auth/verify-email');
    logger.info('  - POST /api/auth/forgot-password');
    logger.info('  - POST /api/auth/reset-password');

  } catch (error) {
    logger.error('❌ Authentication tables migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runAuthTablesMigration()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { createAuthTables, runAuthTablesMigration };