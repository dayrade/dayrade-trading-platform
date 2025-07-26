import { Router, Request, Response } from 'express';
import { BrevoService } from '../integrations/brevo.service';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('EmailRoutes');
const brevoService = new BrevoService();

// Email template IDs for different authentication events
const EMAIL_TEMPLATES = {
  WELCOME: 1, // Welcome email template ID
  EMAIL_VERIFICATION: 2, // Email verification template ID  
  PASSWORD_RESET: 3, // Password reset template ID
  LOGIN_NOTIFICATION: 4 // Login notification template ID
};

/**
 * Send transactional email via Brevo
 * POST /api/email/send
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { templateId, recipientEmail, templateData = {} } = req.body;

    if (!templateId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and recipient email are required'
      });
    }

    let result;

    switch (templateId) {
      case EMAIL_TEMPLATES.WELCOME:
        result = await brevoService.sendWelcomeEmail(
          recipientEmail,
          templateData.firstName || 'User'
        );
        break;

      case EMAIL_TEMPLATES.EMAIL_VERIFICATION:
        result = await brevoService.sendTransactionalEmail({
          to: [{ email: recipientEmail, name: templateData.firstName }],
          subject: 'Verify Your Email Address',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
              <p>Hi ${templateData.firstName || 'there'},</p>
              <p>Thank you for signing up for Dayrade! Please verify your email address by clicking the link below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${templateData.verificationLink}" 
                   style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>If you didn't create an account with us, please ignore this email.</p>
              <p>Best regards,<br>The Dayrade Team</p>
            </div>
          `,
          tags: ['email-verification', 'authentication']
        });
        break;

      case EMAIL_TEMPLATES.PASSWORD_RESET:
        result = await brevoService.sendTransactionalEmail({
          to: [{ email: recipientEmail }],
          subject: 'Reset Your Dayrade Password',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Password Reset</h1>
              <p>You requested to reset your password for your Dayrade account.</p>
              <p>Click the link below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${templateData.resetLink}" 
                   style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Best regards,<br>The Dayrade Team</p>
            </div>
          `,
          tags: ['password-reset', 'authentication']
        });
        break;

      case EMAIL_TEMPLATES.LOGIN_NOTIFICATION:
        result = await brevoService.sendTransactionalEmail({
          to: [{ email: recipientEmail, name: templateData.firstName }],
          subject: 'New Login to Your Dayrade Account',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Login Notification</h1>
              <p>Hi ${templateData.firstName || 'there'},</p>
              <p>We detected a new login to your Dayrade account:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Time:</strong> ${templateData.loginTime || new Date().toISOString()}</p>
                <p><strong>IP Address:</strong> ${templateData.ipAddress || 'Unknown'}</p>
                <p><strong>User Agent:</strong> ${templateData.userAgent || 'Unknown'}</p>
              </div>
              <p>If this was you, no action is needed. If you don't recognize this login, please secure your account immediately.</p>
              <p>Best regards,<br>The Dayrade Team</p>
            </div>
          `,
          tags: ['login-notification', 'security']
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid template ID'
        });
    }

    logger.info(`Email sent successfully to ${recipientEmail} with template ${templateId}`);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    logger.error('Failed to send email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
});

/**
 * Get available email templates
 * GET /api/email/templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await brevoService.getEmailTemplates();
    
    res.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        isActive: template.isActive
      }))
    });

  } catch (error) {
    logger.error('Failed to get email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates'
    });
  }
});

export default router;