# Task 02: Complete Database Schema Implementation

**Task ID:** DAYRADE-002  
**Priority:** Critical  
**Dependencies:** Task 01 (Project Setup)  
**Estimated Duration:** 3-4 hours  
**Tray.ai Tools Required:** File System, Terminal, Web Search  

## 🎯 Task Objective

Implement the complete PostgreSQL database schema for the Dayrade Trading Tournament Platform. This task creates all required tables, relationships, indexes, and constraints to support user management, tournament operations, trading data, chat functionality, and administrative features.

## 📋 Requirement Cross-Reference Validation

This task implements the following database requirements:

- **User Management**: Authentication, profiles, KYC status tracking
- **Tournament System**: Tournament creation, participant management, leaderboards
- **Trading Data**: Performance metrics, trade history, position tracking
- **Communication**: Chat messages, commentary, notifications
- **Administrative**: System monitoring, audit logs, configuration

## 🗄️ Complete Database Schema

### **Core User Management Tables**

#### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  avatar_url VARCHAR(500),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  
  -- Zimtra Integration
  zimtra_id VARCHAR(100) UNIQUE,
  zimtra_username VARCHAR(100),
  
  -- KYC and Verification
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_action')),
  kyc_approved_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  
  -- Profile Information
  country VARCHAR(100),
  timezone VARCHAR(50),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_suspended BOOLEAN DEFAULT false,
  suspension_reason TEXT,
  last_login_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_zimtra_id ON users(zimtra_id);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **User Sessions Table**
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### **Tournament Management Tables**

#### **Tournaments Table**
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Tournament Classification
  division VARCHAR(20) NOT NULL CHECK (division IN ('elevator', 'crusader', 'raider')),
  tournament_type VARCHAR(20) DEFAULT 'standard' CHECK (tournament_type IN ('standard', 'championship', 'special')),
  
  -- Timing
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  registration_open_date TIMESTAMP NOT NULL,
  registration_close_date TIMESTAMP NOT NULL,
  
  -- Participation
  max_participants INTEGER NOT NULL DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  min_participants INTEGER DEFAULT 10,
  
  -- Financial
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  prize_pool DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status Management
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'registration_open', 'registration_closed', 'active', 'completed', 'cancelled')),
  
  -- External Integrations
  ticketsource_event_id VARCHAR(100),
  zimtra_tournament_id VARCHAR(100),
  
  -- Configuration
  starting_balance DECIMAL(15,2) DEFAULT 100000.00,
  trading_symbols TEXT[], -- Array of allowed trading symbols
  rules JSONB, -- Tournament-specific rules and configurations
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT tournaments_dates_valid CHECK (start_date < end_date),
  CONSTRAINT tournaments_registration_valid CHECK (registration_open_date < registration_close_date),
  CONSTRAINT tournaments_participants_valid CHECK (current_participants <= max_participants)
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_division ON tournaments(division);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_tournaments_slug ON tournaments(slug);

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **Tournament Participants Table**
```sql
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Registration Information
  registered_at TIMESTAMP DEFAULT NOW(),
  registration_source VARCHAR(50) DEFAULT 'web',
  
  -- External Integration IDs
  ticketsource_booking_id VARCHAR(100),
  zimtra_account_id VARCHAR(100),
  
  -- Trading Account Information
  starting_balance DECIMAL(15,2) DEFAULT 100000.00,
  current_balance DECIMAL(15,2) DEFAULT 100000.00,
  
  -- Performance Metrics
  total_pnl DECIMAL(15,2) DEFAULT 0.00,
  realized_pnl DECIMAL(15,2) DEFAULT 0.00,
  unrealized_pnl DECIMAL(15,2) DEFAULT 0.00,
  
  -- Trading Statistics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_volume DECIMAL(20,2) DEFAULT 0.00,
  
  -- Ranking Information
  current_rank INTEGER,
  best_rank INTEGER,
  final_rank INTEGER,
  final_pnl DECIMAL(15,2),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  disqualified BOOLEAN DEFAULT false,
  disqualification_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(tournament_id, user_id)
);

CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX idx_tournament_participants_current_rank ON tournament_participants(current_rank);
CREATE INDEX idx_tournament_participants_total_pnl ON tournament_participants(total_pnl);

CREATE TRIGGER update_tournament_participants_updated_at BEFORE UPDATE ON tournament_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Trading Data Tables**

#### **Trading Performance Table**
```sql
CREATE TABLE trading_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  
  -- Timestamp
  recorded_at TIMESTAMP DEFAULT NOW(),
  data_source VARCHAR(20) DEFAULT 'zimtra',
  
  -- Core Metrics (The 8 Dashboard Metrics)
  total_pnl DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  realized_pnl DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  unrealized_pnl DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  usd_balance DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
  number_of_trades INTEGER NOT NULL DEFAULT 0,
  total_shares_traded BIGINT NOT NULL DEFAULT 0,
  number_of_stocks_traded INTEGER NOT NULL DEFAULT 0,
  total_notional_traded DECIMAL(20,2) NOT NULL DEFAULT 0.00,
  
  -- Calculated Metrics
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  best_trade DECIMAL(15,2) DEFAULT 0.00,
  worst_trade DECIMAL(15,2) DEFAULT 0.00,
  average_trade_size DECIMAL(15,2) DEFAULT 0.00,
  
  -- Risk Metrics
  max_drawdown DECIMAL(15,2) DEFAULT 0.00,
  sharpe_ratio DECIMAL(8,4),
  volatility DECIMAL(8,4),
  
  -- Position Information
  current_positions JSONB, -- Array of current positions
  position_count INTEGER DEFAULT 0,
  long_positions INTEGER DEFAULT 0,
  short_positions INTEGER DEFAULT 0,
  
  -- Raw Data from Zimtra
  raw_zimtra_data JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance queries
