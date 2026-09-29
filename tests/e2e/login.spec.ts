import { test, expect } from '../../src/fixtures/test.js';
import { LoginPage } from '../../src/pages/login.page.js';

test.describe('Login', () => {
  test('Allows a normal user to log in.', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(/home/);
  });

  test.describe('administrator user.', () => {
    test.use({ userRole: 'admin' });

    test('Allows an administrator to log in.', async ({ page, user }) => {
      const loginPage = new LoginPage(page);

      await loginPage.open();
      await loginPage.login(user.email, user.password);

      await expect(page).toHaveURL(/home/);
    });
  });

  test('Does not allow login with blank fields.', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('', '');

    await expect(page.getByRole('alert').filter({ hasText: 'Email é obrigatório' })).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: 'Password é obrigatório' })).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('Does not allow login with a blank email.', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('', user.password);

    await expect(page.getByRole('alert').filter({ hasText: 'Email é obrigatório' })).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('Does not allow login with a blank password.', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, '');

    await expect(page.getByRole('alert').filter({ hasText: 'Password é obrigatório' })).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('Does not allow login with an invalid email and password.', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('invalid.email@example.com', 'invalid-password');

    await expect(page).toHaveURL(/login/);
  });

  test('Does not allow login with an invalid email.', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('invalid.email@example.com', user.password);

    await expect(page).toHaveURL(/login/);
  });

  test('Does not allow login with an invalid password.', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, 'invalid-password');

    await expect(page).toHaveURL(/login/);
  });
});

test('Displays the login page.', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.expectLoaded();

  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page.getByPlaceholder('Digite seu email')).toBeVisible();
  await expect(page.getByPlaceholder('Digite sua senha')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('Exposes the expected login field types.', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();

  await expect(page.getByPlaceholder('Digite seu email')).toHaveAttribute('type', 'email');
  await expect(page.getByPlaceholder('Digite sua senha')).toHaveAttribute('type', 'password');
});

test('Does not allow login with an invalid email format.', async ({ page, user }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('invalid-email', user.password);

  await expect(page).toHaveURL(/login/);
});

test('Preserves credentials after an unsuccessful login attempt.', async ({ page, user }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login(user.email, 'invalid-password');

  await expect(page.getByPlaceholder('Digite seu email')).toHaveValue(user.email);
  await expect(page.getByPlaceholder('Digite sua senha')).toHaveValue('invalid-password');
});

test('Allows login submission with the Enter key.', async ({ page, user }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.submitWithEnter(user.email, user.password);

  await expect(page).toHaveURL(/home/);
});