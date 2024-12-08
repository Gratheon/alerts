// global dependencies

// local dependencies
import config from './config/index';
import { alertModel } from './models/alerts';
import error_code, { err } from './error_code';
import { logger } from './logger';

export const resolvers = {
	Query: {
		alerts: async (_, __, ctx) => {
			if (!ctx.uid) {
				logger.warn("Authentication required for alerts resolver")
				return err(error_code.AUTHENTICATION_REQUIRED);
			}

			return await alertModel.getAlerts(ctx.uid);
		},
	}
}