import type { APIRequestContext } from '@playwright/test';
import { environment } from '../config/env.js';

type ProductList = {
  quantidade: number;
  produtos: { nome: string }[];
};

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  async findByName(name: string): Promise<ProductList> {
    const response = await this.request.get(`${environment.apiBaseUrl}/produtos`, {
      params: { nome: name },
    });
    if (!response.ok()) {
      throw new Error(`Product lookup failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }
}
