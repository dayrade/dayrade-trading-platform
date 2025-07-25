import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Logger } from '../utils/logger';
import { ActivityScore, ActivityHeatmapData } from './activity-detection.service';

const logger = new Logger('WebSocketService');

export interface HeatmapUpdate {
  type: 'activity_update' | 'heatmap_refresh' | 'trader_status';
  traderId?: string;
  data: any;
  timestamp: string;
}

export interface ConnectedClient {
  id: string;
  userId?: string;
  subscribedTraders: Set<string>;
  joinedAt: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    if (this.isInitialized) {
      logger.warn('WebSocket service already initialized');
      return;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.isInitialized = true;
    
    logger.info('WebSocket service initialized successfully');
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Register new client
      const client: ConnectedClient = {
        id: socket.id,
        subscribedTraders: new Set(),
        joinedAt: new Date().toISOString()
      };
      this.connectedClients.set(socket.id, client);

      // Handle user authentication
      socket.on('authenticate', (data: { userId: string, token?: string }) => {
        try {
          // TODO: Validate token if needed
          const client = this.connectedClients.get(socket.id);
          if (client) {
            client.userId = data.userId;
            logger.info(`Client ${socket.id} authenticated as user ${data.userId}`);
          }
        } catch (error) {
          logger.error(`Authentication failed for client ${socket.id}:`, error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      // Handle trader subscription
      socket.on('subscribe_trader', (data: { traderId: string }) => {
        try {
          const client = this.connectedClients.get(socket.id);
          if (client) {
            client.subscribedTraders.add(data.traderId);
            socket.join(`trader_${data.traderId}`);
            logger.info(`Client ${socket.id} subscribed to trader ${data.traderId}`);
            
            // Send current status if available
            this.sendCurrentTraderStatus(socket.id, data.traderId);
          }
        } catch (error) {
          logger.error(`Failed to subscribe client ${socket.id} to trader ${data.traderId}:`, error);
        }
      });

      // Handle trader unsubscription
      socket.on('unsubscribe_trader', (data: { traderId: string }) => {
        try {
          const client = this.connectedClients.get(socket.id);
          if (client) {
            client.subscribedTraders.delete(data.traderId);
            socket.leave(`trader_${data.traderId}`);
            logger.info(`Client ${socket.id} unsubscribed from trader ${data.traderId}`);
          }
        } catch (error) {
          logger.error(`Failed to unsubscribe client ${socket.id} from trader ${data.traderId}:`, error);
        }
      });

      // Handle heatmap data request
      socket.on('request_heatmap', (data: { traderId: string, hours?: number }) => {
        try {
          this.handleHeatmapRequest(socket.id, data.traderId, data.hours);
        } catch (error) {
          logger.error(`Failed to handle heatmap request from client ${socket.id}:`, error);
        }
      });

      // Handle activity status request
      socket.on('request_activity_status', () => {
        try {
          this.sendActivityStatus(socket.id);
        } catch (error) {
          logger.error(`Failed to send activity status to client ${socket.id}:`, error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
        this.connectedClients.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for client ${socket.id}:`, error);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Dayrade Activity Heatmap Service',
        clientId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Handle server errors
    this.io.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });
  }

  /**
   * Broadcast activity update to subscribed clients
   */
  broadcastActivityUpdate(activityScores: ActivityScore[]): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    try {
      for (const score of activityScores) {
        const update: HeatmapUpdate = {
          type: 'activity_update',
          traderId: score.traderId,
          data: {
            activityLevel: score.activityLevel,
            tradingVolume: score.tradingVolume,
            tradeFrequency: score.tradeFrequency,
            portfolioChanges: score.portfolioChanges,
            color: this.getActivityColor(score.activityLevel),
            timestamp: score.timestamp
          },
          timestamp: new Date().toISOString()
        };

        // Broadcast to all clients subscribed to this trader
        this.io.to(`trader_${score.traderId}`).emit('activity_update', update);
      }

      logger.info(`Broadcasted activity updates for ${activityScores.length} traders`);
    } catch (error) {
      logger.error('Failed to broadcast activity update:', error);
    }
  }

  /**
   * Broadcast heatmap refresh to all clients
   */
  broadcastHeatmapRefresh(heatmapData: ActivityHeatmapData[]): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    try {
      for (const data of heatmapData) {
        const update: HeatmapUpdate = {
          type: 'heatmap_refresh',
          traderId: data.traderId,
          data: {
            timeSlots: data.timeSlots,
            summary: data.summary
          },
          timestamp: new Date().toISOString()
        };

        // Broadcast to all clients subscribed to this trader
        this.io.to(`trader_${data.traderId}`).emit('heatmap_refresh', update);
      }

      logger.info(`Broadcasted heatmap refresh for ${heatmapData.length} traders`);
    } catch (error) {
      logger.error('Failed to broadcast heatmap refresh:', error);
    }
  }

  /**
   * Send current trader status to a specific client
   */
  private async sendCurrentTraderStatus(clientId: string, traderId: string): Promise<void> {
    try {
      // This would typically fetch current status from ActivityDetectionService
      // For now, we'll send a placeholder response
      const socket = this.io?.sockets.sockets.get(clientId);
      if (socket) {
        socket.emit('trader_status', {
          traderId,
          status: 'active',
          lastUpdate: new Date().toISOString(),
          message: 'Subscribed to trader activity updates'
        });
      }
    } catch (error) {
      logger.error(`Failed to send trader status to client ${clientId}:`, error);
    }
  }

  /**
   * Handle heatmap data request
   */
  private async handleHeatmapRequest(clientId: string, traderId: string, hours: number = 24): Promise<void> {
    try {
      // This would typically fetch data from ActivityDetectionService
      // For now, we'll send a placeholder response
      const socket = this.io?.sockets.sockets.get(clientId);
      if (socket) {
        socket.emit('heatmap_data', {
          traderId,
          hours,
          message: 'Heatmap data request received',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error(`Failed to handle heatmap request for client ${clientId}:`, error);
    }
  }

  /**
   * Send activity status to a specific client
   */
  private async sendActivityStatus(clientId: string): Promise<void> {
    try {
      const socket = this.io?.sockets.sockets.get(clientId);
      if (socket) {
        const status = {
          connectedClients: this.connectedClients.size,
          activeTraders: Array.from(new Set(
            Array.from(this.connectedClients.values())
              .flatMap(client => Array.from(client.subscribedTraders))
          )),
          timestamp: new Date().toISOString()
        };

        socket.emit('activity_status', status);
      }
    } catch (error) {
      logger.error(`Failed to send activity status to client ${clientId}:`, error);
    }
  }

  /**
   * Get activity color based on level
   */
  private getActivityColor(activityLevel: number): string {
    if (activityLevel >= 0.8) return '#22c55e'; // High activity - green
    if (activityLevel >= 0.6) return '#84cc16'; // Medium-high activity - lime
    if (activityLevel >= 0.4) return '#eab308'; // Medium activity - yellow
    if (activityLevel >= 0.2) return '#f97316'; // Low-medium activity - orange
    return '#6b7280'; // Low/no activity - gray
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    const socket = this.io.sockets.sockets.get(clientId);
    if (socket) {
      socket.emit(event, data);
    } else {
      logger.warn(`Client ${clientId} not found`);
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized');
      return;
    }

    this.io.emit(event, data);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get connected clients info
   */
  getConnectedClientsInfo(): ConnectedClient[] {
    return Array.from(this.connectedClients.values());
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Shutdown WebSocket service
   */
  shutdown(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.connectedClients.clear();
    this.isInitialized = false;
    logger.info('WebSocket service shutdown');
  }
}