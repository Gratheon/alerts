import * as TelegramBotLib from 'node-telegram-bot-api';
import config from '../config/index';
import { logger } from '../logger';

const TelegramBot = TelegramBotLib.default || TelegramBotLib;

// Initialize Telegram bot (singleton)
let bot: any | null = null;

function getTelegramBot(): any {
    if (!bot && config.telegram.botToken) {
        // polling: false because we're only sending messages, not receiving
        bot = new TelegramBot(config.telegram.botToken, { polling: false });
    }
    if (!bot) {
        throw new Error('Telegram bot not configured. Please add botToken to config.');
    }
    return bot;
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
        const bot = getTelegramBot();
        
        // Add @ prefix if not present
        const formattedUsername = username.startsWith('@') ? username : `@${username}`;
        
        // Send message by username
        // Note: This requires the user to have started the bot first
        const response = await bot.sendMessage(formattedUsername, message);
        
        logger.info('Alert sent successfully via Telegram', { 
            messageId: response.message_id,
            username: formattedUsername,
            chatId: response.chat.id
        });
        
        return {
            success: true,
            messageId: response.message_id
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
        const bot = getTelegramBot();
        
        const response = await bot.sendMessage(chatId, message);
        
        logger.info('Alert sent successfully via Telegram', { 
            messageId: response.message_id,
            chatId
        });
        
        return {
            success: true,
            messageId: response.message_id
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
