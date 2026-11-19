import { expect, test } from '../../src/fixtures/test.js';
import { createProductData } from '../../src/data/product.factory.js';
import { HomePage } from '../../src/pages/home.page.js';
import { LoginPage } from '../../src/pages/login.page.js';
import {
  ProductRegisterPage,
  type ProductRequiredField,
} from '../../src/pages/product-register.page.js';

async function openProductRegistration(
  page: import('@playwright/test').Page,
  admin: { email: string; password: string },
): Promise<ProductRegisterPage> {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  const productRegisterPage = new ProductRegisterPage(page);

  await loginPage.open();
  await loginPage.login(admin.email, admin.password);
  await homePage.expectLoaded();
  await homePage.openProductRegistration();
  await productRegisterPage.expectLoaded();

  return productRegisterPage;
}

test.describe('Product registration required fields', () => {
  test.use({ userRole: 'admin' });

  test('shows validation errors for all required fields when submitted empty', async ({ page, user }) => {
    const productRegisterPage = await openProductRegistration(page, user);

    await productRegisterPage.submit(createProductData(), [
      'Nome',
      'Preço',
      'Descrição',
      'Quantidade',
    ]);
    await productRegisterPage.expectRequiredFieldErrors([
      'Nome',
      'Preço',
      'Descrição',
      'Quantidade',
    ]);
    await expect(page.getByRole('alert')).toHaveCount(4);
    await expect(page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
  });

  for (const field of ['Nome', 'Preço', 'Descrição', 'Quantidade'] satisfies ProductRequiredField[]) {
    test(`reports only the missing ${field.toLowerCase()} when other values are valid`, async ({ page, user }) => {
      const productRegisterPage = await openProductRegistration(page, user);

      await productRegisterPage.submit(createProductData(), [field]);
      await productRegisterPage.expectRequiredFieldErrors([field]);
      await expect(page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
    });
  }
});
