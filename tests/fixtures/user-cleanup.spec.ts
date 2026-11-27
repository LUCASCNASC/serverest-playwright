import { expect, test } from '../../src/fixtures/test.js';
import { environment } from '../../src/config/env.js';

let createdEmail: string;

test('creates a temporary user for the test', async ({ user }) => {
  createdEmail = user.email;
  expect(createdEmail).toBeTruthy();
});

test.afterAll(async ({ playwright }) => {
  const api = await playwright.request.newContext({ baseURL: environment.apiBaseUrl });
  try {
    expect(createdEmail, 'The fixture must create a user before cleanup can be verified').toBeTruthy();
    const response = await api.get('/usuarios', { params: { email: createdEmail } });
    expect(response.ok(), `User lookup failed with HTTP ${response.status()}`).toBe(true);
    const result = await response.json();
    expect(result.quantidade).toBe(0);
    expect(result.usuarios).toHaveLength(0);
  } finally {
    await api.dispose();
  }
});
