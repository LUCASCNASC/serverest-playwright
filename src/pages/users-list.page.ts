import { expect, type Page } from '@playwright/test';
import type { UserData } from '../data/user.factory.js';

/** Encapsulates the administrator users list and its visible user data. */
export class UsersListPage {
  constructor(private readonly page: Page) {}

  /** Confirms that the users list route and its validated columns are visible. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/listarusuarios(?:$|[?#])/);
    await expect(this.page.getByRole('heading', { name: 'Lista dos usuários' })).toBeVisible();

    for (const column of ['Nome', 'Email', 'Senha', 'Administrador']) {
      await expect(this.page.getByRole('columnheader', { name: column, exact: true })).toBeVisible();
    }
  }

  /** Verifies the registered user's details and role, without asserting actions. */
  async expectUserListed(user: UserData): Promise<void> {
    await this.expectLoaded();

    const userRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: user.email, exact: true }),
    });

    await expect(userRow).toHaveCount(1);
    await expect(userRow.getByRole('cell', { name: user.nome, exact: true })).toBeVisible();
    await expect(userRow.getByRole('cell', { name: user.email, exact: true })).toBeVisible();
    await expect(userRow.getByRole('cell', { name: user.password, exact: true })).toBeVisible();
    await expect(userRow.getByRole('cell', { name: user.administrador, exact: true })).toBeVisible();
  }

  /** Ends the administrator session. */
  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Logout' }).click();
  }
}
