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

    const usersApi = new UsersApi(apiContext);
    let userId: string | undefined;
    try {
      const user = createUserData(userRole);
      userId = await usersApi.create(user);
      await use(user);
    } finally {
      try {
        if (userId) {
          await usersApi.delete(userId);
        }
      } finally {
        await apiContext.dispose();
      }
    }
  },
});

export { expect } from '@playwright/test';
