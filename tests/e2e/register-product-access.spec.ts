import { test, expect } from '../../src/fixtures/test.js';
import { HomePage } from '../../src/pages/home.page.js';
import { LoginPage } from '../../src/pages/login.page.js';

test.describe('Product registration access control', () => {
  test('redirects an unauthenticated visit to login', async ({ page }) => {
    await page.goto('/admin/cadastrarprodutos');

    await expect(page).toHaveURL(/\/login(?:$|[?#])/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cadastro de Produtos' })).toHaveCount(0);
  });

  test('does not expose product registration to a normal user', async ({ page, user }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    await new HomePage(page).expectLoaded();

    await page.goto('/admin/cadastrarprodutos');

    test.fail(true, 'The external frontend exposes the product registration page to normal users.');
    await expect.soft(page).not.toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
    await expect.soft(page.getByRole('heading', { name: 'Cadastro de Produtos' })).toHaveCount(0);
    await expect.soft(page.getByRole('button', { name: 'Cadastrar', exact: true })).toHaveCount(0);
  });
});
