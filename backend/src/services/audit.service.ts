import { PrismaClient, AuditLog } from '../types/database.types';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

const logger = new Logger('AuditService');

export interface CreateAuditLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getPrismaClient();
  }

  async logAction(data: CreateAuditLogData): Promise<AuditLog> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          oldValues: data.oldValues,
          newValues: data.newValues,
          metadata: data.metadata
        }
      });

      logger.info(`Audit log created: ${data.action} on ${data.entityType}`);
      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      throw error;
    }
  }

  async getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]> {
    try {
      const { 
        userId, 
        action, 
        entityType, 
        entityId, 
        startDate, 
        endDate, 
        limit = 100, 
        offset = 0 
      } = filters;

      const where: any = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      return await this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  // Specific audit methods for common actions
  async logUserAction(userId: string, action: string, entityType: string, entityId?: string, metadata?: any): Promise<void> {
    await this.logAction({
      userId,
      action,
      entityType,
      entityId,
      metadata
    });
  }

  async logTournamentAction(userId: string, action: string, tournamentId: string, oldValues?: any, newValues?: any): Promise<void> {
    await this.logAction({
      userId,
      action,
      entityType: 'tournament',
      entityId: tournamentId,
      oldValues,
      newValues
    });
  }

  async logTradeAction(userId: string, action: string, tradeId: string, metadata?: any): Promise<void> {
    await this.logAction({
      userId,
      action,
      entityType: 'trade',
      entityId: tradeId,
      metadata
    });
  }

  async logAuthAction(userId: string | undefined, action: string, ipAddress?: string, userAgent?: string, metadata?: any): Promise<void> {
    await this.logAction({
      userId,
      action,
      entityType: 'auth',
      ipAddress,
      userAgent,
      metadata
    });
  }

  async logSystemAction(action: string, entityType: string, entityId?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action,
      entityType,
      entityId,
      metadata
    });
  }

  async getUserActivitySummary(userId: string, days: number = 30): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActions: AuditLog[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await this.getAuditLogs({
        userId,
        startDate,
        limit: 1000
      });

      const actionsByType: Record<string, number> = {};
      logs.forEach(log => {
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      });

      return {
        totalActions: logs.length,
        actionsByType,
        recentActions: logs.slice(0, 10)
      };
    } catch (error) {
      logger.error(`Failed to get user activity summary for ${userId}:`, error);
      throw error;
    }
  }

  async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      logger.info(`Cleaned up ${result.count} old audit logs`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old audit logs:', error);
      throw error;
    }
  }
}