# Vercel Deployment Guide

This guide will help you deploy the Dayrade Trading Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Environment Variables**: Prepare your production environment variables

## Backend Deployment

### Step 1: Deploy Backend to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set the **Root Directory** to `backend`
5. Vercel will automatically detect it as a Node.js project

### Step 2: Configure Backend Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration (Supabase)
DATABASE_URL=your_production_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration (Optional - use Upstash Redis)
REDIS_URL=your_redis_url
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_minimum_32_characters_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Zimtra API Configuration
ZIMTRA_API_URL=https://api.zimtra.com
ZIMTRA_API_KEY=your_zimtra_api_key
ZIMTRA_API_SECRET=your_zimtra_api_secret
ZIMTRA_WEBHOOK_SECRET=your_zimtra_webhook_secret
ZIMTRA_TRADE_API_URL=https://api.zimtra.com/trade

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

# Security Configuration
FRONTEND_URL=https://your-frontend-deployment.vercel.app
CORS_ORIGIN=https://your-frontend-deployment.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_TRACKING=true

# Webhook Configuration
WEBHOOK_TIMEOUT_MS=30000
WEBHOOK_RETRY_ATTEMPTS=3

# Polling Configuration
ZIMTRA_POLLING_INTERVAL_MS=60000
LEADERBOARD_UPDATE_INTERVAL_MS=30000

# File Upload Configuration
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/svg+xml,application/pdf
```

### Step 3: Deploy Backend

1. Click "Deploy"
2. Wait for the deployment to complete
3. Note your backend URL (e.g., `https://your-backend-deployment.vercel.app`)

## Frontend Deployment

### Step 1: Update Frontend Environment Variables

1. Update `frontend_code/.env.production` with your actual backend URL:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration - Update with your deployed backend URL
VITE_API_BASE_URL=https://your-backend-deployment.vercel.app/api

# Environment
VITE_NODE_ENV=production
```

### Step 2: Deploy Frontend to Vercel

1. Create a new Vercel project for the frontend
2. Import your GitHub repository
3. Set the **Root Directory** to `frontend_code`
4. Vercel will automatically detect it as a Vite project

### Step 3: Configure Frontend Environment Variables

In your Vercel project settings, add these environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://your-backend-deployment.vercel.app/api
VITE_NODE_ENV=production
```

### Step 4: Deploy Frontend

1. Click "Deploy"
2. Wait for the deployment to complete
3. Your frontend will be available at `https://your-frontend-deployment.vercel.app`

## Post-Deployment Steps

### 1. Update CORS Configuration

Update your backend's `FRONTEND_URL` and `CORS_ORIGIN` environment variables with your actual frontend URL.

### 2. Test the Deployment

1. Visit your frontend URL
2. Check that the API is working by visiting `https://your-backend-deployment.vercel.app/health`
3. Test user registration and login functionality

### 3. Configure Custom Domains (Optional)

1. In Vercel dashboard, go to your project settings
2. Add your custom domain
3. Update environment variables with your custom domain URLs

## Troubleshooting

### Common Issues

1. **Environment Variables**: Make sure all required environment variables are set in Vercel
2. **CORS Errors**: Ensure `CORS_ORIGIN` in backend matches your frontend URL
3. **Database Connection**: Verify your Supabase credentials and connection string
4. **API Routes**: Check that all API endpoints are accessible at `/api/*`

### Logs

- View deployment logs in Vercel dashboard
- Check function logs for runtime errors
- Use the health endpoint to verify service status

## Security Considerations

1. **Environment Variables**: Never commit real API keys to your repository
2. **CORS**: Configure CORS to only allow your frontend domain
3. **Rate Limiting**: Ensure rate limiting is properly configured
4. **HTTPS**: Vercel automatically provides HTTPS for all deployments

## Monitoring

1. **Vercel Analytics**: Enable analytics in your Vercel dashboard
2. **Error Tracking**: Monitor function logs for errors
3. **Performance**: Use Vercel's performance monitoring tools

Your Dayrade Trading Platform is now live on Vercel! 🚀