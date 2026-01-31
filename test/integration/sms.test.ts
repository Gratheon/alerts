import { sendAlertSms } from '../../src/delivery/sms';

/**
 * SMS Delivery Integration Tests
 * 
 * Tests Twilio SMS delivery functionality
 * 
 * Prerequisites:
 * - Twilio credentials configured in config.dev.ts
 * - ENV_ID=dev environment variable set
 * 
 * Run with: npm run build && ENV_ID=dev npx jest test/integration/sms.test.ts
 */

describe('SMS Delivery (Twilio)', () => {
  const TEST_PHONE = '+37258058720';

  it('should send alert SMS to valid phone number', async () => {
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
