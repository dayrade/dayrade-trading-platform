// Authentication service layer for Dayrade platform
import { supabase } from '@/lib/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/api';

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate user with Supabase
   */
  async signIn(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Placeholder: Fetch additional user profile data
      const userProfile = await this.fetchUserProfile(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          role: userProfile.role || 'user',
          kycStatus: userProfile.kycStatus || 'pending',
          createdAt: userProfile.createdAt || new Date().toISOString(),
          updatedAt: userProfile.updatedAt || new Date().toISOString(),
          zimtraId: userProfile.zimtraId,
        },
        session: {
          access_token: data.session!.access_token,
          refresh_token: data.session!.refresh_token,
          expires_at: data.session!.expires_at!,
        },
      };
    } catch (error: any) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  /**
   * Register new user with Supabase
   */
  async signUp(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            zimtra_username: userData.zimtraUsername,
          },
        },
      });

      if (error) throw error;

      // Placeholder: Create user profile in custom tables
      await this.createUserProfile({
        id: data.user!.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        zimtraUsername: userData.zimtraUsername,
      });

      return {
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'user',
          kycStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          access_token: data.session!.access_token,
          refresh_token: data.session!.refresh_token,
          expires_at: data.session!.expires_at!,
        },
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get session');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      const userProfile = await this.fetchUserProfile(data.user!.id);

      return {
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          role: userProfile.role || 'user',
          kycStatus: userProfile.kycStatus || 'pending',
          createdAt: userProfile.createdAt || new Date().toISOString(),
          updatedAt: userProfile.updatedAt || new Date().toISOString(),
          zimtraId: userProfile.zimtraId,
        },
        session: {
          access_token: data.session!.access_token,
          refresh_token: data.session!.refresh_token,
          expires_at: data.session!.expires_at!,
        },
      };
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Password update failed');
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: (await this.getCurrentSession())?.user.email!,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  /**
   * Fetch user profile from custom tables
   */
  private async fetchUserProfile(userId: string): Promise<Partial<User>> {
    try {
      // Placeholder: Query custom user profile table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        firstName: '',
        lastName: '',
        role: 'user' as const,
        kycStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      return {
        firstName: '',
        lastName: '',
        role: 'user',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Create user profile in custom tables
   */
  private async createUserProfile(profileData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    zimtraUsername?: string;
  }): Promise<void> {
    try {
      // Placeholder: Insert into custom user profile table
      const { error } = await supabase
        .from('users')
        .insert({
          id: profileData.id,
          email: profileData.email,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          zimtra_username: profileData.zimtraUsername,
          role: 'user',
          kyc_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Placeholder: Create initial user settings and preferences
      await this.createInitialUserSettings(profileData.id);

      // Placeholder: Initialize rewards/referral system
      await this.initializeUserRewards(profileData.id);

    } catch (error: any) {
      console.error('Failed to create user profile:', error);
      // Don't throw here to avoid breaking registration flow
    }
  }

  /**
   * Create initial user settings
   */
  private async createInitialUserSettings(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          notification_preferences: {
            email: true,
            push: true,
            tournament_updates: true,
            trade_alerts: true,
            prize_notifications: true,
            marketing_emails: false,
          },
          ui_preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'auto',
          },
          privacy_settings: {
            profile_visibility: 'public',
            show_trading_stats: true,
            show_social_links: true,
          },
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to create user settings:', error);
    }
  }

  /**
   * Initialize user rewards system
   */
  private async initializeUserRewards(userId: string): Promise<void> {
    try {
      // Generate unique referral code
      const referralCode = this.generateReferralCode();

      const { error } = await supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          current_tier: 0,
          tier_progress: {},
          tasks_completed: {},
          affiliate_code: referralCode,
          referral_count: 0,
          commissions_earned: 0,
          rewards_earned: {},
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to initialize user rewards:', error);
    }
  }

  /**
   * Generate unique referral code
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if user has required permissions
   */
  async hasPermission(requiredRole: 'user' | 'moderator' | 'admin'): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return false;

      const userProfile = await this.fetchUserProfile(session.user.id);
      
      const roles = ['user', 'moderator', 'admin'];
      const userRoleIndex = roles.indexOf(userProfile.role || 'user');
      const requiredRoleIndex = roles.indexOf(requiredRole);

      return userRoleIndex >= requiredRoleIndex;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const session = await this.getCurrentSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        kycStatus: data.kyc_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  /**
   * Handle auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = AuthService.getInstance();