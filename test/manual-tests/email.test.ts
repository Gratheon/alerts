import { sendAlertEmail } from '../../src/delivery/email';

/**
 * Email Delivery Integration Tests
 * 
 * Tests AWS SES email delivery functionality
 * 
 * Prerequisites:
 * - AWS SES credentials configured in config.dev.ts
 * - ENV_ID=dev environment variable set
 * 
 * Run with: npm run build && ENV_ID=dev npx jest test/integration/email.test.ts
 */

describe('Email Delivery (AWS SES)', () => {
  const TEST_EMAIL = 'artkurapov@gmail.com';

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
  }, 30000);

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

  it('should handle empty email address gracefully', async () => {
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
