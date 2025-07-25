#!/usr/bin/env ts-node

import { DatabaseService } from '../src/services/database.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const logger = new Logger('SeedTournamentData');

// Sample trader names and data
const traderNames = [
  'Alex Thompson', 'Sarah Chen', 'Michael Rodriguez', 'Emma Johnson', 'David Kim',
  'Jessica Williams', 'Ryan O\'Connor', 'Lisa Zhang', 'James Miller', 'Amanda Davis',
  'Kevin Lee', 'Rachel Green', 'Daniel Brown', 'Sophia Martinez', 'Tyler Wilson',
  'Olivia Taylor', 'Brandon Clark', 'Megan Lewis', 'Jordan Walker', 'Ashley Hall',
  'Christopher Young', 'Nicole King', 'Matthew Wright', 'Samantha Lopez', 'Andrew Hill',
  'Victoria Scott', 'Nathan Adams', 'Kayla Baker', 'Justin Gonzalez', 'Brittany Nelson',
  'Aaron Carter', 'Stephanie Mitchell', 'Sean Perez', 'Danielle Roberts', 'Marcus Turner',
  'Kimberly Phillips', 'Eric Campbell', 'Melissa Parker', 'Jonathan Evans', 'Heather Edwards',
  'Gregory Collins', 'Crystal Stewart', 'Patrick Sanchez', 'Tiffany Morris', 'Jeremy Rogers',
  'Vanessa Reed', 'Kyle Cook', 'Monica Bailey', 'Travis Rivera', 'Jasmine Cooper',
  'Lucas Richardson', 'Alexis Cox', 'Caleb Ward', 'Destiny Torres', 'Ian Peterson',
  'Gabrielle Gray', 'Mason Ramirez', 'Brooke James', 'Ethan Watson', 'Paige Brooks'
];

const tradingSymbols = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM',
  'ORCL', 'INTC', 'AMD', 'PYPL', 'UBER', 'LYFT', 'ZOOM', 'SHOP', 'SQ', 'ROKU',
  'TWTR', 'SNAP', 'PINS', 'SPOT', 'ZM', 'DOCU', 'CRWD', 'OKTA', 'SNOW', 'PLTR'
];

interface TournamentData {
  name: string;
  description: string;
  division: 'elevator' | 'crusader' | 'raider';
  startDate: Date;
  endDate: Date;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  status: 'active' | 'registration_open' | 'completed';
}

const sampleTournaments: TournamentData[] = [
  {
    name: 'Winter Championship 2024',
    description: 'The ultimate winter trading championship featuring top traders from around the world.',
    division: 'crusader',
    startDate: new Date('2024-12-01T09:00:00Z'),
    endDate: new Date('2024-12-15T17:00:00Z'),
    registrationOpenDate: new Date('2024-11-01T00:00:00Z'),
    registrationCloseDate: new Date('2024-11-30T23:59:59Z'),
    entryFee: 250.00,
    prizePool: 15000.00,
    maxParticipants: 100,
    status: 'active'
  },
  {
    name: 'New Year Trading Challenge',
    description: 'Start the new year with an exciting trading challenge.',
    division: 'elevator',
    startDate: new Date('2025-01-02T09:00:00Z'),
    endDate: new Date('2025-01-16T17:00:00Z'),
    registrationOpenDate: new Date('2024-12-01T00:00:00Z'),
    registrationCloseDate: new Date('2025-01-01T23:59:59Z'),
    entryFee: 100.00,
    prizePool: 5000.00,
    maxParticipants: 75,
    status: 'registration_open'
  },
  {
    name: 'Autumn Masters Tournament',
    description: 'A completed tournament showcasing historical trading performance.',
    division: 'raider',
    startDate: new Date('2024-10-01T09:00:00Z'),
    endDate: new Date('2024-10-31T17:00:00Z'),
    registrationOpenDate: new Date('2024-09-01T00:00:00Z'),
    registrationCloseDate: new Date('2024-09-30T23:59:59Z'),
    entryFee: 500.00,
    prizePool: 25000.00,
    maxParticipants: 50,
    status: 'completed'
  }
];

function generateRandomPnL(baseAmount: number, volatility: number): number {
  const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
  return baseAmount + (baseAmount * volatility * randomFactor);
}

