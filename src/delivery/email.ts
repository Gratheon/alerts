import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import config from '../config/index';
import { logger } from '../logger';

// Initialize SES client (singleton)
const sesClient = new SESClient({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export interface EmailDeliveryResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send an alert email via AWS SES
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param message - Plain text message body
 * @returns Promise with delivery result
 */
export async function sendAlertEmail({
    to,
    subject,
    message
}: {
    to: string;
    subject: string;
    message: string;
}): Promise<EmailDeliveryResult> {
    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: message,
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: config.aws.sesFromEmail,
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        
        logger.info('Alert email sent successfully via SES', { 
            messageId: response.MessageId, 
            to, 
            subject 
        });
        
        return {
            success: true,
            messageId: response.MessageId
        };
    } catch (error: any) {
        logger.error('Failed to send alert email via SES', { 
            error: error.message || error, 
            to, 
            subject 
        });
        
        return {
            success: false,
            error: error.message || 'Unknown error sending email'
        };
    }
}
