# DayTrade Tournament Backend

A comprehensive Node.js/TypeScript backend system for managing trading tournaments, participant tracking, leaderboards, and performance analytics.

## Features

### Core Tournament Management
- **Tournament Lifecycle**: Create, manage, and monitor trading tournaments
- **Participant Registration**: User registration and management system
- **Status Management**: Automated tournament status transitions
- **Division Support**: Multiple skill-based tournament divisions (Beginner, Intermediate, Advanced, Professional)

### Performance Tracking
- **Real-time Metrics**: Track trading performance in real-time
- **Performance Analytics**: Calculate Sharpe ratio, win rates, profit factors
- **Historical Data**: Maintain performance history and snapshots
- **Portfolio Tracking**: Monitor portfolio values and returns

### Leaderboard System
- **Dynamic Rankings**: Real-time participant ranking updates
- **Performance Metrics**: Comprehensive performance-based scoring
- **Historical Rankings**: Track ranking changes over time
- **Top Performers**: Identify and showcase top traders

### Notification System
- **Event-driven Notifications**: Automated notifications for key events
- **Multi-channel Support**: Email, in-app, and push notifications
- **Customizable Templates**: Flexible notification templates
- **User Preferences**: Configurable notification settings

### Security & Compliance
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and user role management
- **Audit Logging**: Comprehensive action tracking
- **Rate Limiting**: API protection against abuse (100 requests/minute)
- **Input Validation**: Robust data validation and sanitization

### Configuration Management
- **Dynamic Configuration**: Runtime configuration updates
- **Environment-specific Settings**: Development, staging, production configs
- **Feature Flags**: Toggle features without deployment
- **Caching**: Redis-based configuration caching

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT
- **Validation**: Custom validation middleware
- **Logging**: Winston logger
- **Testing**: Jest
- **Documentation**: OpenAPI/Swagger

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   ├── services/            # Business logic layer
│   │   ├── tournament.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── notification.service.ts
│   │   ├── trading-performance.service.ts
│   │   ├── audit.service.ts
│   │   └── config.service.ts
│   ├── repositories/        # Data access layer
│   ├── middleware/          # Express middleware
│   │   └── tournament.middleware.ts
│   ├── routes/             # API route definitions
│   │   └── tournament.routes.ts
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── app.ts              # Application entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── tests/                  # Test files
├── docs/                   # Documentation
│   └── api-documentation.md
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dayrade-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/dayrade"
   
   # Redis
   REDIS_URL="redis://localhost:6379"
   
   # JWT
   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN="24h"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   
   # External Services
   EMAIL_SERVICE_URL="your-email-service"
   NOTIFICATION_SERVICE_URL="your-notification-service"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## API Documentation

Comprehensive API documentation is available at `/docs/api-documentation.md`.

### Quick Start Examples

1. **Create a Tournament**
   ```bash
   curl -X POST http://localhost:3001/api/tournaments \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Weekly Trading Challenge",
       "startDate": "2024-01-15T09:00:00Z",
       "endDate": "2024-01-22T17:00:00Z",
       "division": "INTERMEDIATE",
       "slug": "weekly-challenge-001",
       "registrationOpenDate": "2024-01-01T00:00:00Z",
       "registrationCloseDate": "2024-01-14T23:59:59Z",
       "tradingSymbols": ["AAPL", "GOOGL", "MSFT"]
     }'
   ```

2. **Register for Tournament**
   ```bash
   curl -X POST http://localhost:3001/api/tournaments/{id}/register \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"zimtraAccountId": "account123"}'
   ```

3. **Get Leaderboard**
   ```bash
   curl -X GET http://localhost:3001/api/tournaments/{id}/leaderboard \
     -H "Authorization: Bearer <token>"
   ```

## Services Overview

### Tournament Service
Manages tournament lifecycle, participant registration, and status transitions.

**Key Methods:**
- `createTournament(data)` - Create new tournament
- `registerParticipant(tournamentId, userId)` - Register user
- `startTournament(id)` - Start tournament
- `endTournament(id)` - End tournament

