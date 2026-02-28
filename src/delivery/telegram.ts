import fetch from 'cross-fetch';
import config from '../config/index';
import { logger } from '../logger';

function getBotToken(): string {
    if (!config.telegram.botToken) {
        throw new Error('Telegram bot not configured. Please add botToken to config.');
    }
    return config.telegram.botToken;
}

async function sendTelegramMessage(chatId: number | string, message: string) {
    const token = getBotToken();
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    });

    const payload = await response.json() as any;
    if (!response.ok || !payload.ok) {
        const reason = payload?.description || `Telegram API returned HTTP ${response.status}`;
        throw new Error(reason);
    }

    return payload.result;
}

export interface TelegramDeliveryResult {
    success: boolean;
    messageId?: number;
    error?: string;
}

/**
 * Send an alert message via Telegram Bot API
 * @param username - Telegram username (without @ prefix)
 * @param message - Plain text message body
 * @returns Promise with delivery result
 */
export async function sendAlertTelegram({
    username,
    message
}: {
    username: string;
    message: string;
}): Promise<TelegramDeliveryResult> {
    try {
        // Add @ prefix if not present
        const formattedUsername = username.startsWith('@') ? username : `@${username}`;
        const response = await sendTelegramMessage(formattedUsername, message);
        
        logger.info('Alert sent successfully via Telegram', { 
            messageId: response.message_id as number,
            username: formattedUsername,
            chatId: response.chat?.id
        });
        
        return {
            success: true,
            messageId: response.message_id as number
        };
    } catch (error: any) {
        logger.error('Failed to send alert via Telegram', { 
            error: error.message || error, 
            username,
            hint: 'User may need to /start the bot first, or username may be incorrect'
        });
        
        return {
            success: false,
            error: error.message || 'Unknown error sending Telegram message'
        };
    }
}

/**
 * Send an alert message via Telegram Bot API using chat ID
 * This is more reliable than username-based sending
 * @param chatId - Telegram chat ID (numeric)
 * @param message - Plain text message body
 * @returns Promise with delivery result
 */
export async function sendAlertTelegramByChatId({
    chatId,
    message
}: {
    chatId: number;
    message: string;
}): Promise<TelegramDeliveryResult> {
    try {
        const response = await sendTelegramMessage(chatId, message);
        
        logger.info('Alert sent successfully via Telegram', { 
            messageId: response.message_id as number,
            chatId
        });
        
        return {
            success: true,
            messageId: response.message_id as number
        };
    } catch (error: any) {
        logger.error('Failed to send alert via Telegram', { 
            error: error.message || error, 
            chatId 
        });
        
        return {
            success: false,
            error: error.message || 'Unknown error sending Telegram message'
        };
    }
}
