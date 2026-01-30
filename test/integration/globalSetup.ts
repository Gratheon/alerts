import { apiConfig } from './utils/api-config';

async function waitForServer(maxWaitTime = 60000, interval = 1000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(apiConfig.healthEndpoint);
      if (response.ok) {
        console.log('✓ Server is ready');
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Server did not become ready within ${maxWaitTime}ms`);
}

export default async function globalSetup() {
  console.log('Waiting for alerts service to be ready...');
  await waitForServer();
}
