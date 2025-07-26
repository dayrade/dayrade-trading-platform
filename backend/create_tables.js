require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function createTables() {
  try {
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Creating users table...');
    
    // Create users table
    const { data: usersResult, error: usersError } = await client.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          username VARCHAR(50) UNIQUE,
          country VARCHAR(100),
          timezone VARCHAR(50) DEFAULT 'UTC',
          email_verified BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          is_suspended BOOLEAN DEFAULT FALSE,
          role VARCHAR(20) DEFAULT 'USER',
          kyc_status VARCHAR(20) DEFAULT 'pending',
          avatar_url TEXT,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    // Create user_sessions table
    console.log('Creating user_sessions table...');
    const { data: sessionsResult, error: sessionsError } = await client.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          refresh_token VARCHAR(255) NOT NULL,
          ip_address INET,
          user_agent TEXT,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (sessionsError) {
      console.error('Error creating user_sessions table:', sessionsError);
    } else {
      console.log('User_sessions table created successfully');
    }

    console.log('All tables created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();