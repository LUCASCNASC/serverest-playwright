import { expect, type Page } from '@playwright/test';
import type { ProductData } from '../data/product.factory.js';

/** Encapsulates the administrator product list. */
export class ProductsListPage {
  constructor(private readonly page: Page) {}

  async expectProductListed(product: ProductData, imageName?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/listarprodutos(?:$|[?#])/);
    await expect(this.page.getByRole('heading', { name: 'Lista dos Produtos' })).toBeVisible();
    for (const column of ['Nome', 'Preço', 'Descrição', 'Quantidade', 'Imagem']) {
      await expect(this.page.getByRole('columnheader', { name: column, exact: true })).toBeVisible();
    }

    const row = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: product.nome, exact: true }),
    });
    await expect(row).toHaveCount(1);
    const cells = row.getByRole('cell');
    await expect(cells.nth(0)).toHaveText(product.nome);
    await expect(cells.nth(1)).toHaveText(String(product.preco));
    await expect(cells.nth(2)).toHaveText(product.descricao);
    await expect(cells.nth(3)).toHaveText(String(product.quantidade));
    if (imageName) {
      await expect(cells.nth(4)).toContainText(imageName);
    } else {
      await expect(cells.nth(4)).toBeEmpty();
    }
  }
}
