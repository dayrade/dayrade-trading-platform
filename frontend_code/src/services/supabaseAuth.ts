import { supabase } from '@/lib/api';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

export interface AuthResponse {
  user: User;
  session: any;
}

export interface SupabaseAuthService {
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  initiateKyc: () => Promise<any>;
  getKycStatus: () => Promise<any>;
  submitKycVerification: (documents: FormData) => Promise<any>;
}

// Brevo email service for authentication events
const sendBrevoEmail = async (templateId: number, email: string, params: any = {}) => {
  try {
    // This would integrate with your Brevo API
    // For now, we'll log the email event
    console.log(`Sending Brevo email template ${templateId} to ${email}`, params);
    
    // TODO: Implement actual Brevo API call
    // const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'api-key': process.env.BREVO_API_KEY,
    //   },
    //   body: JSON.stringify({
    //     templateId,
    //     to: [{ email }],
    //     params,
    //   }),
    // });
  } catch (error) {
    console.error('Failed to send Brevo email:', error);
  }
};

export const supabaseAuthService: SupabaseAuthService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    // Get user profile from our custom table
    const profile = await this.getProfile();

    // Send login notification email
    await sendBrevoEmail(1, credentials.email, {
      firstName: profile.firstName,
      loginTime: new Date().toISOString(),
    });

    return {
      user: profile,
      session: data.session,
    };
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // First, create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    // Create user profile in our custom table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    const user: User = {
      id: profileData.id,
      email: profileData.email,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      role: profileData.role,
      kycStatus: 'pending',
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    // Send welcome email
    await sendBrevoEmail(2, userData.email, {
      firstName: userData.firstName,
      verificationLink: `${window.location.origin}/verify-email?token=${data.session?.access_token}`,
    });

    return {
      user,
      session: data.session,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getProfile(): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: profileData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: profileData.id,
      email: profileData.email,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      role: profileData.role,
      isEmailVerified: user.email_confirmed_at ? true : false,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const updateData: any = {};
    if (profileData.firstName) updateData.first_name = profileData.firstName;
    if (profileData.lastName) updateData.last_name = profileData.lastName;
    if (profileData.email) updateData.email = profileData.email;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      isEmailVerified: user.email_confirmed_at ? true : false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Send password change notification
    const profile = await this.getProfile();
    await sendBrevoEmail(3, profile.email, {
      firstName: profile.firstName,
      changeTime: new Date().toISOString(),
    });
  },

  async sendEmailVerification(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Send verification reminder email
    await sendBrevoEmail(4, email, {
      verificationLink: `${window.location.origin}/verify-email`,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Send password reset email
    await sendBrevoEmail(5, email, {
      resetLink: `${window.location.origin}/reset-password`,
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Send password reset confirmation
    const profile = await this.getProfile();
    await sendBrevoEmail(6, profile.email, {
      firstName: profile.firstName,
      resetTime: new Date().toISOString(),
    });
  },

  async initiateKyc(): Promise<any> {
    // KYC implementation would depend on your KYC provider
    // For now, return a placeholder
    return { status: 'initiated' };
  },

  async getKycStatus(): Promise<any> {
    // KYC status implementation
    return { status: 'pending' };
  },

  async submitKycVerification(documents: FormData): Promise<any> {
    // KYC document submission implementation
    return { status: 'submitted' };
  },
};

export default supabaseAuthService;