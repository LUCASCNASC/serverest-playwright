import { expect, type Page } from '@playwright/test';
import type { ProductData } from '../data/product.factory.js';

export type ProductRequiredField = 'Nome' | 'Preço' | 'Descrição' | 'Quantidade';

const requiredFieldMessages: Record<ProductRequiredField, string> = {
  Nome: 'Nome é obrigatório',
  Preço: 'Preco é obrigatório',
  Descrição: 'Descricao é obrigatório',
  Quantidade: 'Quantidade é obrigatório',
};

/** Encapsulates product registration in the administrator area. */
export class ProductRegisterPage {
  private readonly nameInput;
  private readonly priceInput;
  private readonly descriptionInput;
  private readonly quantityInput;
  private readonly registerButton;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByRole('textbox', { name: 'Nome: *' });
    this.priceInput = page.getByRole('spinbutton', { name: 'Preço: *' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Descrição: *' });
    this.quantityInput = page.getByRole('spinbutton', { name: 'Quantidade: *' });
    this.registerButton = page.getByRole('button', { name: 'Cadastrar', exact: true });
  }

  /** Confirms the product registration route and its mandatory form controls. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
    await expect(this.page.getByRole('heading', { name: 'Cadastro de Produtos' })).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.priceInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
    await expect(this.quantityInput).toBeVisible();
  }

  /** Fills the form, optionally leaving fields empty to exercise validation. */
  async fill(product: ProductData, omittedFields: ProductRequiredField[] = []): Promise<void> {
    await this.nameInput.fill(omittedFields.includes('Nome') ? '' : product.nome);
    await this.priceInput.fill(omittedFields.includes('Preço') ? '' : String(product.preco));
    await this.descriptionInput.fill(omittedFields.includes('Descrição') ? '' : product.descricao);
    await this.quantityInput.fill(omittedFields.includes('Quantidade') ? '' : String(product.quantidade));
  }

  /** Submits the form with the provided values. */
  async submit(product: ProductData, omittedFields: ProductRequiredField[] = []): Promise<void> {
    await this.fill(product, omittedFields);
    await this.registerButton.click();
  }

  /** Checks the exact required-field validation message and that registration did not proceed. */
  async expectRequiredFieldErrors(fields: ProductRequiredField[]): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/cadastrarprodutos(?:$|[?#])/);
    await expect(this.page.getByRole('alert')).toHaveCount(fields.length);

    for (const field of fields) {
      await expect(
        this.page.getByRole('alert').filter({ hasText: requiredFieldMessages[field] }),
      ).toBeVisible();
    }
  }
}
