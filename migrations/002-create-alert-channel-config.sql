CREATE TABLE IF NOT EXISTS alert_channel_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  channel_type VARCHAR(32) NOT NULL DEFAULT 'SMS',
  phone_number VARCHAR(32),
  time_start VARCHAR(5), -- e.g., '09:00'
  time_end VARCHAR(5),   -- e.g., '18:00'
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE KEY (user_id, channel_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 