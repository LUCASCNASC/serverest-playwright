import { expect, type Page } from '@playwright/test';

/** Encapsulates the authenticated home screen. */
export class HomePage {
  constructor(private readonly page: Page) {}

  /** Confirms that the user reached the home screen after authentication. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/home(?:$|[?#])/);
  }

  /** Opens user registration from the administrator home screen. */
  async openUserRegistration(): Promise<void> {
    await this.page.getByTestId('cadastrarUsuarios').click();
  }
};
