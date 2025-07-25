import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { DatabaseService } from './database.service';
import { BrevoService } from '../integrations/brevo.service';
import { Logger } from '../utils/logger';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  userState: 'viewer' | 'registered' | 'kyc_verified';
  kycStatus: 'pending' | 'approved' | 'rejected';
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
  country?: string;
  timezone?: string;
}

export class AuthService {
  private static logger = new Logger('AuthService');
  private static brevoService = new BrevoService();

  /**
   * Register a new user account
   */
  static async register(request: RegisterRequest): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Validate email format
      if (!this.isValidEmail(request.email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // Check if user already exists
      const { data: existingUser } = await db
        .from('users')
        .select('id')
        .eq('email', request.email.toLowerCase())
        .single();

      if (existingUser) {
        return { success: false, message: 'User already exists with this email' };
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message };
      }

      // Generate username if not provided
      const username = request.username || await this.generateUsername(request.firstName, request.lastName);

      // Hash password
      const passwordHash = await bcrypt.hash(request.password, 12);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user account
      const { data: user, error } = await db
        .from('users')
        .insert({
          email: request.email.toLowerCase(),
          password_hash: passwordHash,
          first_name: request.firstName,
          last_name: request.lastName,
          username,
          country: request.country || null,
          timezone: request.timezone || 'UTC',
          email_verified: false,
          is_active: true,
          is_suspended: false,
          role: 'USER'
        })
        .select()
        .single();

      if (error) {
        this.logger.error('User creation error:', error);
        return { success: false, message: 'Registration failed. Please try again.' };
      }

      // Send verification email
      await this.sendVerificationEmail(request.email, request.firstName, verificationToken);

      this.logger.info(`User registered successfully: ${request.email}`);

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id
      };

    } catch (error) {
      this.logger.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      const { data: user, error } = await db
        .from('users')
        .select(`
          id,
          email,
          username,
          first_name,
          last_name,
          avatar_url,
          country,
          timezone,
          role,
          email_verified,
          is_active,
          created_at,
          last_login_at
        `)
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        message: 'User profile retrieved successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          country: user.country,
          timezone: user.timezone,
          role: user.role,
          emailVerified: user.email_verified,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        }
      };

    } catch (error) {
      this.logger.error('Get user profile error:', error);
      return { success: false, message: 'Failed to retrieve user profile' };
    }
  }

  /**
   * Authenticate user login
   */
  static async login(request: LoginRequest): Promise<{ success: boolean; message: string; tokens?: AuthTokens; user?: UserPayload }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Get user by email
      const { data: user, error } = await db
        .from('users')
        .select('*')
        .eq('email', request.email.toLowerCase())
        .single();

      if (error || !user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check if account is active
      if (!user.is_active) {
        return { success: false, message: 'Account is deactivated. Please contact support.' };
      }

      if (user.is_suspended) {
        return { success: false, message: 'Account is suspended. Please contact support.' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(request.password, user.password_hash);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session record
      await this.createSession(user.id, tokens.refreshToken, request);

      // Update last login
      await db
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      const userPayload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.email_verified,
        userState: this.getUserState(user),
        kycStatus: user.kyc_status || 'pending'
      };

      this.logger.info(`User logged in successfully: ${user.email}`);

      return {
        success: true,
        message: 'Login successful',
        tokens,
        user: userPayload
      };

    } catch (error) {
      this.logger.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ success: boolean; message: string; tokens?: AuthTokens }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;

      // Check if session exists and is active
      const { data: session, error } = await db
        .from('user_sessions')
        .select(`
          *,
          users (*)
        `)
        .eq('refresh_token', refreshToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return { success: false, message: 'Invalid or expired refresh token' };
      }

      const user = session.users;

      // Check if user is still active
      if (!user.is_active || user.is_suspended) {
        return { success: false, message: 'Account is no longer active' };
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update session with new refresh token
      await db
        .from('user_sessions')
        .update({
          refresh_token: tokens.refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          last_used_at: new Date().toISOString()
        })
        .eq('refresh_token', refreshToken);

      this.logger.info(`Token refreshed for user: ${user.email}`);

      return {
        success: true,
        message: 'Token refreshed successfully',
        tokens
      };

    } catch (error) {
      this.logger.error('Token refresh error:', error);
      return { success: false, message: 'Token refresh failed' };
    }
  }

  /**
   * Logout user and invalidate session
   */
  static async logout(refreshToken: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Invalidate session
      await db
        .from('user_sessions')
        .update({ is_active: false })
        .eq('refresh_token', refreshToken);

      this.logger.info('User logged out successfully');

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      this.logger.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  }

  /**
   * Generate JWT tokens for user
   */
  private static async generateTokens(user: any): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '24h'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Create user session record
   */
  private static async createSession(userId: string, refreshToken: string, request: LoginRequest): Promise<void> {
    try {
      const db = DatabaseService.getInstance().getClient();

      await db
        .from('user_sessions')
        .insert({
          user_id: userId,
          refresh_token: refreshToken,
          device_info: request.deviceInfo || null,
          ip_address: request.ipAddress || null,
          user_agent: request.userAgent || null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          is_active: true
        });

    } catch (error) {
      this.logger.error('Session creation error:', error);
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private static validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true, message: 'Password is valid' };
  }

  /**
   * Generate unique username
   */
  private static async generateUsername(firstName: string, lastName: string): Promise<string> {
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    let username = baseUsername;
    let counter = 1;

    const db = DatabaseService.getInstance().getClient();

    while (true) {
      const { data: existingUser } = await db
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (!existingUser) {
        break;
      }

      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  /**
   * Determine user state based on verification and KYC status
   */
  private static getUserState(user: any): 'viewer' | 'registered' | 'kyc_verified' {
    // If email is not verified, user is just a viewer
    if (!user.email_verified) {
      return 'viewer';
    }
    
    // If email is verified but KYC is not approved, user is registered
    if (user.kyc_status !== 'approved') {
      return 'registered';
    }
    
    // If both email and KYC are verified, user is fully verified
    return 'kyc_verified';
  }

  /**
   * Send email verification code
   */
  static async sendEmailVerificationCode(email: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Check if user exists
      const { data: user, error: userError } = await db
        .from('users')
        .select('id, first_name, email_verified')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        return { success: false, message: 'User not found' };
      }

      if (user.email_verified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Check for recent verification attempts (rate limiting)
      const { data: recentCode } = await db
        .from('email_verification_codes')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('is_used', false)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last 1 minute
        .single();

      if (recentCode) {
        return { success: false, message: 'Please wait before requesting another verification code' };
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code in database
      await db
        .from('email_verification_codes')
        .insert({
          user_id: user.id,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          is_used: false
        });

      // Send verification email via Brevo
      await this.brevoService.sendEmailVerificationCode(email, user.first_name, verificationCode);

      this.logger.info(`Verification code sent to ${email}`);

      return {
        success: true,
        message: 'Verification code sent to your email',
        expiresAt: expiresAt.toISOString()
      };

    } catch (error) {
      this.logger.error('Send verification code error:', error);
      return { success: false, message: 'Failed to send verification code' };
    }
  }

  /**
   * Verify email with 6-digit code
   */
  static async verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string; user?: UserPayload }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Get user and verification code
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        return { success: false, message: 'User not found' };
      }

      if (user.email_verified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Get verification code
      const { data: verificationRecord, error: codeError } = await db
        .from('email_verification_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('code', code)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (codeError || !verificationRecord) {
        return { success: false, message: 'Invalid or expired verification code' };
      }

      // Mark code as used
      await db
        .from('email_verification_codes')
        .update({ is_used: true })
        .eq('id', verificationRecord.id);

      // Mark email as verified
      await db
        .from('users')
        .update({ 
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Send welcome email
      await this.brevoService.sendWelcomeEmail(user.email, user.first_name);

      const userPayload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: true,
        userState: this.getUserState({ ...user, email_verified: true }),
        kycStatus: user.kyc_status || 'pending'
      };

      this.logger.info(`Email verified successfully for ${email}`);

      return {
        success: true,
        message: 'Email verified successfully',
        user: userPayload
      };

    } catch (error) {
      this.logger.error('Email verification error:', error);
      return { success: false, message: 'Email verification failed' };
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Check if user exists
      const { data: user, error: userError } = await db
        .from('users')
        .select('id, first_name, email')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        // Don't reveal if user exists or not for security
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent' };
      }

      // Check for recent reset attempts (rate limiting)
      const { data: recentReset } = await db
        .from('password_reset_tokens')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('is_used', false)
        .gte('created_at', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
        .single();

      if (recentReset) {
        return { success: false, message: 'Please wait before requesting another password reset' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await db
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          is_used: false
        });

      // Send password reset email
      await this.brevoService.sendPasswordResetEmail(user.email, resetToken);

      this.logger.info(`Password reset requested for ${email}`);

      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      };

    } catch (error) {
      this.logger.error('Password reset request error:', error);
      return { success: false, message: 'Failed to process password reset request' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = DatabaseService.getInstance().getClient();

      // Validate password strength
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message };
      }

      // Get reset token
      const { data: resetRecord, error: tokenError } = await db
        .from('password_reset_tokens')
        .select(`
          *,
          users (*)
        `)
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetRecord) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      const user = resetRecord.users;

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', user.id);

      // Mark token as used
      await db
        .from('password_reset_tokens')
        .update({ is_used: true })
        .eq('id', resetRecord.id);

      // Invalidate all user sessions for security
      await db
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      this.logger.info(`Password reset successfully for user ${user.email}`);

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      this.logger.error('Password reset error:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  /**
   * Send verification email (legacy method for registration)
   */
  private static async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    try {
      const db = DatabaseService.getInstance().getClient();
      
      // Get user ID for storing verification code
      const { data: user } = await db
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      
      if (user) {
        // Generate 6-digit code instead of token for new flow
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        // Store verification code in database
        await db
          .from('email_verification_codes')
          .insert({
            user_id: user.id,
            code: verificationCode,
            expires_at: expiresAt.toISOString(),
            is_used: false
          });
        
        // Send via Brevo
        await this.brevoService.sendEmailVerificationCode(email, firstName, verificationCode);
      }
      
      this.logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
    }
  }
}