### Leaderboard Service
Handles participant rankings and leaderboard generation.

**Key Methods:**
- `getTournamentLeaderboard(tournamentId)` - Get current rankings
- `updateParticipantRanking(tournamentId)` - Recalculate rankings
- `getParticipantRank(participantId)` - Get individual rank

### Trading Performance Service
Tracks and analyzes trading performance metrics.

**Key Methods:**
- `recordPerformance(data)` - Record performance data
- `getPerformanceSnapshot(tournamentId, participantId)` - Get current metrics
- `calculateMetrics(trades)` - Calculate performance metrics

### Notification Service
Manages user notifications and communication.

**Key Methods:**
- `createNotification(data)` - Create notification
- `sendTournamentNotification(type, tournamentId)` - Send tournament updates
- `getNotifications(filters)` - Retrieve user notifications

### Audit Service
Provides comprehensive audit logging and tracking.

**Key Methods:**
- `logAction(userId, action, details)` - Log user action
- `getAuditLogs(filters)` - Retrieve audit logs
- `logTournamentAction(userId, action, tournamentId)` - Log tournament action

### Config Service
Manages system configuration and settings.

**Key Methods:**
- `getConfig(key)` - Get configuration value
- `setConfig(key, value)` - Set configuration value
- `getAllConfigs()` - Get all configurations

## Development

### Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## Database Schema

### Core Entities

- **Tournament**: Tournament details and configuration
- **TournamentParticipant**: User participation in tournaments
- **TradingPerformance**: Performance metrics and history
- **User**: User account information
- **Notification**: User notifications
- **AuditLog**: System audit trail
- **Configuration**: System configuration

### Tournament Status Values

- `DRAFT` - Tournament created but not yet open for registration
- `REGISTRATION_OPEN` - Registration is open
- `REGISTRATION_CLOSED` - Registration closed, tournament not yet started
- `ACTIVE` - Tournament is currently running
- `COMPLETED` - Tournament has ended
- `CANCELLED` - Tournament was cancelled

### Division Values

- `BEGINNER` - Entry level traders
- `INTERMEDIATE` - Experienced traders
- `ADVANCED` - Expert traders
- `PROFESSIONAL` - Professional traders

## Security

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication
- **Role-based Access**: Admin and user roles
- **Token Expiration**: Configurable token lifetime
- **Rate Limiting**: 100 requests per minute per IP

### Data Protection

- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: Input sanitization
- **Audit Logging**: All actions logged with user context

## Deployment

### Health Checks

The application provides health check endpoints:

- `GET /api/tournaments/health` - API health status
- `GET /health` - Application health status

### Environment Variables

Production environment requires:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV=production`

## API Endpoints Summary

### Tournament Management
- `POST /tournaments` - Create tournament (Admin)
- `GET /tournaments/:id` - Get tournament details
- `PUT /tournaments/:id` - Update tournament (Admin)
- `DELETE /tournaments/:id` - Delete tournament (Admin)
- `POST /tournaments/:id/start` - Start tournament (Admin)
- `POST /tournaments/:id/end` - End tournament (Admin)

### Participant Management
- `POST /tournaments/:id/register` - Register for tournament
- `GET /tournaments/:id/participants` - Get participants

### Leaderboard & Performance
- `GET /tournaments/:id/leaderboard` - Get leaderboard
- `POST /tournaments/:id/update-rankings` - Update rankings (Admin)
- `POST /performance` - Record performance data
- `GET /performance/participant/:id` - Get performance snapshot

### Notifications
- `GET /notifications` - Get user notifications
- `POST /notifications/:id/read` - Mark as read
- `GET /notifications/unread-count/:userId` - Get unread count

### Configuration & Audit (Admin Only)
- `GET /config/:key` - Get configuration
- `GET /config` - Get all configurations
- `GET /audit` - Get audit logs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- **Documentation**: `/docs/api-documentation.md`
- **Issues**: GitHub Issues
- **Email**: support@daytradeapp.com