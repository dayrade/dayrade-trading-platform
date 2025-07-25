#!/usr/bin/env ts-node

import { BrevoService } from '../src/integrations/brevo.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('BrevoServiceTest');

async function testBrevoService() {
  try {
    logger.info('Testing Brevo service...');

    const brevoService = new BrevoService();

    // Test health check
    logger.info('Testing health check...');
    try {
      const healthStatus = await brevoService.healthCheck();
      logger.info('Health check result:', JSON.stringify(healthStatus, null, 2));
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }

    // Test getting email templates
    logger.info('Testing email templates retrieval...');
    try {
      // Let's test the raw API call first
      const brevoService = new BrevoService();
      const client = (brevoService as any).client; // Access the axios client directly
      
      logger.info('Making direct API call to /smtp/templates...');
      const response = await client.get('/smtp/templates');
      logger.info('Raw API response:', JSON.stringify(response.data, null, 2));
      
      // Now test the service method
      const templates = await brevoService.getEmailTemplates();
      logger.info(`Found ${templates.length} email templates`);

      // Log available templates
      templates.forEach(template => {
        logger.info(`Template: ${template.name} - ${template.subject}`);
      });
    } catch (error) {
      logger.error('Email templates retrieval failed:', error);
      throw error;
    }

    logger.info('✅ Brevo service basic functionality test completed successfully!');
    logger.info('Note: Email sending tests skipped to avoid sending actual emails');

  } catch (error) {
    logger.error('❌ Brevo service test failed:', error);
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

// Run test if called directly
if (require.main === module) {
  testBrevoService()
    .then(() => {
      logger.info('Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Test script failed:', error);
      process.exit(1);
    });
}

export { testBrevoService };