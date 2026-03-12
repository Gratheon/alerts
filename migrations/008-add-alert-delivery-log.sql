CREATE TABLE IF NOT EXISTS alert_delivery_log (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  channel_type VARCHAR(32) NOT NULL,
  delivery_status VARCHAR(16) NOT NULL DEFAULT 'pending',
  delivery_time TIMESTAMPTZ NULL,
  error_message TEXT NULL,
  external_message_id VARCHAR(255) NULL,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_alert_delivery_status CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  CONSTRAINT fk_alert_delivery_log_alerts FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alert_id ON alert_delivery_log(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_delivery_user_channel ON alert_delivery_log(user_id, channel_type);
CREATE INDEX IF NOT EXISTS idx_status ON alert_delivery_log(delivery_status);
