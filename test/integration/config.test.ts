import config from '../../src/config';

/**
 * Delivery Configuration Tests
 * 
 * Validates that all delivery channel configurations are properly structured
 * 
 * Run with: npm run build && ENV_ID=dev npx jest test/integration/config.test.ts
 */

describe('Delivery Module Configuration', () => {
  it('should have AWS SES configuration', () => {
    expect(config.aws).toBeDefined();
    expect(config.aws.region).toBeDefined();
    expect(config.aws.sesFromEmail).toBeDefined();
    expect(config.aws.accessKeyId).toBeDefined();
    expect(config.aws.secretAccessKey).toBeDefined();

    console.log('✅ AWS SES configuration structure is valid');
    console.log(`   Region: ${config.aws.region}`);
    console.log(`   From Email: ${config.aws.sesFromEmail}`);
  });

  it('should have Twilio configuration', () => {
    expect(config.twilio).toBeDefined();
    expect(config.twilio.accountSid).toBeDefined();
    expect(config.twilio.authToken).toBeDefined();

    console.log('✅ Twilio configuration structure is valid');
  });

  it('should have Telegram configuration', () => {
    expect(config.telegram).toBeDefined();
    expect(config.telegram.botToken).toBeDefined();

    console.log('✅ Telegram configuration structure is valid');
  });
});
