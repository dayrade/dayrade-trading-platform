# Task 06: Brevo Transactional Email System Implementation

**Task ID:** DAYRADE-006  
**Priority:** Critical  
**Dependencies:** Task 04 (Zimtra Integration), Task 05 (TicketSource Integration)  
**Estimated Duration:** 3-4 hours  
**Tray.ai Tools Required:** File System, Terminal, Web Search  

## 🎯 Task Objective

Implement the complete Brevo transactional email system for the Dayrade Trading Tournament Platform. This task establishes email template management, automated email triggers from the Zimtra workflow, user notification systems, and comprehensive email delivery tracking with proper Dayrade branding.

## 📋 Requirement Cross-Reference Validation

This task implements the following email system requirements:

- **Brevo Template Integration**: Use Brevo's in-platform templates with professional formatting
- **Dayrade Branding**: Embed Dayrade SVG logo and maintain consistent brand identity
- **Workflow Email Triggers**: Automated emails for KYC approval and SIMULATOR account creation
- **Template Management**: Dynamic data injection and fallback plain-text support
- **Delivery Tracking**: Comprehensive email delivery status monitoring
- **User Notifications**: Tournament updates, trading alerts, and system communications

## 📧 Brevo Email Template Specifications

### **Required Email Templates**

Based on the Dayrade ⇄ Zimtra integration workflow, two critical email templates must be implemented:

#### **Template 1: KYC Approval Notification**
- **Template Name**: `dayrade_kyc_approved`
- **Trigger Source**: Zimtra KYC approval webhook
- **Subject**: "You're Approved! Here's How to Join the Contest."
- **Purpose**: Inform users of KYC approval and guide them to purchase contest tickets

#### **Template 2: SIMULATOR Account Ready**
- **Template Name**: `dayrade_simulator_ready`
- **Trigger Source**: Zimtra SIMULATOR account creation webhook
- **Subject**: "Your SIMULATOR Account Is Ready!"
- **Purpose**: Provide trader ID and login instructions for SIMULATOR account

### **Email Template Requirements**

All transactional emails must adhere to these specifications:

- **Platform**: Brevo's in-platform template system
- **Formatting**: Minimal but professional design
- **Logo**: Dayrade SVG embedded (will be uploaded to Tray.ai)
- **Sender Identity**: Clearly identify Dayrade as the sender
- **CTA Buttons**: Clear call-to-action buttons for user engagement
- **Fallback**: Plain-text instructions for accessibility
- **Testing**: Sample payload validation for dynamic data injection

## 🔧 Brevo Service Implementation

### **Core Brevo Service Class**

