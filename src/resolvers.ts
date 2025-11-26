import config from './config/index';
import { alertModel } from './models/alerts';
import error_code, { err } from './error_code';
import { logger } from './logger';
import { alertChannelModel } from './models/alertChannel';
import { alertRuleModel } from './models/alertRule';

export const resolvers = {
	Query: {
		alerts: async (_, __, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for alerts resolver")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}

			const alerts = await alertModel.getAlerts(ctx.uid);
			return alerts.map(alert => ({
				id: alert.id,
				text: alert.text,
				date_added: alert.date_added,
				hiveId: alert.hive_id,
				metricType: alert.metric_type,
				metricValue: alert.metric_value,
				delivered: alert.delivered
			}));
		},
		alertChannels: async (_, __, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for alertChannels resolver")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}
			const rows = await alertChannelModel.getAll(ctx.uid);
			return rows.map(row => ({
				id: row.id,
				channelType: row.channel_type,
				phoneNumber: row.phone_number,
				email: row.email,
				telegramUsername: row.telegram_username,
				timeStart: row.time_start,
				timeEnd: row.time_end,
				enabled: row.enabled
			}));
		},
		alertRules: async (_, { hiveId, metricType }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for alertRules resolver")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}
			const rules = await alertRuleModel.getAll(ctx.uid, hiveId, metricType);
			return rules.map(rule => ({
				id: rule.id,
				hiveId: rule.hive_id,
				metricType: rule.metric_type,
				conditionType: rule.condition_type,
				thresholdValue: rule.threshold_value,
				durationMinutes: rule.duration_minutes,
				enabled: rule.enabled,
				createdAt: rule.created_at,
				updatedAt: rule.updated_at
			}));
		},
	},
	Mutation: {
		setAlertChannel: async (_, { config }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for setAlertChannel mutation")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}

			if (config.phoneNumber && !/^\+?[0-9]{7,15}$/.test(config.phoneNumber)) {
				return err("INVALID_PHONE_NUMBER");
			}
			if (config.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
				return err("INVALID_EMAIL");
			}
			if (config.timeStart && config.timeEnd && config.timeStart >= config.timeEnd) {
				return err("INVALID_TIME_RANGE");
			}

			const row = await alertChannelModel.setConfig(ctx.uid, {
				channel_type: config.channelType,
				phone_number: config.phoneNumber,
				email: config.email,
				telegram_username: config.telegramUsername,
				time_start: config.timeStart,
				time_end: config.timeEnd,
				enabled: config.enabled,
			});
			if (!row) return null;
			return {
				id: row.id,
				channelType: row.channel_type,
				phoneNumber: row.phone_number,
				email: row.email,
				telegramUsername: row.telegram_username,
				timeStart: row.time_start,
				timeEnd: row.time_end,
				enabled: row.enabled
			};
		},
		deleteAlertChannel: async (_, { channelType }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for deleteAlertChannel mutation")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}
			return await alertChannelModel.deleteConfig(ctx.uid, channelType);
		},
		createAlertRule: async (_, { rule }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for createAlertRule mutation")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}

			const created = await alertRuleModel.create(ctx.uid, {
				hive_id: rule.hiveId,
				metric_type: rule.metricType,
				condition_type: rule.conditionType,
				threshold_value: rule.thresholdValue,
				duration_minutes: rule.durationMinutes,
				enabled: rule.enabled ?? true
			});

			return {
				id: created.id,
				hiveId: created.hive_id,
				metricType: created.metric_type,
				conditionType: created.condition_type,
				thresholdValue: created.threshold_value,
				durationMinutes: created.duration_minutes,
				enabled: created.enabled,
				createdAt: created.created_at,
				updatedAt: created.updated_at
			};
		},
		updateAlertRule: async (_, { id, rule }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for updateAlertRule mutation")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}

			const updated = await alertRuleModel.update(ctx.uid, id, {
				hive_id: rule.hiveId,
				metric_type: rule.metricType,
				condition_type: rule.conditionType,
				threshold_value: rule.thresholdValue,
				duration_minutes: rule.durationMinutes,
				enabled: rule.enabled ?? true
			});

			return {
				id: updated.id,
				hiveId: updated.hive_id,
				metricType: updated.metric_type,
				conditionType: updated.condition_type,
				thresholdValue: updated.threshold_value,
				durationMinutes: updated.duration_minutes,
				enabled: updated.enabled,
				createdAt: updated.created_at,
				updatedAt: updated.updated_at
			};
		},
		deleteAlertRule: async (_, { id }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for deleteAlertRule mutation")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}
			return await alertRuleModel.delete(ctx.uid, id);
		},
	},
}