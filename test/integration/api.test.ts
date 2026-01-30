import { apiConfig, graphQLRequest } from './utils/api-config';

describe('Alerts API Integration Tests', () => {
  describe('Health Check', () => {
    it('should respond to health endpoint', async () => {
      const response = await fetch(apiConfig.healthEndpoint);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('hello');
      expect(data.hello).toBe('world');
    });

    it('should return 200 status code', async () => {
      const response = await fetch(apiConfig.healthEndpoint);
      expect(response.status).toBe(200);
    });
  });

  describe('GraphQL Endpoint', () => {
    it('should be accessible', async () => {
      const response = await fetch(apiConfig.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('should handle introspection query', async () => {
      const result = await graphQLRequest(`
        {
          __schema {
            queryType {
              name
            }
          }
        }
      `);

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('__schema');
    });

    it('should require valid GraphQL syntax', async () => {
      const response = await fetch(apiConfig.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'invalid query syntax',
        }),
      });

      const result = await response.json();
      expect(result).toHaveProperty('errors');
    });
  });

  describe('API Responsiveness', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now();
      await fetch(apiConfig.healthEndpoint);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      // Should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        fetch(apiConfig.healthEndpoint)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });
  });

  describe('Root Endpoint', () => {
    it('should return HTML documentation page', async () => {
      const response = await fetch(apiConfig.baseUrl + '/');
      expect(response.ok).toBe(true);
      
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('text/html');
      
      const html = await response.text();
      expect(html).toContain('Alerts');
    });
  });
});
