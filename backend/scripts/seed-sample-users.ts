#!/usr/bin/env ts-node

import { DatabaseService } from '../src/services/database.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const logger = new Logger('SeedSampleUsers');

interface SampleUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  zimtraUsername: string;
  role: 'user' | 'moderator' | 'admin';
  emailVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  description: string;
}

const sampleUsers: SampleUser[] = [
  {
    email: 'viewer@dayrade.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Viewer',
    zimtraUsername: 'john_viewer',
    role: 'user',
    emailVerified: false,
    kycStatus: 'pending',
    isActive: true,
    description: 'Unverified user - viewer state'
  },
  {
    email: 'registered@dayrade.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Registered',
    zimtraUsername: 'jane_registered',
    role: 'user',
    emailVerified: true,
    kycStatus: 'pending',
    isActive: true,
    description: 'Email verified but KYC pending - registered state'
  },
  {
    email: 'verified@dayrade.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Verified',
    zimtraUsername: 'mike_verified',
    role: 'user',
    emailVerified: true,
    kycStatus: 'approved',
    isActive: true,
    description: 'Fully verified user - kyc_verified state'
  },
  {
    email: 'rejected@dayrade.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Rejected',
    zimtraUsername: 'sarah_rejected',
    role: 'user',
    emailVerified: true,
    kycStatus: 'rejected',
    isActive: true,
    description: 'KYC rejected user'
  },
  {
    email: 'moderator@dayrade.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Moderator',
    zimtraUsername: 'alex_moderator',
    role: 'moderator',
    emailVerified: true,
    kycStatus: 'approved',
    isActive: true,
    description: 'Moderator user'
  },
  {
    email: 'admin@dayrade.com',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Admin',
    zimtraUsername: 'emma_admin',
    role: 'admin',
    emailVerified: true,
    kycStatus: 'approved',
    isActive: true,
    description: 'Admin user'
  }
];

async function seedSampleUsers() {
  try {
    logger.info('Starting sample users seeding...');

    // Initialize database service
    const databaseService = await DatabaseService.initialize();
    const supabase = databaseService.getClient();

    logger.info('Connected to database');

    for (const user of sampleUsers) {
      try {
        logger.info(`Creating user: ${user.email} (${user.description})`);

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingUser) {
          logger.info(`User ${user.email} already exists, skipping...`);
          continue;
        }

        // Create user in Supabase Auth (if using Supabase Auth)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: user.emailVerified,
          user_metadata: {
            firstName: user.firstName,
            lastName: user.lastName,
            zimtraUsername: user.zimtraUsername
          }
        });

        if (authError) {
          logger.error(`Failed to create auth user for ${user.email}:`, authError);
          continue;
        }

        // Create user profile in users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user?.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            zimtra_username: user.zimtraUsername,
            role: user.role,
            kyc_status: user.kycStatus,
            email_verified: user.emailVerified,
            is_active: user.isActive,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          logger.error(`Failed to create user profile for ${user.email}:`, profileError);
          continue;
        }

        logger.info(`✅ Successfully created user: ${user.email}`);

      } catch (error) {
        logger.error(`Failed to create user ${user.email}:`, error);
      }
    }

    logger.info('Sample users seeding completed!');
    logger.info('\n📋 Sample User Credentials:');
    logger.info('================================');
    
    sampleUsers.forEach(user => {
      logger.info(`${user.description}:`);
      logger.info(`  Email: ${user.email}`);
      logger.info(`  Password: ${user.password}`);
      logger.info(`  State: ${user.emailVerified ? (user.kycStatus === 'approved' ? 'kyc_verified' : 'registered') : 'viewer'}`);
      logger.info(`  KYC Status: ${user.kycStatus}`);
      logger.info(`  Role: ${user.role}`);
      logger.info('');
    });

  } catch (error) {
    logger.error('Failed to seed sample users:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await seedSampleUsers();
    process.exit(0);
  } catch (error) {
    logger.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { seedSampleUsers };