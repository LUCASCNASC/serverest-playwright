import { test, expect } from '../../src/fixtures/test.js';
import { createUserData } from '../../src/data/user.factory.js';
import { RegisterPage } from '../../src/pages/register.page.js';
import { LoginPage } from '../../src/pages/login.page.js';
import { AdminRegisterPage } from '../../src/pages/admin-register.page.js';
import { HomePage } from '../../src/pages/home.page.js';
import { UsersListPage } from '../../src/pages/users-list.page.js';
import type { Page } from '@playwright/test';

type RequiredField = 'Nome' | 'Email' | 'Password';

async function expectRequiredFieldError(page: Page, field: RequiredField): Promise<void> {
  await expect(
    page.getByRole('alert').filter({ hasText: `${field} é obrigatório` }),
  ).toBeVisible();
}

test.describe('User registration', () => {
  test('registers a normal user successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData('normal');

    await registerPage.open();
    await registerPage.register(user);

    await expect(page).toHaveURL(/home/);
  });

  test('allows the newly registered user to log in', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const user = createUserData('normal');

    await registerPage.open();
    await registerPage.register(user);
    await expect(page).toHaveURL(/home/);

    await loginPage.open();
    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(/home/);
  });

  test('registers an administrator successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData('admin');

    await registerPage.open();
    await registerPage.register(user);

    await expect(page).toHaveURL(/home/);
  });

  test('registers a user with accented name characters', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = { ...createUserData('normal'), nome: 'João D’Ávila QA – São Paulo' };

    await registerPage.open();
    await registerPage.register(user);

    await expect(page).toHaveURL(/\/home(?:$|[?#])/);
  });

  test('displays the registration page with the expected controls', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();

    await expect(page.getByRole('heading', { name: 'Cadastro' })).toBeVisible();
    await expect(page.getByTestId('nome')).toBeVisible();
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('checkbox')).not.toBeChecked();
    await expect(page.getByTestId('cadastrar')).toBeVisible();
    await expect(page.getByTestId('entrar')).toBeVisible();
  });

  test('exposes the expected input types and name', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();

    await expect(page.getByTestId('nome')).toHaveAttribute('type', 'text');
    await expect(page.getByTestId('nome')).toHaveAttribute('name', 'nome');
    await expect(page.getByTestId('email')).toHaveAttribute('type', 'email');
    await expect(page.getByTestId('email')).toHaveAttribute('name', 'email');
    await expect(page.getByTestId('password')).toHaveAttribute('type', 'password');
    await expect(page.getByTestId('password')).toHaveAttribute('name', 'password');
    await expect(page.getByTestId('checkbox')).toHaveAttribute('type', 'checkbox');
    await expect(page.getByTestId('checkbox')).toHaveAttribute('name', 'administrador');
  });

  test('does not register a user with all fields blank', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.submit('', '', '');

    await expect(page).toHaveURL(/cadastrarusuarios/);
    await expectRequiredFieldError(page, 'Nome');
    await expectRequiredFieldError(page, 'Email');
    await expectRequiredFieldError(page, 'Password');
  });

  test('does not register a user with a blank name', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit('', user.email, user.password);

    await expect(page).toHaveURL(/cadastrarusuarios/);
    await expectRequiredFieldError(page, 'Nome');
  });

  test('does not register a user with a blank email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit(user.nome, '', user.password);

    await expect(page).toHaveURL(/cadastrarusuarios/);
    await expectRequiredFieldError(page, 'Email');
  });

  test('does not register a user with a blank password', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit(user.nome, user.email, '');

    await expect(page).toHaveURL(/cadastrarusuarios/);
    await expectRequiredFieldError(page, 'Password');
  });

  test('does not register a user with an invalid email format', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit(user.nome, 'invalid-email', user.password);

    await expect(page).toHaveURL(/cadastrarusuarios/);
    const emailInput = page.getByTestId('email');
    await expect(emailInput).toHaveValue('invalid-email');
    expect(await emailInput.evaluate((input: HTMLInputElement) => input.validity.typeMismatch)).toBe(true);
  });

  test('does not register a user with a duplicated email', async ({ page, user }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register(user);

    await expect(page).toHaveURL(/cadastrarusuarios/);
    await expect(page.getByText('Este email já está sendo usado')).toBeVisible();
  });

  test('preserves the submitted values after a duplicated email error', async ({ page, user }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register(user);

    await expect(page.getByTestId('nome')).toHaveValue(user.nome);
    await expect(page.getByTestId('email')).toHaveValue(user.email);
    await expect(page.getByTestId('password')).toHaveValue(user.password);
    await expect(page.getByTestId('checkbox')).not.toBeChecked();
  });

  test('allows selecting and clearing the administrator option', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await page.getByTestId('checkbox').check();
    await expect(page.getByTestId('checkbox')).toBeChecked();

    await page.getByTestId('checkbox').uncheck();
    await expect(page.getByTestId('checkbox')).not.toBeChecked();
  });

  test('navigates to the login page', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.goToLogin();

    await expect(page).toHaveURL(/login/);
  });

  test('submits the form with the Enter key', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submitWithEnter(user.nome, user.email, user.password);

    await expect(page).toHaveURL(/home/);
  });

  test('masks the password field', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();

    await expect(page.getByTestId('password')).toHaveAttribute('type', 'password');
  });
});

