import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Logger } from '../utils/logger';

const logger = new Logger('BrevoService');

export interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoEmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
}

export interface SendEmailRequest {
  to: Array<{
    email: string;
    name?: string;
  }>;
  templateId?: number;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  params?: Record<string, any>;
  tags?: string[];
  headers?: Record<string, string>;
}

export interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  type: string;
  status: string;
  scheduledAt?: string;
  sentDate?: string;
  statistics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export interface TransactionalEmailLog {
  messageId: string;
  email: string;
  subject: string;
  templateId?: number;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'blocked' | 'spam';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export class BrevoService {
  private client: AxiosInstance;
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY!;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@dayrade.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Dayrade Platform';

    this.client = axios.create({
      baseURL: 'https://api.brevo.com/v3',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`Brevo API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Brevo API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`Brevo API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Brevo API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  // Contact Management
  async createContact(contactData: BrevoContact): Promise<void> {
    try {
      await this.client.post('/contacts', contactData);
      logger.info(`Created Brevo contact: ${contactData.email}`);
    } catch (error) {
      logger.error('Failed to create Brevo contact:', error);
      throw new Error('Failed to create contact');
    }
  }

  async updateContact(email: string, contactData: Partial<BrevoContact>): Promise<void> {
    try {
      await this.client.put(`/contacts/${encodeURIComponent(email)}`, contactData);
      logger.info(`Updated Brevo contact: ${email}`);
    } catch (error) {
      logger.error(`Failed to update Brevo contact ${email}:`, error);
      throw new Error('Failed to update contact');
    }
  }

  async getContact(email: string): Promise<BrevoContact> {
    try {
      const response: AxiosResponse<BrevoContact> = await this.client.get(`/contacts/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get Brevo contact ${email}:`, error);
      throw new Error('Failed to get contact');
    }
  }

  async deleteContact(email: string): Promise<void> {
    try {
      await this.client.delete(`/contacts/${encodeURIComponent(email)}`);
      logger.info(`Deleted Brevo contact: ${email}`);
    } catch (error) {
      logger.error(`Failed to delete Brevo contact ${email}:`, error);
      throw new Error('Failed to delete contact');
    }
  }

  // Email Templates
  async getEmailTemplates(): Promise<BrevoEmailTemplate[]> {
    try {
      const response: AxiosResponse<{ templates: BrevoEmailTemplate[] }> = await this.client.get('/smtp/templates');
      return response.data.templates;
    } catch (error) {
      logger.error('Failed to get email templates:', error);
      throw new Error('Failed to get email templates');
    }
  }

  async getEmailTemplate(templateId: number): Promise<BrevoEmailTemplate> {
    try {
      const response: AxiosResponse<BrevoEmailTemplate> = await this.client.get(`/smtp/templates/${templateId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get email template ${templateId}:`, error);
      throw new Error('Failed to get email template');
    }
  }

  // Transactional Emails
  async sendTransactionalEmail(emailData: SendEmailRequest): Promise<{ messageId: string }> {
    try {
      const payload = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: emailData.to,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent,
        templateId: emailData.templateId,
        params: emailData.params,
        tags: emailData.tags,
        headers: emailData.headers,
      };

      const response: AxiosResponse<{ messageId: string }> = await this.client.post('/smtp/email', payload);
      logger.info(`Sent transactional email to: ${emailData.to.map(t => t.email).join(', ')}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to send transactional email:', error);
      throw new Error('Failed to send transactional email');
    }
  }

  // Tournament-specific email methods
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<{ messageId: string }> {
    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: 'Welcome to Dayrade Trading Tournament Platform',
      htmlContent: `
        <h1>Welcome to Dayrade, ${userName}!</h1>
        <p>Thank you for joining our trading tournament platform. Get ready to compete with the best traders!</p>
        <p>Your account has been successfully created and you can now:</p>
        <ul>
          <li>Browse upcoming tournaments</li>
          <li>Register for competitions</li>
          <li>Track your performance</li>
          <li>Connect with other traders</li>
        </ul>
        <p>Good luck and happy trading!</p>
        <p>Best regards,<br>The Dayrade Team</p>
      `,
      tags: ['welcome', 'user-onboarding'],
    });
  }

  async sendKycApprovalEmail(userEmail: string, userName: string): Promise<{ messageId: string }> {
    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: '🎉 KYC Approved - Purchase Your Contest Ticket Now!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">🎉 Congratulations, ${userName}!</h1>
            
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
              <a href="${process.env.FRONTEND_URL}/tournaments" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Purchase Contest Ticket</a>
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
      tags: ['dayrade_kyc_approved', 'contest-ticket', 'tournament-access'],
    });
  }

  async sendSimulatorReadyEmail(
    userEmail: string, 
    userName: string, 
    zimtraId: string, 
    accountDetails?: any
  ): Promise<{ messageId: string }> {
    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: '🚀 Your SIMULATOR Account is Ready - Start Trading Now!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #17a2b8; text-align: center; margin-bottom: 30px;">🚀 Your SIMULATOR Account is Ready!</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${userName},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Great news! Your Zimtra SIMULATOR trading account has been successfully created and is ready for action.</p>
            
            <div style="background-color: #e1f7fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0277bd; margin-top: 0;">📊 Your Trading Account Details</h3>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p style="margin: 5px 0; color: #333;"><strong>Trader ID:</strong> <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; color: #e83e8c;">${zimtraId}</code></p>
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
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">Access Dashboard</a>
              <a href="${process.env.FRONTEND_URL}/tournaments?type=simulator" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join SIMULATOR Tournament</a>
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
      tags: ['dayrade_simulator_ready', 'account-created', 'simulator-trading'],
    });
  }

  async sendTournamentRegistrationEmail(
    userEmail: string,
    userName: string,
    tournamentName: string,
    tournamentStartDate: string
  ): Promise<{ messageId: string }> {
    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: `Tournament Registration Confirmed - ${tournamentName}`,
      htmlContent: `
        <h1>Registration Confirmed!</h1>
        <p>Hi ${userName},</p>
        <p>You have successfully registered for <strong>${tournamentName}</strong>.</p>
        <p><strong>Tournament Details:</strong></p>
        <ul>
          <li>Start Date: ${new Date(tournamentStartDate).toLocaleDateString()}</li>
          <li>Your Zimtra account is ready for trading</li>
          <li>Join the tournament chat to connect with other participants</li>
        </ul>
        <p>Good luck in the competition!</p>
        <p>Best regards,<br>The Dayrade Team</p>
      `,
      tags: ['tournament-registration', 'confirmation'],
    });
  }

  async sendTournamentStartEmail(
    userEmail: string,
    userName: string,
    tournamentName: string
  ): Promise<{ messageId: string }> {
    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: `Tournament Started - ${tournamentName}`,
      htmlContent: `
        <h1>The Tournament Has Begun!</h1>
        <p>Hi ${userName},</p>
        <p><strong>${tournamentName}</strong> has officially started!</p>
        <p>Time to put your trading skills to the test. Remember:</p>
        <ul>
          <li>Monitor your performance on the leaderboard</li>
          <li>Use the chat to discuss strategies with other traders</li>
          <li>Track your progress in real-time</li>
        </ul>
        <p>May the best trader win!</p>
        <p>Best regards,<br>The Dayrade Team</p>
      `,
      tags: ['tournament-start', 'competition'],
    });
  }

  async sendTournamentEndEmail(
    userEmail: string,
    userName: string,
    tournamentName: string,
    finalRank: number,
    totalParticipants: number
  ): Promise<{ messageId: string }> {
    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: `Tournament Results - ${tournamentName}`,
      htmlContent: `
        <h1>Tournament Complete!</h1>
        <p>Hi ${userName},</p>
        <p><strong>${tournamentName}</strong> has concluded.</p>
        <p><strong>Your Results:</strong></p>
        <ul>
          <li>Final Rank: ${finalRank} out of ${totalParticipants}</li>
          <li>View detailed performance metrics in your dashboard</li>
          <li>Compare your results with other participants</li>
        </ul>
        <p>Thank you for participating! Look out for upcoming tournaments.</p>
        <p>Best regards,<br>The Dayrade Team</p>
      `,
      tags: ['tournament-end', 'results'],
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<{ messageId: string }> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.sendTransactionalEmail({
      to: [{ email: userEmail }],
      subject: 'Reset Your Dayrade Password',
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password for your Dayrade account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Dayrade Team</p>
      `,
      tags: ['password-reset', 'security'],
    });
  }

  async sendEmailVerificationCode(userEmail: string, userName: string, verificationCode: string): Promise<{ messageId: string }> {
    const { EmailTemplateService } = await import('../services/email-template.service');
    const template = EmailTemplateService.getEmailVerificationTemplate({ 
      code: verificationCode, 
      firstName: userName 
    });

    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      tags: ['email-verification', 'verification-code', 'onboarding'],
    });
  }

  async sendWelcomeEmailWithTemplate(userEmail: string, userName: string): Promise<{ messageId: string }> {
    const { EmailTemplateService } = await import('../services/email-template.service');
    const template = EmailTemplateService.getWelcomeEmailTemplate({ 
      firstName: userName, 
      email: userEmail 
    });

    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      tags: ['welcome', 'onboarding'],
    });
  }

  async sendPasswordResetEmailWithTemplate(userEmail: string, resetLink: string, userName?: string): Promise<{ messageId: string }> {
    const { EmailTemplateService } = await import('../services/email-template.service');
    const template = EmailTemplateService.getPasswordResetTemplate({ 
      firstName: userName, 
      resetLink 
    });

    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      tags: ['password-reset', 'security'],
    });
  }

  async sendKycApprovedEmailWithTemplate(userEmail: string, userName: string): Promise<{ messageId: string }> {
    const { EmailTemplateService } = await import('../services/email-template.service');
    const template = EmailTemplateService.getKycApprovedTemplate({ 
      firstName: userName 
    });

    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      tags: ['kyc-approved', 'verification'],
    });
  }

  async sendTournamentInvitationEmailWithTemplate(
    userEmail: string,
    data: {
      firstName: string;
      tournamentName: string;
      startDate: string;
      prizePool: string;
      registrationLink: string;
    }
  ): Promise<{ messageId: string }> {
    const { EmailTemplateService } = await import('../services/email-template.service');
    const template = EmailTemplateService.getTournamentInvitationTemplate(data);

    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: data.firstName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      tags: ['tournament', 'invitation'],
    });
  }

  async sendWeeklyPerformanceSummaryEmailWithTemplate(
    userEmail: string,
    data: {
      firstName: string;
      weeklyReturn: string;
      totalReturn: string;
      rank: number;
      totalUsers: number;
      bestTrade: string;
      dashboardLink: string;
    }
  ): Promise<{ messageId: string }> {
    const { EmailTemplateService } = await import('../services/email-template.service');
    const template = EmailTemplateService.getWeeklyPerformanceSummaryTemplate(data);

    return this.sendTransactionalEmail({
      to: [{ email: userEmail, name: data.firstName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      tags: ['performance', 'weekly-summary'],
    });
  }

  async sendEmailVerificationEmail(userEmail: string, verificationToken: string): Promise<{ messageId: string }> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    return this.sendTransactionalEmail({
      to: [{ email: userEmail }],
      subject: 'Verify Your Dayrade Email Address',
      htmlContent: `
        <h1>Verify Your Email Address</h1>
        <p>Thank you for signing up for Dayrade!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Dayrade Team</p>
      `,
      tags: ['email-verification', 'onboarding'],
    });
  }

  // Email Analytics
  async getEmailStatistics(messageId: string): Promise<TransactionalEmailLog> {
    try {
      const response: AxiosResponse<TransactionalEmailLog> = await this.client.get(`/smtp/statistics/events?messageId=${messageId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get email statistics for ${messageId}:`, error);
      throw new Error('Failed to get email statistics');
    }
  }

  async getEmailLogs(options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    email?: string;
  }): Promise<TransactionalEmailLog[]> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.email) params.append('email', options.email);

      const response: AxiosResponse<{ logs: TransactionalEmailLog[] }> = await this.client.get(
        `/smtp/statistics/events?${params.toString()}`
      );
      return response.data.logs;
    } catch (error) {
      logger.error('Failed to get email logs:', error);
      throw new Error('Failed to get email logs');
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'online' | 'offline'; responseTime: number }> {
    const startTime = Date.now();
    try {
      await this.client.get('/account');
      return {
        status: 'online',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'offline',
        responseTime: Date.now() - startTime,
      };
    }
  }
}

export const brevoService = new BrevoService();