import { test, expect } from '../../src/fixtures/test.js';
import { createUserData } from '../../src/data/user.factory.js';
import { RegisterPage } from '../../src/pages/register.page.js';
import { LoginPage } from '../../src/pages/login.page.js';

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

  test('exposes the expected input types and names', async ({ page }) => {
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
  });

  test('does not register a user with a blank name', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit('', user.email, user.password);

    await expect(page).toHaveURL(/cadastrarusuarios/);
  });

  test('does not register a user with a blank email', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit(user.nome, '', user.password);

    await expect(page).toHaveURL(/cadastrarusuarios/);
  });

  test('does not register a user with a blank password', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit(user.nome, user.email, '');

    await expect(page).toHaveURL(/cadastrarusuarios/);
  });

  test('does not register a user with an invalid email format', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = createUserData();

    await registerPage.open();
    await registerPage.submit(user.nome, 'invalid-email', user.password);

    await expect(page).toHaveURL(/cadastrarusuarios/);
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
