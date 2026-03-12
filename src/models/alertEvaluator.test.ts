const mockStorageQuery = jest.fn();

jest.mock("../storage", () => ({
  sql: jest.fn((strings, ...values) => ({ strings, values })),
  storage: jest.fn(() => ({
    query: mockStorageQuery,
  })),
}));

jest.mock("./alerts", () => ({
  alertModel: {
    createAlert: jest.fn(),
    markAsDelivered: jest.fn(),
  },
}));

jest.mock("./alertChannel", () => ({
  alertChannelModel: {
    getConfig: jest.fn(),
    getAll: jest.fn(),
  },
}));

jest.mock("./alertDeliveryLog", () => ({
  alertDeliveryLogModel: {
    logDeliveryAttempt: jest.fn(),
    getFailedDeliveries: jest.fn(),
    updateDeliveryStatus: jest.fn(),
  },
}));

jest.mock("../delivery/email", () => ({
  sendAlertEmail: jest.fn(),
}));

jest.mock("../delivery/sms", () => ({
  sendAlertSms: jest.fn(),
}));

jest.mock("../delivery/telegram", () => ({
  sendAlertTelegramByChatId: jest.fn(),
}));

jest.mock("../logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { alertEvaluator } from "./alertEvaluator";
import { alertModel } from "./alerts";
import { alertChannelModel } from "./alertChannel";
import { alertDeliveryLogModel } from "./alertDeliveryLog";
import { sendAlertEmail } from "../delivery/email";
import { sendAlertSms } from "../delivery/sms";
import { sendAlertTelegramByChatId } from "../delivery/telegram";

describe("alertEvaluator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("shouldSendAlert", () => {
    it("returns false when channel is missing or disabled", async () => {
      (alertChannelModel.getConfig as jest.Mock).mockResolvedValueOnce(null);
      expect(await alertEvaluator.shouldSendAlert(1, "EMAIL")).toBe(false);

      (alertChannelModel.getConfig as jest.Mock).mockResolvedValueOnce({
        enabled: false,
      });
      expect(await alertEvaluator.shouldSendAlert(1, "EMAIL")).toBe(false);
    });

    it("returns true only inside configured time range", async () => {
      (alertChannelModel.getConfig as jest.Mock).mockResolvedValue({
        enabled: true,
        time_start: "09:00",
        time_end: "11:00",
      });

      jest.setSystemTime(new Date("2026-03-03T10:30:00"));
      expect(await alertEvaluator.shouldSendAlert(1, "EMAIL")).toBe(true);

      jest.setSystemTime(new Date("2026-03-03T08:59:00"));
      expect(await alertEvaluator.shouldSendAlert(1, "EMAIL")).toBe(false);
    });
  });

  describe("createAndDeliverAlert", () => {
    it("delivers to enabled channels and logs failures per channel", async () => {
      (alertModel.createAlert as jest.Mock).mockResolvedValue(42);
      (alertChannelModel.getAll as jest.Mock).mockResolvedValue([
        { channel_type: "EMAIL", enabled: true, email: "bee@example.com" },
        { channel_type: "SMS", enabled: true, phone_number: null },
        { channel_type: "UNKNOWN", enabled: true },
      ]);
      jest.spyOn(alertEvaluator, "shouldSendAlert").mockResolvedValue(true);
      (sendAlertEmail as jest.Mock).mockResolvedValue({
        success: true,
        messageId: "ses-1",
      });

      const alertId = await alertEvaluator.createAndDeliverAlert(
        7,
        "high temperature",
        "hive-1",
        "temperature",
        39.2,
        11
      );

      expect(alertId).toBe(42);
      expect(sendAlertEmail).toHaveBeenCalledTimes(1);
      expect(sendAlertSms).not.toHaveBeenCalled();
      expect(sendAlertTelegramByChatId).not.toHaveBeenCalled();
      expect(alertDeliveryLogModel.logDeliveryAttempt).toHaveBeenCalledWith(
        42,
        7,
        "EMAIL",
        "sent",
        undefined,
        "ses-1"
      );
      expect(alertDeliveryLogModel.logDeliveryAttempt).toHaveBeenCalledWith(
        42,
        7,
        "SMS",
        "failed",
        "No phone number configured"
      );
      expect(alertDeliveryLogModel.logDeliveryAttempt).toHaveBeenCalledWith(
        42,
        7,
        "UNKNOWN",
        "failed",
        "Unknown channel type: UNKNOWN"
      );
      expect(alertModel.markAsDelivered).toHaveBeenCalledWith(42);
    });

    it("skips delivery when outside time window", async () => {
      (alertModel.createAlert as jest.Mock).mockResolvedValue(77);
      (alertChannelModel.getAll as jest.Mock).mockResolvedValue([
        { channel_type: "EMAIL", enabled: true, email: "bee@example.com" },
      ]);
      jest.spyOn(alertEvaluator, "shouldSendAlert").mockResolvedValue(false);

      await alertEvaluator.createAndDeliverAlert(
        1,
        "cold snap",
        "hive-2",
        "temperature",
        1.5,
        21
      );

      expect(sendAlertEmail).not.toHaveBeenCalled();
      expect(alertDeliveryLogModel.logDeliveryAttempt).not.toHaveBeenCalled();
      expect(alertModel.markAsDelivered).toHaveBeenCalledWith(77);
    });
  });

  describe("retryFailedDeliveries", () => {
    it("retries failed email deliveries and updates status on success", async () => {
      (alertDeliveryLogModel.getFailedDeliveries as jest.Mock).mockResolvedValue(
        [{ alert_id: 9, user_id: 3, channel_type: "EMAIL", retry_count: 0 }]
      );
      mockStorageQuery.mockResolvedValueOnce([
        {
          text: "hot day",
          metric_type: "temperature",
        },
      ]);
      (alertChannelModel.getConfig as jest.Mock).mockResolvedValue({
        enabled: true,
        email: "retry@example.com",
      });
      jest.spyOn(alertEvaluator, "shouldSendAlert").mockResolvedValue(true);
      (sendAlertEmail as jest.Mock).mockResolvedValue({
        success: true,
        messageId: "retry-1",
      });

      await alertEvaluator.retryFailedDeliveries(3);

      expect(sendAlertEmail).toHaveBeenCalledWith({
        to: "retry@example.com",
        subject: "Gratheon Alert: temperature",
        message: "hot day",
      });
      expect(alertDeliveryLogModel.updateDeliveryStatus).toHaveBeenCalledWith(
        9,
        "EMAIL",
        "sent",
        undefined,
        "retry-1"
      );
    });
  });
});
