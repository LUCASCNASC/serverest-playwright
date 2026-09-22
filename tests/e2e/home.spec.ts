import { test } from '../../src/fixtures/test.js';
import { HomePage } from '../../src/pages/home.page.js';
import { LoginPage } from '../../src/pages/login.page.js';

test.describe('Home', () => {
  test('allows a normal user to reach home after login', async ({ page, user }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.open();
    await loginPage.login(user.email, user.password);

    await homePage.expectLoaded();
  });

  test.describe('administrator user', () => {
    test.use({ userRole: 'admin' });

    test('allows an administrator to reach home after login', async ({ page, user }) => {
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);

      await loginPage.open();
      await loginPage.login(user.email, user.password);

      await homePage.expectLoaded();
    });
  });
});