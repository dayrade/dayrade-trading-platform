-- Admin System Tables Schema
-- This file contains the SQL schema for admin dashboard functionality

-- Admin Audit Log Table
-- Stores all admin actions for audit trail
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admin_audit_log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- Announcements Table
-- Stores system announcements and notifications
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- info, warning, success, error
  target_audience VARCHAR(50) NOT NULL DEFAULT 'all', -- all, users, admins, specific_role
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_starts_at ON announcements(starts_at);
CREATE INDEX IF NOT EXISTS idx_announcements_ends_at ON announcements(ends_at);

-- System Settings Table
-- Stores configurable system settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT false, -- Whether setting can be read by non-admins
  updated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);

-- Admin Sessions Table
-- Tracks admin login sessions for security
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- User Moderation Actions Table
-- Tracks moderation actions taken on users
CREATE TABLE IF NOT EXISTS user_moderation_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- suspend, unsuspend, ban, unban, warn, etc.
  reason TEXT,
  duration_hours INTEGER, -- For temporary actions
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_moderation_actions
CREATE INDEX IF NOT EXISTS idx_user_moderation_actions_user_id ON user_moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_actions_moderator_id ON user_moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_actions_action_type ON user_moderation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_moderation_actions_is_active ON user_moderation_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_moderation_actions_expires_at ON user_moderation_actions(expires_at);

-- System Health Metrics Table
-- Stores system health and performance metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit VARCHAR(20), -- ms, %, MB, etc.
  service_name VARCHAR(50), -- database, redis, api, etc.
  status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, critical
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system_health_metrics
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_service ON system_health_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_status ON system_health_metrics(status);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at);

-- Feature Flags Table
-- Manages feature toggles for the platform
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  target_audience VARCHAR(50) DEFAULT 'all', -- all, beta_users, admins, etc.
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for feature_flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_target_audience ON feature_flags(target_audience);

-- Insert default admin user if not exists
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  username,
  role,
  is_verified,
  kyc_status,
  created_at
) VALUES (
  gen_random_uuid(),
  'admin@dayrade.com',
  'Admin',
  'User',
  'admin',
  'ADMIN',
  true,
  'approved',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, category, is_public, updated_by) VALUES
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'system', true, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('registration_enabled', 'true', 'Enable/disable user registration', 'user', true, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('max_tournament_participants', '1000', 'Maximum participants per tournament', 'tournament', false, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('voice_commentary_enabled', 'false', 'Enable/disable voice commentary', 'voice', false, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('voice_daily_budget', '100', 'Daily budget for voice commentary in USD', 'voice', false, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('voice_weekly_budget', '500', 'Weekly budget for voice commentary in USD', 'voice', false, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('voice_monthly_budget', '2000', 'Monthly budget for voice commentary in USD', 'voice', false, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1))
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, is_enabled, description, target_audience, rollout_percentage, created_by) VALUES
  ('voice_commentary', false, 'Enable voice commentary feature', 'all', 0, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('advanced_analytics', true, 'Enable advanced analytics dashboard', 'admins', 100, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('tournament_chat', true, 'Enable chat in tournaments', 'all', 100, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1)),
  ('mobile_app_beta', false, 'Enable mobile app beta features', 'beta_users', 25, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1))
ON CONFLICT (flag_name) DO NOTHING;

-- Create a sample announcement
INSERT INTO announcements (title, content, type, target_audience, is_active, priority, created_by) VALUES
  ('Welcome to Dayrade Admin Dashboard', 'The admin dashboard is now live! You can manage tournaments, users, and system settings from here.', 'info', 'admins', true, 1, (SELECT id FROM users WHERE email = 'admin@dayrade.com' LIMIT 1))
ON CONFLICT DO NOTHING;