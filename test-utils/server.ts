import { setupServer } from "msw/node";

type ServerHandlers = Parameters<typeof setupServer>;

export function setupTestServer(...handlers: ServerHandlers) {
  const server = setupServer(...handlers);
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
