import { expect, test } from '../../src/fixtures/test.js';
import { createProductData } from '../../src/data/product.factory.js';
import { ProductsApi } from '../../src/api/products.api.js';
import { HomePage } from '../../src/pages/home.page.js';
import { LoginPage } from '../../src/pages/login.page.js';
import { ProductsListPage } from '../../src/pages/products-list.page.js';
import type { APIRequestContext, Page } from '@playwright/test';
import {
  ProductRegisterPage,
  type ProductRequiredField,
} from '../../src/pages/product-register.page.js';

async function openProductRegistration(
  page: Page,
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

async function expectProductCount(request: APIRequestContext, name: string, count: number): Promise<void> {
  const result = await new ProductsApi(request).findByName(name);
  expect(result.quantidade).toBe(count);
  expect(result.produtos).toHaveLength(count);
  for (const product of result.produtos) {
    expect(product.nome).toBe(name);
  }
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

test.describe('Product registration', () => {
  test.use({ userRole: 'admin' });

  test('registers a product without an image and verifies its details', async ({ page, user }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();

    await registerPage.submit(product);

    await expect(page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    await new ProductsListPage(page).expectProductListed(product);
  });

  test('registers a product with an image and retains its filename after reload', async ({ page, user }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();
    const imageName = 'product.png';

    await registerPage.fill(product);
    await page.getByLabel('Imagem: *').setInputFiles({
      name: imageName,
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZ8AAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();

    await expect(page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    const productsListPage = new ProductsListPage(page);
    await productsListPage.expectProductListed(product, imageName);
    await page.reload();
    await productsListPage.expectProductListed(product, imageName);
  });

  test('registers the minimum price and zero quantity', async ({ page, user }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = { ...createProductData(), preco: 1, quantidade: 0 };

    await registerPage.submit(product);

    await expect(page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    await new ProductsListPage(page).expectProductListed(product);
  });

  test('preserves accented characters in the product name and description', async ({ page, user }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();
    product.nome = `Café – ${product.nome}`;
    product.descricao = `Descrição com acentos: ${product.descricao}`;

    await registerPage.submit(product);

    await expect(page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    await new ProductsListPage(page).expectProductListed(product);
  });

  test('opens product registration from the administrator home card', async ({ page, user }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    await homePage.expectLoaded();

    await homePage.openProductRegistrationFromCard();

    await expect(page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
    await new ProductRegisterPage(page).expectLoaded();
  });

  test('rejects a duplicate name and preserves entered values', async ({ page, user, request }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();
    await registerPage.submit(product);
    await new ProductsListPage(page).expectProductListed(product);
    await new HomePage(page).openProductRegistration();

    await registerPage.submit(product);

    await expect(page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
    await expect(page.getByRole('alert')).toContainText('Já existe produto com esse nome');
    await expect(page.getByRole('textbox', { name: 'Nome: *' })).toHaveValue(product.nome);
    await expect(page.getByRole('spinbutton', { name: 'Preço: *' })).toHaveValue(String(product.preco));
    await expect(page.getByRole('textbox', { name: 'Descrição: *' })).toHaveValue(product.descricao);
    await expect(page.getByRole('spinbutton', { name: 'Quantidade: *' })).toHaveValue(String(product.quantidade));
    await expectProductCount(request, product.nome, 1);
  });

  test('allows correcting a required field and registering the product', async ({ page, user }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();

    await registerPage.submit(product, ['Nome']);
    await registerPage.expectRequiredFieldErrors(['Nome']);
    await expect(page.getByRole('spinbutton', { name: 'Preço: *' })).toHaveValue(String(product.preco));
    await expect(page.getByRole('textbox', { name: 'Descrição: *' })).toHaveValue(product.descricao);
    await expect(page.getByRole('spinbutton', { name: 'Quantidade: *' })).toHaveValue(String(product.quantidade));
    await page.getByRole('textbox', { name: 'Nome: *' }).fill(product.nome);
    await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();

    test.fail(true, 'The external frontend drops the other field values when resubmitting after a validation error.');
    await new ProductsListPage(page).expectProductListed(product);
  });

  for (const invalid of [
    { field: 'preco', value: 0, message: 'Preco deve ser um número positivo' },
    { field: 'preco', value: -1, message: 'Preco deve ser um número positivo' },
    { field: 'quantidade', value: -1, message: 'Quantidade deve ser maior ou igual a 0' },
  ] as const) {
    test(`rejects ${invalid.field} ${invalid.value} without registering a product`, async ({ page, user, request }) => {
      const registerPage = await openProductRegistration(page, user);
      const product = { ...createProductData(), [invalid.field]: invalid.value };

      await registerPage.submit(product);

      await expect(page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
      await expect(page.getByRole('alert')).toContainText(invalid.message);
      await expectProductCount(request, product.nome, 0);
    });
  }

  for (const field of ['Preço', 'Quantidade'] as const) {
    test(`does not register a product with a decimal ${field.toLowerCase()}`, async ({ page, user, request }) => {
      const registerPage = await openProductRegistration(page, user);
      const product = createProductData();
      await registerPage.fill(product);
      const input = page.getByRole('spinbutton', { name: `${field}: *` });
      await input.fill('1.5');

      await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();

      await expect(page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
      expect(await input.evaluate((element: HTMLInputElement) => element.validity.stepMismatch)).toBe(true);
      await expectProductCount(request, product.nome, 0);
    });
  }

  test('submits the product using Enter', async ({ page, user }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();
    await registerPage.fill(product);

    await page.getByRole('spinbutton', { name: 'Quantidade: *' }).press('Enter');

    await expect(page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    await new ProductsListPage(page).expectProductListed(product);
  });

  test('does not create duplicate products on a double click', async ({ page, user, request }) => {
    const registerPage = await openProductRegistration(page, user);
    const product = createProductData();
    await registerPage.fill(product);

    await page.getByRole('button', { name: 'Cadastrar', exact: true }).dblclick();

    await expect(page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    await new ProductsListPage(page).expectProductListed(product);
    await expectProductCount(request, product.nome, 1);
  });

  test('exposes labeled product controls in keyboard order', async ({ page, user }) => {
    await openProductRegistration(page, user);
    const controls = [
      page.getByRole('textbox', { name: 'Nome: *' }),
      page.getByRole('spinbutton', { name: 'Preço: *' }),
      page.getByRole('textbox', { name: 'Descrição: *' }),
      page.getByRole('spinbutton', { name: 'Quantidade: *' }),
      page.getByLabel('Imagem: *'),
      page.getByRole('button', { name: 'Cadastrar', exact: true }),
    ];

    await controls[0].focus();
    await expect(controls[0]).toBeFocused();
    for (const control of controls.slice(1)) {
      await page.keyboard.press('Tab');
      await expect(control).toBeFocused();
    }
  });
});
