ALTER TABLE alert_channel_config
  ADD COLUMN email VARCHAR(255) NULL,
  ADD COLUMN telegram_username VARCHAR(255) NULL;

CREATE INDEX idx_user_channel ON alert_channel_config(user_id, channel_type);

