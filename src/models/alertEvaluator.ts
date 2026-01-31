import { storage } from "../storage";
import { sql } from "@databases/mysql";
import { alertModel } from "./alerts";
import { alertChannelModel } from "./alertChannel";
import { alertDeliveryLogModel } from "./alertDeliveryLog";
import { logger } from "../logger";
import { sendAlertEmail } from "../delivery/email";
import { sendAlertSms } from "../delivery/sms";
import { sendAlertTelegramByChatId } from "../delivery/telegram";

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

      logger.info(`Delivering alert ${alertId} to user ${user_id} via ${channel.channel_type}`);
      
      let result;
      try {
        switch (channel.channel_type) {
          case 'EMAIL':
            if (!channel.email) {
              logger.warn(`No email configured for user ${user_id}`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', 'No email configured');
              break;
            }
            result = await sendAlertEmail({
              to: channel.email,
              subject: `Gratheon Alert: ${metric_type}`,
              message: text
            });
            if (result.success) {
              logger.info(`Email alert sent to ${channel.email} (messageId: ${result.messageId})`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'sent', undefined, result.messageId);
            } else {
              logger.error(`Failed to send email alert to ${channel.email}: ${result.error}`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', result.error);
            }
            break;

          case 'SMS':
            if (!channel.phone_number) {
              logger.warn(`No phone number configured for user ${user_id}`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', 'No phone number configured');
              break;
            }
            result = await sendAlertSms({
              to: channel.phone_number,
              message: text
            });
            if (result.success) {
              logger.info(`SMS alert sent to ${channel.phone_number} (messageSid: ${result.messageSid})`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'sent', undefined, result.messageSid);
            } else {
              logger.error(`Failed to send SMS alert to ${channel.phone_number}: ${result.error}`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', result.error);
            }
            break;

          case 'TELEGRAM':
            if (!channel.telegram_chat_id) {
              logger.warn(`No Telegram chat ID configured for user ${user_id}. User must start bot first.`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', 'No Telegram chat ID configured');
              break;
            }
            result = await sendAlertTelegramByChatId({
              chatId: channel.telegram_chat_id,
              message: text
            });
            if (result.success) {
              logger.info(`Telegram alert sent to chat ${channel.telegram_chat_id} (messageId: ${result.messageId})`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'sent', undefined, result.messageId?.toString());
            } else {
              logger.error(`Failed to send Telegram alert to chat ${channel.telegram_chat_id}: ${result.error}`);
              await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', result.error);
            }
            break;

          default:
            logger.warn(`Unknown channel type: ${channel.channel_type}`);
            await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', `Unknown channel type: ${channel.channel_type}`);
        }
      } catch (error: any) {
        logger.error(`Exception while delivering alert ${alertId} via ${channel.channel_type}: ${error.message}`);
        await alertDeliveryLogModel.logDeliveryAttempt(alertId, user_id, channel.channel_type, 'failed', error.message);
      }
    }

    await alertModel.markAsDelivered(alertId);

    return alertId;
  },

  async retryFailedDeliveries(maxRetries = 3) {
    logger.info("Starting retry of failed deliveries");

    const failedDeliveries = await alertDeliveryLogModel.getFailedDeliveries(maxRetries);
    logger.info(`Found ${failedDeliveries.length} failed deliveries to retry`);

    for (const delivery of failedDeliveries) {
      const { alert_id, user_id, channel_type, retry_count } = delivery;
      
      logger.info(`Retrying delivery for alert ${alert_id} via ${channel_type} (attempt ${retry_count + 1})`);

      // Get alert details
      const alerts = await storage().query(
        sql`SELECT text, hive_id, metric_type, metric_value FROM alerts WHERE id=${alert_id}`
      );
      
      if (alerts.length === 0) {
        logger.warn(`Alert ${alert_id} not found, skipping retry`);
        continue;
      }

      const alert = alerts[0];
      const channel = await alertChannelModel.getConfig(user_id, channel_type);
      
      if (!channel || !channel.enabled) {
        logger.info(`Channel ${channel_type} disabled for user ${user_id}, skipping retry`);
        continue;
      }

      // Check time window
      const shouldSend = await this.shouldSendAlert(user_id, channel_type);
      if (!shouldSend) {
        logger.info(`Outside time window for user ${user_id} on ${channel_type}, will retry later`);
        continue;
      }

      // Retry delivery
      let result;
      try {
        switch (channel_type) {
          case 'EMAIL':
            if (!channel.email) break;
            result = await sendAlertEmail({
              to: channel.email,
              subject: `Gratheon Alert: ${alert.metric_type}`,
              message: alert.text
            });
            if (result.success) {
              logger.info(`Retry successful: Email sent to ${channel.email}`);
              await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'sent', undefined, result.messageId);
            } else {
              logger.error(`Retry failed: ${result.error}`);
              await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'failed', result.error);
            }
            break;

          case 'SMS':
            if (!channel.phone_number) break;
            result = await sendAlertSms({
              to: channel.phone_number,
              message: alert.text
            });
            if (result.success) {
              logger.info(`Retry successful: SMS sent to ${channel.phone_number}`);
              await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'sent', undefined, result.messageSid);
            } else {
              logger.error(`Retry failed: ${result.error}`);
              await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'failed', result.error);
            }
            break;

          case 'TELEGRAM':
            if (!channel.telegram_chat_id) break;
            result = await sendAlertTelegramByChatId({
              chatId: channel.telegram_chat_id,
              message: alert.text
            });
            if (result.success) {
              logger.info(`Retry successful: Telegram sent to chat ${channel.telegram_chat_id}`);
              await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'sent', undefined, result.messageId?.toString());
            } else {
              logger.error(`Retry failed: ${result.error}`);
              await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'failed', result.error);
            }
            break;
        }
      } catch (error: any) {
        logger.error(`Exception during retry: ${error.message}`);
        await alertDeliveryLogModel.updateDeliveryStatus(alert_id, channel_type, 'failed', error.message);
      }
    }

    logger.info("Completed retry of failed deliveries");
  }
};