```typescript
// src/services/brevo.service.ts
import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';
import { DatabaseService } from './database.service';

export interface BrevoEmailRequest {
  templateId: string | number;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  variables?: Record<string, any>;
  subject?: string;
  replyTo?: string;
  tags?: string[];
  headers?: Record<string, string>;
}

export interface BrevoEmailResponse {
  messageId: string;
  success: boolean;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  brevoTemplateId: number;
  subject: string;
  variables: string[];
  isActive: boolean;
}

export class BrevoService {
  private static instance: BrevoService;
  private apiClient: AxiosInstance;
  private logger: Logger;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.logger = new Logger('BrevoService');
    this.apiClient = axios.create({
      baseURL: 'https://api.brevo.com/v3',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      }
    });

    this.setupInterceptors();
    this.loadEmailTemplates();
  }

  static getInstance(): BrevoService {
    if (!BrevoService.instance) {
      BrevoService.instance = new BrevoService();
    }
    return BrevoService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Brevo API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Brevo API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Brevo API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Brevo API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Load email templates from database
   */
  private async loadEmailTemplates(): Promise<void> {
    try {
      const result = await DatabaseService.query(
        'SELECT * FROM email_templates WHERE is_active = true'
      );

      for (const template of result.rows) {
        this.templates.set(template.name, {
          id: template.id,
          name: template.name,
          brevoTemplateId: template.brevo_template_id,
          subject: template.subject,
          variables: template.variables || [],
          isActive: template.is_active
        });
      }

      this.logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.error('Failed to load email templates:', error);
    }
  }

  /**
   * Send transactional email using Brevo template
   */
  async sendTransactionalEmail(request: BrevoEmailRequest): Promise<BrevoEmailResponse> {
    try {
      // Get template configuration
      const template = this.templates.get(request.templateId as string);
      if (!template) {
        throw new Error(`Email template not found: ${request.templateId}`);
      }

      // Prepare email payload
      const emailPayload = {
        templateId: template.brevoTemplateId,
        to: Array.isArray(request.to) 
          ? request.to.map(email => ({ email }))
          : [{ email: request.to }],
        params: request.variables || {},
        headers: {
          'X-Mailin-custom': JSON.stringify({
            platform: 'Dayrade',
            template: template.name,
            timestamp: new Date().toISOString()
          }),
          ...request.headers
        },
        tags: ['dayrade', 'transactional', ...(request.tags || [])],
        replyTo: {
          email: request.replyTo || process.env.BREVO_SENDER_EMAIL || 'noreply@dayrade.com',
          name: 'Dayrade Support'
        }
      };

      // Add CC and BCC if provided
      if (request.cc && request.cc.length > 0) {
        emailPayload['cc'] = request.cc.map(email => ({ email }));
      }
      if (request.bcc && request.bcc.length > 0) {
        emailPayload['bcc'] = request.bcc.map(email => ({ email }));
      }

      // Send email via Brevo API
      const response = await this.apiClient.post('/smtp/email', emailPayload);

      const result: BrevoEmailResponse = {
        messageId: response.data.messageId,
        success: true
      };

      // Log successful email
      await this.logEmailDelivery({
        templateName: template.name,
        recipient: request.to as string,
        messageId: result.messageId,
        status: 'sent',
        variables: request.variables
      });

      this.logger.info(`Email sent successfully: ${template.name} to ${request.to}`);
      return result;

    } catch (error) {
      const errorMessage = this.handleBrevoError(error);
      
      // Log failed email
      await this.logEmailDelivery({
        templateName: request.templateId as string,
        recipient: request.to as string,
        messageId: null,
        status: 'failed',
        error: errorMessage,
        variables: request.variables
      });

      this.logger.error(`Email sending failed: ${request.templateId} to ${request.to}`, error);
      
      return {
        messageId: '',
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send KYC approval email
   */
  async sendKYCApprovalEmail(email: string, firstName: string, lastName: string, kycApprovedDate: string): Promise<BrevoEmailResponse> {
    return this.sendTransactionalEmail({
      templateId: 'dayrade_kyc_approved',
      to: email,
      variables: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        kyc_approved_date: kycApprovedDate,
        contest_url: `${process.env.FRONTEND_URL}/tournaments`,
        support_email: process.env.BREVO_SENDER_EMAIL || 'support@dayrade.com'
      },
      tags: ['kyc', 'approval', 'zimtra-workflow']
    });
  }

  /**
   * Send SIMULATOR account ready email
   */
  async sendSimulatorReadyEmail(email: string, firstName: string, lastName: string, traderId: string): Promise<BrevoEmailResponse> {
    return this.sendTransactionalEmail({
      templateId: 'dayrade_simulator_ready',
      to: email,
      variables: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        trader_id: traderId,
        login_url: `${process.env.ZIMTRA_LOGIN_URL || 'https://app.zimtra.com/login'}`,
        dashboard_url: `${process.env.FRONTEND_URL}/dashboard`,
        support_email: process.env.BREVO_SENDER_EMAIL || 'support@dayrade.com'
      },
      tags: ['simulator', 'account-ready', 'zimtra-workflow']
    });
  }

  /**
   * Send tournament registration confirmation
   */
  async sendTournamentRegistrationEmail(email: string, firstName: string, tournamentName: string, startDate: string): Promise<BrevoEmailResponse> {
    return this.sendTransactionalEmail({
      templateId: 'tournament_registration_confirmation',
      to: email,
      variables: {
        first_name: firstName,
        tournament_name: tournamentName,
        start_date: startDate,
        tournament_url: `${process.env.FRONTEND_URL}/tournaments`,
        rules_url: `${process.env.FRONTEND_URL}/rules`
      },
      tags: ['tournament', 'registration', 'confirmation']
    });
  }

  /**
   * Send tournament reminder email
   */
  async sendTournamentReminderEmail(email: string, firstName: string, tournamentName: string, timeUntilStart: string): Promise<BrevoEmailResponse> {
    return this.sendTransactionalEmail({
      templateId: 'tournament_reminder',
      to: email,
      variables: {
        first_name: firstName,
        tournament_name: tournamentName,
        time_until_start: timeUntilStart,
        join_url: `${process.env.FRONTEND_URL}/tournaments/join`
      },
      tags: ['tournament', 'reminder']
    });
  }

  /**
   * Send tournament results email
   */
  async sendTournamentResultsEmail(email: string, firstName: string, tournamentName: string, finalRank: number, finalPnL: number): Promise<BrevoEmailResponse> {
    return this.sendTransactionalEmail({
      templateId: 'tournament_results',
      to: email,
      variables: {
        first_name: firstName,
        tournament_name: tournamentName,
        final_rank: finalRank,
        final_pnl: finalPnL,
        results_url: `${process.env.FRONTEND_URL}/tournaments/results`
      },
      tags: ['tournament', 'results', 'completion']
    });
  }

  /**
   * Log email delivery for tracking and analytics
   */
  private async logEmailDelivery(logData: {
    templateName: string;
    recipient: string;
    messageId: string | null;
    status: 'sent' | 'failed' | 'delivered' | 'bounced';
    error?: string;
    variables?: Record<string, any>;
  }): Promise<void> {
    try {
      await DatabaseService.query(
        `INSERT INTO email_logs (
          template_name, recipient_email, message_id, status, error_message, 
          template_variables, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          logData.templateName,
          logData.recipient,
          logData.messageId,
          logData.status,
          logData.error || null,
          JSON.stringify(logData.variables || {})
        ]
      );
    } catch (error) {
      this.logger.error('Failed to log email delivery:', error);
    }
  }

  /**
   * Handle Brevo API errors
   */
  private handleBrevoError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return `Invalid email request: ${data?.message || 'Bad request'}`;
        case 401:
          return 'Brevo API authentication failed - check API key';
        case 402:
          return 'Brevo account payment required - check billing status';
        case 403:
          return 'Brevo API access forbidden - insufficient permissions';
        case 404:
          return `Brevo template not found: ${data?.message || 'Unknown template'}`;
        case 429:
          return 'Brevo API rate limit exceeded - too many emails sent';
        case 500:
          return 'Brevo API server error - service temporarily unavailable';
        default:
          return `Brevo API error ${status}: ${data?.message || 'Unknown error'}`;
      }
    } else if (error.request) {
      return 'Brevo API network error - unable to connect to service';
    } else {
      return `Email service error: ${error.message}`;
    }
  }

  /**
   * Get email delivery statistics
   */
  async getEmailStats(templateName?: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      let query = `
        SELECT 
          template_name,
          status,
          COUNT(*) as count,
          DATE(created_at) as date
        FROM email_logs
        WHERE 1=1
      `;
      const params: any[] = [];

      if (templateName) {
        query += ` AND template_name = $${params.length + 1}`;
        params.push(templateName);
      }

      if (dateFrom) {
        query += ` AND created_at >= $${params.length + 1}`;
        params.push(dateFrom);
      }

      if (dateTo) {
        query += ` AND created_at <= $${params.length + 1}`;
        params.push(dateTo);
      }

      query += ` GROUP BY template_name, status, DATE(created_at) ORDER BY date DESC`;

      const result = await DatabaseService.query(query, params);
      return result.rows;

    } catch (error) {
      this.logger.error('Failed to get email statistics:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      // Test API connection
      const response = await this.apiClient.get('/account');
      
      if (response.status === 200) {
        this.logger.info('Brevo API connection test successful');
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error('Brevo API connection test failed:', error);
      return false;
    }
  }

  /**
   * Health check for Brevo service
   */
  async healthCheck(): Promise<boolean> {
    return this.testEmailConfiguration();
  }
}
```

## 📊 Email Template Management

### **Database Schema for Email Templates**

The email templates are managed through the database to allow for dynamic configuration and updates without code changes.

```sql
-- Email templates table (already defined in Task 02)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  brevo_template_id INTEGER,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email delivery logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  message_id VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced', 'spam', 'blocked')),
  error_message TEXT,
  template_variables JSONB,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_logs_template_name ON email_logs(template_name);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
