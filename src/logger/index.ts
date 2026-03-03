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

function pickHeaders(headers: any): Record<string, any> | undefined {
    if (!headers || typeof headers !== 'object') return undefined;

    const allowed = ['content-type', 'content-length', 'user-agent', 'x-request-id', 'x-correlation-id', 'host'];
    const out: Record<string, any> = {};

    for (const key of allowed) {
        const value = headers[key];
        if (value !== undefined) {
            out[key] = value;
        }
    }

    return Object.keys(out).length ? out : undefined;
}

function sanitizeRequest(req: any): Record<string, any> {
    if (!req || typeof req !== 'object') return {};

    return {
        id: req.id,
        method: req.method,
        url: req.url,
        path: req.path,
        remoteAddress: req.remoteAddress || req.ip,
        headers: pickHeaders(req.headers),
    };
}

function sanitizeResponse(res: any): Record<string, any> {
    if (!res || typeof res !== 'object') return {};

    return {
        statusCode: res.statusCode,
        responseTime: res.responseTime,
    };
}

function sanitizeError(err: any): Record<string, any> {
    if (!err || typeof err !== 'object') return {};

    return {
        name: err.name,
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
    };
}

function sanitizePayload(value: any, depth: number = 0): any {
    if (value == null) return value;
    if (depth > 2) return '[Truncated]';
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizePayload(item, depth + 1));

    const out: Record<string, any> = {};
    const entries = Object.entries(value).slice(0, 30);

    for (const [key, val] of entries) {
        if (key === 'raw' || key === 'socket' || key.startsWith('_')) continue;
        if (key === 'req' || key === 'request') {
            out[key] = sanitizeRequest(val);
            continue;
        }
        if (key === 'res' || key === 'response') {
            out[key] = sanitizeResponse(val);
            continue;
        }
        if (key === 'err' || key === 'error') {
            out[key] = sanitizeError(val);
            continue;
        }
        out[key] = sanitizePayload(val, depth + 1);
    }

    return out;
}

function normalizeFastifyLog(msg: any, args: any[]): { message: string; meta?: any } {
    const messageFromArgs = args.find((arg) => typeof arg === 'string') as string | undefined;

    if (msg instanceof Error) {
        return {
            message: messageFromArgs ? `${messageFromArgs}: ${msg.message}` : msg.message,
            meta: { err: sanitizeError(msg) },
        };
    }

    if (msg && typeof msg === 'object') {
        const defaultMessage = typeof msg.msg === 'string' ? msg.msg : 'fastify request';
        return {
            message: messageFromArgs || defaultMessage,
            meta: sanitizePayload(msg),
        };
    }

    return { message: messageFromArgs ? `${String(msg)} ${messageFromArgs}` : String(msg) };
}

let wrappedFastifyLogger: typeof fastifyLogger;
wrappedFastifyLogger = {
    info: (msg: any, ...args: any[]) => {
        const normalized = normalizeFastifyLog(msg, args);
        logger.info(normalized.message, normalized.meta);
    },
    warn: (msg: any, ...args: any[]) => {
        const normalized = normalizeFastifyLog(msg, args);
        logger.warn(normalized.message, normalized.meta);
    },
    error: (msg: any, ...args: any[]) => {
        const normalized = normalizeFastifyLog(msg, args);
        logger.error(normalized.message, normalized.meta);
    },
    debug: (msg: any, ...args: any[]) => {
        const normalized = normalizeFastifyLog(msg, args);
        logger.debug(normalized.message, normalized.meta);
    },
    fatal: (msg: any, ...args: any[]) => {
        const normalized = normalizeFastifyLog(msg, args);
        logger.error(normalized.message, { ...normalized.meta, fatal: true });
    },
    trace: () => {
        // Intentionally ignored to keep noise low in alerts service.
    },
    child: () => wrappedFastifyLogger,
};

export { logger, wrappedFastifyLogger as fastifyLogger };
