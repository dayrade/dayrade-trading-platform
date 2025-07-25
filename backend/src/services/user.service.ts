import { UserRepository, CreateUserData, UpdateUserData } from '../repositories/user.repository';
import { ZimtraService, CreateAccountRequest } from '../integrations/zimtra.service';
import { GetStreamService } from '../integrations/getstream.service';
import { BrevoService } from '../integrations/brevo.service';
import { Logger } from '../utils/logger';
import { User, KycStatus } from '../types/database.types';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const logger = new Logger('UserService');

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  country: string;
  acceptedTerms: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  role: string;
  zimtraId?: string;
  zimtraUsername?: string;
  kycStatus: string;
  kycApprovedAt: Date | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  country?: string;
  timezone: string;
  dateOfBirth: Date | null;
  phoneNumber?: string;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCData {
  documentType: 'passport' | 'driving_license' | 'national_id';
  documentNumber: string;
  documentImages: string[];
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  proofOfAddress?: string;
}

export class UserService {
  private userRepository: UserRepository;
  private zimtraService: ZimtraService;
  private getStreamService: GetStreamService;
  private brevoService: BrevoService;

  constructor() {
    this.userRepository = new UserRepository();
    this.zimtraService = new ZimtraService();
    this.getStreamService = new GetStreamService();
    this.brevoService = new BrevoService();
  }

  // Authentication
  async register(data: RegisterData): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    try {
      // Validate registration data
      await this.validateRegistrationData(data);

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create Zimtra account
      const zimtraAccountData: CreateAccountRequest = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.email, // Use email as username for now
        accountType: 'sim', // Default to simulation account
      };
      
      const zimtraAccount = await this.zimtraService.createAccount(zimtraAccountData);

      // Create user in database
      const userData: CreateUserData = {
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber,
        country: data.country,
      };

      const user = await this.userRepository.create(userData);

      // Update user with Zimtra details
      await this.userRepository.update(user.id, {
        zimtraId: zimtraAccount.id,
        zimtraUsername: zimtraAccount.username,
      });

      // Create GetStream user
      await this.getStreamService.createUser({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      });

      // Create Brevo contact
      await this.brevoService.createContact({
        email: user.email,
        attributes: {
          COUNTRY: user.country,
          KYC_STATUS: user.kycStatus,
        },
      });

      // Send welcome email
      await this.brevoService.sendWelcomeEmail(user.email, user.firstName || 'User');

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`User registered successfully: ${user.id}`);

      return {
        user: this.mapToUserProfile(user),
        tokens,
      };
    } catch (error) {
      logger.error('Failed to register user:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`User logged in successfully: ${user.id}`);

      return {
        user: this.mapToUserProfile(user),
        tokens,
      };
    } catch (error) {
      logger.error('Failed to login user:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Failed to logout user:', error);
      throw error;
    }
  }

  // Profile Management
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return this.mapToUserProfile(user);
    } catch (error) {
      logger.error(`Failed to get user profile: ${userId}`, error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: Partial<UpdateUserData>): Promise<UserProfile> {
    try {
      const user = await this.userRepository.update(userId, data);

      // Update GetStream user if name changed
      if (data.firstName || data.lastName) {
        await this.getStreamService.updateUser(userId, {
          name: `${user.firstName} ${user.lastName}`,
        });
      }

      // Update Brevo contact
      await this.brevoService.updateContact(user.email, {
        attributes: {
          COUNTRY: user.country,
          KYC_STATUS: user.kycStatus,
        },
      });

      logger.info(`User profile updated: ${userId}`);

      return this.mapToUserProfile(user);
    } catch (error) {
      logger.error(`Failed to update user profile: ${userId}`, error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.userRepository.update(userId, {
        passwordHash: hashedNewPassword,
      });

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to change password for user: ${userId}`, error);
      throw error;
    }
  }

  // KYC Management
  async submitKYC(userId: string, kycData: KYCData): Promise<UserProfile> {
    try {
      // Update KYC status to under review
      const user = await this.userRepository.update(userId, {
        kycStatus: KycStatus.IN_REVIEW,
      });

      // Update Brevo contact
      await this.brevoService.updateContact(user.email, {
        attributes: {
          KYC_STATUS: 'IN_REVIEW',
        },
      });

      logger.info(`KYC submitted for user: ${userId}`);

      return this.mapToUserProfile(user);
    } catch (error) {
      logger.error(`Failed to submit KYC for user: ${userId}`, error);
      throw error;
    }
  }

  async approveKYC(userId: string): Promise<UserProfile> {
    try {
      const user = await this.userRepository.update(userId, {
        kycStatus: KycStatus.APPROVED,
        kycApprovedAt: new Date(),
      });

      // Update Brevo contact
      await this.brevoService.updateContact(user.email, {
        attributes: {
          KYC_STATUS: 'APPROVED',
        },
      });

      // Send KYC approval email
      await this.brevoService.sendKycApprovalEmail(user.email, user.firstName || '');

      logger.info(`KYC approved for user: ${userId}`);

      return this.mapToUserProfile(user);
    } catch (error) {
      logger.error(`Failed to approve KYC for user: ${userId}`, error);
      throw error;
    }
  }

  async rejectKYC(userId: string, reason: string): Promise<UserProfile> {
    try {
      const user = await this.userRepository.update(userId, {
        kycStatus: KycStatus.REJECTED,
      });

      // Update Brevo contact
      await this.brevoService.updateContact(user.email, {
        attributes: {
          KYC_STATUS: 'REJECTED',
        },
      });

      logger.info(`KYC rejected for user: ${userId}`);

      return this.mapToUserProfile(user);
    } catch (error) {
      logger.error(`Failed to reject KYC for user: ${userId}`, error);
      throw error;
    }
  }

  // Account Management
  async deactivateAccount(userId: string): Promise<void> {
    try {
      await this.userRepository.update(userId, {
        isActive: false,
      });

      // Deactivate GetStream user
      await this.getStreamService.deleteUser(userId);

      logger.info(`Account deactivated: ${userId}`);
    } catch (error) {
      logger.error(`Failed to deactivate account: ${userId}`, error);
      throw error;
    }
  }

  async reactivateAccount(userId: string): Promise<UserProfile> {
    try {
      const user = await this.userRepository.update(userId, {
        isActive: true,
      });

      // Reactivate GetStream user
      await this.getStreamService.createUser({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      });

      logger.info(`Account reactivated: ${userId}`);

      return this.mapToUserProfile(user);
    } catch (error) {
      logger.error(`Failed to reactivate account: ${userId}`, error);
      throw error;
    }
  }

  // Utility methods
  private async validateRegistrationData(data: RegisterData): Promise<void> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate age (must be 18+)
    const age = new Date().getFullYear() - data.dateOfBirth.getFullYear();
    if (age < 18) {
      throw new Error('Must be 18 years or older to register');
    }

    // Validate terms acceptance
    if (!data.acceptedTerms) {
      throw new Error('Must accept terms and conditions');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  private mapToUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      avatarUrl: user.avatarUrl || '',
      role: user.role,
      zimtraId: user.zimtraId || undefined,
      zimtraUsername: user.zimtraUsername || undefined,
      kycStatus: user.kycStatus,
      kycApprovedAt: user.kycApprovedAt,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      country: user.country || undefined,
      timezone: user.timezone || '',
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber || undefined,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      suspensionReason: user.suspensionReason || '',
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}