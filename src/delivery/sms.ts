const twilio = require('twilio');
import config from '../config/index';
import { logger } from '../logger';

// Initialize Twilio client (singleton)
const twilioClient = twilio(
    config.twilio.accountSid,
    config.twilio.authToken
);

export interface SmsDeliveryResult {
    success: boolean;
    messageSid?: string;
    error?: string;
}

/**
 * Send an alert SMS via Twilio
 * @param to - Recipient phone number (E.164 format, e.g., +1234567890)
 * @param message - Plain text message body
 * @returns Promise with delivery result
 */
export async function sendAlertSms({
    to,
    message
}: {
    to: string;
    message: string;
}): Promise<SmsDeliveryResult> {
    try {
        const response = await twilioClient.messages.create({
            body: message,
            messagingServiceSid: config.twilio.messagingServiceSid,
            to: to,
        });
        
        logger.info('Alert SMS sent successfully via Twilio', { 
            messageSid: response.sid,
            to,
            status: response.status
        });
        
        return {
            success: true,
            messageSid: response.sid
        };
    } catch (error: any) {
        logger.error('Failed to send alert SMS via Twilio', { 
            error: error.message || error, 
            to 
        });
        
        return {
            success: false,
            error: error.message || 'Unknown error sending SMS'
        };
    }
}
