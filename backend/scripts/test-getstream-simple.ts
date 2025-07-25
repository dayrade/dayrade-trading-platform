#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import { GetStreamService } from '../src/integrations/getstream.service';
import { Logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('GetStreamTest');

async function testGetStreamIntegration() {
  try {
    logger.info('Starting GetStream.io integration test...');

    // Initialize GetStream service
    const getStreamService = new GetStreamService();

    // Test 1: Health Check
    logger.info('Testing GetStream health check...');
    const health = await getStreamService.healthCheck();
    logger.info(`Health check result: ${health.status} (${health.responseTime}ms)`);

    // Test 2: Create Test User
    logger.info('Testing user creation...');
    const testUser = {
      id: 'test-user-' + Date.now(),
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      role: 'user'
    };

    const createdUser = await getStreamService.createUser(testUser);
    logger.info(`Created user: ${createdUser.id}`);

    // Test 3: Generate User Token
    logger.info('Testing token generation...');
    const token = getStreamService.generateUserToken(testUser.id);
    logger.info(`Generated token: ${token.substring(0, 20)}...`);

    // Test 4: Create Tournament Channel
    logger.info('Testing tournament channel creation...');
    const tournamentId = 'test-tournament-' + Date.now();
    const channel = await getStreamService.createTournamentChannel(
      tournamentId,
      'Test Tournament Chat'
    );
    logger.info(`Created tournament channel: ${channel.id}`);

    // Test 5: Add User to Tournament
    logger.info('Testing adding user to tournament...');
    await getStreamService.addParticipantToTournament(tournamentId, testUser.id);
    logger.info(`Added user ${testUser.id} to tournament ${tournamentId}`);

    // Test 6: Send Tournament Announcement
    logger.info('Testing tournament announcement...');
    const announcement = await getStreamService.sendTournamentAnnouncement(
      tournamentId,
      'Welcome to the test tournament! This is a GetStream.io integration test.'
    );
    logger.info(`Sent announcement: ${announcement.id}`);

    // Test 7: Get Channel Messages
    logger.info('Testing message retrieval...');
    const messages = await getStreamService.getChannelMessages('tournament', tournamentId, {
      limit: 10
    });
    logger.info(`Retrieved ${messages.length} messages from channel`);

    // Test 8: Clean up - Remove user from tournament
    logger.info('Cleaning up - removing user from tournament...');
    await getStreamService.removeParticipantFromTournament(tournamentId, testUser.id);
    logger.info(`Removed user ${testUser.id} from tournament ${tournamentId}`);

    // Test 9: Delete test user
    logger.info('Cleaning up - deleting test user...');
    await getStreamService.deleteUser(testUser.id);
    logger.info(`Deleted test user: ${testUser.id}`);

    logger.info('✅ GetStream.io integration test completed successfully!');
    
    return {
      success: true,
      message: 'All GetStream.io tests passed',
      results: {
        healthCheck: health,
        userCreated: createdUser.id,
        tokenGenerated: true,
        channelCreated: channel.id,
        messagesRetrieved: messages.length,
        announcementSent: announcement.id
      }
    };

  } catch (error) {
    logger.error('GetStream.io integration test failed:', error);
    
    return {
      success: false,
      message: 'GetStream.io integration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGetStreamIntegration()
    .then((result) => {
      if (result.success) {
        logger.info('🎉 GetStream.io integration is working correctly!');
        logger.info('Test Results:', result.results);
        process.exit(0);
      } else {
        logger.error('❌ GetStream.io integration test failed');
        logger.error('Error:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error('Unexpected error during test:', error);
      process.exit(1);
    });
}

export { testGetStreamIntegration };