interface TradingActivityData {
  trader_id: string;
  timestamp: string;
  activity_level: number;
  trading_volume: number;
  trade_frequency: number;
  portfolio_changes: number;
  raw_score: number;
  normalized_score: number;
}

function generateTradingActivity(traderId: string, days: number): TradingActivityData[] {
  const activities: TradingActivityData[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    
    // Generate multiple activity points per day
    for (let hour = 9; hour < 17; hour++) {
      if (Math.random() > 0.3) { // 70% chance of activity each hour
        const activityTime = new Date(date);
        activityTime.setHours(hour, Math.floor(Math.random() * 60));
        
        activities.push({
          trader_id: traderId,
          timestamp: activityTime.toISOString(),
          activity_level: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
          trading_volume: Math.floor(Math.random() * 50000) + 1000,
          trade_frequency: Math.floor(Math.random() * 10) + 1,
          portfolio_changes: Math.floor(Math.random() * 5) + 1,
          raw_score: Math.random() * 100,
          normalized_score: Math.random()
        });
      }
    }
  }
  
  return activities;
}

async function createSampleUsers(count: number): Promise<any[]> {
  const users: any[] = [];
  const databaseService = await DatabaseService.initialize();
  const supabase = databaseService.getClient();
  
  for (let i = 0; i < count; i++) {
    const [firstName, lastName] = traderNames[i % traderNames.length].split(' ');
    const email = `trader${i + 1}@dayrade.com`;
    const zimtraUsername = `trader_${i + 1}`;
    const password = 'TraderPass2024!';
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        users.push(existingUser);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          firstName: firstName,
          lastName: lastName,
          zimtraUsername: zimtraUsername
        }
      });

      if (authError) {
        logger.error(`Failed to create auth user for ${email}:`, authError);
        continue;
      }

      // Create user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.user?.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          zimtra_username: zimtraUsername,
          role: 'user',
          kyc_status: 'approved',
          email_verified: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        logger.error(`Failed to create user profile for ${email}:`, profileError);
        continue;
      }

      users.push(userProfile);
      logger.info(`✅ Created user: ${email}`);

    } catch (error) {
      logger.error(`Failed to create user ${email}:`, error);
    }
  }
  
  return users;
}

