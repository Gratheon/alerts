CREATE TABLE IF NOT EXISTS alert_rules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  hive_id VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  condition_type VARCHAR(20) NOT NULL,
  threshold_value NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS alert_rule_id INTEGER,
  ADD COLUMN IF NOT EXISTS hive_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS metric_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS metric_value NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_alert_rule ON alerts(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_delivered ON alerts(delivered);
CREATE INDEX IF NOT EXISTS idx_user_hive ON alert_rules(user_id, hive_id);
CREATE INDEX IF NOT EXISTS idx_enabled ON alert_rules(enabled);
