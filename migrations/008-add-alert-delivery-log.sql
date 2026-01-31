-- Create alert_delivery_log table to track per-channel delivery status
-- This allows us to track which channels succeeded/failed and retry failed deliveries

CREATE TABLE IF NOT EXISTS alert_delivery_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  user_id INT NOT NULL,
  channel_type VARCHAR(32) NOT NULL,
  delivery_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  delivery_time TIMESTAMP NULL,
  error_message TEXT NULL,
  external_message_id VARCHAR(255) NULL COMMENT 'MessageId from SES, MessageSid from Twilio, or Telegram message ID',
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_alert_id (alert_id),
  INDEX idx_user_channel (user_id, channel_type),
  INDEX idx_status (delivery_status),
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