async function createTournaments(): Promise<any[]> {
  const databaseService = await DatabaseService.initialize();
  const supabase = databaseService.getClient();
  const tournaments: any[] = [];
  
  for (const tournamentData of sampleTournaments) {
    try {
      const slug = tournamentData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Check if tournament already exists
      const { data: existingTournament } = await supabase
        .from('tournaments')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingTournament) {
        tournaments.push(existingTournament);
        continue;
      }

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({
          name: tournamentData.name,
          slug: slug,
          description: tournamentData.description,
          division: tournamentData.division,
          tournament_type: 'standard',
          start_date: tournamentData.startDate.toISOString(),
          end_date: tournamentData.endDate.toISOString(),
          registration_open_date: tournamentData.registrationOpenDate.toISOString(),
          registration_close_date: tournamentData.registrationCloseDate.toISOString(),
          max_participants: tournamentData.maxParticipants,
          current_participants: 0,
          min_participants: 10,
          entry_fee: tournamentData.entryFee,
          prize_pool: tournamentData.prizePool,
          currency: 'USD',
          status: tournamentData.status,
          starting_balance: 100000.00,
          trading_symbols: tradingSymbols,
          rules: {
            maxPositionSize: 10000,
            allowedSymbols: tradingSymbols,
            tradingHours: { start: '09:00', end: '16:00' }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error(`Failed to create tournament ${tournamentData.name}:`, error);
        continue;
      }

      tournaments.push(tournament);
      logger.info(`✅ Created tournament: ${tournamentData.name}`);

    } catch (error) {
      logger.error(`Failed to create tournament ${tournamentData.name}:`, error);
    }
  }
  
  return tournaments;
}

async function createTournamentParticipants(tournaments: any[], users: any[]): Promise<void> {
  const databaseService = await DatabaseService.initialize();
  const supabase = databaseService.getClient();
  
  for (const tournament of tournaments) {
    const participantCount = Math.min(
      tournament.max_participants,
      tournament.name.includes('Winter') ? 60 : 
      tournament.name.includes('New Year') ? 45 : 35
    );
    
    const selectedUsers = users.slice(0, participantCount);
    
    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      
      try {
        // Check if participant already exists
        const { data: existingParticipant } = await supabase
          .from('tournament_participants')
          .select('id')
          .eq('tournament_id', tournament.id)
          .eq('user_id', user.id)
          .single();

        if (existingParticipant) {
          continue;
        }

        // Generate realistic performance data
        const basePnL = generateRandomPnL(0, 0.15); // ±15% volatility
        const totalTrades = Math.floor(Math.random() * 100) + 10;
        const winningTrades = Math.floor(totalTrades * (0.4 + Math.random() * 0.4)); // 40-80% win rate
        
        const { data: participant, error } = await supabase
          .from('tournament_participants')
          .insert({
            tournament_id: tournament.id,
            user_id: user.id,
            registered_at: new Date().toISOString(),
            registration_source: 'web',
            zimtra_account_id: `zimtra_${user.zimtra_username}`,
            starting_balance: 100000.00,
            current_balance: 100000 + basePnL,
            total_pnl: basePnL,
            realized_pnl: basePnL * 0.7,
            unrealized_pnl: basePnL * 0.3,
            total_trades: totalTrades,
            winning_trades: winningTrades,
            losing_trades: totalTrades - winningTrades,
            total_volume: Math.floor(Math.random() * 1000000) + 100000,
            current_rank: i + 1,
            best_rank: Math.max(1, i + 1 - Math.floor(Math.random() * 5)),
            is_active: true,
            disqualified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          logger.error(`Failed to create participant for ${user.email}:`, error);
          continue;
        }

        // Update tournament participant count
        await supabase
          .from('tournaments')
          .update({ 
            current_participants: i + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', tournament.id);

        logger.info(`✅ Added participant: ${user.email} to ${tournament.name}`);

      } catch (error) {
        logger.error(`Failed to create participant for ${user.email}:`, error);
      }
    }
  }
}

async function createTradingActivity(users: any[]): Promise<void> {
  const databaseService = await DatabaseService.initialize();
  const supabase = databaseService.getClient();
  
  logger.info('Creating trading activity data...');
  
  for (const user of users.slice(0, 30)) { // Create activity for first 30 users
    const activities = generateTradingActivity(user.zimtra_username, 14); // 14 days of activity
    
    for (const activity of activities) {
      try {
        const { error } = await supabase
          .from('trading_activity')
          .insert(activity);

        if (error) {
          logger.error(`Failed to create trading activity for ${user.zimtra_username}:`, error);
        }
      } catch (error) {
        logger.error(`Failed to create trading activity for ${user.zimtra_username}:`, error);
      }
    }
    
    logger.info(`✅ Created trading activity for: ${user.zimtra_username}`);
  }
}

async function seedTournamentData() {
  try {
    logger.info('🚀 Starting tournament data seeding...');

    // Create sample users (60 traders)
    logger.info('Creating sample users...');
    const users = await createSampleUsers(60);
    logger.info(`✅ Created ${users.length} users`);

    // Create tournaments
    logger.info('Creating tournaments...');
    const tournaments = await createTournaments();
    logger.info(`✅ Created ${tournaments.length} tournaments`);

    // Create tournament participants
    logger.info('Creating tournament participants...');
    await createTournamentParticipants(tournaments, users);
    logger.info('✅ Created tournament participants');

    // Create trading activity data
    logger.info('Creating trading activity data...');
    await createTradingActivity(users);
    logger.info('✅ Created trading activity data');

    logger.info('🎉 Tournament data seeding completed successfully!');
    
    logger.info('\n📊 Summary:');
    logger.info('===================');
    logger.info(`👥 Users created: ${users.length}`);
    logger.info(`🏆 Tournaments created: ${tournaments.length}`);
    logger.info('📈 Trading activity data populated');
    logger.info('🎯 Platform ready for demonstration');

  } catch (error) {
    logger.error('❌ Failed to seed tournament data:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await seedTournamentData();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { seedTournamentData };