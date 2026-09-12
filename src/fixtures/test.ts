import { test as base } from '@playwright/test';
import { UsersApi } from '../api/users.api.js';
import { createUserData, type UserData, type UserRole } from '../data/user.factory.js';
import { environment } from '../config/env.js';

type UserFixtures = {
  userRole: UserRole;
  user: UserData;
};

export const test = base.extend<UserFixtures>({
  userRole: ['normal', { option: true }],

  user: async ({ playwright, userRole }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: environment.apiBaseUrl,
      timeout: 10_000,
    });

    const user = createUserData(userRole);
    await new UsersApi(apiContext).create(user);
    await use(user);
    await apiContext.dispose();
  },
});

export { expect } from '@playwright/test';