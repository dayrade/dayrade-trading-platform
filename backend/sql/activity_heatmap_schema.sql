-- Trading Activity Heatmap Schema
-- This file contains the SQL schema for storing trading activity data for heatmap visualization

-- Trading Activity Table
-- Stores calculated activity scores for each trader at regular intervals
CREATE TABLE IF NOT EXISTS trading_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  activity_level DECIMAL(5,4) NOT NULL CHECK (activity_level >= 0 AND activity_level <= 1),
  trading_volume DECIMAL(15,2) NOT NULL DEFAULT 0,
  trade_frequency INTEGER NOT NULL DEFAULT 0,
  portfolio_changes INTEGER NOT NULL DEFAULT 0,
  raw_score DECIMAL(8,2) NOT NULL DEFAULT 0,
  normalized_score DECIMAL(5,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for trading_activity
CREATE INDEX IF NOT EXISTS idx_trading_activity_trader_id ON trading_activity(trader_id);
CREATE INDEX IF NOT EXISTS idx_trading_activity_timestamp ON trading_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_trading_activity_trader_timestamp ON trading_activity(trader_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_trading_activity_activity_level ON trading_activity(activity_level);
CREATE INDEX IF NOT EXISTS idx_trading_activity_created_at ON trading_activity(created_at);

-- Activity Heatmap Aggregates Table
-- Stores pre-calculated heatmap data for faster retrieval
CREATE TABLE IF NOT EXISTS activity_heatmap_aggregates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id VARCHAR(50) NOT NULL,
  time_slot TIMESTAMP WITH TIME ZONE NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  avg_activity_level DECIMAL(5,4) NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  total_volume DECIMAL(15,2) NOT NULL DEFAULT 0,
  peak_activity DECIMAL(5,4) NOT NULL DEFAULT 0,
  activity_color VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  data_points_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity_heatmap_aggregates
CREATE INDEX IF NOT EXISTS idx_heatmap_aggregates_trader_id ON activity_heatmap_aggregates(trader_id);
CREATE INDEX IF NOT EXISTS idx_heatmap_aggregates_time_slot ON activity_heatmap_aggregates(time_slot);
CREATE INDEX IF NOT EXISTS idx_heatmap_aggregates_trader_time ON activity_heatmap_aggregates(trader_id, time_slot);
CREATE INDEX IF NOT EXISTS idx_heatmap_aggregates_duration ON activity_heatmap_aggregates(slot_duration_minutes);

-- Activity Thresholds Configuration Table
-- Stores configurable thresholds for activity level calculations
CREATE TABLE IF NOT EXISTS activity_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  volume_weight DECIMAL(3,2) NOT NULL DEFAULT 0.30,
  frequency_weight DECIMAL(3,2) NOT NULL DEFAULT 0.25,
  portfolio_weight DECIMAL(3,2) NOT NULL DEFAULT 0.25,
  pnl_weight DECIMAL(3,2) NOT NULL DEFAULT 0.20,
  max_volume_threshold DECIMAL(15,2) NOT NULL DEFAULT 50000,
  max_trades_threshold INTEGER NOT NULL DEFAULT 10,
  max_positions_threshold INTEGER NOT NULL DEFAULT 5,
  max_pnl_change_threshold DECIMAL(10,2) NOT NULL DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default threshold configuration
INSERT INTO activity_thresholds (
  name, 
  description,
  volume_weight,
  frequency_weight,
  portfolio_weight,
  pnl_weight,
  max_volume_threshold,
  max_trades_threshold,
  max_positions_threshold,
  max_pnl_change_threshold
) VALUES (
  'default',
  'Default activity calculation thresholds',
  0.30,
  0.25,
  0.25,
  0.20,
  50000,
  10,
  5,
  1000
) ON CONFLICT (name) DO NOTHING;

-- Activity Color Mapping Table
-- Stores color mappings for different activity levels
CREATE TABLE IF NOT EXISTS activity_color_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  min_activity DECIMAL(5,4) NOT NULL,
  max_activity DECIMAL(5,4) NOT NULL,
  color_hex VARCHAR(7) NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default color mappings
INSERT INTO activity_color_mapping (min_activity, max_activity, color_hex, color_name, description, sort_order) VALUES
(0.0, 0.2, '#6b7280', 'gray', 'Low/No Activity', 1),
(0.2, 0.4, '#f97316', 'orange', 'Low-Medium Activity', 2),
(0.4, 0.6, '#eab308', 'yellow', 'Medium Activity', 3),
(0.6, 0.8, '#84cc16', 'lime', 'Medium-High Activity', 4),
(0.8, 1.0, '#22c55e', 'green', 'High Activity', 5)
ON CONFLICT DO NOTHING;

-- Activity Statistics Table
-- Stores daily/hourly statistics for performance monitoring
CREATE TABLE IF NOT EXISTS activity_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  trader_id VARCHAR(50),
  total_data_points INTEGER NOT NULL DEFAULT 0,
  avg_activity_level DECIMAL(5,4) NOT NULL DEFAULT 0,
  peak_activity_level DECIMAL(5,4) NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  total_volume DECIMAL(15,2) NOT NULL DEFAULT 0,
  active_traders_count INTEGER NOT NULL DEFAULT 0,
  zero_activity_periods INTEGER NOT NULL DEFAULT 0,
  high_activity_periods INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, hour, trader_id)
);

