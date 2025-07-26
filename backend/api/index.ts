import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { DatabaseService } from '../src/services/database.service';
import { RedisService } from '../src/services/redis.service';
import { Logger } from '../src/utils/logger';
import { errorHandler } from '../src/middleware/error.middleware';
import { rateLimitMiddleware } from '../src/middleware/rate-limit.middleware';

// Import routes
import authRoutes from '../src/routes/auth.routes';
import tournamentRoutes from '../src/routes/tournament.routes';
import tradingRoutes from '../src/routes/trading.routes';
import adminRoutes from '../src/routes/admin.routes';
import webhookRoutes from '../src/routes/webhook.routes';
import zimtraRoutes from '../src/routes/zimtra.routes';
import chatRoutes from '../src/routes/chat.routes';
import dashboardRoutes from '../src/routes/dashboard.routes';

const logger = new Logger('VercelApp');

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
          ? 'https://your-backend-deployment.vercel.app' 
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
  },
  apis: ['../src/routes/*.ts', '../src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:8080', 'https://your-frontend-deployment.vercel.app'],
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

// Initialize services for Vercel
async function initializeServices() {
  try {
    // Initialize database service
    await DatabaseService.initialize();
    logger.info('Database service initialized');
    
    // Initialize Redis service (optional)
    try {
      await RedisService.initialize();
      logger.info('Redis service initialized');
    } catch (error) {
      logger.warn('Redis service not available, continuing without Redis:', error);
    }
  } catch (error) {
    logger.error('Failed to initialize services:', error);
  }
}

// Initialize services on cold start
initializeServices();

export default app;