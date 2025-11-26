import { sql } from "@databases/mysql";
import { storage } from "../storage";

export const alertChannelModel = {
  async getAll(user_id) {
    const rows = await storage().query(
      sql`SELECT id, channel_type, phone_number, email, telegram_username, time_start, time_end, enabled 
          FROM alert_channel_config 
          WHERE user_id=${user_id}`
    );
    return rows;
  },

  async getConfig(user_id, channel_type) {
    const rows = await storage().query(
      sql`SELECT id, channel_type, phone_number, email, telegram_username, time_start, time_end, enabled 
          FROM alert_channel_config 
          WHERE user_id=${user_id} AND channel_type=${channel_type}`
    );
    return rows[0] || null;
  },

  async setConfig(user_id, { channel_type, phone_number, email, telegram_username, time_start, time_end, enabled }) {
    await storage().query(sql`
      INSERT INTO alert_channel_config (user_id, channel_type, phone_number, email, telegram_username, time_start, time_end, enabled)
      VALUES (${user_id}, ${channel_type}, ${phone_number}, ${email}, ${telegram_username}, ${time_start}, ${time_end}, ${enabled})
      ON DUPLICATE KEY UPDATE
        phone_number=VALUES(phone_number),
        email=VALUES(email),
        telegram_username=VALUES(telegram_username),
        time_start=VALUES(time_start),
        time_end=VALUES(time_end),
        enabled=VALUES(enabled)
    `);
    return this.getConfig(user_id, channel_type);
  },

  async deleteConfig(user_id, channel_type) {
    await storage().query(
      sql`DELETE FROM alert_channel_config WHERE user_id=${user_id} AND channel_type=${channel_type}`
    );
    return true;
  },
}; 