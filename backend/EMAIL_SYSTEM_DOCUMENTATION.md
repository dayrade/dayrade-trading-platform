# Dayrade Email System Documentation

## Overview

The Dayrade email system provides comprehensive email functionality with Brevo integration, featuring professional email templates with Dayrade branding, email verification workflows, and various transactional emails.

## Features

### ✅ Email Templates
- **Email Verification Code**: 6-digit verification codes with security notes
- **Welcome Email**: Post-registration welcome with onboarding guidance
- **Password Reset**: Secure password reset with time-limited links
- **KYC Approved**: Notification when identity verification is complete
- **Tournament Invitation**: Invitations to trading tournaments
- **Weekly Performance Summary**: Performance reports and analytics

### ✅ Email Verification System
- 6-digit verification codes
- 10-minute expiration time
- Rate limiting (5-minute cooldown)
- Automatic welcome email after verification
- Database tracking of verification attempts

### ✅ Password Reset System
- Secure token-based password reset
- 1-hour expiration time
- One-time use tokens
- Session invalidation after password reset

### ✅ Branding & Design
- Professional Dayrade branding
- Responsive email templates
- Mobile-optimized layouts
- Consistent color scheme and typography
- SVG logo integration

## API Endpoints

### Authentication Endpoints

#### Send Email Verification Code
```http
POST /api/auth/send-verification-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

#### Verify Email Code
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "newPassword": "newSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Database Schema

### Email Verification Codes Table
```sql
CREATE TABLE email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Email Templates

### Template Types

1. **email_verification**: 6-digit verification code
2. **welcome**: Welcome message after email verification
3. **password_reset**: Password reset with secure link
4. **kyc_approved**: KYC verification completion
5. **tournament_invitation**: Tournament participation invite
6. **weekly_performance**: Weekly trading performance summary

### Template Usage

```typescript
import { EmailTemplateService } from '../services/email-template.service';

// Generate email verification template
const template = EmailTemplateService.getEmailVerificationTemplate({
  code: '123456',
  firstName: 'John'
});

// Generate welcome email template
const welcomeTemplate = EmailTemplateService.getWelcomeEmailTemplate({
  firstName: 'John',
  email: 'john@example.com'
});
```

## Brevo Integration

### Service Methods

```typescript
// Send email verification code
await brevoService.sendEmailVerificationCode(email, code, firstName);

// Send welcome email
await brevoService.sendWelcomeEmailWithTemplate(email, firstName);

// Send password reset email
await brevoService.sendPasswordResetEmailWithTemplate(email, resetLink, firstName);

// Send KYC approved email
await brevoService.sendKycApprovedEmailWithTemplate(email, firstName);

// Send tournament invitation
await brevoService.sendTournamentInvitationEmailWithTemplate(email, tournamentData);

// Send weekly performance summary
await brevoService.sendWeeklyPerformanceSummaryEmailWithTemplate(email, performanceData);
```

### Environment Variables

```env
# Brevo Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@dayrade.com
BREVO_SENDER_NAME=Dayrade

# Frontend URL for links
FRONTEND_URL=https://dayrade.com

# Test email for development
TEST_EMAIL=your-test-email@example.com
```

## Testing

### Run Email Tests

```bash
# Test all email templates and functionality
npx ts-node scripts/test-email-system.ts

# Set up authentication tables
npx ts-node scripts/setup-auth-tables.ts
```

### Test Email Templates

The testing script will:
1. Generate all email templates
2. Send test emails to the configured test address
3. Verify template rendering and content
4. Check email delivery status

## Security Features

### Email Verification
- 6-digit codes for better UX than long tokens
- 10-minute expiration for security
- Rate limiting to prevent spam
- Secure code generation using crypto-random

### Password Reset
- Cryptographically secure tokens
- 1-hour expiration time
- One-time use tokens
- Session invalidation after reset
- No user enumeration (same response for valid/invalid emails)

### General Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection in email templates
- Secure email headers and content

## Error Handling

### Common Error Responses

```json
// User not found
{
  "success": false,
  "message": "User not found"
}

// Rate limiting
{
  "success": false,
  "message": "Please wait before requesting another verification code",
  "canResendAt": "2024-01-25T14:05:00.000Z"
}

// Invalid/expired code
{
  "success": false,
  "message": "Invalid or expired verification code"
}

// Email already verified
{
  "success": false,
  "message": "Email is already verified"
}
```

## Integration with Frontend

### Registration Flow
1. User registers with email/password
2. Backend sends verification code via email
3. User enters code in verification modal
4. Backend verifies code and marks email as verified
5. Welcome email is automatically sent
6. User gains access to the platform

### Password Reset Flow
1. User requests password reset
2. Backend sends reset link via email
3. User clicks link and enters new password
4. Backend validates token and updates password
5. All user sessions are invalidated
6. User must log in with new password

## Monitoring and Analytics

### Email Tracking
- Delivery status tracking via Brevo
- Open rate monitoring
- Click-through rate tracking
- Bounce and complaint handling

### Database Logging
- All verification attempts logged
- Password reset requests tracked
- Email sending status recorded
- Failed delivery notifications

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check Brevo API key configuration
   - Verify sender email is authorized
   - Check rate limits and quotas

2. **Verification codes not working**
   - Check database table creation
   - Verify code expiration logic
   - Check for timezone issues

3. **Templates not rendering**
   - Verify template service imports
   - Check for missing template data
   - Validate HTML/CSS compatibility

### Debug Commands

```bash
# Check email service health
curl -X GET http://localhost:3000/api/auth/health

# Test email template generation
npx ts-node -e "
import { EmailTemplateService } from './src/services/email-template.service';
console.log(EmailTemplateService.getEmailVerificationTemplate({ code: '123456', firstName: 'Test' }));
"
```

## Future Enhancements

### Planned Features
- Email preference management
- Unsubscribe functionality
- Email template A/B testing
- Advanced analytics dashboard
- Multi-language email support
- Email scheduling and automation

### Performance Optimizations
- Email queue system for high volume
- Template caching
- Batch email processing
- CDN integration for images

---

## Quick Start Guide

1. **Set up environment variables**
2. **Run database migration**: `npx ts-node scripts/setup-auth-tables.ts`
3. **Test email system**: `npx ts-node scripts/test-email-system.ts`
4. **Integrate with frontend authentication modals**
5. **Monitor email delivery and user feedback**

For support, contact the development team or check the troubleshooting section above.