import { sql } from "@databases/mysql";
import { storage } from "../storage";

export const alertChannelModel = {
  async getConfig(user_id) {
    const rows = await storage().query(
      sql`SELECT channel_type, phone_number, time_start, time_end, enabled FROM alert_channel_config WHERE user_id=${user_id} AND channel_type='SMS'`
    );
    return rows[0] || null;
  },

  async setConfig(user_id, { phone_number, time_start, time_end, enabled }) {
    // Upsert logic
    await storage().query(sql`
      INSERT INTO alert_channel_config (user_id, channel_type, phone_number, time_start, time_end, enabled)
      VALUES (${user_id}, 'SMS', ${phone_number}, ${time_start}, ${time_end}, ${enabled})
      ON DUPLICATE KEY UPDATE
        phone_number=VALUES(phone_number),
        time_start=VALUES(time_start),
        time_end=VALUES(time_end),
        enabled=VALUES(enabled)
    `);
    return this.getConfig(user_id);
  },
}; 