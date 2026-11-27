import { test, expect } from '../../src/fixtures/test.js';
import { LoginPage } from '../../src/pages/login.page.js';

test.describe('Administrator route access control', () => {
  test('redirects unauthenticated visits to protected user pages to login', async ({ page }) => {
    for (const route of ['/admin/cadastrarusuarios', '/admin/listarusuarios']) {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login(?:$|[?#])/);
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Cadastro de usuários' })).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Lista dos usuários' })).toHaveCount(0);
    }
  });

  test('does not expose administrator registration to a normal user', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/home(?:$|[?#])/);

    await page.goto('/admin/cadastrarusuarios');

    test.fail(true, 'The external frontend exposes the user registration page to normal users.');
    await expect.soft(page).not.toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    await expect.soft(page.getByRole('heading', { name: 'Cadastro de usuários' })).toHaveCount(0);
    await expect.soft(page.getByTestId('cadastrarUsuario')).toHaveCount(0);
    await expect.soft(page.getByTestId('nome')).toHaveCount(0);
  });

  test('does not expose the users list to a normal user', async ({ page, user }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/home(?:$|[?#])/);

    await page.goto('/admin/listarusuarios');

    test.fail(true, 'The external frontend exposes the users list to normal users.');
    await expect.soft(page).not.toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await expect.soft(page.getByRole('heading', { name: 'Lista dos usuários' })).toHaveCount(0);
    await expect.soft(page.getByRole('table')).toHaveCount(0);
  });
});
