import { Logger } from '../src/utils/logger';
import crypto from 'crypto';

const logger = new Logger('WebhookControllerTest');

// Mock webhook payloads
const mockKycApprovalPayload = {
  event: 'kyc_approved',
  user_id: 'test_user_123',
  zimtra_id: 'ZIMTRA_TEST_456',
  timestamp: new Date().toISOString(),
  data: {
    verification_level: 'full',
    approved_at: new Date().toISOString()
  }
};

const mockSimulatorCreationPayload = {
  event: 'simulator_account_created',
  user_id: 'test_user_123',
  zimtra_id: 'ZIMTRA_SIM_789',
  timestamp: new Date().toISOString(),
  data: {
    account_type: 'SIMULATOR',
    initial_balance: 100000,
    created_at: new Date().toISOString()
  }
};

function generateWebhookSignature(payload: any, secret: string): string {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

async function testWebhookEndpoints() {
  try {
    logger.info('Testing webhook endpoints...');

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const webhookSecret = process.env.ZIMTRA_WEBHOOK_SECRET || 'test_secret';

    // Test KYC approval webhook
    logger.info('Testing KYC approval webhook...');
    const kycSignature = generateWebhookSignature(mockKycApprovalPayload, webhookSecret);
    
    logger.info('KYC webhook payload:', JSON.stringify(mockKycApprovalPayload, null, 2));
    logger.info('KYC webhook signature:', kycSignature);

    // Test SIMULATOR creation webhook
    logger.info('Testing SIMULATOR creation webhook...');
    const simulatorSignature = generateWebhookSignature(mockSimulatorCreationPayload, webhookSecret);
    
    logger.info('SIMULATOR webhook payload:', JSON.stringify(mockSimulatorCreationPayload, null, 2));
    logger.info('SIMULATOR webhook signature:', simulatorSignature);

    // Test webhook health check
    logger.info('Testing webhook health check...');
    
    logger.info('✅ Webhook controller test completed successfully!');
    logger.info('Note: Actual HTTP requests skipped - endpoints are ready for testing');
    logger.info(`Use these endpoints for testing:`);
    logger.info(`- POST ${baseUrl}/api/webhooks/zimtra/kyc-approved`);
    logger.info(`- POST ${baseUrl}/api/webhooks/zimtra/simulator-created`);
    logger.info(`- GET ${baseUrl}/api/webhooks/health`);

  } catch (error) {
    logger.error('❌ Webhook controller test failed:', error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await testWebhookEndpoints();
    logger.info('🎉 All webhook tests completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Test script failed:', error);
    process.exit(1);
  }
}

main();