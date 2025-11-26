CREATE TABLE IF NOT EXISTS alert_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hive_id VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  condition_type VARCHAR(20) NOT NULL,
  threshold_value DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_hive (user_id, hive_id),
  INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE alerts
  ADD COLUMN alert_rule_id INT NULL,
  ADD COLUMN hive_id VARCHAR(50) NULL,
  ADD COLUMN metric_type VARCHAR(50) NULL,
  ADD COLUMN metric_value DECIMAL(10, 2) NULL,
  ADD COLUMN delivered BOOLEAN DEFAULT FALSE,
  ADD COLUMN delivery_attempts INT DEFAULT 0,
  ADD INDEX idx_alert_rule (alert_rule_id),
  ADD INDEX idx_delivered (delivered);

