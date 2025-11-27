ALTER TABLE alert_rules
  ADD COLUMN apiary_id VARCHAR(50) NULL AFTER hive_id,
  ADD INDEX idx_apiary (apiary_id);

