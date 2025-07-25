import { Logger } from '../utils/logger';

const logger = new Logger('EmailTemplateService');

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailTemplateData {
  [key: string]: string | number | undefined;
}

export class EmailTemplateService {
  private static readonly DAYRADE_LOGO_URL = 'https://dayrade.com/assets/logo.svg';
  private static readonly DAYRADE_BRAND_COLOR = '#1a73e8';
  private static readonly DAYRADE_SECONDARY_COLOR = '#34a853';

  /**
   * Get the base email template with Dayrade branding
   */
  private static getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dayrade</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${this.DAYRADE_BRAND_COLOR} 0%, ${this.DAYRADE_SECONDARY_COLOR} 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            max-width: 200px;
            height: auto;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: ${this.DAYRADE_BRAND_COLOR};
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1557b0;
        }
        .verification-code {
            background-color: #f8f9fa;
            border: 2px solid ${this.DAYRADE_BRAND_COLOR};
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: ${this.DAYRADE_BRAND_COLOR};
        }
        .highlight {
            color: ${this.DAYRADE_BRAND_COLOR};
            font-weight: bold;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .content {
                padding: 20px !important;
            }
            .header {
                padding: 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${this.DAYRADE_LOGO_URL}" alt="Dayrade" class="logo" />
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2024 Dayrade. All rights reserved.</p>
            <p>This email was sent to you because you have an account with Dayrade.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Email Verification Code Template
   */
  static getEmailVerificationTemplate(data: { code: string; firstName?: string }): EmailTemplate {
    const content = `
      <h1>Verify Your Email Address</h1>
      ${data.firstName ? `<p>Hi ${data.firstName},</p>` : '<p>Hello,</p>'}
      <p>Thank you for signing up with Dayrade! To complete your registration, please verify your email address using the code below:</p>
      
      <div class="verification-code">${data.code}</div>
      
      <p>This verification code will expire in <span class="highlight">10 minutes</span>.</p>
      
      <div class="warning">
        <strong>Security Note:</strong> Never share this code with anyone. Dayrade will never ask for your verification code via phone or email.
      </div>
      
      <p>If you didn't create a Dayrade account, please ignore this email.</p>
      
      <p>Welcome to the future of trading!</p>
      <p><strong>The Dayrade Team</strong></p>
    `;

    return {
      subject: 'Verify Your Dayrade Account',
      htmlContent: this.getBaseTemplate(content),
      textContent: `
Verify Your Email Address

${data.firstName ? `Hi ${data.firstName},` : 'Hello,'}

Thank you for signing up with Dayrade! To complete your registration, please verify your email address using the code below:

Verification Code: ${data.code}

This verification code will expire in 10 minutes.

Security Note: Never share this code with anyone. Dayrade will never ask for your verification code via phone or email.

If you didn't create a Dayrade account, please ignore this email.

Welcome to the future of trading!
The Dayrade Team

© 2024 Dayrade. All rights reserved.
      `.trim()
    };
  }

  /**
   * Welcome Email Template
   */
  static getWelcomeEmailTemplate(data: { firstName: string; email: string }): EmailTemplate {
    const content = `
      <h1>Welcome to Dayrade! 🎉</h1>
      <p>Hi ${data.firstName},</p>
      <p>Congratulations! Your email has been successfully verified and your Dayrade account is now active.</p>
      
      <p>You're now part of an exclusive community of traders who are shaping the future of financial markets through cutting-edge simulation technology.</p>
      
      <h2>What's Next?</h2>
      <ul>
        <li><strong>Complete Your Profile:</strong> Add your trading experience and preferences</li>
        <li><strong>KYC Verification:</strong> Complete identity verification to unlock all features</li>
        <li><strong>Explore the Platform:</strong> Try our advanced trading simulator</li>
        <li><strong>Join Tournaments:</strong> Compete with other traders for prizes</li>
      </ul>
      
      <a href="https://dayrade.com/dashboard" class="button">Get Started</a>
      
      <p>If you have any questions, our support team is here to help you succeed.</p>
      
      <p>Happy trading!</p>
      <p><strong>The Dayrade Team</strong></p>
    `;

    return {
      subject: 'Welcome to Dayrade - Your Account is Ready!',
      htmlContent: this.getBaseTemplate(content),
      textContent: `
Welcome to Dayrade! 🎉

Hi ${data.firstName},

Congratulations! Your email has been successfully verified and your Dayrade account is now active.

You're now part of an exclusive community of traders who are shaping the future of financial markets through cutting-edge simulation technology.

What's Next?
- Complete Your Profile: Add your trading experience and preferences
- KYC Verification: Complete identity verification to unlock all features
- Explore the Platform: Try our advanced trading simulator
- Join Tournaments: Compete with other traders for prizes

Get started: https://dayrade.com/dashboard

If you have any questions, our support team is here to help you succeed.

Happy trading!
The Dayrade Team

© 2024 Dayrade. All rights reserved.
      `.trim()
    };
  }

  /**
   * Password Reset Template
   */
  static getPasswordResetTemplate(data: { firstName?: string; resetLink: string }): EmailTemplate {
    const content = `
      <h1>Reset Your Password</h1>
      ${data.firstName ? `<p>Hi ${data.firstName},</p>` : '<p>Hello,</p>'}
      <p>We received a request to reset your Dayrade account password. Click the button below to create a new password:</p>
      
      <a href="${data.resetLink}" class="button">Reset Password</a>
      
      <p>This link will expire in <span class="highlight">1 hour</span> for security reasons.</p>
      
      <div class="warning">
        <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email. Your account remains secure.
      </div>
      
      <p>For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.</p>
      
      <p>If you're having trouble clicking the button, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${data.resetLink}</p>
      
      <p><strong>The Dayrade Team</strong></p>
    `;

    return {
      subject: 'Reset Your Dayrade Password',
      htmlContent: this.getBaseTemplate(content),
      textContent: `
Reset Your Password

${data.firstName ? `Hi ${data.firstName},` : 'Hello,'}

We received a request to reset your Dayrade account password. Use the link below to create a new password:

Reset Link: ${data.resetLink}

This link will expire in 1 hour for security reasons.

Security Note: If you didn't request a password reset, please ignore this email. Your account remains secure.

For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.

The Dayrade Team

© 2024 Dayrade. All rights reserved.
      `.trim()
    };
  }

  /**
   * KYC Approved Template
   */
  static getKycApprovedTemplate(data: { firstName: string }): EmailTemplate {
    const content = `
      <h1>KYC Verification Approved! ✅</h1>
      <p>Hi ${data.firstName},</p>
      <p>Great news! Your identity verification has been successfully completed and approved.</p>
      
      <p>You now have access to all Dayrade features, including:</p>
      <ul>
        <li><strong>Advanced Trading Simulator:</strong> Full access to all trading instruments</li>
        <li><strong>Tournament Participation:</strong> Compete for real prizes</li>
        <li><strong>Premium Analytics:</strong> Advanced performance tracking</li>
        <li><strong>Community Features:</strong> Connect with other verified traders</li>
      </ul>
      
      <a href="https://dayrade.com/dashboard" class="button">Explore Your Account</a>
      
      <p>Thank you for completing the verification process. We're excited to see you succeed on our platform!</p>
      
      <p><strong>The Dayrade Team</strong></p>
    `;

    return {
      subject: 'KYC Verification Approved - Full Access Unlocked!',
      htmlContent: this.getBaseTemplate(content),
      textContent: `
KYC Verification Approved! ✅

Hi ${data.firstName},

Great news! Your identity verification has been successfully completed and approved.

You now have access to all Dayrade features, including:
- Advanced Trading Simulator: Full access to all trading instruments
- Tournament Participation: Compete for real prizes
- Premium Analytics: Advanced performance tracking
- Community Features: Connect with other verified traders

Explore your account: https://dayrade.com/dashboard

Thank you for completing the verification process. We're excited to see you succeed on our platform!

The Dayrade Team

© 2024 Dayrade. All rights reserved.
      `.trim()
    };
  }

  /**
   * Tournament Invitation Template
   */
  static getTournamentInvitationTemplate(data: { 
    firstName: string; 
    tournamentName: string; 
    startDate: string; 
    prizePool: string;
    registrationLink: string;
  }): EmailTemplate {
    const content = `
      <h1>You're Invited to ${data.tournamentName}! 🏆</h1>
      <p>Hi ${data.firstName},</p>
      <p>You've been selected to participate in an exclusive trading tournament!</p>
      
      <h2>Tournament Details:</h2>
      <ul>
        <li><strong>Tournament:</strong> ${data.tournamentName}</li>
        <li><strong>Start Date:</strong> ${data.startDate}</li>
        <li><strong>Prize Pool:</strong> ${data.prizePool}</li>
        <li><strong>Format:</strong> Live trading simulation</li>
      </ul>
      
      <p>This is your chance to showcase your trading skills and compete for amazing prizes!</p>
      
      <a href="${data.registrationLink}" class="button">Register Now</a>
      
      <p>Registration closes 24 hours before the tournament starts. Don't miss out!</p>
      
      <p>Good luck and may the best trader win!</p>
      <p><strong>The Dayrade Team</strong></p>
    `;

    return {
      subject: `Tournament Invitation: ${data.tournamentName}`,
      htmlContent: this.getBaseTemplate(content),
      textContent: `
You're Invited to ${data.tournamentName}! 🏆

Hi ${data.firstName},

You've been selected to participate in an exclusive trading tournament!

Tournament Details:
- Tournament: ${data.tournamentName}
- Start Date: ${data.startDate}
- Prize Pool: ${data.prizePool}
- Format: Live trading simulation

This is your chance to showcase your trading skills and compete for amazing prizes!

Register now: ${data.registrationLink}

Registration closes 24 hours before the tournament starts. Don't miss out!

Good luck and may the best trader win!
The Dayrade Team

© 2024 Dayrade. All rights reserved.
      `.trim()
    };
  }

  /**
   * Weekly Performance Summary Template
   */
  static getWeeklyPerformanceSummaryTemplate(data: {
    firstName: string;
    weeklyReturn: string;
    totalReturn: string;
    rank: number;
    totalUsers: number;
    bestTrade: string;
    dashboardLink: string;
  }): EmailTemplate {
    const content = `
      <h1>Your Weekly Trading Summary 📊</h1>
      <p>Hi ${data.firstName},</p>
      <p>Here's how you performed this week on Dayrade:</p>
      
      <h2>Performance Highlights:</h2>
      <ul>
        <li><strong>Weekly Return:</strong> <span class="highlight">${data.weeklyReturn}</span></li>
        <li><strong>Total Return:</strong> <span class="highlight">${data.totalReturn}</span></li>
        <li><strong>Current Rank:</strong> #${data.rank} out of ${data.totalUsers} traders</li>
        <li><strong>Best Trade:</strong> ${data.bestTrade}</li>
      </ul>
      
      <p>Keep up the great work! Every trade is a learning opportunity to improve your skills.</p>
      
      <a href="${data.dashboardLink}" class="button">View Full Report</a>
      
      <p>Ready for another week of trading? Check out the latest market opportunities and upcoming tournaments.</p>
      
      <p><strong>The Dayrade Team</strong></p>
    `;

    return {
      subject: 'Your Weekly Trading Performance Summary',
      htmlContent: this.getBaseTemplate(content),
      textContent: `
Your Weekly Trading Summary 📊

Hi ${data.firstName},

Here's how you performed this week on Dayrade:

Performance Highlights:
- Weekly Return: ${data.weeklyReturn}
- Total Return: ${data.totalReturn}
- Current Rank: #${data.rank} out of ${data.totalUsers} traders
- Best Trade: ${data.bestTrade}

Keep up the great work! Every trade is a learning opportunity to improve your skills.

View full report: ${data.dashboardLink}

Ready for another week of trading? Check out the latest market opportunities and upcoming tournaments.

The Dayrade Team

© 2024 Dayrade. All rights reserved.
      `.trim()
    };
  }

  /**
   * Get template by type
   */
  static getTemplate(type: string, data: EmailTemplateData): EmailTemplate {
    try {
      switch (type) {
        case 'email_verification':
          return this.getEmailVerificationTemplate(data as { code: string; firstName?: string });
        
        case 'welcome':
          return this.getWelcomeEmailTemplate(data as { firstName: string; email: string });
        
        case 'password_reset':
          return this.getPasswordResetTemplate(data as { firstName?: string; resetLink: string });
        
        case 'kyc_approved':
          return this.getKycApprovedTemplate(data as { firstName: string });
        
        case 'tournament_invitation':
          return this.getTournamentInvitationTemplate(data as {
            firstName: string;
            tournamentName: string;
            startDate: string;
            prizePool: string;
            registrationLink: string;
          });
        
        case 'weekly_performance':
          return this.getWeeklyPerformanceSummaryTemplate(data as {
            firstName: string;
            weeklyReturn: string;
            totalReturn: string;
            rank: number;
            totalUsers: number;
            bestTrade: string;
            dashboardLink: string;
          });
        
        default:
          throw new Error(`Unknown email template type: ${type}`);
      }
    } catch (error) {
      logger.error(`Error generating email template for type ${type}:`, error);
      throw error;
    }
  }
}