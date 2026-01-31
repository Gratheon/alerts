const { sendAlertEmail } = require('../../app/delivery/email');
const { sendAlertSms } = require('../../app/delivery/sms');
const { sendAlertTelegram, sendAlertTelegramByChatId } = require('../../app/delivery/telegram');

/**
 * Integration tests for alert delivery channels
 * 
 * IMPORTANT: These tests use REAL services and will:
 * - Send actual emails via AWS SES
 * - Send actual SMS messages via Twilio
 * - Send actual Telegram messages via Telegram Bot API
 * 
 * Prerequisites:
 * 1. AWS SES credentials configured in config.dev.ts
 * 2. Twilio credentials configured in config.dev.ts (already set)
 * 3. Telegram bot token configured in config.dev.ts
 * 4. Build TypeScript: npm run build
 * 5. Update test contacts below with your actual values
 * 
 * Run with: npm run test:delivery
 */

describe('Alert Delivery Channels - Integration Tests', () => {
    
    // Test configuration - UPDATE THESE VALUES
    const TEST_EMAIL = 'artkurapov@gmail.com';
    const TEST_PHONE = '+37258058720'; // Phone number in E.164 format
    const TEST_TELEGRAM_USERNAME = 'tot_ra'; // Telegram username (without @)
    const TEST_TELEGRAM_CHAT_ID = 374550738; // Telegram chat ID (more reliable than username)
    
    describe('Email Delivery (AWS SES)', () => {
        
        it('should send alert email to valid address', async () => {
            console.log(`\n📧 Sending test email to ${TEST_EMAIL}...`);
            
            const result = await sendAlertEmail({
                to: TEST_EMAIL,
                subject: 'Gratheon Test Alert - Email Delivery',
                message: 'This is a test alert from the alerts service integration tests.\n\nIf you received this email, the email delivery channel is working correctly!'
            });
            
            expect(result.success).toBe(true);
            expect(result.messageId).toBeDefined();
            expect(result.error).toBeUndefined();
            
            console.log(`✅ Email sent successfully!`);
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Please check your inbox at ${TEST_EMAIL}\n`);
        }, 30000); // 30 second timeout
        
        it('should handle invalid email address gracefully', async () => {
            console.log('\n📧 Testing invalid email handling...');
            
            const result = await sendAlertEmail({
                to: 'invalid-email-address',
                subject: 'Test',
                message: 'This should fail'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.messageId).toBeUndefined();
            
            console.log('✅ Invalid email handled gracefully');
            console.log(`   Error: ${result.error}\n`);
        });
        
        it('should handle empty configuration gracefully', async () => {
            console.log('\n📧 Testing empty email handling...');
            
            const result = await sendAlertEmail({
                to: '',
                subject: 'Test',
                message: 'This should fail'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            
            console.log('✅ Empty email handled gracefully\n');
        });
    });
    
    describe('SMS Delivery (Twilio)', () => {
        
        it('should send alert SMS to valid phone number', async () => {
            if (TEST_PHONE === '+1234567890') {
                console.log('\n⚠️  Skipping SMS test - please update TEST_PHONE in delivery.test.ts\n');
                return;
            }
            
            console.log(`\n📱 Sending test SMS to ${TEST_PHONE}...`);
            
            const result = await sendAlertSms({
                to: TEST_PHONE,
                message: 'Gratheon Test Alert: SMS delivery is working! This is a test message from the alerts service.'
            });
            
            expect(result.success).toBe(true);
            expect(result.messageSid).toBeDefined();
            expect(result.error).toBeUndefined();
            
            console.log(`✅ SMS sent successfully!`);
            console.log(`   Message SID: ${result.messageSid}`);
            console.log(`   Please check your phone at ${TEST_PHONE}\n`);
        }, 30000);
        
        it('should handle invalid phone number gracefully', async () => {
            console.log('\n📱 Testing invalid phone number handling...');
            
            const result = await sendAlertSms({
                to: 'invalid-phone',
                message: 'This should fail'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.messageSid).toBeUndefined();
            
            console.log('✅ Invalid phone number handled gracefully');
            console.log(`   Error: ${result.error}\n`);
        });
        
        it('should handle empty phone number gracefully', async () => {
            console.log('\n📱 Testing empty phone number handling...');
            
            const result = await sendAlertSms({
                to: '',
                message: 'This should fail'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            
            console.log('✅ Empty phone number handled gracefully\n');
        });
    });
    
    describe('Telegram Delivery (Bot API)', () => {
        
        it('should send alert to Telegram user by username', async () => {
            if (TEST_TELEGRAM_USERNAME === 'your_username') {
                console.log('\n⚠️  Skipping Telegram test - please update TEST_TELEGRAM_USERNAME in delivery.test.ts');
                console.log('   Also ensure you have:');
                console.log('   1. Created a bot via @BotFather');
                console.log('   2. Added bot token to config.dev.ts');
                console.log('   3. Started your bot in Telegram (search for bot, click Start)\n');
                return;
            }
            
            console.log(`\n💬 Sending test Telegram message to @${TEST_TELEGRAM_USERNAME}...`);
            
            const result = await sendAlertTelegram({
                username: TEST_TELEGRAM_USERNAME,
                message: 'Gratheon Test Alert\n\n✅ Telegram delivery is working!\n\nThis is a test message from the alerts service integration tests.'
            });
            
            expect(result.success).toBe(true);
            expect(result.messageId).toBeDefined();
            expect(result.error).toBeUndefined();
            
            console.log(`✅ Telegram message sent successfully!`);
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Please check your Telegram app\n`);
        }, 30000);
        
        it('should send alert to Telegram user by chat ID', async () => {
            console.log(`\n💬 Sending test Telegram message to chat ID ${TEST_TELEGRAM_CHAT_ID}...`);
            
            const result = await sendAlertTelegramByChatId({
                chatId: TEST_TELEGRAM_CHAT_ID,
                message: 'Gratheon Test Alert (Chat ID)\n\n✅ Telegram delivery by chat ID is working!\n\nThis is a test message from the alerts service integration tests.'
            });
            
            expect(result.success).toBe(true);
            expect(result.messageId).toBeDefined();
            expect(result.error).toBeUndefined();
            
            console.log(`✅ Telegram message sent successfully via chat ID!`);
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Please check your Telegram app\n`);
        }, 30000);
        
        it('should handle user who has not started bot', async () => {
            console.log('\n💬 Testing user who has not started bot...');
            
            const result = await sendAlertTelegram({
                username: 'nonexistent_user_that_definitely_does_not_exist_12345',
                message: 'This should fail'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.messageId).toBeUndefined();
            
            console.log('✅ User not found handled gracefully');
            console.log(`   Error: ${result.error}\n`);
        });
        
        it('should handle empty username gracefully', async () => {
            console.log('\n💬 Testing empty username handling...');
            
            const result = await sendAlertTelegram({
                username: '',
                message: 'This should fail'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            
            console.log('✅ Empty username handled gracefully\n');
        });
        
        it('should handle username with @ prefix', async () => {
            if (TEST_TELEGRAM_USERNAME === 'your_username') {
                console.log('\n⚠️  Skipping Telegram @ prefix test - please update TEST_TELEGRAM_USERNAME\n');
                return;
            }
            
            console.log('\n💬 Testing username with @ prefix...');
            
            const result = await sendAlertTelegram({
                username: `@${TEST_TELEGRAM_USERNAME}`, // Add @ prefix
                message: 'Test message with @ prefix in username'
            });
            
            // Should still work since our code handles @ prefix
            expect(result.success).toBe(true);
            expect(result.messageId).toBeDefined();
            
            console.log('✅ @ prefix handled correctly\n');
        }, 30000);
    });
    
    describe('Cross-Channel Reliability', () => {
        
        it('should handle all channels independently', async () => {
            console.log('\n🔄 Testing that failures in one channel do not affect others...\n');
            
            // Send to invalid destinations
            const emailResult = sendAlertEmail({
                to: 'invalid-email',
                subject: 'Test',
                message: 'Test'
            });
            
            const smsResult = sendAlertSms({
                to: 'invalid',
                message: 'Test'
            });
            
            const telegramResult = sendAlertTelegram({
                username: 'nonexistent_user_12345',
                message: 'Test'
            });
            
            // All should complete (not throw exceptions)
            const results = await Promise.all([emailResult, smsResult, telegramResult]);
            
            expect(results[0].success).toBe(false);
            expect(results[1].success).toBe(false);
            expect(results[2].success).toBe(false);
            
            console.log('✅ All channels handled failures independently');
            console.log('   No exceptions thrown - errors returned as status objects\n');
        });
    });
    
});

describe('Delivery Module Configuration', () => {
    
    it('should have AWS SES configuration', () => {
        const config = require('../../app/config/index').default;
        
        expect(config.aws).toBeDefined();
        expect(config.aws.region).toBe('eu-west-1');
        expect(config.aws.sesFromEmail).toBe('pilot@gratheon.com');
        // Note: accessKeyId and secretAccessKey will be empty until manually configured
        
        console.log('✅ AWS SES configuration structure is valid');
    });
    
    it('should have Twilio configuration', () => {
        const config = require('../../app/config/index').default;
        
        expect(config.twilio).toBeDefined();
        expect(config.twilio.accountSid).toBeDefined();
        expect(config.twilio.authToken).toBeDefined();
        expect(config.twilio.messagingServiceSid).toBeDefined();
        
        console.log('✅ Twilio configuration structure is valid');
    });
    
    it('should have Telegram configuration', () => {
        const config = require('../../app/config/index').default;
        
        expect(config.telegram).toBeDefined();
        // Note: botToken will be empty until manually configured
        
        console.log('✅ Telegram configuration structure is valid');
    });
    
});
