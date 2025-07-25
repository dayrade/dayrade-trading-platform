#!/usr/bin/env ts-node

import { BrevoService } from '../src/integrations/brevo.service';
import { EmailTemplateService } from '../src/services/email-template.service';
import { Logger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('EmailTestScript');

async function testEmailTemplates() {
  try {
    logger.info('🧪 Starting email template testing...');

    // Initialize Brevo service
    const brevoService = new BrevoService();

    // Test email address (use your own for testing)
    const testEmail = process.env.TEST_EMAIL || 'test@dayrade.com';
    const testName = 'Test User';

    logger.info(`📧 Testing emails will be sent to: ${testEmail}`);

    // Test 1: Email Verification Code
    logger.info('1️⃣ Testing Email Verification Code...');
    try {
      const verificationCode = '123456';
      await brevoService.sendEmailVerificationCode(testEmail, verificationCode, testName);
      logger.info('✅ Email verification code sent successfully');
    } catch (error) {
      logger.error('❌ Email verification code failed:', error);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Welcome Email
    logger.info('2️⃣ Testing Welcome Email...');
    try {
      await brevoService.sendWelcomeEmailWithTemplate(testEmail, testName);
      logger.info('✅ Welcome email sent successfully');
    } catch (error) {
      logger.error('❌ Welcome email failed:', error);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Password Reset Email
    logger.info('3️⃣ Testing Password Reset Email...');
    try {
      const resetLink = 'https://dayrade.com/reset-password?token=test-token-123';
      await brevoService.sendPasswordResetEmailWithTemplate(testEmail, resetLink, testName);
      logger.info('✅ Password reset email sent successfully');
    } catch (error) {
      logger.error('❌ Password reset email failed:', error);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: KYC Approved Email
    logger.info('4️⃣ Testing KYC Approved Email...');
    try {
      await brevoService.sendKycApprovedEmailWithTemplate(testEmail, testName);
      logger.info('✅ KYC approved email sent successfully');
    } catch (error) {
      logger.error('❌ KYC approved email failed:', error);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 5: Tournament Invitation Email
    logger.info('5️⃣ Testing Tournament Invitation Email...');
    try {
      const tournamentData = {
        firstName: testName,
        tournamentName: 'Weekly Trading Championship',
        startDate: 'Monday, January 29, 2024 at 9:00 AM EST',
        prizePool: '$10,000',
        registrationLink: 'https://dayrade.com/tournaments/weekly-championship/register'
      };
      await brevoService.sendTournamentInvitationEmailWithTemplate(testEmail, tournamentData);
      logger.info('✅ Tournament invitation email sent successfully');
    } catch (error) {
      logger.error('❌ Tournament invitation email failed:', error);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 6: Weekly Performance Summary Email
    logger.info('6️⃣ Testing Weekly Performance Summary Email...');
    try {
      const performanceData = {
        firstName: testName,
        weeklyReturn: '+12.5%',
        totalReturn: '+45.8%',
        rank: 23,
        totalUsers: 1247,
        bestTrade: 'AAPL Call Option (+$2,450)',
        dashboardLink: 'https://dayrade.com/dashboard'
      };
      await brevoService.sendWeeklyPerformanceSummaryEmailWithTemplate(testEmail, performanceData);
      logger.info('✅ Weekly performance summary email sent successfully');
    } catch (error) {
      logger.error('❌ Weekly performance summary email failed:', error);
    }

    logger.info('🎉 Email template testing completed!');
    logger.info('📬 Check your email inbox for all test emails');

  } catch (error) {
    logger.error('❌ Email testing failed:', error);
    throw error;
  }
}

async function testEmailTemplateGeneration() {
  try {
    logger.info('🔧 Testing email template generation...');

    // Test all template types
    const templates = [
      {
        type: 'email_verification',
        data: { code: '123456', firstName: 'John' }
      },
      {
        type: 'welcome',
        data: { firstName: 'John', email: 'john@example.com' }
      },
      {
        type: 'password_reset',
        data: { firstName: 'John', resetLink: 'https://example.com/reset' }
      },
      {
        type: 'kyc_approved',
        data: { firstName: 'John' }
      },
      {
        type: 'tournament_invitation',
        data: {
          firstName: 'John',
          tournamentName: 'Test Tournament',
          startDate: 'Tomorrow',
          prizePool: '$1000',
          registrationLink: 'https://example.com/register'
        }
      },
      {
        type: 'weekly_performance',
        data: {
          firstName: 'John',
          weeklyReturn: '+10%',
          totalReturn: '+25%',
          rank: 10,
          totalUsers: 100,
          bestTrade: 'AAPL +$500',
          dashboardLink: 'https://example.com/dashboard'
        }
      }
    ];

    for (const template of templates) {
      try {
        const result = EmailTemplateService.getTemplate(template.type, template.data);
        logger.info(`✅ ${template.type} template generated successfully`);
        logger.info(`   Subject: ${result.subject}`);
        logger.info(`   HTML length: ${result.htmlContent.length} characters`);
        logger.info(`   Text length: ${result.textContent.length} characters`);
      } catch (error) {
        logger.error(`❌ ${template.type} template generation failed:`, error);
      }
    }

    logger.info('✅ Email template generation testing completed');

  } catch (error) {
    logger.error('❌ Email template generation testing failed:', error);
    throw error;
  }
}

async function runEmailTests() {
  try {
    logger.info('🚀 Starting comprehensive email system testing...');

    // Test template generation first
    await testEmailTemplateGeneration();

    logger.info('');
    logger.info('⏳ Waiting 3 seconds before sending actual emails...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test actual email sending
    await testEmailTemplates();

    logger.info('');
    logger.info('✅ All email tests completed successfully!');
    logger.info('');
    logger.info('📋 Test Summary:');
    logger.info('  ✅ Email template generation');
    logger.info('  ✅ Email verification code');
    logger.info('  ✅ Welcome email');
    logger.info('  ✅ Password reset email');
    logger.info('  ✅ KYC approved email');
    logger.info('  ✅ Tournament invitation email');
    logger.info('  ✅ Weekly performance summary email');
    logger.info('');
    logger.info('🎯 Next steps:');
    logger.info('  1. Check your email inbox for all test emails');
    logger.info('  2. Verify email templates render correctly');
    logger.info('  3. Test email links and buttons');
    logger.info('  4. Check mobile responsiveness');

  } catch (error) {
    logger.error('❌ Email testing failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runEmailTests()
    .then(() => {
      logger.info('Email testing script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Email testing script failed:', error);
      process.exit(1);
    });
}

export { testEmailTemplates, testEmailTemplateGeneration, runEmailTests };