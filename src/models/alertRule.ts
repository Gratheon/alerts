import { sql } from "@databases/mysql";
import { storage } from "../storage";

interface AlertRuleData {
  hive_id: string | null;
  apiary_id?: string | null;
  metric_type: string;
  condition_type: string;
  threshold_value: number;
  duration_minutes: number;
  enabled: boolean;
}

export const alertRuleModel = {
  async getAll(user_id, hive_id = null, metric_type = null) {
    let query = sql`SELECT id, hive_id, apiary_id, metric_type, condition_type, threshold_value, duration_minutes, enabled, created_at, updated_at 
        FROM alert_rules 
        WHERE user_id=${user_id}`;

    if (hive_id !== null) {
      query = sql`${query} AND hive_id=${hive_id}`;
    }

    if (metric_type !== null) {
      query = sql`${query} AND metric_type=${metric_type}`;
    }

    return await storage().query(query);
  },

  async create(user_id: number, { hive_id, apiary_id, metric_type, condition_type, threshold_value, duration_minutes, enabled }: AlertRuleData) {
    const result = await storage().query(sql`
      INSERT INTO alert_rules (user_id, hive_id, apiary_id, metric_type, condition_type, threshold_value, duration_minutes, enabled)
      VALUES (${user_id}, ${hive_id}, ${apiary_id}, ${metric_type}, ${condition_type}, ${threshold_value}, ${duration_minutes}, ${enabled})
    `);

    const rows = await storage().query(
      sql`SELECT id, hive_id, apiary_id, metric_type, condition_type, threshold_value, duration_minutes, enabled, created_at, updated_at 
          FROM alert_rules 
          WHERE id=${result.insertId}`
    );
    return rows[0];
  },

  async update(user_id: number, rule_id: number, { hive_id, apiary_id, metric_type, condition_type, threshold_value, duration_minutes, enabled }: AlertRuleData) {
    await storage().query(sql`
      UPDATE alert_rules 
      SET hive_id=${hive_id}, 
          apiary_id=${apiary_id}, 
          metric_type=${metric_type}, 
          condition_type=${condition_type}, 
          threshold_value=${threshold_value}, 
          duration_minutes=${duration_minutes}, 
          enabled=${enabled}
      WHERE id=${rule_id} AND user_id=${user_id}
    `);

    const rows = await storage().query(
      sql`SELECT id, hive_id, apiary_id, metric_type, condition_type, threshold_value, duration_minutes, enabled, created_at, updated_at 
          FROM alert_rules 
          WHERE id=${rule_id}`
    );
    return rows[0];
  },

  async delete(user_id, rule_id) {
    await storage().query(
      sql`DELETE FROM alert_rules WHERE id=${rule_id} AND user_id=${user_id}`
    );
    return true;
  },
};

