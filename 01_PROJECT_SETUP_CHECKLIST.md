# Task 01: Project Setup and Initial Configuration

**Task ID:** DAYRADE-001  
**Priority:** Critical  
**Dependencies:** None  
**Estimated Duration:** 2-3 hours  
**Tray.ai Tools Required:** File System, Terminal, Web Search, Preview  

## 🎯 Task Objective

Establish the complete project foundation for the Dayrade Trading Tournament Platform backend infrastructure. This task creates the initial Node.js + Express.js project structure, installs all required dependencies, configures environment variables, and sets up the development environment for subsequent implementation tasks.

## 📋 Requirement Cross-Reference Validation

This task implements the following requirements from the master PRD:

- **Backend Services Architecture**: Node.js + Express.js API server setup
- **Database Integration**: PostgreSQL with Supabase client configuration
- **External Service Preparation**: Environment setup for Zimtra, TicketSource, GetStream.io, and Brevo
- **Authentication Foundation**: JWT token infrastructure preparation
- **Development Environment**: Local development server with hot reload

## 🔧 Complete Implementation Specification

### **Step 1.1: Initialize Node.js Project**

Create a new Node.js project with TypeScript support and configure the basic project structure.

```bash
# Initialize new Node.js project
npm init -y

# Install TypeScript and development dependencies
npm install -D typescript @types/node ts-node nodemon
npm install -D @types/express @types/cors @types/bcryptjs @types/jsonwebtoken

# Create TypeScript configuration
npx tsc --init
```

**TypeScript Configuration (tsconfig.json):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **Step 1.2: Install Core Dependencies**

Install all required production dependencies for the complete backend implementation.

```bash
# Core server dependencies
npm install express cors helmet morgan compression
npm install bcryptjs jsonwebtoken cookie-parser

# Database and caching
npm install @supabase/supabase-js redis ioredis
npm install pg @types/pg

# External service integrations
npm install axios node-fetch
npm install ws socket.io
npm install node-cron

# Validation and utilities
npm install joi dotenv uuid
npm install @types/uuid

# Email service
npm install nodemailer @types/nodemailer

# Monitoring and logging
npm install winston pino
```

### **Step 1.3: Project Directory Structure**

Create the complete directory structure for organized development.

```
src/
├── controllers/          # Route handlers and business logic
│   ├── auth.controller.ts
│   ├── tournament.controller.ts
│   ├── trading.controller.ts
│   ├── admin.controller.ts
│   └── webhook.controller.ts
├── middleware/           # Express middleware functions
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── rate-limit.middleware.ts
├── routes/              # API route definitions
│   ├── auth.routes.ts
│   ├── tournament.routes.ts
│   ├── trading.routes.ts
│   ├── admin.routes.ts
│   └── webhook.routes.ts
├── services/            # External service integrations
│   ├── zimtra.service.ts
│   ├── ticketsource.service.ts
│   ├── getstream.service.ts
│   ├── brevo.service.ts
│   └── database.service.ts
├── models/              # Database models and schemas
│   ├── user.model.ts
│   ├── tournament.model.ts
│   ├── trading.model.ts
│   └── notification.model.ts
├── utils/               # Utility functions and helpers
│   ├── metrics.calculator.ts
│   ├── validators.ts
│   ├── formatters.ts
│   └── logger.ts
├── types/               # TypeScript type definitions
│   ├── api.types.ts
│   ├── zimtra.types.ts
│   ├── tournament.types.ts
│   └── database.types.ts
├── jobs/                # Background job processors
│   ├── zimtra.polling.job.ts
│   ├── email.queue.job.ts
│   └── leaderboard.update.job.ts
├── config/              # Configuration files
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── external-apis.config.ts
└── app.ts               # Main application entry point
```

### **Step 1.4: Environment Configuration**

Set up comprehensive environment variable configuration for all external services.

**Environment Variables (.env):**
```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/dayrade_db
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Zimtra API Configuration
ZIMTRA_API_URL=https://api.zimtra.com
ZIMTRA_API_KEY=your_zimtra_api_key
ZIMTRA_API_SECRET=your_zimtra_api_secret
ZIMTRA_WEBHOOK_SECRET=your_zimtra_webhook_secret

# TicketSource API Configuration
TICKETSOURCE_API_URL=https://api.ticketsource.co.uk
TICKETSOURCE_API_KEY=your_ticketsource_api_key
TICKETSOURCE_WEBHOOK_SECRET=your_ticketsource_webhook_secret

# GetStream.io Configuration
GETSTREAM_API_KEY=your_getstream_api_key
GETSTREAM_API_SECRET=your_getstream_api_secret
GETSTREAM_APP_ID=your_getstream_app_id

# Brevo Email Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@dayrade.com
BREVO_SENDER_NAME=Dayrade Platform

# Market Data Configuration
MARKET_DATA_API_KEY=your_market_data_api_key
MARKET_DATA_BASE_URL=https://api.marketdata.com

# Monitoring Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_TRACKING=true

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Step 1.5: Basic Express Server Setup**

Create the foundational Express.js server with essential middleware configuration.

**Main Application (src/app.ts):**
```typescript
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

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

