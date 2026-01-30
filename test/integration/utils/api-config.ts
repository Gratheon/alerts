const API_HOST = process.env.CI ? 'alerts' : 'localhost';
const API_PORT = 4560;
const BASE_URL = `http://${API_HOST}:${API_PORT}`;

export const apiConfig = {
  host: API_HOST,
  port: API_PORT,
  baseUrl: BASE_URL,
  healthEndpoint: `${BASE_URL}/health`,
  graphqlEndpoint: `${BASE_URL}/graphql`,
};

export async function graphQLRequest(query: string, variables?: any, headers?: Record<string, string>) {
  const response = await fetch(apiConfig.graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return response.json();
}
