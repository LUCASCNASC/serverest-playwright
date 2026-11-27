import { test, expect } from '../../src/fixtures/test.js';
import { createUserData } from '../../src/data/user.factory.js';
import { LoginPage } from '../../src/pages/login.page.js';
import { AdminRegisterPage } from '../../src/pages/admin-register.page.js';
import { HomePage } from '../../src/pages/home.page.js';
import { UsersListPage } from '../../src/pages/users-list.page.js';
import { expectRequiredFieldError } from './user-registration.helpers.js';

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

