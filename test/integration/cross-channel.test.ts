import { sendAlertEmail } from '../../src/delivery/email';
import { sendAlertSms } from '../../src/delivery/sms';
import { sendAlertTelegram } from '../../src/delivery/telegram';

/**
 * Cross-Channel Delivery Tests
 * 
 * Tests that delivery channels work independently and failures don't cascade
 * 
 * Run with: npm run build && ENV_ID=dev npx jest test/integration/cross-channel.test.ts
 */

describe('Cross-Channel Reliability', () => {
  it('should handle all channels independently', async () => {
    console.log('\n🔄 Testing that failures in one channel do not affect others...\n');

    // Send to invalid destinations in parallel
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
