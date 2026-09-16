import { expect, type Page } from '@playwright/test';

/** Encapsulates the login screen and its user-facing actions. */
export class LoginPage {
  private readonly emailInput;
  private readonly passwordInput;
  private readonly loginButton;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByPlaceholder('Digite seu email');
    this.passwordInput = page.getByPlaceholder('Digite sua senha');
    this.loginButton = page.getByRole('button', { name: 'Entrar' });
  }

  /** Opens the login route using Playwright's configured base URL. */
  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  /** Submits credentials by clicking the visible login button. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Submits credentials through the keyboard to cover form accessibility. */
  async submitWithEnter(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');
  }

  /** Confirms that the login route is still open. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/login/);
  }
}
