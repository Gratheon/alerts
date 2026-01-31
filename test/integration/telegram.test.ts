import { sendAlertTelegram, sendAlertTelegramByChatId } from '../../src/delivery/telegram';

/**
 * Telegram Delivery Integration Tests
 * 
 * Tests Telegram Bot API delivery functionality
 * 
 * Prerequisites:
 * - Telegram bot token configured in config.dev.ts
 * - User has started the bot (to get chat ID)
 * - ENV_ID=dev environment variable set
 * 
 * Run with: npm run build && ENV_ID=dev npx jest test/integration/telegram.test.ts
 */

describe('Telegram Delivery (Bot API)', () => {
  const TEST_TELEGRAM_USERNAME = 'tot_ra';
  const TEST_TELEGRAM_CHAT_ID = 374550738;

  it('should send alert to Telegram user by username', async () => {
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
    console.log('\n💬 Testing username with @ prefix...');

    const result = await sendAlertTelegram({
      username: `@${TEST_TELEGRAM_USERNAME}`,
      message: 'Test message with @ prefix in username'
    });

    // Should still work since our code handles @ prefix
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();

    console.log('✅ @ prefix handled correctly\n');
  }, 30000);
});
