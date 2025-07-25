#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

async function testGetStreamAPI() {
  try {
    console.log('Testing GetStream API connection...');
    
    const apiKey = process.env.GETSTREAM_API_KEY;
    const apiSecret = process.env.GETSTREAM_API_SECRET;
    const appId = process.env.GETSTREAM_APP_ID;
    
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
    console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 8)}...` : 'NOT SET');
    console.log('App ID:', appId);
    
    if (!apiKey || !apiSecret || !appId) {
      throw new Error('Missing GetStream credentials');
    }
    
    // Generate JWT token
    const payload = {
      server: true,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };
    
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    console.log('Generated token:', token.substring(0, 50) + '...');
    
    // Test API call
    const response = await axios.get('https://chat-us-east-1.stream-io-api.com/channels', {
      headers: {
        'Content-Type': 'application/json',
        'Stream-Auth-Type': 'jwt',
        'Authorization': token,
      },
      params: {
        api_key: apiKey,
      },
    });
    
    console.log('✅ API call successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('❌ API call failed:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response statusText:', error.response.statusText);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    }
    if (error.request) {
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        params: error.config?.params,
      });
    }
  }
}

testGetStreamAPI();