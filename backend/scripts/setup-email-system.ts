#!/usr/bin/env ts-node

import { DatabaseService } from '../src/services/database.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('EmailSystemMigration');

async function createEmailTables() {
  try {
    logger.info('Starting email system database migration...');

    // Initialize database service
    const databaseService = await DatabaseService.initialize();
    const supabase = databaseService.getClient();

    // Check if tables already exist by trying to select from them
    logger.info('Checking if email_templates table exists...');
    const { error: templatesCheckError } = await supabase
      .from('email_templates')
      .select('id')
      .limit(1);

    if (templatesCheckError) {
      logger.info('email_templates table does not exist or has access issues:', templatesCheckError.message);
      logger.info('Please create the table manually using the SQL schema file');
    } else {
      logger.info('email_templates table exists and is accessible');
    }

    logger.info('Checking if email_logs table exists...');
    const { error: logsCheckError } = await supabase
      .from('email_logs')
      .select('id')
      .limit(1);

    if (logsCheckError) {
      logger.info('email_logs table does not exist or has access issues:', logsCheckError.message);
      logger.info('Please create the table manually using the SQL schema file');
    } else {
      logger.info('email_logs table exists and is accessible');
    }

    logger.info('Table existence check completed');
    return true;

  } catch (error) {
    logger.error('Email system migration failed:', error);
    throw error;
  }
}

