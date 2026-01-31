import { sql } from "@databases/mysql";
import { storage } from "../storage";

export const alertDeliveryLogModel = {
  async logDeliveryAttempt(alert_id: number, user_id: number, channel_type: string, status: 'pending' | 'sent' | 'failed', errorMessage?: string, externalMessageId?: string) {
    const delivery_time = status === 'sent' ? new Date() : null;
    
    await storage().query(sql`
      INSERT INTO alert_delivery_log (alert_id, user_id, channel_type, delivery_status, delivery_time, error_message, external_message_id, retry_count)
      VALUES (${alert_id}, ${user_id}, ${channel_type}, ${status}, ${delivery_time}, ${errorMessage || null}, ${externalMessageId || null}, 0)
    `);
  },

  async updateDeliveryStatus(alert_id: number, channel_type: string, status: 'sent' | 'failed', errorMessage?: string, externalMessageId?: string) {
    const delivery_time = status === 'sent' ? new Date() : null;
    
    await storage().query(sql`
      UPDATE alert_delivery_log 
      SET delivery_status=${status}, 
          delivery_time=${delivery_time}, 
          error_message=${errorMessage || null}, 
          external_message_id=${externalMessageId || null},
          retry_count=retry_count+1
      WHERE alert_id=${alert_id} AND channel_type=${channel_type}
    `);
  },

  async getDeliveryStatus(alert_id: number) {
    return await storage().query(sql`
      SELECT channel_type, delivery_status, delivery_time, error_message, external_message_id, retry_count
      FROM alert_delivery_log
      WHERE alert_id=${alert_id}
      ORDER BY created_at ASC
    `);
  },

  async getFailedDeliveries(maxRetries = 3) {
    return await storage().query(sql`
      SELECT alert_id, user_id, channel_type, error_message, retry_count
      FROM alert_delivery_log
      WHERE delivery_status='failed' AND retry_count < ${maxRetries}
      ORDER BY created_at DESC
      LIMIT 100
    `);
  }
};
