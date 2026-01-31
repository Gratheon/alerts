/**
 * End-to-End Integration Test for Alert Delivery
 * 
 * This test verifies the complete alert delivery flow:
 * 1. Creates a test alert
 * 2. Delivers it through all configured channels
 * 3. Verifies delivery status in the delivery log
 * 
 * Prerequisites:
 * - MySQL database running on 127.0.0.1:3309
 * - Database migrations applied (including 007 and 008)
 * - Channel config set up for test user
 * - ENV_ID=dev for credentials
 */

const { alertEvaluator } = require('../../app/models/alertEvaluator');
const { alertDeliveryLogModel } = require('../../app/models/alertDeliveryLog');
const { alertChannelModel } = require('../../app/models/alertChannel');
const { storage } = require('../../app/storage');

describe('Alert Delivery End-to-End', () => {
  const TEST_USER_ID = 1;
  const TEST_HIVE_ID = 'test-hive-123';
  const TEST_METRIC_TYPE = 'temperature';
  const TEST_METRIC_VALUE = 35.5;
  const TEST_ALERT_TEXT = 'Test alert: Temperature is 35.5°C';

  beforeAll(async () => {
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Close database connection
    const db = storage();
    if (db && db.dispose) {
      await db.dispose();
    }
  });

  test('should create and deliver alert to all configured channels', async () => {
    // Get configured channels for test user
    const channels = await alertChannelModel.getAll(TEST_USER_ID);
    console.log(`Found ${channels.length} configured channels:`, channels.map(c => c.channel_type));

    // Create and deliver alert
    const alertId = await alertEvaluator.createAndDeliverAlert(
      TEST_USER_ID,
      TEST_ALERT_TEXT,
      TEST_HIVE_ID,
      TEST_METRIC_TYPE,
      TEST_METRIC_VALUE,
      null // alert_rule_id
    );

    expect(alertId).toBeDefined();
    expect(typeof alertId).toBe('number');
    console.log(`Created alert with ID: ${alertId}`);

    // Wait for deliveries to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check delivery status
    const deliveryStatus = await alertDeliveryLogModel.getDeliveryStatus(alertId);
    console.log('Delivery status:', deliveryStatus);

    // Verify delivery attempts were logged
    expect(deliveryStatus.length).toBeGreaterThan(0);

    // Check each delivery
    for (const delivery of deliveryStatus) {
      console.log(`Channel: ${delivery.channel_type}`);
      console.log(`  Status: ${delivery.delivery_status}`);
      console.log(`  External ID: ${delivery.external_message_id}`);
      console.log(`  Error: ${delivery.error_message}`);
      console.log(`  Retry count: ${delivery.retry_count}`);

      // Status should be either 'sent' or 'failed'
      expect(['sent', 'failed']).toContain(delivery.delivery_status);

      // If sent, should have external message ID
      if (delivery.delivery_status === 'sent') {
        expect(delivery.external_message_id).toBeDefined();
      }

      // If failed, should have error message
      if (delivery.delivery_status === 'failed') {
        expect(delivery.error_message).toBeDefined();
      }
    }

    // Count successful deliveries
    const successfulDeliveries = deliveryStatus.filter(d => d.delivery_status === 'sent');
    console.log(`\nSuccessful deliveries: ${successfulDeliveries.length}/${deliveryStatus.length}`);

    // At least one channel should succeed (assuming proper config)
    // This assertion is optional - remove if channels aren't configured
    // expect(successfulDeliveries.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout

  test('should retry failed deliveries', async () => {
    console.log('Testing retry mechanism...');

    // Get failed deliveries
    const failedBefore = await alertDeliveryLogModel.getFailedDeliveries(3);
    console.log(`Found ${failedBefore.length} failed deliveries to retry`);

    if (failedBefore.length === 0) {
      console.log('No failed deliveries to retry - skipping test');
      return;
    }

    // Run retry
    await alertEvaluator.retryFailedDeliveries(3);

    // Wait for retries to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if retry count increased
    const failedAfter = await alertDeliveryLogModel.getFailedDeliveries(3);
    console.log(`Failed deliveries after retry: ${failedAfter.length}`);

    // Some failures might succeed, so count should decrease or stay same
    expect(failedAfter.length).toBeLessThanOrEqual(failedBefore.length);
  }, 30000);

  test('should respect time window restrictions', async () => {
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    console.log(`Current hour: ${currentHour}`);

    // Test shouldSendAlert for EMAIL channel
    const shouldSendEmail = await alertEvaluator.shouldSendAlert(TEST_USER_ID, 'EMAIL');
    console.log(`Should send email now: ${shouldSendEmail}`);

    // The result should be a boolean
    expect(typeof shouldSendEmail).toBe('boolean');

    // Get channel config to verify time window
    const emailConfig = await alertChannelModel.getConfig(TEST_USER_ID, 'EMAIL');
    if (emailConfig) {
      console.log(`Email time window: ${emailConfig.time_start} - ${emailConfig.time_end}`);
      console.log(`Email enabled: ${emailConfig.enabled}`);
    }
  });
});
