import { expect, type Page } from '@playwright/test';
import type { UserData } from '../data/user.factory.js';

/** Encapsulates the user registration screen and its user-facing actions. */
export class RegisterPage {
  private readonly nameInput;
  private readonly emailInput;
  private readonly passwordInput;
  private readonly administratorCheckbox;
  private readonly registerButton;
  private readonly loginLink;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByTestId('nome');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.administratorCheckbox = page.getByTestId('checkbox');
    this.registerButton = page.getByTestId('cadastrar');
    this.loginLink = page.getByTestId('entrar');
  }

  /** Opens the registration route using Playwright's configured base URL. */
  async open(): Promise<void> {
    await this.page.goto('/cadastrarusuarios');
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

  /** Confirms that the registration route is still open. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cadastrarusuarios/);
  }

  /** Activates the existing navigation control to the login screen. */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
