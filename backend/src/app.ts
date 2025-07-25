import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import tournamentRoutes from './routes/tournament.routes';
import tradingRoutes from './routes/trading.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhook.routes';

// Import services
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { Logger } from './utils/logger';
import { EnvironmentValidator } from './utils/env-validator';
import { StartupValidator } from './utils/startup-validator';
import { swaggerSpec } from './config/swagger.config';

class DaytradeServer {
  private app: Application;
  private port: number;
  private logger: Logger;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.logger = new Logger('DaytradeServer');
    
    this.validateEnvironment();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private validateEnvironment(): void {
    try {
      EnvironmentValidator.validateRequired();
      EnvironmentValidator.validateFormat();
      this.logger.info('Environment validation passed');
    } catch (error) {
      this.logger.error('Environment validation failed:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Logging
    if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    this.app.use(rateLimitMiddleware);
  }

  private initializeRoutes(): void {
    // API Documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/tournaments', tournamentRoutes);
    this.app.use('/api/trading', tradingRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/webhooks', webhookRoutes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Dayrade Trading Tournament Platform API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health'
      });
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      this.logger.info('Starting Dayrade API server...');

      // Validate startup requirements
      await StartupValidator.validateDatabaseConnection();
      this.logger.info('Database connection validated');

      await StartupValidator.validateRedisConnection();
      this.logger.info('Redis connection validated');

      // Test external services (non-blocking)
      StartupValidator.validateExternalServices().catch(error => {
        this.logger.warn('Some external services may not be available:', error.message);
      });

      // Start server
      this.app.listen(this.port, () => {
        this.logger.info(`🚀 Dayrade API server running on port ${this.port}`);
        this.logger.info(`📖 Environment: ${process.env.NODE_ENV}`);
        this.logger.info(`🏥 Health check: http://localhost:${this.port}/health`);
        this.logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
      });

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server if this file is run directly
if (require.main === module) {
  const server = new DaytradeServer();
  server.start();
}

export default DaytradeServer;