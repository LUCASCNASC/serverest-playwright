# ServeRest Playwright

Projeto de automacao E2E e API para a aplicacao ServeRest.

## Estrutura

- `tests/e2e`: cenarios de interface organizados por funcionalidade.
- `tests/api`: cenarios de API organizados por recurso.
- `src/pages`: Page Objects da interface.
- `src/api`: clientes das APIs.
- `src/data`: factories e contratos de dados de teste.
- `src/fixtures`: fixtures compartilhadas entre testes.
- `src/config`: configuracoes e variaveis de ambiente.
- `playwright.config.ts`: configuracao global da execucao.

## Ambiente

Copie `.env.example` para `.env` quando precisar sobrescrever URLs. O arquivo `.env` nao deve ser versionado.

## Comandos

- `npm test`: executa todos os testes.
- `npm run test:e2e`: executa testes de interface.
- `npm run test:api`: executa testes de API.
- `npm run test:headed`: executa com navegador visivel.
- `npm run test:ui`: abre o modo UI do Playwright.
- `npm run typecheck`: valida os tipos TypeScript.
