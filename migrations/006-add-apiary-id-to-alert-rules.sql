ALTER TABLE alert_rules
  ADD COLUMN IF NOT EXISTS apiary_id VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_apiary ON alert_rules(apiary_id);