```

### **Email Template Seeder**

```typescript
// src/scripts/seed-email-templates.ts
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

export class EmailTemplateSeeder {
  private static logger = new Logger('EmailTemplateSeeder');

  static async seedTemplates(): Promise<void> {
    try {
      await DatabaseService.initialize();

      const templates = [
        {
          name: 'dayrade_kyc_approved',
          subject: "You're Approved! Here's How to Join the Contest.",
          content: 'KYC approval notification with contest joining instructions',
          template_type: 'kyc_workflow',
          brevo_template_id: 1, // This would be the actual Brevo template ID
          variables: ['first_name', 'last_name', 'kyc_approved_date', 'contest_url', 'support_email']
        },
        {
          name: 'dayrade_simulator_ready',
          subject: 'Your SIMULATOR Account Is Ready!',
          content: 'SIMULATOR account creation notification with login instructions',
          template_type: 'account_creation',
          brevo_template_id: 2, // This would be the actual Brevo template ID
          variables: ['first_name', 'last_name', 'trader_id', 'login_url', 'dashboard_url', 'support_email']
        },
        {
          name: 'tournament_registration_confirmation',
          subject: 'Tournament Registration Confirmed - {{tournament_name}}',
          content: 'Tournament registration confirmation with details',
          template_type: 'tournament',
          brevo_template_id: 3,
          variables: ['first_name', 'tournament_name', 'start_date', 'tournament_url', 'rules_url']
        },
        {
          name: 'tournament_reminder',
          subject: 'Tournament Starting Soon - {{tournament_name}}',
          content: 'Tournament reminder notification',
          template_type: 'tournament',
          brevo_template_id: 4,
          variables: ['first_name', 'tournament_name', 'time_until_start', 'join_url']
        },
        {
          name: 'tournament_results',
          subject: 'Tournament Results - {{tournament_name}}',
          content: 'Tournament completion results notification',
          template_type: 'tournament',
          brevo_template_id: 5,
          variables: ['first_name', 'tournament_name', 'final_rank', 'final_pnl', 'results_url']
        }
      ];

      for (const template of templates) {
        await DatabaseService.query(
          `INSERT INTO email_templates (
            name, subject, content, template_type, brevo_template_id, variables
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (name) DO UPDATE SET
            subject = EXCLUDED.subject,
            content = EXCLUDED.content,
            template_type = EXCLUDED.template_type,
            brevo_template_id = EXCLUDED.brevo_template_id,
            variables = EXCLUDED.variables,
            updated_at = NOW()`,
          [
            template.name,
            template.subject,
            template.content,
            template.template_type,
            template.brevo_template_id,
            JSON.stringify(template.variables)
          ]
        );
      }

      this.logger.info(`Seeded ${templates.length} email templates`);

    } catch (error) {
      this.logger.error('Failed to seed email templates:', error);
      throw error;
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  EmailTemplateSeeder.seedTemplates()
    .then(() => {
      console.log('Email templates seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed email templates:', error);
      process.exit(1);
    });
}
```

## 🔗 Integration with Zimtra Workflow

### **Updated Webhook Controllers**

The webhook controllers from Task 04 need to be updated to use the Brevo service:

```typescript
// src/controllers/webhook.controller.ts (Updated)
import { BrevoService } from '../services/brevo.service';

export class WebhookController {
  private static brevoService = BrevoService.getInstance();

  /**
   * Handle KYC approval webhook from Zimtra
   * Updated to use Brevo service
   */
  static async handleZimtraKYCApproval(req: Request, res: Response): Promise<void> {
    try {
      const payload: ZimtraKYCApprovalPayload = req.body;
      
      // Validate webhook signature
      const isValid = ZimtraService.validateWebhookSignature(
        req.headers['x-zimtra-signature'] as string,
        JSON.stringify(payload)
      );
      
      if (!isValid) {
        res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        return;
      }

      // Update user KYC status in database
      await DatabaseService.query(
        `UPDATE users 
         SET kyc_status = 'approved', kyc_approved_at = $1, updated_at = NOW()
         WHERE email = $2`,
        [payload.kyc_approved_at, payload.email]
      );

      // Send Brevo email: KYC Approved
      const emailResult = await this.brevoService.sendKYCApprovalEmail(
        payload.email,
        payload.first_name,
        payload.last_name,
        payload.kyc_approved_at
      );

      if (!emailResult.success) {
        this.logger.warn(`KYC approval email failed for ${payload.email}: ${emailResult.error}`);
      }

      this.logger.info(`KYC approval processed for user: ${payload.email}`);
      
      res.status(200).json({ 
        success: true, 
        message: 'KYC approval processed successfully',
        emailSent: emailResult.success
      });

    } catch (error) {
      this.logger.error('KYC approval webhook error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process KYC approval' 
      });
    }
  }

  /**
   * Handle SIMULATOR account creation webhook from Zimtra
   * Updated to use Brevo service
   */
  static async handleZimtraAccountCreation(req: Request, res: Response): Promise<void> {
    try {
      const payload: ZimtraAccountCreationPayload = req.body;
      
      // Validate webhook signature
      const isValid = ZimtraService.validateWebhookSignature(
        req.headers['x-zimtra-signature'] as string,
        JSON.stringify(payload)
      );
      
      if (!isValid) {
        res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        return;
      }

      // Update user with Zimtra trader ID
      await DatabaseService.query(
        `UPDATE users 
         SET zimtra_id = $1, updated_at = NOW()
         WHERE email = $2`,
        [payload.trader_id, payload.email]
      );

      // Get user details for email
      const userResult = await DatabaseService.query(
        'SELECT first_name, last_name FROM users WHERE email = $1',
        [payload.email]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Send Brevo email: SIMULATOR Account Ready
        const emailResult = await this.brevoService.sendSimulatorReadyEmail(
          payload.email,
          user.first_name,
          user.last_name,
          payload.trader_id
        );

        if (!emailResult.success) {
          this.logger.warn(`SIMULATOR ready email failed for ${payload.email}: ${emailResult.error}`);
        }
      }

      this.logger.info(`SIMULATOR account created for user: ${payload.email}, Trader ID: ${payload.trader_id}`);
      
      res.status(200).json({ 
        success: true, 
        message: 'SIMULATOR account creation processed successfully' 
      });

    } catch (error) {
      this.logger.error('Account creation webhook error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process account creation' 
      });
    }
  }
}
```

## 📈 Email Analytics and Monitoring

### **Email Analytics Service**

```typescript
// src/services/email-analytics.service.ts
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  failureRate: number;
  templateStats: Array<{
    templateName: string;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  dailyStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

export class EmailAnalyticsService {
  private static logger = new Logger('EmailAnalyticsService');

  /**
   * Get comprehensive email analytics
   */
  static async getEmailAnalytics(dateFrom?: Date, dateTo?: Date): Promise<EmailAnalytics> {
    try {
      const dateFilter = this.buildDateFilter(dateFrom, dateTo);
      
      // Get overall statistics
      const overallStats = await this.getOverallStats(dateFilter);
      
      // Get template-specific statistics
      const templateStats = await this.getTemplateStats(dateFilter);
      
      // Get daily statistics
      const dailyStats = await this.getDailyStats(dateFilter);

      return {
        totalSent: overallStats.totalSent,
        totalDelivered: overallStats.totalDelivered,
        totalFailed: overallStats.totalFailed,
        deliveryRate: overallStats.deliveryRate,
        failureRate: overallStats.failureRate,
        templateStats,
        dailyStats
      };

    } catch (error) {
      this.logger.error('Failed to get email analytics:', error);
      throw error;
    }
  }

  private static buildDateFilter(dateFrom?: Date, dateTo?: Date): { query: string; params: any[] } {
    let query = '';
    const params: any[] = [];

    if (dateFrom) {
      query += ` AND created_at >= $${params.length + 1}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(dateTo);
    }

    return { query, params };
  }

  private static async getOverallStats(dateFilter: { query: string; params: any[] }): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as total_delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed
      FROM email_logs
      WHERE 1=1 ${dateFilter.query}
    `;

    const result = await DatabaseService.query(query, dateFilter.params);
    const stats = result.rows[0];

    const totalSent = parseInt(stats.total_sent);
    const totalDelivered = parseInt(stats.total_delivered);
    const totalFailed = parseInt(stats.total_failed);

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      failureRate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0
    };
  }

  private static async getTemplateStats(dateFilter: { query: string; params: any[] }): Promise<any[]> {
    const query = `
      SELECT 
        template_name,
        COUNT(*) as sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM email_logs
      WHERE 1=1 ${dateFilter.query}
      GROUP BY template_name
      ORDER BY sent DESC
    `;

    const result = await DatabaseService.query(query, dateFilter.params);
    
    return result.rows.map(row => ({
      templateName: row.template_name,
      sent: parseInt(row.sent),
      delivered: parseInt(row.delivered),
      failed: parseInt(row.failed),
      deliveryRate: parseInt(row.sent) > 0 ? (parseInt(row.delivered) / parseInt(row.sent)) * 100 : 0
    }));
  }

  private static async getDailyStats(dateFilter: { query: string; params: any[] }): Promise<any[]> {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM email_logs
      WHERE 1=1 ${dateFilter.query}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const result = await DatabaseService.query(query, dateFilter.params);
    
    return result.rows.map(row => ({
      date: row.date,
      sent: parseInt(row.sent),
      delivered: parseInt(row.delivered),
      failed: parseInt(row.failed)
    }));
  }
}
```

## ✅ Functional Validation Testing

### **Test 6.1: Brevo Service Validation**

```typescript
// src/tests/brevo.test.ts
import { BrevoService } from '../services/brevo.service';

describe('Brevo Email Service', () => {
  let brevoService: BrevoService;

  beforeAll(() => {
    brevoService = BrevoService.getInstance();
  });

  test('should connect to Brevo API successfully', async () => {
    const isHealthy = await brevoService.healthCheck();
    expect(isHealthy).toBe(true);
  });

  test('should send KYC approval email', async () => {
    const result = await brevoService.sendKYCApprovalEmail(
      'test@example.com',
      'John',
      'Doe',
      '2025-07-25 10:00:00'
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  test('should send SIMULATOR ready email', async () => {
    const result = await brevoService.sendSimulatorReadyEmail(
      'test@example.com',
      'John',
      'Doe',
      'ZIMSTISIM12345'
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  test('should handle invalid template gracefully', async () => {
    const result = await brevoService.sendTransactionalEmail({
      templateId: 'non_existent_template',
      to: 'test@example.com',
      variables: {}
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('template not found');
  });
});
```

### **Test 6.2: Email Template Management**

```typescript
// src/tests/email-templates.test.ts
import { EmailTemplateSeeder } from '../scripts/seed-email-templates';
import { DatabaseService } from '../services/database.service';

describe('Email Template Management', () => {
  beforeAll(async () => {
    await DatabaseService.initialize();
  });

  test('should seed email templates successfully', async () => {
    await EmailTemplateSeeder.seedTemplates();

    const result = await DatabaseService.query(
      'SELECT COUNT(*) as count FROM email_templates WHERE is_active = true'
    );

    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('should retrieve template by name', async () => {
    const result = await DatabaseService.query(
      'SELECT * FROM email_templates WHERE name = $1',
      ['dayrade_kyc_approved']
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].brevo_template_id).toBeDefined();
  });
});
```

### **Test 6.3: Email Analytics Validation**

```typescript
// src/tests/email-analytics.test.ts
import { EmailAnalyticsService } from '../services/email-analytics.service';

describe('Email Analytics', () => {
  test('should calculate email analytics correctly', async () => {
    const analytics = await EmailAnalyticsService.getEmailAnalytics();

    expect(analytics).toHaveProperty('totalSent');
    expect(analytics).toHaveProperty('totalDelivered');
    expect(analytics).toHaveProperty('deliveryRate');
    expect(analytics).toHaveProperty('templateStats');
    expect(analytics).toHaveProperty('dailyStats');
  });

  test('should filter analytics by date range', async () => {
    const dateFrom = new Date('2025-07-01');
    const dateTo = new Date('2025-07-31');
    
    const analytics = await EmailAnalyticsService.getEmailAnalytics(dateFrom, dateTo);
    
    expect(analytics.dailyStats.length).toBeGreaterThanOrEqual(0);
  });
});
```

## 🎯 Explicit Completion Declaration

**Task 06 Completion Criteria:**

- [x] Complete Brevo service implementation with template management
- [x] Integration with Zimtra workflow for automated email triggers
- [x] KYC approval email template and sending functionality
- [x] SIMULATOR account ready email template and sending functionality
- [x] Tournament-related email templates (registration, reminders, results)
- [x] Email delivery logging and tracking system
- [x] Email analytics and monitoring capabilities
- [x] Error handling for email delivery failures
- [x] Database schema for email templates and logs
- [x] Email template seeding system for deployment
- [x] Comprehensive test suite for email functionality
- [x] Brevo API integration with proper authentication

**Deliverables:**
1. BrevoService class with complete email functionality
2. Email template management system with database integration
3. Automated email triggers for Zimtra workflow integration
4. Email analytics service for monitoring and reporting
5. Comprehensive test suite for email delivery validation
6. Email template seeding system for deployment

**Next Step Validation:**
Task 06 is complete and ready for Task 07 (GetStream.io Chat Integration). The email system provides comprehensive communication capabilities for user notifications, workflow automation, and tournament updates.

## 📞 Stakeholder Communication Template

**Status Update for Project Stakeholders:**

"Task 06 (Brevo Email System) has been completed successfully. The complete transactional email system is now operational with Brevo integration, automated workflow triggers, and comprehensive template management. The system includes email delivery tracking, analytics monitoring, and robust error handling for reliable communication with users throughout the Dayrade platform experience."

**Technical Summary:**
- Brevo API integration with template management
- Automated email triggers for Zimtra workflow
- Email delivery tracking and analytics
- Tournament communication templates
- Comprehensive error handling and monitoring
- Database-driven template configuration

**Ready for Next Phase:** GetStream.io Chat Integration (Task 07)

