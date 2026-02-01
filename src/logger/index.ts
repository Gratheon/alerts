import { createLogger } from '@gratheon/log-lib';
import config from '../config/index';

// Create logger with MySQL database persistence and log level from environment
const { logger, fastifyLogger } = createLogger({
    mysql: {
        host: config.mysql.host,
        port: parseInt(config.mysql.port),
        user: config.mysql.user,
        password: config.mysql.password,
        database: 'logs' // Use separate logs database
    },
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 
              (process.env.ENV_ID === 'dev' ? 'debug' : 'info')
});

export { logger, fastifyLogger };
