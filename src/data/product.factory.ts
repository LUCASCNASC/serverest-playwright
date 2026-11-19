import { randomUUID } from 'node:crypto';

export type ProductData = {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
};

export function createProductData(): ProductData {
  const uniqueId = randomUUID();

  return {
    nome: `Test Product ${uniqueId}`,
    preco: 100,
    descricao: `Product description ${uniqueId}`,
    quantidade: 3,
  };
}
