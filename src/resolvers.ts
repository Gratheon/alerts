// global dependencies

// local dependencies
import config from './config/index';
import { alertModel } from './models/alerts';
import error_code, { err } from './error_code';
import { logger } from './logger';
import { alertChannelModel } from './models/alertChannel';

export const resolvers = {
	Query: {
		alerts: async (_, __, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for alerts resolver")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}

			return await alertModel.getAlerts(ctx.uid);
		},
		alertChannelConfig: async (_, __, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for alertChannelConfig resolver")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}
			const row = await alertChannelModel.getConfig(ctx.uid);
			if (!row) return null;
			return {
				channelType: row.channel_type,
				phoneNumber: row.phone_number,
				timeStart: row.time_start,
				timeEnd: row.time_end,
				enabled: row.enabled
			};
		},
	},
	Mutation: {
		setAlertChannelConfig: async (_, { config }, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for setAlertChannelConfig mutation")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}
			// Basic validation
			if (config.phoneNumber && !/^\+?[0-9]{7,15}$/.test(config.phoneNumber)) {
				return err("INVALID_PHONE_NUMBER");
			}
			if (config.timeStart && config.timeEnd && config.timeStart >= config.timeEnd) {
				return err("INVALID_TIME_RANGE");
			}
			const row = await alertChannelModel.setConfig(ctx.uid, {
				phone_number: config.phoneNumber,
				time_start: config.timeStart,
				time_end: config.timeEnd,
				enabled: config.enabled,
			});
			if (!row) return null;
			return {
				channelType: row.channel_type,
				phoneNumber: row.phone_number,
				timeStart: row.time_start,
				timeEnd: row.time_end,
				enabled: row.enabled
			};
		},
	},
}