# Dayrade Trading Tournament Platform

A comprehensive trading competition platform with real-time market data, tournament management, and social features.

## 🚀 Project Overview

Dayrade is a modern trading tournament platform that allows users to participate in trading competitions using real market data. The platform features real-time market updates, social interactions, tournament management, and comprehensive analytics.

## 🏗️ Architecture

This is a full-stack application with:

- **Backend**: Node.js with Express.js and TypeScript
- **Frontend**: React with TypeScript and Vite
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Features**: WebSocket connections and polling
- **External APIs**: Zimtra for market data, Brevo for emails, GetStream for chat

## 📁 Project Structure

```
dayrade_complete_documentation_package/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── app.ts             # Main application entry
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic services
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── frontend_code/              # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── assets/                     # Static assets and logos
└── *.md                       # Documentation files
```

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Redis (for caching and sessions)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with the required values

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend_code
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## 📚 API Documentation

The API documentation is available at `http://localhost:3001/api-docs` when the backend server is running.

### Available Endpoints

- **Health Check**: `GET /health`
- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Tournaments**: `GET /api/tournaments`
- **Trading**: `GET /api/trading/performance`
- **Admin**: `GET /api/admin/dashboard`
- **Webhooks**: `POST /api/webhooks/zimtra`, `POST /api/webhooks/ticketsource`

## 🧪 Testing

### Backend Testing

Run the endpoint test script:
```bash
cd backend
chmod +x test-endpoints.sh
./test-endpoints.sh
```

### Manual Testing

You can test individual endpoints using curl:
```bash
# Health check
curl http://localhost:3001/health

# Authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🔧 Configuration

### Environment Variables

The following environment variables need to be configured:

#### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/dayrade
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
ZIMTRA_API_KEY=your-zimtra-api-key
BREVO_API_KEY=your-brevo-api-key
GETSTREAM_API_KEY=your-getstream-api-key
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend_code
npm run build
```

The built files will be in the `dist/` directory.

## 📖 Documentation

Comprehensive documentation is available in the following files:

- `00_MASTER_IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `01_PROJECT_SETUP_CHECKLIST.md` - Setup checklist
- `02_DATABASE_SCHEMA_COMPLETE.md` - Database schema
- `03_AUTHENTICATION_SYSTEM.md` - Authentication implementation
- `04_ZIMTRA_API_INTEGRATION.md` - Market data integration
- `05_ENVIRONMENT_CONFIGURATION.md` - Environment setup
- `06_BREVO_EMAIL_SYSTEM.md` - Email system integration
- `07_GETSTREAM_CHAT_INTEGRATION.md` - Chat system integration
- `08_API_ENDPOINTS_SPECIFICATION.md` - API documentation
- `09_POLLING_SYSTEM_IMPLEMENTATION.md` - Real-time updates
- `10_FRONTEND_INTEGRATION_GUIDE.md` - Frontend integration
- `11_TESTING_VALIDATION_SUITE.md` - Testing guidelines
- `12_DEPLOYMENT_PRODUCTION_GUIDE.md` - Deployment guide
- `13_SECURITY_COMPLIANCE_GUIDE.md` - Security guidelines
- `14_FINAL_IMPLEMENTATION_SUMMARY.md` - Implementation summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please refer to the documentation files or contact the development team.

## 🔄 Current Status

**Task 01 Completed**: ✅
- Project structure setup
- Core application configuration
- API route frameworks
- Development tools and testing
- Environment configuration
- Security middleware implementation

**Next Steps**:
- Task 02: Database schema implementation
- Task 03: Authentication system
- Task 04: Zimtra API integration
- Task 05: Environment configuration
- And more...

---

Built with ❤️ for the Dayrade trading community.