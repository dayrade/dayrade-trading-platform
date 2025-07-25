-- Email Templates Table
-- This table stores email templates for the Brevo email system
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Email Logs Table
-- This table stores logs of all sent emails for tracking and analytics
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL,
  template_name VARCHAR(100),
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(email_address);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_name);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_message_id ON email_logs(message_id);

-- Insert email templates
INSERT INTO email_templates (name, subject, html_content, text_content) VALUES
(
  'dayrade_kyc_approved',
  '🎉 KYC Approved - Purchase Your Contest Ticket Now!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h1 style="color: #28a745; text-align: center; margin-bottom: 30px;">🎉 Congratulations, {{userName}}!</h1>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333;">Your KYC verification has been <strong>approved</strong>! You''re now eligible to participate in our exclusive trading tournaments.</p>
      
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
        <h4 style="color: #495057; margin-top: 0;">📋 What''s Included:</h4>
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
  </div>',
  'Congratulations {{userName}}!

Your KYC verification has been approved! You''re now eligible to participate in our exclusive trading tournaments.

Next Step: Purchase Your Contest Ticket

To secure your spot in upcoming tournaments, you need to purchase a contest ticket:
- Contest tickets grant access to live trading tournaments
- Compete with verified traders for real prizes
- Track your performance on live leaderboards
- Build your trading reputation

Visit: {{frontendUrl}}/tournaments

What''s Included:
- Access to live trading tournaments
- Real-time performance tracking
- Professional trading tools
- Community chat and networking

Best regards,
The Dayrade Team'
),
(
  'dayrade_simulator_ready',
  '🚀 Your SIMULATOR Account is Ready - Start Trading Now!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
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
  </div>',
  'Your SIMULATOR Account is Ready!

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
The Dayrade Team'
)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content,
  updated_at = NOW();