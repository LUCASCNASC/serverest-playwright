import { test, expect } from '../../src/fixtures/test.js';
import { LoginPage } from '../../src/pages/login.page.js';

test.describe('Login', () => {
  test('permite login de usuario normal', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(/home/);
  });

  test.describe('usuario administrador', () => {
    test.use({ userRole: 'admin' });

    test('permite login', async ({ page, user }) => {
      const loginPage = new LoginPage(page);

      await loginPage.open();
      await loginPage.login(user.email, user.password);

      await expect(page).toHaveURL(/home/);
    });
  });

  test('nao permite login com os campos em branco', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('', '');

    await expect(page.getByRole('alert').filter({ hasText: 'Email é obrigatório' })).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: 'Password é obrigatório' })).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('nao permite login com o email em branco', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('', user.password);

    await expect(page.getByRole('alert').filter({ hasText: 'Email é obrigatório' })).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('nao permite login com a senha em branco', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, '');

    await expect(page.getByRole('alert').filter({ hasText: 'Password é obrigatório' })).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('nao permite login com email e senha errados', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('email.invalido@exemplo.com', 'senha-invalida');

    await expect(page).toHaveURL(/login/);
  });

  test('nao permite login com email errado', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('email.invalido@exemplo.com', user.password);

    await expect(page).toHaveURL(/login/);
  });

  test('nao permite login com senha errada', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, 'senha-invalida');

    await expect(page).toHaveURL(/login/);
  });
});

test('exibe a tela de login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.expectLoaded();
});