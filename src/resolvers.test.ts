jest.mock("./models/alerts", () => ({
  alertModel: {
    getAlerts: jest.fn(),
  },
}));

jest.mock("./models/alertChannel", () => ({
  alertChannelModel: {
    getAll: jest.fn(),
    setConfig: jest.fn(),
  },
}));

jest.mock("./models/alertRule", () => ({
  alertRuleModel: {
    getAll: jest.fn(),
  },
}));

jest.mock("./logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { resolvers } from "./resolvers";
import { alertModel } from "./models/alerts";
import { alertChannelModel } from "./models/alertChannel";

describe("resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query.alerts", () => {
    it("requires authentication", async () => {
      const result = await resolvers.Query.alerts(null, null, {});
      expect(result).toEqual({
        __typename: "Error",
        code: "AUTHENTICATION_REQUIRED",
      });
    });

    it("maps alert rows into GraphQL shape", async () => {
      (alertModel.getAlerts as jest.Mock).mockResolvedValue([
        {
          id: 1,
          text: "test",
          date_added: "2026-03-03T08:00:00Z",
          hive_id: "hive-1",
          metric_type: "temperature",
          metric_value: 33.3,
          delivered: true,
        },
      ]);

      const result = await resolvers.Query.alerts(null, null, { uid: 44 });
      expect(alertModel.getAlerts).toHaveBeenCalledWith(44);
      expect(result).toEqual([
        {
          id: 1,
          text: "test",
          date_added: "2026-03-03T08:00:00Z",
          hiveId: "hive-1",
          metricType: "temperature",
          metricValue: 33.3,
          delivered: true,
        },
      ]);
    });
  });

  describe("Mutation.setAlertChannel", () => {
    it("validates phone numbers", async () => {
      const result = await resolvers.Mutation.setAlertChannel(
        null,
        {
          config: {
            channelType: "SMS",
            phoneNumber: "not-a-phone",
          },
        },
        { uid: 7 }
      );

      expect(result).toEqual({ __typename: "Error", code: "INVALID_PHONE_NUMBER" });
      expect(alertChannelModel.setConfig).not.toHaveBeenCalled();
    });

    it("accepts valid config and maps response", async () => {
      (alertChannelModel.setConfig as jest.Mock).mockResolvedValue({
        id: 2,
        channel_type: "EMAIL",
        phone_number: null,
        email: "bee@example.com",
        telegram_username: null,
        time_start: "08:00",
        time_end: "20:00",
        enabled: true,
      });

      const result = await resolvers.Mutation.setAlertChannel(
        null,
        {
          config: {
            channelType: "EMAIL",
            email: "bee@example.com",
            timeStart: "08:00",
            timeEnd: "20:00",
            enabled: true,
          },
        },
        { uid: 9 }
      );

      expect(alertChannelModel.setConfig).toHaveBeenCalledWith(9, {
        channel_type: "EMAIL",
        phone_number: undefined,
        email: "bee@example.com",
        telegram_username: undefined,
        telegram_chat_id: undefined,
        time_start: "08:00",
        time_end: "20:00",
        enabled: true,
      });
      expect(result).toEqual({
        id: 2,
        channelType: "EMAIL",
        phoneNumber: null,
        email: "bee@example.com",
        telegramUsername: null,
        timeStart: "08:00",
        timeEnd: "20:00",
        enabled: true,
      });
    });
  });
});
