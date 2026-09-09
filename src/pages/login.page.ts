import { expect, type Page } from '@playwright/test';

export class LoginPage {
  private readonly emailInput;
  private readonly passwordInput;
  private readonly loginButton;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByPlaceholder('Digite seu email');
    this.passwordInput = page.getByPlaceholder('Digite sua senha');
    this.loginButton = page.getByRole('button', { name: 'Entrar' });
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async submitWithEnter(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/login/);
  }
}
