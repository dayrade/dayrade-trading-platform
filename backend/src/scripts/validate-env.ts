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
  console.log('✅ All required environment variables are configured');
  console.log('Environment validation passed successfully');
}