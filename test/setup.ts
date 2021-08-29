if (!global.fetch) {
  global.fetch = require('node-fetch');
}

import { server } from './msw/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
