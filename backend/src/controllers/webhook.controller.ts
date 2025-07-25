import { Request, Response } from 'express';
import { ZimtraService } from '../integrations/zimtra.service';
import { brevoService } from '../integrations/brevo.service';
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('WebhookController');

export class WebhookController {
  private static zimtraService = new ZimtraService();

  /**
   * Handle Zimtra KYC approval webhook
   * POST /api/webhooks/zimtra/kyc-approved
   */
  static async handleZimtraKYCApproval(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Validate webhook signature
      if (!WebhookController.zimtraService.validateWebhook(payload, signature)) {
        logger.warn('Invalid webhook signature for KYC approval');
        res.status(401).json({ 
          success: false, 
          error: 'Invalid webhook signature' 
        });
        return;
      }

      const { userId, email, firstName, lastName, zimtraId, kycStatus } = req.body;

      logger.info(`Processing KYC approval webhook for user ${userId}`, {
        zimtraId,
        kycStatus,
        email
      });

      // Validate required fields
      if (!userId || !email || !firstName || kycStatus !== 'approved') {
        logger.error('Missing required fields in KYC approval webhook', req.body);
        res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
        return;
      }

      // Update user KYC status in database
      const databaseService = DatabaseService.getInstance();
      const supabase = databaseService.getClient();
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          kyc_status: 'approved',
          zimtra_id: zimtraId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('Failed to update user KYC status:', updateError);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to update user status' 
        });
        return;
      }

      // Send KYC approval email
      try {
        const userName = `${firstName} ${lastName}`.trim();
        const emailResult = await brevoService.sendKycApprovalEmail(email, userName);
        
        logger.info(`KYC approval email sent successfully`, {
          userId,
          email,
          messageId: emailResult.messageId
        });

        // Log email delivery to database
        await supabase
          .from('email_logs')
          .insert({
            user_id: userId,
            email_address: email,
            template_name: 'dayrade_kyc_approved',
            subject: '🎉 KYC Approved - Purchase Your Contest Ticket Now!',
            status: 'sent',
            message_id: emailResult.messageId,
            sent_at: new Date().toISOString()
          });

      } catch (emailError) {
        logger.error('Failed to send KYC approval email:', emailError);
        // Don't fail the webhook if email fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'KYC approval processed successfully' 
      });

    } catch (error) {
      logger.error('Error processing KYC approval webhook:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  /**
   * Handle Zimtra SIMULATOR account creation webhook
   * POST /api/webhooks/zimtra/simulator-created
   */
  static async handleZimtraSimulatorCreation(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Validate webhook signature
      if (!WebhookController.zimtraService.validateWebhook(payload, signature)) {
        logger.warn('Invalid webhook signature for SIMULATOR creation');
        res.status(401).json({ 
          success: false, 
          error: 'Invalid webhook signature' 
        });
        return;
      }

      const { 
        userId, 
        email, 
        firstName, 
        lastName, 
        zimtraId, 
        accountType, 
        accountStatus,
        accountDetails 
      } = req.body;

      logger.info(`Processing SIMULATOR creation webhook for user ${userId}`, {
        zimtraId,
        accountType,
        accountStatus,
        email
      });

      // Validate required fields
      if (!userId || !email || !firstName || !zimtraId || accountType !== 'simulator') {
        logger.error('Missing required fields in SIMULATOR creation webhook', req.body);
        res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
        return;
      }

      // Update user with Zimtra ID in database
      const databaseService = DatabaseService.getInstance();
      const supabase = databaseService.getClient();
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          zimtra_id: zimtraId,
          simulator_account_status: accountStatus || 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('Failed to update user with Zimtra ID:', updateError);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to update user' 
        });
        return;
      }

      // Send SIMULATOR ready email
      try {
        const userName = `${firstName} ${lastName}`.trim();
        const emailResult = await brevoService.sendSimulatorReadyEmail(
          email, 
          userName, 
          zimtraId, 
          accountDetails
        );
        
        logger.info(`SIMULATOR ready email sent successfully`, {
          userId,
          email,
          zimtraId,
          messageId: emailResult.messageId
        });

        // Log email delivery to database
        await supabase
          .from('email_logs')
          .insert({
            user_id: userId,
            email_address: email,
            template_name: 'dayrade_simulator_ready',
            subject: '🚀 Your SIMULATOR Account is Ready - Start Trading Now!',
            status: 'sent',
            message_id: emailResult.messageId,
            sent_at: new Date().toISOString()
          });

      } catch (emailError) {
        logger.error('Failed to send SIMULATOR ready email:', emailError);
        // Don't fail the webhook if email fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'SIMULATOR account creation processed successfully',
        data: {
          zimtraId,
          accountStatus: accountStatus || 'active'
        }
      });

    } catch (error) {
      logger.error('Error processing SIMULATOR creation webhook:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  /**
   * Health check for webhook endpoints
   * GET /api/webhooks/health
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Webhook endpoints are healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
          '/api/webhooks/zimtra/kyc-approved',
          '/api/webhooks/zimtra/simulator-created'
        ]
      });
    } catch (error) {
      logger.error('Webhook health check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed'
      });
    }
  }
}