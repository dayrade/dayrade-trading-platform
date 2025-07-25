import { PrismaClient, User, UserRole, KycStatus, Prisma } from '../types/database.types';
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('UserRepository');

export interface CreateUserData {
  email: string;
  username?: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  country?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  country?: string;
  timezone?: string;
  avatarUrl?: string;
  role?: UserRole;
  kycStatus?: KycStatus;
  kycApprovedAt?: Date;
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  isActive?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string | null;
  zimtraId?: string;
  zimtraUsername?: string;
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: userData,
      });
      
      logger.info(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(`Failed to find user by ID ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error(`Failed to find user by email ${email}:`, error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      logger.error(`Failed to find user by username ${username}:`, error);
      throw error;
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: userData,
      });
      
      logger.info(`User updated successfully: ${id}`);
      return user;
    } catch (error) {
      logger.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      
      logger.info(`User deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  } = {}): Promise<User[]> {
    try {
      return await this.prisma.user.findMany(options);
    } catch (error) {
      logger.error('Failed to find users:', error);
      throw error;
    }
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      return await this.prisma.user.count({ where });
    } catch (error) {
      logger.error('Failed to count users:', error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<User> {
    try {
      return await this.update(id, { lastLoginAt: new Date() });
    } catch (error) {
      logger.error(`Failed to update last login for user ${id}:`, error);
      throw error;
    }
  }

  async verifyEmail(id: string): Promise<User> {
    try {
      return await this.update(id, { 
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
    } catch (error) {
      logger.error(`Failed to verify email for user ${id}:`, error);
      throw error;
    }
  }

  async activateUser(id: string): Promise<User> {
    try {
      return await this.update(id, { 
        isActive: true,
        isSuspended: false,
        suspensionReason: null
      });
    } catch (error) {
      logger.error(`Failed to activate user ${id}:`, error);
      throw error;
    }
  }

  async suspendUser(id: string, reason?: string): Promise<User> {
    try {
      return await this.update(id, { 
        isSuspended: true,
        suspensionReason: reason
      });
    } catch (error) {
      logger.error(`Failed to suspend user ${id}:`, error);
      throw error;
    }
  }

  async deactivateUser(id: string): Promise<User> {
    try {
      return await this.update(id, { isActive: false });
    } catch (error) {
      logger.error(`Failed to deactivate user ${id}:`, error);
      throw error;
    }
  }

  async findActiveUsers(): Promise<User[]> {
    try {
      return await this.findMany({
        where: { 
          isActive: true,
          isSuspended: false
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find active users:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
          isActive: true,
          isSuspended: false,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error(`Failed to search users with term "${searchTerm}":`, error);
      throw error;
    }
  }

  async updateKycStatus(id: string, status: KycStatus): Promise<User> {
    try {
      const updateData: UpdateUserData = { kycStatus: status };
      
      if (status === KycStatus.APPROVED) {
        updateData.kycApprovedAt = new Date();
      }
      
      return await this.update(id, updateData);
    } catch (error) {
      logger.error(`Failed to update KYC status for user ${id}:`, error);
      throw error;
    }
  }

  async findByZimtraId(zimtraId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { zimtraId },
      });
    } catch (error) {
      logger.error(`Failed to find user by Zimtra ID ${zimtraId}:`, error);
      throw error;
    }
  }

  async updateZimtraInfo(id: string, zimtraId: string, zimtraUsername?: string): Promise<User> {
    try {
      return await this.update(id, { 
        zimtraId,
        zimtraUsername
      });
    } catch (error) {
      logger.error(`Failed to update Zimtra info for user ${id}:`, error);
      throw error;
    }
  }
}