test.describe('User registration from the administrator area', () => {
  test.use({ userRole: 'admin' });

  async function openAdminRegistration(
    page: import('@playwright/test').Page,
    admin: { email: string; password: string },
  ): Promise<AdminRegisterPage> {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const registerPage = new AdminRegisterPage(page);

    await loginPage.open();
    await loginPage.login(admin.email, admin.password);
    await homePage.expectLoaded();
    await homePage.openUserRegistration();
    await registerPage.expectLoaded();

    return registerPage;
  }

  test('registers a normal user and verifies the user list details', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const usersListPage = new UsersListPage(page);
    const newUser = createUserData('normal');

    await registerPage.register(newUser);

    await expect(page).toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await usersListPage.expectUserListed(newUser);
  });

  test('registers an administrator and verifies the user list role', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const usersListPage = new UsersListPage(page);
    const newUser = createUserData('admin');

    await registerPage.register(newUser);

    await expect(page).toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await usersListPage.expectUserListed(newUser);
  });

  test('preserves accented name characters in the users list', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const usersListPage = new UsersListPage(page);
    const newUser = { ...createUserData('normal'), nome: 'João D’Ávila QA – São Paulo' };

    await registerPage.register(newUser);

    await expect(page).toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await usersListPage.expectUserListed(newUser);
  });

  test('allows the newly registered user to log in', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const usersListPage = new UsersListPage(page);
    const loginPage = new LoginPage(page);
    const newUser = createUserData('normal');

    await registerPage.register(newUser);
    await usersListPage.expectUserListed(newUser);
    await usersListPage.logout();
    await loginPage.open();
    await loginPage.login(newUser.email, newUser.password);

    await expect(page).toHaveURL(/\/home(?:$|[?#])/);
  });

  test('displays the administrator registration page with the expected controls', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);

    await expect(page.getByTestId('nome')).toBeVisible();
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('checkbox')).not.toBeChecked();
    await expect(page.getByTestId('cadastrarUsuario')).toBeVisible();

    await registerPage.expectLoaded();
  });

  test('exposes the expected input types and names in the administrator form', async ({ page, user }) => {
    await openAdminRegistration(page, user);

    await expect(page.getByTestId('nome')).toHaveAttribute('type', 'text');
    await expect(page.getByTestId('nome')).toHaveAttribute('name', 'nome');
    await expect(page.getByTestId('email')).toHaveAttribute('type', 'email');
    await expect(page.getByTestId('email')).toHaveAttribute('name', 'email');
    await expect(page.getByTestId('password')).toHaveAttribute('type', 'password');
    await expect(page.getByTestId('password')).toHaveAttribute('name', 'password');
    await expect(page.getByTestId('checkbox')).toHaveAttribute('type', 'checkbox');
    await expect(page.getByTestId('checkbox')).toHaveAttribute('name', 'administrador');
  });

  test('does not register a user with all fields blank', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);

    await registerPage.submit('', '', '');

    await registerPage.expectLoaded();
    await expect(page).toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    await expectRequiredFieldError(page, 'Nome');
    await expectRequiredFieldError(page, 'Email');
    await expectRequiredFieldError(page, 'Password');
  });

  test('does not register a user with a blank name', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const newUser = createUserData();

    await registerPage.submit('', newUser.email, newUser.password);

    await registerPage.expectLoaded();
    await expect(page).toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    await expectRequiredFieldError(page, 'Nome');
  });

  test('does not register a user with a blank email', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const newUser = createUserData();

    await registerPage.submit(newUser.nome, '', newUser.password);

    await registerPage.expectLoaded();
    await expect(page).toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    await expectRequiredFieldError(page, 'Email');
  });

  test('does not register a user with a blank password', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const newUser = createUserData();

    await registerPage.submit(newUser.nome, newUser.email, '');

    await registerPage.expectLoaded();
    await expect(page).toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    await expectRequiredFieldError(page, 'Password');
  });

  test('does not register a user with an invalid email format', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const newUser = createUserData();

    await registerPage.submit(newUser.nome, 'invalid-email', newUser.password);

    await registerPage.expectLoaded();
    await expect(page).toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    const emailInput = page.getByTestId('email');
    await expect(emailInput).toHaveValue('invalid-email');
    expect(await emailInput.evaluate((input: HTMLInputElement) => input.validity.typeMismatch)).toBe(true);
  });

  test('does not register a user with a duplicated email', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);

    await registerPage.register(user);

    await registerPage.expectLoaded();
    await expect(page.getByText('Este email já está sendo usado')).toBeVisible();
  });

  test('preserves submitted values after a duplicated email error', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);

    await registerPage.register(user);

    await expect(page.getByTestId('nome')).toHaveValue(user.nome);
    await expect(page.getByTestId('email')).toHaveValue(user.email);
    await expect(page.getByTestId('password')).toHaveValue(user.password);
    await expect(page.getByTestId('checkbox')).toBeChecked();
  });

  test('allows selecting and clearing the administrator option', async ({ page, user }) => {
    await openAdminRegistration(page, user);
    await page.getByTestId('checkbox').check();
    await expect(page.getByTestId('checkbox')).toBeChecked();

    await page.getByTestId('checkbox').uncheck();
    await expect(page.getByTestId('checkbox')).not.toBeChecked();
  });

  test('navigates to the users list from the administrator registration page', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const usersListPage = new UsersListPage(page);

    await registerPage.goToUsersList();

    await usersListPage.expectLoaded();
    await expect(page).toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
  });

  test('submits the form with the Enter key and verifies the registered user', async ({ page, user }) => {
    const registerPage = await openAdminRegistration(page, user);
    const usersListPage = new UsersListPage(page);
    const newUser = createUserData('normal');

    await registerPage.submitWithEnter(newUser.nome, newUser.email, newUser.password);

    await expect(page).toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await usersListPage.expectUserListed(newUser);
  });

  test('masks the password field in the administrator form', async ({ page, user }) => {
    await openAdminRegistration(page, user);

    await expect(page.getByTestId('password')).toHaveAttribute('type', 'password');
  });
});

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

    await expect.soft(page).not.toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await expect.soft(page.getByRole('heading', { name: 'Lista dos usuários' })).toHaveCount(0);
    await expect.soft(page.getByRole('table')).toHaveCount(0);
  });
});
