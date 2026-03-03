import { graphQLRequest } from "./utils/api-config";

describe("GraphQL auth and validation integration", () => {
  it("rejects protected query without user header", async () => {
    const result = await graphQLRequest(`
      query {
        alerts {
          id
        }
      }
    `);

    expect(result).toHaveProperty("data");
    expect(result.data.alerts).toBeNull();
    expect(result.errors?.length ?? 0).toBeGreaterThan(0);
  });

  it("creates and reads channel config for authenticated user", async () => {
    const result = await graphQLRequest(
      `
      mutation($config: AlertChannelInput!) {
        setAlertChannel(config: $config) {
          id
          channelType
          email
          timeStart
          timeEnd
          enabled
        }
      }
      `,
      {
        config: {
          channelType: "EMAIL",
          email: "alerts@example.com",
          timeStart: "08:00",
          timeEnd: "20:00",
          enabled: true,
        },
      },
      {
        "internal-userid": "1",
      }
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.setAlertChannel).toMatchObject({
      channelType: "EMAIL",
      email: "alerts@example.com",
      timeStart: "08:00",
      timeEnd: "20:00",
      enabled: true,
    });

    const channelsResult = await graphQLRequest(
      `
      query {
        alertChannels {
          channelType
          email
        }
      }
      `,
      undefined,
      {
        "internal-userid": "1",
      }
    );

    expect(channelsResult.errors).toBeUndefined();
    expect(channelsResult.data.alertChannels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          channelType: "EMAIL",
          email: "alerts@example.com",
        }),
      ])
    );
  });
});
