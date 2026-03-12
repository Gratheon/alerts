CREATE TABLE IF NOT EXISTS alert_channel_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  channel_type VARCHAR(32) NOT NULL DEFAULT 'SMS',
  phone_number VARCHAR(32),
  time_start VARCHAR(5),
  time_end VARCHAR(5),
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE (user_id, channel_type)
);
