# ServeRest Playwright

Este projeto automatiza testes de interface do ServeRest usando Playwright + TypeScript, com clientes de API para preparar e verificar dados.

O objetivo principal é validar cenários reais como login, cadastro, navegação e acessibilidade, sem depender de usuários fixos ou dados manuais.

## O que o projeto cobre

- testes de login
- testes de cadastro de usuário
- testes de cadastro de usuários pela área administrativa, incluindo a confirmação do perfil na listagem
- validação dos campos obrigatórios no cadastro de produtos
- acesso à home após autenticação
- clientes de API para suporte aos testes E2E; a suíte independente de API ainda não foi implementada
- testes de acessibilidade com Axe e navegação por teclado
- relatórios e evidências de falha

## Requisitos

- Node.js 22.20.0 (mesma versão usada na CI)
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
│   ├── api/                   # reservado para futuros testes de API
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
Ao final, a fixture tenta excluir apenas o usuário que criou. Usuários criados pela interface e produtos ainda permanecem até o reset noturno; interrupções abruptas também podem impedir a limpeza.

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

### Executar testes de cadastro de usuários

```powershell
npm run test:register:user
```

### Validar campos obrigatórios no cadastro de produtos

```powershell
npm run test:register:product
```

### Executar testes de acessibilidade

```powershell
npm run test:a11y
```

### Testar scripts de suporte

```powershell
npm run test:scripts
```

Ainda não há testes independentes em `tests/api`.

### Atualizar o inventário HTML

Edite `docs/INVENTARIO_CENARIOS.md`, depois execute `npm run inventory`. Use `npm run inventory:check` para verificar a sincronização.

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
