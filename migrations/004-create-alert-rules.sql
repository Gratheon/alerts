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

SET @alert_rule_id_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND column_name = 'alert_rule_id'
);
SET @alert_rule_id_sql := IF(
  @alert_rule_id_exists = 0,
  'ALTER TABLE alerts ADD COLUMN alert_rule_id INT NULL',
  'SELECT 1'
);
PREPARE alert_rule_id_stmt FROM @alert_rule_id_sql;
EXECUTE alert_rule_id_stmt;
DEALLOCATE PREPARE alert_rule_id_stmt;

SET @hive_id_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND column_name = 'hive_id'
);
SET @hive_id_sql := IF(
  @hive_id_exists = 0,
  'ALTER TABLE alerts ADD COLUMN hive_id VARCHAR(50) NULL',
  'SELECT 1'
);
PREPARE hive_id_stmt FROM @hive_id_sql;
EXECUTE hive_id_stmt;
DEALLOCATE PREPARE hive_id_stmt;

SET @metric_type_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND column_name = 'metric_type'
);
SET @metric_type_sql := IF(
  @metric_type_exists = 0,
  'ALTER TABLE alerts ADD COLUMN metric_type VARCHAR(50) NULL',
  'SELECT 1'
);
PREPARE metric_type_stmt FROM @metric_type_sql;
EXECUTE metric_type_stmt;
DEALLOCATE PREPARE metric_type_stmt;

SET @metric_value_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND column_name = 'metric_value'
);
SET @metric_value_sql := IF(
  @metric_value_exists = 0,
  'ALTER TABLE alerts ADD COLUMN metric_value DECIMAL(10, 2) NULL',
  'SELECT 1'
);
PREPARE metric_value_stmt FROM @metric_value_sql;
EXECUTE metric_value_stmt;
DEALLOCATE PREPARE metric_value_stmt;

SET @delivered_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND column_name = 'delivered'
);
SET @delivered_sql := IF(
  @delivered_exists = 0,
  'ALTER TABLE alerts ADD COLUMN delivered BOOLEAN DEFAULT FALSE',
  'SELECT 1'
);
PREPARE delivered_stmt FROM @delivered_sql;
EXECUTE delivered_stmt;
DEALLOCATE PREPARE delivered_stmt;

SET @delivery_attempts_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND column_name = 'delivery_attempts'
);
SET @delivery_attempts_sql := IF(
  @delivery_attempts_exists = 0,
  'ALTER TABLE alerts ADD COLUMN delivery_attempts INT DEFAULT 0',
  'SELECT 1'
);
PREPARE delivery_attempts_stmt FROM @delivery_attempts_sql;
EXECUTE delivery_attempts_stmt;
DEALLOCATE PREPARE delivery_attempts_stmt;

SET @idx_alert_rule_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND index_name = 'idx_alert_rule'
);
SET @idx_alert_rule_sql := IF(
  @idx_alert_rule_exists = 0,
  'ALTER TABLE alerts ADD INDEX idx_alert_rule (alert_rule_id)',
  'SELECT 1'
);
PREPARE idx_alert_rule_stmt FROM @idx_alert_rule_sql;
EXECUTE idx_alert_rule_stmt;
DEALLOCATE PREPARE idx_alert_rule_stmt;

SET @idx_delivered_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'alerts'
    AND index_name = 'idx_delivered'
);
SET @idx_delivered_sql := IF(
  @idx_delivered_exists = 0,
  'ALTER TABLE alerts ADD INDEX idx_delivered (delivered)',
  'SELECT 1'
);
PREPARE idx_delivered_stmt FROM @idx_delivered_sql;
EXECUTE idx_delivered_stmt;
DEALLOCATE PREPARE idx_delivered_stmt;
