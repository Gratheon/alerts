-- Add telegram_chat_id column to alert_channel_config
-- Chat IDs are used for reliable Telegram message delivery
-- Users must start the bot first to obtain their chat ID

ALTER TABLE alert_channel_config
  ADD COLUMN telegram_chat_id BIGINT NULL COMMENT 'Telegram chat ID for message delivery';

CREATE INDEX idx_telegram_chat_id ON alert_channel_config(telegram_chat_id);