CREATE INDEX idx_trading_performance_tournament_user ON trading_performance(tournament_id, user_id);
CREATE INDEX idx_trading_performance_recorded_at ON trading_performance(recorded_at);
CREATE INDEX idx_trading_performance_total_pnl ON trading_performance(total_pnl);
CREATE INDEX idx_trading_performance_participant_id ON trading_performance(participant_id);

-- Composite index for leaderboard queries
CREATE INDEX idx_trading_performance_leaderboard ON trading_performance(tournament_id, recorded_at DESC, total_pnl DESC);
```

#### **Trades Table**
```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  
  -- Trade Information
  symbol VARCHAR(10) NOT NULL,
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  
  -- Execution Details
  executed_at TIMESTAMP NOT NULL,
  order_type VARCHAR(10) DEFAULT 'market' CHECK (order_type IN ('market', 'limit', 'stop')),
  
  -- Financial Impact
  trade_value DECIMAL(15,2) NOT NULL, -- quantity * price
  commission DECIMAL(8,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NOT NULL, -- trade_value - commission
  
  -- P&L Calculation (for closed positions)
  pnl DECIMAL(15,2),
  pnl_percentage DECIMAL(8,4),
  
  -- External Integration
  zimtra_trade_id VARCHAR(100),
  zimtra_order_id VARCHAR(100),
  
  -- Trade Context
  position_type VARCHAR(10) CHECK (position_type IN ('open', 'close', 'partial')),
  related_trade_id UUID REFERENCES trades(id), -- For linking opening/closing trades
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trades_tournament_user ON trades(tournament_id, user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_executed_at ON trades(executed_at);
CREATE INDEX idx_trades_zimtra_trade_id ON trades(zimtra_trade_id);
CREATE INDEX idx_trades_participant_id ON trades(participant_id);
```

#### **Positions Table**
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  
  -- Position Details
  symbol VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL,
  average_price DECIMAL(10,4) NOT NULL,
  current_price DECIMAL(10,4),
  
  -- Financial Metrics
  market_value DECIMAL(15,2),
  cost_basis DECIMAL(15,2) NOT NULL,
  unrealized_pnl DECIMAL(15,2),
  unrealized_pnl_percentage DECIMAL(8,4),
  
  -- Position Status
  side VARCHAR(5) NOT NULL CHECK (side IN ('long', 'short')),
  status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  
  -- Timing
  opened_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT NOW(),
  
  -- External Integration
  zimtra_position_id VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint for open positions
  UNIQUE(tournament_id, user_id, symbol, status) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_positions_tournament_user ON positions(tournament_id, user_id);
CREATE INDEX idx_positions_symbol ON positions(symbol);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_participant_id ON positions(participant_id);

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Communication Tables**

#### **Chat Messages Table**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message Content
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'user_message' CHECK (message_type IN ('user_message', 'system_message', 'commentary', 'announcement')),
  
  -- External Integration
  getstream_message_id VARCHAR(100),
  channel_id VARCHAR(100),
  
  -- Moderation
  is_moderated BOOLEAN DEFAULT false,
  moderation_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP,
  
  -- Analytics
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  relevance_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chat_messages_text_length CHECK (char_length(message_text) <= 1000)
);

CREATE INDEX idx_chat_messages_tournament_id ON chat_messages(tournament_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_getstream_id ON chat_messages(getstream_message_id);

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **Commentary Table**
```sql
CREATE TABLE commentary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- Commentary Content
  personality VARCHAR(20) NOT NULL CHECK (personality IN ('bull', 'bear', 'sage', 'rocket')),
  commentary_text TEXT NOT NULL,
  
  -- Trigger Information
  trigger_event VARCHAR(100),
  trigger_data JSONB,
  trigger_user_id UUID REFERENCES users(id),
  
  -- Audio Information
  audio_url VARCHAR(500),
  audio_duration INTEGER, -- in seconds
  audio_generated BOOLEAN DEFAULT false,
  
  -- Scheduling
  scheduled_at TIMESTAMP,
  played_at TIMESTAMP,
  is_played BOOLEAN DEFAULT false,
  
  -- Classification
  source VARCHAR(20) NOT NULL CHECK (source IN ('trading', 'economic', 'chat', 'manual')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commentary_tournament_id ON commentary(tournament_id);
CREATE INDEX idx_commentary_personality ON commentary(personality);
CREATE INDEX idx_commentary_scheduled_at ON commentary(scheduled_at);
CREATE INDEX idx_commentary_source ON commentary(source);
CREATE INDEX idx_commentary_priority ON commentary(priority);

CREATE TRIGGER update_commentary_updated_at BEFORE UPDATE ON commentary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Notification and Communication Tables**

#### **Notifications Table**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Content
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  -- Priority and Routing
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  channels VARCHAR(20)[] DEFAULT ARRAY['in_app'], -- in_app, email, push, sms
  
  -- Action Information
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  
  -- Delivery Tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP,
  
  -- Related Entities
  tournament_id UUID REFERENCES tournaments(id),
  trade_id UUID REFERENCES trades(id),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **Email Templates Table**
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- Template Configuration
  template_type VARCHAR(50) NOT NULL,
  brevo_template_id INTEGER,
  variables JSONB, -- Available template variables
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_templates_name ON email_templates(name);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Economic and Market Data Tables**

#### **Economic Events Table**
```sql
CREATE TABLE economic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  country VARCHAR(100) NOT NULL,
  
  -- Event Timing
  event_time TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Impact Assessment
  impact_level VARCHAR(10) NOT NULL CHECK (impact_level IN ('low', 'medium', 'high')),
  
  -- Economic Data
  forecast_value DECIMAL(15,4),
  actual_value DECIMAL(15,4),
  previous_value DECIMAL(15,4),
  unit VARCHAR(50),
  
  -- Market Impact
  affected_symbols TEXT[],
  market_reaction JSONB,
  
  -- Data Source
  data_source VARCHAR(50) DEFAULT 'external_api',
  external_event_id VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_economic_events_event_time ON economic_events(event_time);
CREATE INDEX idx_economic_events_country ON economic_events(country);
CREATE INDEX idx_economic_events_impact_level ON economic_events(impact_level);

CREATE TRIGGER update_economic_events_updated_at BEFORE UPDATE ON economic_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Administrative and System Tables**

#### **System Configuration Table**
```sql
CREATE TABLE system_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  
  -- Configuration Management
  category VARCHAR(50) NOT NULL,
  is_sensitive BOOLEAN DEFAULT false,
  requires_restart BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_system_configuration_key ON system_configuration(key);
CREATE INDEX idx_system_configuration_category ON system_configuration(category);

CREATE TRIGGER update_system_configuration_updated_at BEFORE UPDATE ON system_configuration
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **Audit Logs Table**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- Action Information
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  -- Change Details
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## 🔧 Database Service Implementation

### **Database Connection Service**

```typescript
// src/services/database.service.ts
import { Pool, PoolClient } from 'pg';
import { Logger } from '../utils/logger';

export class DatabaseService {
  private static pool: Pool;
  private static logger = new Logger('DatabaseService');

  static async initialize(): Promise<void> {
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      await this.testConnection();
      this.logger.info('Database connection pool initialized');

    } catch (error) {
      this.logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  static async testConnection(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT NOW()');
      this.logger.info('Database connection test successful');
    } finally {
      client.release();
    }
  }

  static async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Query executed in ${duration}ms: ${text}`);
      return result;
    } catch (error) {
      this.logger.error('Database query error:', { text, params, error });
      throw error;
    }
  }

  static async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  static async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.info('Database connection pool closed');
    }
  }
}
```

### **Migration System**

```typescript
// src/scripts/migrate.ts
import { DatabaseService } from '../services/database.service';
import { Logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class MigrationRunner {
  private static logger = new Logger('MigrationRunner');

  static async runMigrations(): Promise<void> {
    try {
      await DatabaseService.initialize();
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get list of migration files
      const migrationFiles = this.getMigrationFiles();
      
      // Run each migration
      for (const file of migrationFiles) {
        await this.runMigration(file);
      }
      
      this.logger.info('All migrations completed successfully');
      
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  private static async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await DatabaseService.query(query);
  }

  private static getMigrationFiles(): string[] {
    const migrationsDir = path.join(__dirname, '../migrations');
    return fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  private static async runMigration(filename: string): Promise<void> {
    // Check if migration already executed
    const checkQuery = 'SELECT id FROM schema_migrations WHERE filename = $1';
    const result = await DatabaseService.query(checkQuery, [filename]);
    
    if (result.rows.length > 0) {
      this.logger.debug(`Migration ${filename} already executed, skipping`);
      return;
    }

    // Read and execute migration
    const migrationPath = path.join(__dirname, '../migrations', filename);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await DatabaseService.transaction(async (client) => {
      await client.query(migrationSQL);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename]
      );
    });

    this.logger.info(`Migration ${filename} executed successfully`);
  }
}

// Run migrations if called directly
if (require.main === module) {
  MigrationRunner.runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
```

## ✅ Functional Validation Testing

### **Test 2.1: Database Connection Validation**

```typescript
// src/tests/database.test.ts
import { DatabaseService } from '../services/database.service';

describe('Database Connection', () => {
  beforeAll(async () => {
    await DatabaseService.initialize();
  });

  afterAll(async () => {
    await DatabaseService.close();
  });

  test('should connect to database successfully', async () => {
    await expect(DatabaseService.testConnection()).resolves.not.toThrow();
  });

  test('should execute basic query', async () => {
    const result = await DatabaseService.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  test('should handle transactions', async () => {
    const result = await DatabaseService.transaction(async (client) => {
      const res = await client.query('SELECT 2 as test');
      return res.rows[0].test;
    });
    expect(result).toBe(2);
  });
});
```

### **Test 2.2: Schema Validation**

```sql
-- src/tests/schema-validation.sql
-- Test that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Test foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- Test indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### **Test 2.3: Data Integrity Validation**

```typescript
// src/tests/data-integrity.test.ts
describe('Data Integrity', () => {
  test('should enforce user email uniqueness', async () => {
    const email = 'test@example.com';
    
    // Insert first user
    await DatabaseService.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email, 'hash1']
    );

    // Attempt to insert duplicate email
    await expect(
      DatabaseService.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
        [email, 'hash2']
      )
    ).rejects.toThrow();
  });

  test('should enforce tournament participant uniqueness', async () => {
    const tournamentId = 'tournament-uuid';
    const userId = 'user-uuid';

    // Insert first participation
    await DatabaseService.query(
      'INSERT INTO tournament_participants (tournament_id, user_id) VALUES ($1, $2)',
      [tournamentId, userId]
    );

    // Attempt duplicate participation
    await expect(
      DatabaseService.query(
        'INSERT INTO tournament_participants (tournament_id, user_id) VALUES ($1, $2)',
        [tournamentId, userId]
      )
    ).rejects.toThrow();
  });
});
```

## 🔍 Error Handling Specifications

### **Database Error Handler**

```typescript
// src/middleware/database-error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export class DatabaseErrorHandler {
  private static logger = new Logger('DatabaseErrorHandler');

  static handle(error: any, req: Request, res: Response, next: NextFunction): void {
    this.logger.error('Database error:', error);

    // PostgreSQL error codes
    switch (error.code) {
      case '23505': // Unique violation
        res.status(409).json({
          success: false,
          message: 'Resource already exists',
          error: 'DUPLICATE_ENTRY'
        });
        break;

      case '23503': // Foreign key violation
        res.status(400).json({
          success: false,
          message: 'Invalid reference to related resource',
          error: 'FOREIGN_KEY_VIOLATION'
        });
        break;

      case '23514': // Check constraint violation
        res.status(400).json({
          success: false,
          message: 'Data validation failed',
          error: 'CONSTRAINT_VIOLATION'
        });
        break;

      case '42P01': // Undefined table
        res.status(500).json({
          success: false,
          message: 'Database schema error',
          error: 'SCHEMA_ERROR'
        });
        break;

      default:
        res.status(500).json({
          success: false,
          message: 'Database operation failed',
          error: 'DATABASE_ERROR'
        });
    }
  }
}
```

## 🎯 Explicit Completion Declaration

**Task 02 Completion Criteria:**

- [x] Complete PostgreSQL schema with all 15 tables created
- [x] All foreign key relationships and constraints implemented
- [x] Comprehensive indexing strategy for performance optimization
- [x] Database service class with connection pooling
- [x] Migration system for schema version control
- [x] Transaction support for data consistency
- [x] Error handling for database operations
- [x] Validation tests for schema integrity
- [x] Audit logging and system configuration tables
- [x] Trigger functions for automatic timestamp updates

**Deliverables:**
1. Complete database schema with all required tables
2. Database service with connection management
3. Migration system for schema deployment
4. Comprehensive test suite for data integrity
5. Error handling middleware for database operations

**Next Step Validation:**
Task 02 is complete and ready for Task 03 (Authentication System Implementation). The database foundation is established with proper schema, relationships, and service layer for all subsequent development tasks.

## 📞 Stakeholder Communication Template

**Status Update for Project Stakeholders:**

"Task 02 (Database Schema Implementation) has been completed successfully. The complete PostgreSQL database schema is now implemented with all 15 tables, relationships, and constraints required for the Dayrade platform. The database service layer provides robust connection management, transaction support, and error handling. The migration system ensures proper schema version control for deployment."

**Technical Summary:**
- 15 database tables with complete relationships
- Comprehensive indexing for optimal performance
- Database service with connection pooling
- Migration system for schema management
- Data integrity validation and error handling

**Ready for Next Phase:** Authentication System Implementation (Task 03)

