# Dayrade Trading Tournament Platform

A comprehensive trading tournament platform built with modern web technologies, ready for deployment on Vercel.

## 🚀 Quick Deploy to Vercel

### Option 1: Automated Deployment

```bash
# Install dependencies
npm run install:all

# Deploy both frontend and backend
npm run deploy

# Or deploy individually
npm run deploy:backend
npm run deploy:frontend
```

### Option 2: Manual Deployment

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
dayrade-trading-platform/
├── backend/                 # Express.js API server
│   ├── api/                # Vercel serverless functions
│   ├── src/                # Source code
│   ├── vercel.json         # Vercel configuration
│   └── .env.example        # Environment variables template
├── frontend_code/          # React frontend application
│   ├── src/                # Source code
│   ├── vercel.json         # Vercel configuration
│   ├── .env.example        # Environment variables template
│   └── .env.production     # Production environment variables
├── assets/                 # Shared assets and resources
├── deploy.js               # Automated deployment script
├── package.json            # Root package.json with scripts
└── VERCEL_DEPLOYMENT_GUIDE.md # Deployment instructions
```

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (or Supabase)
- Redis (optional, for caching)

### Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend_code
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## ✨ Features

- 🔐 User authentication and authorization
- 🏆 Trading tournament management
- 📈 Real-time market data integration
- 💬 Live chat and notifications
- 👨‍💼 Admin dashboard
- 📧 Email notifications
- 📱 Responsive design
- ☁️ Cloud-ready deployment

## 🔧 Technology Stack

### Backend
- Express.js with TypeScript
- Supabase/PostgreSQL database
- Redis for caching
- JWT authentication
- Socket.io for real-time features
- Vercel serverless functions

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Query for state management
- Vercel hosting

## 🌐 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment:

1. **Backend**: Deployed as serverless functions
2. **Frontend**: Deployed as a static site with SPA routing
3. **Environment Variables**: Configured in Vercel dashboard
4. **Custom Domains**: Supported through Vercel

### Environment Variables

#### Backend (.env)
```bash
# See backend/.env.example for complete list
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ZIMTRA_API_KEY=your_zimtra_api_key
# ... and more
```

#### Frontend (.env.production)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_NODE_ENV=production
```

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