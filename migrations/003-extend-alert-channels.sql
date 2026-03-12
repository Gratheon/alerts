ALTER TABLE alert_channel_config
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_user_channel ON alert_channel_config(user_id, channel_type);
