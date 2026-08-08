import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetFixtures } from './fixtures';
import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  resetFixtures();
});

afterAll(() => {
  server.close();
});
