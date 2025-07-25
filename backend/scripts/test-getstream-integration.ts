#!/usr/bin/env ts-node

import { config } from 'dotenv';
import { GetStreamService } from '../src/integrations/getstream.service';
import { Logger } from '../src/utils/logger';

// Load environment variables
config();

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
      'Test Tournament Chat',
      [testUser.id]
    );
    logger.info(`Created tournament channel: ${channel.id || 'success'}`);

    // Test 5: Add User to Tournament
    logger.info('Testing adding user to tournament...');
    await getStreamService.addParticipantToTournament(tournamentId, testUser.id);
    logger.info(`Added user ${testUser.id} to tournament ${tournamentId}`);

    // Test 6: Send Tournament Message
    logger.info('Testing tournament message...');
    const message = await getStreamService.sendTournamentMessage(
      tournamentId,
      testUser.id,
      'Welcome to the test tournament! This is a GetStream.io integration test.'
    );
    logger.info(`Sent message: ${message.id || 'success'}`);

    // Test 7: Get Tournament Messages
    logger.info('Testing message retrieval...');
    const messages = await getStreamService.getTournamentMessages(tournamentId);
    logger.info(`Retrieved ${messages.length} messages from tournament`);

    // Test 8: Get Tournament Participants
    logger.info('Testing participant retrieval...');
    const participants = await getStreamService.getTournamentParticipants(tournamentId);
    logger.info(`Retrieved ${participants.length} participants from tournament`);

    // Test 9: Clean up - Remove user from tournament
    logger.info('Cleaning up - removing user from tournament...');
    await getStreamService.removeParticipantFromTournament(tournamentId, testUser.id);
    logger.info(`Removed user ${testUser.id} from tournament ${tournamentId}`);

    // Test 10: Delete test user
    logger.info('Cleaning up - deleting test user...');
    await getStreamService.deleteUser(testUser.id);
    logger.info(`Deleted test user: ${testUser.id}`);

    logger.info('✅ GetStream.io integration test completed successfully!');
    
    return {
      success: true,
      message: 'All GetStream.io tests passed',
      results: {
        healthCheck: health,
        userCreated: createdUser.id || 'success',
        tokenGenerated: true,
        channelCreated: channel.id || 'success',
        messagesRetrieved: messages.length,
        participantsRetrieved: participants.length,
        messageSent: message.id || 'success'
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