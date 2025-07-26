import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { Logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import tournamentRoutes from './routes/tournament.routes';
import tradingRoutes from './routes/trading.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhook.routes';
import zimtraRoutes from './routes/zimtra.routes';
import chatRoutes from './routes/chat.routes';
import dashboardRoutes from './routes/dashboard.routes';
import emailRoutes from './routes/email.routes';

const logger = new Logger('App');

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REDIS_URL',
  'JWT_SECRET',
  'ZIMTRA_API_KEY',
  'ZIMTRA_TRADE_API_URL',
  'BREVO_API_KEY',
  'GETSTREAM_API_KEY',
  'GETSTREAM_API_SECRET',
  'GETSTREAM_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dayrade Trading Tournament API',
      version: '1.0.0',
      description: 'API for the Dayrade Trading Tournament Platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.dayrade.com' 
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimitMiddleware);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    let dbStatus = 'not initialized';
    try {
      const dbService = DatabaseService.getInstance();
      await dbService.testConnection();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'not available';
    }
    
    let redisStatus = 'not available';
    try {
      const redisService = RedisService.getInstance();
      await redisService.testConnection();
      redisStatus = 'connected';
    } catch (error) {
      redisStatus = 'not available';
    }
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/zimtra', zimtraRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/email', emailRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Dayrade Trading Tournament API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    logger.info('Starting Dayrade Trading Tournament API...');
    
    // Initialize database service
    await DatabaseService.initialize();
    logger.info('Database service initialized');
    
    // Initialize Redis service (optional for development)
    try {
      await RedisService.initialize();
      logger.info('Redis service initialized');
    } catch (error) {
      logger.warn('Redis service not available, continuing without Redis:', error);
    }
    
    const port = process.env.PORT || 3001;
    
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${port}/api-docs`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    try {
      const dbService = DatabaseService.getInstance();
      await dbService.disconnect();
    } catch (error) {
      logger.warn('Database service not initialized or already disconnected');
    }
    
    try {
      const redisService = RedisService.getInstance();
      await redisService.disconnect();
    } catch (error) {
      logger.warn('Redis service not initialized or already disconnected');
    }
    
    logger.info('Services disconnected successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    try {
      const dbService = DatabaseService.getInstance();
      await dbService.disconnect();
    } catch (error) {
      logger.warn('Database service not initialized or already disconnected');
    }
    
    try {
      const redisService = RedisService.getInstance();
      await redisService.disconnect();
    } catch (error) {
      logger.warn('Redis service not initialized or already disconnected');
    }
    
    logger.info('Services disconnected successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();

export default app;