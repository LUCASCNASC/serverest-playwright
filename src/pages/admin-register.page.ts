import { expect, type Page } from '@playwright/test';
import type { UserData } from '../data/user.factory.js';

/** Encapsulates user registration from the administrator area. */
export class AdminRegisterPage {
  private readonly nameInput;
  private readonly emailInput;
  private readonly passwordInput;
  private readonly administratorCheckbox;
  private readonly registerButton;
  private readonly usersListLink;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByTestId('nome');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.administratorCheckbox = page.getByTestId('checkbox');
    this.registerButton = page.getByTestId('cadastrarUsuario');
    this.usersListLink = page.getByText('Listar Usuários', { exact: true });
  }

  /** Registers a complete user object, including its administrator role. */
  async register(user: UserData): Promise<void> {
    await this.nameInput.fill(user.nome);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);

    if (user.administrador === 'true') {
      await this.administratorCheckbox.check();
    }

    await this.registerButton.click();
  }

  /** Submits arbitrary values for positive and negative registration scenarios. */
  async submit(name: string, email: string, password: string, administrator = false): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (administrator) {
      await this.administratorCheckbox.check();
    }

    await this.registerButton.click();
  }

  /** Submits arbitrary values through the keyboard instead of clicking the button. */
  async submitWithEnter(name: string, email: string, password: string, administrator = false): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (administrator) {
      await this.administratorCheckbox.check();
    }

    await this.passwordInput.press('Enter');
  }

  /** Confirms that the administrator registration route is open. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/cadastrarusuarios(?:$|[?#])/);
    await expect(this.page.getByRole('heading', { name: 'Cadastro de usuários' })).toBeVisible();
  }

  /** Navigates to the users list through the administrator navigation. */
  async goToUsersList(): Promise<void> {
    await this.usersListLink.click();
  }
}
