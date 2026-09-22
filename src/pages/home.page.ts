import { expect, type Page } from '@playwright/test';

/** Encapsulates the authenticated home screen. */
export class HomePage {
  constructor(private readonly page: Page) {}

  /** Confirms that the user reached the home screen after authentication. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/home(?:$|[?#])/);
  }
}