ALTER TABLE alert_channel_config
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_telegram_chat_id ON alert_channel_config(telegram_chat_id);