-- Indexes for activity_statistics
CREATE INDEX IF NOT EXISTS idx_activity_stats_date ON activity_statistics(date);
CREATE INDEX IF NOT EXISTS idx_activity_stats_hour ON activity_statistics(hour);
CREATE INDEX IF NOT EXISTS idx_activity_stats_trader ON activity_statistics(trader_id);
CREATE INDEX IF NOT EXISTS idx_activity_stats_date_hour ON activity_statistics(date, hour);

-- Function to automatically update activity_heatmap_aggregates
CREATE OR REPLACE FUNCTION update_activity_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert aggregate data for 30-minute time slots
  INSERT INTO activity_heatmap_aggregates (
    trader_id,
    time_slot,
    slot_duration_minutes,
    avg_activity_level,
    total_trades,
    total_volume,
    peak_activity,
    activity_color,
    data_points_count,
    updated_at
  )
  SELECT 
    NEW.trader_id,
    date_trunc('hour', NEW.timestamp) + 
      INTERVAL '30 minutes' * FLOOR(EXTRACT(MINUTE FROM NEW.timestamp) / 30) as time_slot,
    30,
    AVG(activity_level),
    SUM(trade_frequency),
    SUM(trading_volume),
    MAX(activity_level),
    CASE 
      WHEN AVG(activity_level) >= 0.8 THEN '#22c55e'
      WHEN AVG(activity_level) >= 0.6 THEN '#84cc16'
      WHEN AVG(activity_level) >= 0.4 THEN '#eab308'
      WHEN AVG(activity_level) >= 0.2 THEN '#f97316'
      ELSE '#6b7280'
    END,
    COUNT(*),
    NOW()
  FROM trading_activity 
  WHERE trader_id = NEW.trader_id 
    AND timestamp >= date_trunc('hour', NEW.timestamp) + 
        INTERVAL '30 minutes' * FLOOR(EXTRACT(MINUTE FROM NEW.timestamp) / 30)
    AND timestamp < date_trunc('hour', NEW.timestamp) + 
        INTERVAL '30 minutes' * (FLOOR(EXTRACT(MINUTE FROM NEW.timestamp) / 30) + 1)
  GROUP BY trader_id
  ON CONFLICT (trader_id, time_slot, slot_duration_minutes) 
  DO UPDATE SET
    avg_activity_level = EXCLUDED.avg_activity_level,
    total_trades = EXCLUDED.total_trades,
    total_volume = EXCLUDED.total_volume,
    peak_activity = EXCLUDED.peak_activity,
    activity_color = EXCLUDED.activity_color,
    data_points_count = EXCLUDED.data_points_count,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update aggregates
DROP TRIGGER IF EXISTS trigger_update_activity_aggregates ON trading_activity;
CREATE TRIGGER trigger_update_activity_aggregates
  AFTER INSERT ON trading_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_aggregates();

-- Function to clean up old activity data (keep last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete activity data older than 7 days
  DELETE FROM trading_activity 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete aggregate data older than 30 days
  DELETE FROM activity_heatmap_aggregates 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete statistics older than 90 days
  DELETE FROM activity_statistics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_trading_activity_recent ON trading_activity(trader_id, timestamp DESC) 
  WHERE timestamp > NOW() - INTERVAL '24 hours';

CREATE INDEX IF NOT EXISTS idx_heatmap_aggregates_recent ON activity_heatmap_aggregates(trader_id, time_slot DESC) 
  WHERE time_slot > NOW() - INTERVAL '7 days';

-- Comments for documentation
COMMENT ON TABLE trading_activity IS 'Stores real-time trading activity scores calculated from Zimtra polling data';
COMMENT ON TABLE activity_heatmap_aggregates IS 'Pre-calculated aggregate data for heatmap visualization performance';
COMMENT ON TABLE activity_thresholds IS 'Configurable thresholds for activity level calculations';
COMMENT ON TABLE activity_color_mapping IS 'Color mappings for different activity levels in heatmap visualization';
COMMENT ON TABLE activity_statistics IS 'Daily and hourly statistics for monitoring and analytics';

COMMENT ON COLUMN trading_activity.activity_level IS 'Normalized activity score between 0.0 and 1.0';
COMMENT ON COLUMN trading_activity.trading_volume IS 'Total trading volume in USD for the period';
COMMENT ON COLUMN trading_activity.trade_frequency IS 'Number of trades executed in the period';
COMMENT ON COLUMN trading_activity.portfolio_changes IS 'Number of position changes in the period';
COMMENT ON COLUMN trading_activity.raw_score IS 'Raw activity score before normalization';
COMMENT ON COLUMN trading_activity.normalized_score IS 'Normalized activity score (0.0-1.0)';