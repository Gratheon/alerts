import { storage } from "../storage";
import { sql } from "@databases/mysql";
import { alertModel } from "./alerts";
import { alertChannelModel } from "./alertChannel";
import { logger } from "../logger";

export const alertEvaluator = {
  async evaluateRules() {
    logger.info("Starting alert rule evaluation");

    const rules = await storage().query(
      sql`SELECT id, user_id, hive_id, metric_type, condition_type, threshold_value, duration_minutes, enabled 
          FROM alert_rules 
          WHERE enabled = true`
    );

    logger.info(`Found ${rules.length} active alert rules to evaluate`);
  },

  async shouldSendAlert(user_id: number, channel_type: string): Promise<boolean> {
    const config = await alertChannelModel.getConfig(user_id, channel_type);
    if (!config || !config.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    const [startH, startM] = (config.time_start || '00:00').split(':').map(Number);
    const [endH, endM] = (config.time_end || '23:59').split(':').map(Number);
    const start = startH + startM / 60;
    const end = endH + endM / 60;

    return currentHour >= start && currentHour < end;
  },

  async createAndDeliverAlert(user_id: number, text: string, hive_id: string, metric_type: string, metric_value: number, alert_rule_id: number) {
    const alertId = await alertModel.createAlert(user_id, {
      text,
      hive_id,
      metric_type,
      metric_value,
      alert_rule_id
    });

    const channels = await alertChannelModel.getAll(user_id);

    for (const channel of channels) {
      if (!channel.enabled) continue;

      const shouldSend = await this.shouldSendAlert(user_id, channel.channel_type);
      if (!shouldSend) {
        logger.info(`Skipping alert delivery for user ${user_id} on ${channel.channel_type} (outside time window)`);
        continue;
      }

      logger.info(`TODO: Deliver alert ${alertId} to user ${user_id} via ${channel.channel_type}`);
    }

    await alertModel.markAsDelivered(alertId);

    return alertId;
  }
};

