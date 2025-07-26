#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Dayrade Trading Platform - Vercel Deployment Helper');
console.log('====================================================');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI. Please install manually: npm install -g vercel');
    process.exit(1);
  }
}

// Function to deploy backend
function deployBackend() {
  console.log('\n📦 Deploying Backend...');
  try {
    process.chdir(path.join(__dirname, 'backend'));
    
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      console.log('⚠️  No .env file found in backend. Make sure to set environment variables in Vercel dashboard.');
    }
    
    console.log('Building and deploying backend to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Backend deployed successfully!');
    
  } catch (error) {
    console.error('❌ Backend deployment failed:', error.message);
    return false;
  }
  return true;
}

// Function to deploy frontend
function deployFrontend() {
  console.log('\n🎨 Deploying Frontend...');
  try {
    process.chdir(path.join(__dirname, 'frontend_code'));
    
    // Check if .env.production file exists
    if (!fs.existsSync('.env.production')) {
      console.log('⚠️  No .env.production file found. Make sure to set environment variables in Vercel dashboard.');
    }
    
    console.log('Building and deploying frontend to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Frontend deployed successfully!');
    
  } catch (error) {
    console.error('❌ Frontend deployment failed:', error.message);
    return false;
  }
  return true;
}

// Main deployment process
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nUsage:');
    console.log('  node deploy.js [options]');
    console.log('\nOptions:');
    console.log('  --backend-only    Deploy only the backend');
    console.log('  --frontend-only   Deploy only the frontend');
    console.log('  --help, -h        Show this help message');
    console.log('\nDefault: Deploy both backend and frontend');
    return;
  }
  
  const backendOnly = args.includes('--backend-only');
  const frontendOnly = args.includes('--frontend-only');
  
  let success = true;
  
  if (!frontendOnly) {
    success = deployBackend() && success;
  }
  
  if (!backendOnly) {
    success = deployFrontend() && success;
  }
  
  if (success) {
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update environment variables in Vercel dashboard');
    console.log('2. Configure custom domains if needed');
    console.log('3. Test your deployed application');
    console.log('4. Monitor logs for any issues');
    console.log('\n📖 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md');
  } else {
    console.log('\n❌ Deployment failed. Please check the errors above.');
    process.exit(1);
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error.message);
  process.exit(1);
});

// Run the deployment
main().catch((error) => {
  console.error('❌ Deployment script failed:', error.message);
  process.exit(1);
});