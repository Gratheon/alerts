import { sql, storage } from "../storage";

export const alertChannelModel = {
  async getAll(user_id) {
    const rows = await storage().query(
      sql`SELECT id, channel_type, phone_number, email, telegram_username, telegram_chat_id, time_start, time_end, enabled 
          FROM alert_channel_config 
          WHERE user_id=${user_id}`
    );
    return rows;
  },

  async getConfig(user_id, channel_type) {
    const rows = await storage().query(
      sql`SELECT id, channel_type, phone_number, email, telegram_username, telegram_chat_id, time_start, time_end, enabled 
          FROM alert_channel_config 
          WHERE user_id=${user_id} AND channel_type=${channel_type}`
    );
    return rows[0] || null;
  },

  async setConfig(user_id, { channel_type, phone_number, email, telegram_username, telegram_chat_id, time_start, time_end, enabled }) {
    await storage().query(sql`
      INSERT INTO alert_channel_config (user_id, channel_type, phone_number, email, telegram_username, telegram_chat_id, time_start, time_end, enabled)
      VALUES (${user_id}, ${channel_type}, ${phone_number}, ${email}, ${telegram_username}, ${telegram_chat_id}, ${time_start}, ${time_end}, ${enabled})
      ON CONFLICT (user_id, channel_type) DO UPDATE SET
        phone_number=EXCLUDED.phone_number,
        email=EXCLUDED.email,
        telegram_username=EXCLUDED.telegram_username,
        telegram_chat_id=EXCLUDED.telegram_chat_id,
        time_start=EXCLUDED.time_start,
        time_end=EXCLUDED.time_end,
        enabled=EXCLUDED.enabled
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
