# Dayrade Trading Tournament Platform - Backend API

## Overview

This is the backend API for the Dayrade Trading Tournament Platform, built with Node.js, Express.js, and TypeScript. The backend provides comprehensive tournament management, real-time trading data integration, user authentication, and external service integrations.

## Features

- **User Authentication & Authorization** - JWT-based auth system
- **Tournament Management** - Create and manage trading tournaments
- **Real-time Trading Data** - Integration with Zimtra API for live trading metrics
- **Payment Processing** - TicketSource integration for tournament registration
- **Email Notifications** - Brevo email service integration
- **Real-time Chat** - GetStream.io integration for tournament chat
- **Admin Dashboard** - Comprehensive admin functionality
- **WebSocket Support** - Real-time updates for leaderboards and chat

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Supabase
- **Cache**: Redis
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

## External Integrations

- **Zimtra API** - Trading data and account management
- **TicketSource** - Payment processing and ticketing
- **GetStream.io** - Real-time chat functionality
- **Brevo** - Transactional email service

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (or Supabase account)
- Redis server
- API keys for external services

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Validate environment**:
   ```bash
   npm run validate:env
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run validate:env` - Validate environment variables
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## API Documentation

Once the server is running, visit:
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## Project Structure

```
src/
├── controllers/     # Route handlers and business logic
├── middleware/      # Express middleware functions
├── routes/          # API route definitions
├── services/        # External service integrations
├── models/          # Database models and schemas
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
├── jobs/            # Background job processors
├── config/          # Configuration files
└── app.ts           # Main application entry point
```

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `ZIMTRA_API_KEY` - Zimtra API credentials
- `TICKETSOURCE_API_KEY` - TicketSource API credentials
- `GETSTREAM_API_KEY` - GetStream.io credentials
- `BREVO_API_KEY` - Brevo email service credentials

## Development Status

This backend is being built following a 14-task implementation plan:

- ✅ **Task 01**: Project Setup and Configuration
- 🔄 **Task 02**: Database Schema Implementation
- ⏳ **Task 03**: Authentication System
- ⏳ **Task 04**: Zimtra API Integration
- ⏳ **Task 05**: TicketSource Integration
- ⏳ **Task 06**: Brevo Email System
- ⏳ **Task 07**: GetStream Chat Integration
- ⏳ **Task 08**: API Endpoints Implementation
- ⏳ **Task 09**: Polling System Implementation
- ⏳ **Task 10**: Webhook Handlers
- ⏳ **Task 11**: Admin Dashboard Backend
- ⏳ **Task 12**: Monitoring and Logging
- ⏳ **Task 13**: Deployment Configuration
- ⏳ **Task 14**: Testing and Validation

## Security

- All API endpoints use HTTPS in production
- JWT tokens for authentication
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## Support

For development questions or issues, refer to the comprehensive documentation package included with this project.

## License

MIT License - see LICENSE file for details.