# ServeRest Playwright

Este projeto automatiza testes de interface e API do sistema ServeRest usando Playwright + TypeScript.

O objetivo principal é validar cenários reais como login, cadastro, navegação e acessibilidade, sem depender de usuários fixos ou dados manuais.

## O que o projeto cobre

- testes de login
- testes de cadastro de usuário
- acesso à home após autenticação
- testes de API
- testes de acessibilidade com Axe e navegação por teclado
- relatórios e evidências de falha

## Requisitos

- Node.js LTS
- npm
- navegador Chromium instalado pelo Playwright
- acesso à internet para as URLs do frontend e da API
- terminal PowerShell no Windows ou shell equivalente em Linux/macOS

Verifique as versões:

```powershell
node --version
npm --version
```

## Instalação rápida

Na raiz do projeto, execute:

```powershell
npm install
npx playwright install chromium
```

## Configuração de ambiente

O projeto usa duas URLs principais:

```text
WEB_BASE_URL=https://front.serverest.dev
API_BASE_URL=https://serverest.dev
```

Crie um arquivo `.env` na raiz do projeto com o conteúdo abaixo:

```powershell
@"
WEB_BASE_URL=https://front.serverest.dev
API_BASE_URL=https://serverest.dev
"@ | Set-Content .env
```

Importante:

- o arquivo `.env` é local e não deve entrar no Git
- não salve credenciais reais, tokens ou dados sensíveis
- o projeto lê esse arquivo automaticamente

## Estrutura do projeto

```text
serverest-playwright/
├── .github/workflows/         # CI do projeto
├── docs/                      # documentação de apoio
├── scripts/                   # utilitários de relatórios e suporte
├── src/
│   ├── api/                   # clientes de API usados nos testes
│   ├── config/                # configuração de ambiente
│   ├── data/                  # factories e dados dinâmicos
│   ├── fixtures/              # fixtures compartilhadas do Playwright
│   └── pages/                 # Page Objects da interface
├── tests/
│   ├── api/                   # testes de API
│   └── e2e/                   # testes de interface
├── .env                       # ambiente local (não versionado)
├── commands.md                # referência rápida de comandos
├── eslint.config.js           # configuração do ESLint
├── playwright.config.ts       # configuração do Playwright
├── package.json               # scripts e dependências
├── tsconfig.json              # configuração do TypeScript
├── playwright-report/         # relatório HTML gerado
├── test-results/              # evidências de falha e artefatos
└── README.md                  # documentação principal
```

## Como o projeto evita dados frágil

Os testes não usam usuários fixos gravados no sistema.

O fixture `user` cria um usuário novo antes do teste, com papel de `normal` ou `admin`. Isso elimina dependência de dados que são apagados diariamente pelo ambiente externo.

Essa estratégia deixa os testes:

- independentes da ordem de execução
- mais estáveis
- menos propensos a falhar por resets de dados

## Comandos principais

### Executar tudo

```powershell
npm test
```

### Executar testes E2E

```powershell
npm run test:e2e
```

### Executar testes de login

```powershell
npm run test:login
```

### Executar testes de cadastro

```powershell
npm run test:register
```

### Executar testes de acessibilidade

```powershell
npm run test:a11y
```

### Executar testes de API

```powershell
npm run test:api
```

### Rodar com navegador visível

```powershell
npm run test:headed
```

### Abrir a interface do Playwright

```powershell
npm run test:ui
```

### Rodar somente no Chromium

```powershell
npm run test:chromium
```

### Validar TypeScript

```powershell
npm run typecheck
```

### Validar lint

```powershell
npm run lint
```

### Auditoria de vulnerabilidades

```powershell
npm run audit
```

### Abrir relatório HTML

```powershell
npm run report
```

## Relatórios e evidências

Ao rodar os testes, o projeto gera:

- relatório HTML em `playwright-report/`
- evidências em `test-results/`
- screenshots de falhas
- traces e contextos de erro

Esses artefatos ajudam a entender o que falhou antes de alterar o código dos testes.

## CI e qualidade

O workflow em `.github/workflows/playwright.yml` faz a verificação do ambiente, instala dependências, roda o audit, executa os testes e publica os relatórios como artefatos.

## Dicas de solução de problemas

### O site não está acessível

Verifique as URLs manualmente:

```powershell
Invoke-WebRequest https://front.serverest.dev/login
Invoke-WebRequest https://serverest.dev/usuarios
```

### O navegador não foi instalado

```powershell
npx playwright install chromium
```

### Um teste falha de forma instável

Verifique:

- o relatório HTML
- o screenshot em `test-results/`
- o erro contextual
- a disponibilidade da API externa
- a criação do usuário dinâmico

## Mais informações

Consulte o guia detalhado em [docs/QA_GUIDE.md](docs/QA_GUIDE.md) para conhecer melhor a estrutura, os fixtures, Page Objects e a estratégia de acessibilidade.
