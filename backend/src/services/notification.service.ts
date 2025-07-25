import { PrismaClient, NotificationType, Notification } from '../types/database.types';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('NotificationService');

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  expiresAt?: Date;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export class NotificationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          data: data.data,
          expiresAt: data.expiresAt
        }
      });

      logger.info(`Notification created for user ${data.userId}: ${data.title}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getNotifications(filters: NotificationFilters): Promise<Notification[]> {
    try {
      const { userId, type, isRead, limit = 50, offset = 0 } = filters;

      const where: any = {};
      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;

      return await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      logger.error('Failed to get notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error(`Failed to mark notification as read: ${notificationId}`, error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      logger.info(`Marked ${result.count} notifications as read for user ${userId}`);
      return result.count;
    } catch (error) {
      logger.error(`Failed to mark all notifications as read for user ${userId}:`, error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });
    } catch (error) {
      logger.error(`Failed to get unread count for user ${userId}:`, error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.prisma.notification.delete({
        where: { id: notificationId }
      });

      logger.info(`Notification deleted: ${notificationId}`);
    } catch (error) {
      logger.error(`Failed to delete notification: ${notificationId}`, error);
      throw error;
    }
  }

  // Tournament-specific notification methods
  async notifyTournamentRegistration(userId: string, tournamentName: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Tournament Registration Confirmed',
      message: `You have successfully registered for ${tournamentName}`,
      type: NotificationType.TOURNAMENT_REGISTRATION
    });
  }

  async notifyTournamentStart(userId: string, tournamentName: string): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Tournament Started',
      message: `${tournamentName} has started. Good luck!`,
      type: NotificationType.TOURNAMENT_START
    });
  }

  async notifyTournamentEnd(userId: string, tournamentName: string, finalRank?: number): Promise<void> {
    const message = finalRank 
      ? `${tournamentName} has ended. Your final rank: #${finalRank}`
      : `${tournamentName} has ended. Check your final results!`;

    await this.createNotification({
      userId,
      title: 'Tournament Completed',
      message,
      type: NotificationType.TOURNAMENT_END,
      data: { finalRank }
    });
  }

  async notifyRankChange(userId: string, tournamentName: string, newRank: number, oldRank?: number): Promise<void> {
    const message = oldRank 
      ? `Your rank in ${tournamentName} changed from #${oldRank} to #${newRank}`
      : `Your current rank in ${tournamentName}: #${newRank}`;

    await this.createNotification({
      userId,
      title: 'Rank Update',
      message,
      type: NotificationType.RANK_CHANGE,
      data: { newRank, oldRank, tournamentName }
    });
  }

  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await this.prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      logger.info(`Cleaned up ${result.count} expired notifications`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup expired notifications:', error);
      throw error;
    }
  }
}