class DaytradeServer {
  private app: Application;
  private port: number;
  private logger: Logger;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.logger = new Logger('DaytradeServer');
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
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
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/tournaments', tournamentRoutes);
    this.app.use('/api/trading', tradingRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/webhooks', webhookRoutes);

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
      // Initialize database connection
      await DatabaseService.initialize();
      this.logger.info('Database connection established');

      // Initialize Redis connection
      await RedisService.initialize();
      this.logger.info('Redis connection established');

      // Start server
      this.app.listen(this.port, () => {
        this.logger.info(`Dayrade API server running on port ${this.port}`);
        this.logger.info(`Environment: ${process.env.NODE_ENV}`);
        this.logger.info(`Health check: http://localhost:${this.port}/health`);
      });

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new DaytradeServer();
server.start();

export default DaytradeServer;
```

### **Step 1.6: Package.json Scripts Configuration**

Configure npm scripts for development, building, and deployment.

**Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean",
    "postbuild": "cp package*.json dist/",
    "db:migrate": "node dist/scripts/migrate.js",
    "db:seed": "node dist/scripts/seed.js"
  }
}
```

## ✅ Functional Validation Testing

### **Test 1.1: Server Startup Validation**

Verify that the Express server starts successfully and responds to health checks.

```bash
# Start development server
npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-07-25T10:00:00.000Z",
  "uptime": 1.234,
  "environment": "development"
}
```

### **Test 1.2: Environment Configuration Validation**

Verify that all required environment variables are properly loaded.

```typescript
// Create validation script: src/scripts/validate-env.ts
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'ZIMTRA_API_KEY',
  'TICKETSOURCE_API_KEY',
  'GETSTREAM_API_KEY',
  'BREVO_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
} else {
  console.log('All required environment variables are configured');
}
```

### **Test 1.3: Project Structure Validation**

Verify that all required directories and files are created correctly.

```bash
# Check project structure
find src -type f -name "*.ts" | head -20

# Expected output should show all TypeScript files in proper directories
```

## 🔍 Error Handling Specifications

### **Environment Variable Errors**

```typescript
// src/utils/env-validator.ts
export class EnvironmentValidator {
  static validateRequired(): void {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'ZIMTRA_API_KEY',
      'TICKETSOURCE_API_KEY',
      'GETSTREAM_API_KEY',
      'BREVO_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  static validateFormat(): void {
    // Validate URL formats
    const urls = ['DATABASE_URL', 'SUPABASE_URL', 'ZIMTRA_API_URL'];
    urls.forEach(key => {
      const value = process.env[key];
      if (value && !this.isValidUrl(value)) {
        throw new Error(`Invalid URL format for ${key}: ${value}`);
      }
    });

    // Validate port number
    const port = parseInt(process.env.PORT || '3001', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${process.env.PORT}`);
    }
  }

  private static isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}
```

### **Server Startup Errors**

```typescript
// src/utils/startup-validator.ts
export class StartupValidator {
  static async validateDatabaseConnection(): Promise<void> {
    try {
      await DatabaseService.testConnection();
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  static async validateRedisConnection(): Promise<void> {
    try {
      await RedisService.testConnection();
    } catch (error) {
      throw new Error(`Redis connection failed: ${error.message}`);
    }
  }

  static async validateExternalServices(): Promise<void> {
    const services = [
      { name: 'Zimtra', test: () => ZimtraService.healthCheck() },
      { name: 'TicketSource', test: () => TicketSourceService.healthCheck() },
      { name: 'GetStream', test: () => GetStreamService.healthCheck() },
      { name: 'Brevo', test: () => BrevoService.healthCheck() }
    ];

    for (const service of services) {
      try {
        await service.test();
      } catch (error) {
        console.warn(`${service.name} service not available: ${error.message}`);
      }
    }
  }
}
```

## 📚 Documentation Requirements

### **API Documentation Setup**

Install and configure Swagger for automatic API documentation generation.

```bash
# Install Swagger dependencies
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

**Swagger Configuration (src/config/swagger.config.ts):**
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dayrade Trading Tournament API',
      version: '1.0.0',
      description: 'Complete API documentation for the Dayrade platform',
      contact: {
        name: 'Dayrade Support',
        email: 'support@dayrade.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```

## 🎯 Explicit Completion Declaration

**Task 01 Completion Criteria:**

- [x] Node.js project initialized with TypeScript configuration
- [x] All required dependencies installed and configured
- [x] Complete project directory structure created
- [x] Environment variables configured for all external services
- [x] Express server setup with essential middleware
- [x] Health check endpoint functional
- [x] Development scripts configured
- [x] Error handling framework established
- [x] Swagger documentation setup prepared
- [x] Validation scripts created for environment and startup

**Deliverables:**
1. Functional Express.js server running on port 3001
2. Complete project structure with all required directories
3. Environment configuration template with all service placeholders
4. Health check endpoint responding correctly
5. Development workflow scripts operational

**Next Step Validation:**
Task 01 is complete and ready for Task 02 (Database Schema Implementation). The project foundation is established with proper structure, configuration, and validation mechanisms in place.

## 📞 Stakeholder Communication Template

**Status Update for Project Stakeholders:**

"Task 01 (Project Setup) has been completed successfully. The Dayrade backend foundation is now established with a fully configured Node.js + Express.js server, complete project structure, and all external service integration points prepared. The development environment is operational and ready for database schema implementation in Task 02."

**Technical Summary:**
- Express.js server operational on port 3001
- TypeScript configuration optimized for development
- All external service environment variables configured
- Health monitoring and error handling established
- Development workflow scripts functional

**Ready for Next Phase:** Database Schema Creation (Task 02)

