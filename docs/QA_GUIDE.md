# Guia do QA

Este guia explica de forma simples como instalar, executar, manter e diagnosticar os testes automatizados do ServeRest.

## Objetivo do projeto

Este repositório contém testes com Playwright para a interface web e a API do ServeRest.

Os cenários atuais cobrem:

- login de usuário normal e administrador
- erros de login e validação de campos obrigatórios
- cadastro de usuários
- tratamento de e-mail duplicado
- navegação de login para cadastro e vice-versa
- acessibilidade com Axe e navegação por teclado
- validação da home após autenticação

## Pré-requisitos

- Node.js LTS
- npm
- acesso ao frontend e à API do ServeRest
- navegador Chromium instalado via Playwright

Instale as dependências e o browser na raiz do projeto:

```powershell
npm install
npx playwright install chromium
```

## URLs do sistema

As URLs padrão são:

- frontend: https://front.serverest.dev
- API: https://serverest.dev

Variáveis de ambiente:

```text
WEB_BASE_URL=https://front.serverest.dev
API_BASE_URL=https://serverest.dev
```

Esses valores são usados no Playwright para navegar no site e na API.

## Arquivos importantes

```text
src/
  api/         clientes da API para setup e testes
  config/      configuração de ambiente
  data/        dados e factories dinâmicos
  fixtures/    fixtures compartilhados
  pages/       Page Objects para a interface

tests/
  e2e/         testes de interface por funcionalidade
  api/         testes de API por recurso

.github/      workflow de CI
scripts/       utilitários de suporte
```

## Estratégia de dados

Os testes não devem depender de usuários fixos ou permanentes.

O ambiente externo é resetado diariamente, então o projeto cria seus próprios usuários antes da execução.

O fixture `user` faz isso automaticamente:

1. gera um usuário único
2. define o perfil como `normal` ou `admin`
3. cria o registro via `POST /usuarios`
4. entrega as credenciais para o teste
5. fecha o contexto da API ao final

Exemplo:

```ts
import { test, expect } from '../../src/fixtures/test.js';

test('exemplo', async ({ user }) => {
  expect(user.email).toBeTruthy();
});
```

Quando o cenário exige um usuário administrador, use:

```ts
test.describe('administrador', () => {
  test.use({ userRole: 'admin' });
});
```

## Page Objects

Os Page Objects centralizam seletores e ações da interface. Eles ajudam o teste a focar no comportamento e não repetir código em cada cenário.

Objetos atuais:

- `LoginPage`: abre a tela de login e envia credenciais
- `HomePage`: valida que a autenticação levou para a home

Preferência de seletor:

- login: placeholders e roles acessíveis
- cadastro: `data-testid`

Evite `waitForTimeout` sem necessidade. Prefira asserções do Playwright, que esperam o elemento ou estado correto.

## Comandos de execução

Executar todos os testes:

```powershell
npm test
```

Executar somente os testes E2E:

```powershell
npm run test:e2e
```

Executar testes de login:

```powershell
npm run test:login
```

Executar testes de cadastro:

```powershell
npm run test:register
```

Executar testes de acessibilidade:

```powershell
npm run test:a11y
```

Executar testes de API:

```powershell
npm run test:api
```

Executar com navegador visível:

```powershell
npm run test:headed
```

Executar um arquivo específico com navegador visível:

```powershell
npx playwright test tests/e2e/login.spec.ts --headed
```

Abrir a interface do Playwright:

```powershell
npm run test:ui
```

Validar TypeScript:

```powershell
npm run typecheck
```

Executar ESLint:

```powershell
npm run lint
```

Auditar vulnerabilidades de dependências:

```powershell
npm run audit
```

## Relatórios

O projeto gera:

- HTML em `playwright-report/`
- JUnit em `test-results/playwright-results.xml`
- JSON em `test-results/playwright-results.json`
- screenshots e traces em `test-results/`

Abra o relatório HTML com:

```powershell
npm run report
```

## Testes de acessibilidade

A suíte de acessibilidade usa `@axe-core/playwright` com regras WCAG 2.0 A e AA.

Ela valida:

- violações automáticas
- acessibilidade por teclado
- nomes e rótulos dos elementos

Se houver falha, ela é evidência real de problema. Quando a aplicação externa já tem um problema conhecido, o projeto registra isso com `test.fail()` para manter o rastreio documentado.

Problemas conhecidos do frontend externo incluem:

- imagem sem texto alternativo
- contraste insuficiente
- link de login que não recebe foco por teclado

Esses itens não são corrigidos neste repositório de automação.

## Troubleshooting

### O sistema não está acessível

Verifique manualmente:

```powershell
Invoke-WebRequest "$env:WEB_BASE_URL/login"
Invoke-WebRequest "$env:API_BASE_URL/usuarios"
```

### Um usuário não consegue ser criado

Pode ser problema da API externa, rede, timeout ou resposta inválida. Verifique a resposta da API no output do teste antes de mudar a automação.

### O teste falha só no CI

Revise, em ordem:

1. relatório HTML
2. screenshot em `test-results/`
3. trace da falha
4. resumo do workflow
5. resultado do health check

### Testes de acessibilidade falham

Leia a descrição da violação e os elementos afetados. Não ignore a falha apenas para deixar o pipeline verde.

## Resumo

O projeto foi pensado para ser:

- estável
- reutilizável
- independente de dados fixos
- fácil de manter
- confiável para validação de regressão e acessibilidade

## Adding New Tests

1. Identify the user behavior and expected result.
2. Add or reuse a Page Object for UI interactions.
3. Generate unique data with the existing factory.
4. Avoid shared users and test order dependencies.
5. Use Playwright web-first assertions.
6. Keep API setup in API clients or fixtures.
7. Add a focused command when a suite will be executed frequently.
8. Run `npm run typecheck` before opening a pull request.
9. Document any external dependency or known limitation.
