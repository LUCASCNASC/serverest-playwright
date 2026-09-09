import { expect, type Page } from '@playwright/test';
import type { UserData } from '../data/user.factory.js';

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

  async open(): Promise<void> {
    await this.page.goto('/cadastrarusuarios');
  }

  async register(user: UserData): Promise<void> {
    await this.nameInput.fill(user.nome);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);

    if (user.administrador === 'true') {
      await this.administratorCheckbox.check();
    }

    await this.registerButton.click();
  }

  async submit(name: string, email: string, password: string, administrator = false): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (administrator) {
      await this.administratorCheckbox.check();
    }

    await this.registerButton.click();
  }

  async submitWithEnter(name: string, email: string, password: string, administrator = false): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (administrator) {
      await this.administratorCheckbox.check();
    }

    await this.passwordInput.press('Enter');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cadastrarusuarios/);
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