async function seedEmailTemplates() {
  try {
    logger.info('Seeding email templates...');

    // Initialize database service
    const databaseService = await DatabaseService.initialize();
    const supabase = databaseService.getClient();

    const templates = [
      {
        name: 'dayrade_kyc_approved',
        subject: '🎉 KYC Approved - Purchase Your Contest Ticket Now!',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">🎉 Congratulations, {{userName}}!</h1>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Your KYC verification has been <strong>approved</strong>! You're now eligible to participate in our exclusive trading tournaments.</p>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #155724; margin-top: 0;">🎫 Next Step: Purchase Your Contest Ticket</h3>
                <p style="margin-bottom: 15px; color: #155724;">To secure your spot in upcoming tournaments, you need to purchase a contest ticket:</p>
                <ul style="color: #155724; margin-left: 20px;">
                  <li>Contest tickets grant access to live trading tournaments</li>
                  <li>Compete with verified traders for real prizes</li>
                  <li>Track your performance on live leaderboards</li>
                  <li>Build your trading reputation</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{frontendUrl}}/tournaments" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Purchase Contest Ticket</a>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="color: #495057; margin-top: 0;">📋 What's Included:</h4>
                <ul style="color: #6c757d; margin-left: 20px;">
                  <li>Access to live trading tournaments</li>
                  <li>Real-time performance tracking</li>
                  <li>Professional trading tools</li>
                  <li>Community chat and networking</li>
                </ul>
              </div>
              
              <p style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                <strong>The Dayrade Team</strong>
              </p>
            </div>
          </div>
        `,
        text_content: `
          Congratulations {{userName}}!
          
          Your KYC verification has been approved! You're now eligible to participate in our exclusive trading tournaments.
          
          Next Step: Purchase Your Contest Ticket
          
          To secure your spot in upcoming tournaments, you need to purchase a contest ticket:
          - Contest tickets grant access to live trading tournaments
          - Compete with verified traders for real prizes
          - Track your performance on live leaderboards
          - Build your trading reputation
          
          Visit: {{frontendUrl}}/tournaments
          
          What's Included:
          - Access to live trading tournaments
          - Real-time performance tracking
          - Professional trading tools
          - Community chat and networking
          
          Best regards,
          The Dayrade Team
        `
      },
      {
        name: 'dayrade_simulator_ready',
        subject: '🚀 Your SIMULATOR Account is Ready - Start Trading Now!',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #17a2b8; text-align: center; margin-bottom: 30px;">🚀 Your SIMULATOR Account is Ready!</h1>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi {{userName}},</p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Great news! Your Zimtra SIMULATOR trading account has been successfully created and is ready for action.</p>
              
              <div style="background-color: #e1f7fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0277bd; margin-top: 0;">📊 Your Trading Account Details</h3>
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                  <p style="margin: 5px 0; color: #333;"><strong>Trader ID:</strong> <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; color: #e83e8c;">{{zimtraId}}</code></p>
                  <p style="margin: 5px 0; color: #333;"><strong>Account Type:</strong> SIMULATOR</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Active</span></p>
                  <p style="margin: 5px 0; color: #333;"><strong>Starting Balance:</strong> $100,000 (Virtual)</p>
                </div>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">🎯 Ready to Start Trading?</h3>
                <ul style="color: #856404; margin-left: 20px;">
                  <li>Practice with virtual funds in a real market environment</li>
                  <li>Test your trading strategies risk-free</li>
                  <li>Compete in SIMULATOR tournaments</li>
                  <li>Build your trading skills and confidence</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{frontendUrl}}/dashboard" style="background-color: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">Access Dashboard</a>
                <a href="{{frontendUrl}}/tournaments?type=simulator" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join SIMULATOR Tournament</a>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="color: #495057; margin-top: 0;">💡 Pro Tips:</h4>
                <ul style="color: #6c757d; margin-left: 20px;">
                  <li>Start with small position sizes to learn the platform</li>
                  <li>Use the paper trading environment to test strategies</li>
                  <li>Join the community chat to learn from other traders</li>
                  <li>Track your performance metrics to improve</li>
                </ul>
              </div>
              
              <p style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px;">
                Happy Trading!<br>
                <strong>The Dayrade Team</strong>
              </p>
            </div>
          </div>
        `,
        text_content: `
          Your SIMULATOR Account is Ready!
          
          Hi {{userName}},
          
          Great news! Your Zimtra SIMULATOR trading account has been successfully created and is ready for action.
          
          Your Trading Account Details:
          - Trader ID: {{zimtraId}}
          - Account Type: SIMULATOR
          - Status: Active
          - Starting Balance: $100,000 (Virtual)
          
          Ready to Start Trading?
          - Practice with virtual funds in a real market environment
          - Test your trading strategies risk-free
          - Compete in SIMULATOR tournaments
          - Build your trading skills and confidence
          
          Access Dashboard: {{frontendUrl}}/dashboard
          Join SIMULATOR Tournament: {{frontendUrl}}/tournaments?type=simulator
          
          Pro Tips:
          - Start with small position sizes to learn the platform
          - Use the paper trading environment to test strategies
          - Join the community chat to learn from other traders
          - Track your performance metrics to improve
          
          Happy Trading!
          The Dayrade Team
        `
      }
    ];

    for (const template of templates) {
      const { error } = await supabase
        .from('email_templates')
        .upsert(template, { onConflict: 'name' });

      if (error) {
        logger.error(`Failed to seed template ${template.name}:`, error);
        throw error;
      }

      logger.info(`Template ${template.name} seeded successfully`);
    }

    logger.info('Email templates seeded successfully');
    return true;

  } catch (error) {
    logger.error('Email template seeding failed:', error);
    throw error;
  }
}

async function runEmailSystemMigration() {
  try {
    logger.info('Starting complete email system migration...');

    // Create tables
    await createEmailTables();

    // Seed templates
    await seedEmailTemplates();

    logger.info('✅ Email system migration completed successfully!');
    logger.info('Available email templates:');
    logger.info('  - dayrade_kyc_approved');
    logger.info('  - dayrade_simulator_ready');
    logger.info('Available webhook endpoints:');
    logger.info('  - POST /api/webhooks/zimtra/kyc-approved');
    logger.info('  - POST /api/webhooks/zimtra/simulator-created');

  } catch (error) {
    logger.error('❌ Email system migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runEmailSystemMigration()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { createEmailTables, seedEmailTemplates, runEmailSystemMigration };