import { expect, type Page } from '@playwright/test';

type RequiredField = 'Nome' | 'Email' | 'Password';

export async function expectRequiredFieldError(page: Page, field: RequiredField): Promise<void> {
  await expect(
    page.getByRole('alert').filter({ hasText: `${field} é obrigatório` }),
  ).toBeVisible();
}
