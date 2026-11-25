# Inventário de cenários — ServeRest Playwright

**Referência:** 24/11/2026.

**Escopo:** estrutura local e cenários automatizados disponíveis no projeto.

## Resumo

O projeto automatiza a interface do ServeRest usando Playwright e TypeScript. A listagem do runner identificou **81 testes Playwright em cinco arquivos**, todos configurados para Chromium. Há também **1 teste de suporte** para o resumo da pipeline, executado separadamente.

| Área | Arquivo | Testes |
|---|---|---:|
| Login | [login.spec.ts](../tests/e2e/login.spec.ts) | 13 |
| Home | [home.spec.ts](../tests/e2e/home.spec.ts) | 2 |
| Cadastro de usuários e acesso administrativo | [register-user.spec.ts](../tests/e2e/register-user.spec.ts) | 37 |
| Cadastro de produtos | [register-product.spec.ts](../tests/e2e/register-product.spec.ts) | 22 |
| Acessibilidade | [accessibility.spec.ts](../tests/e2e/accessibility.spec.ts) | 7 |
| **Total** | | **81** |

**Implementado não significa aprovado.** A última execução completa disponível começou em **24/11/2026 às 10h10 (UTC−3)**. Dos 81 testes Playwright, 73 passaram e 8 apresentaram falhas esperadas: quatro de acessibilidade e quatro de cadastro e autorização. O Playwright considerou a execução bem-sucedida, mas as falhas esperadas não significam que os defeitos foram corrigidos. A conferência atual listou os testes sem executá-los novamente.

| Área | Passaram | Falhas esperadas |
|---|---:|---:|
| Login | 13 | 0 |
| Home | 2 | 0 |
| Cadastro público de usuários | 17 | 0 |
| Cadastro administrativo de usuários | 17 | 0 |
| Acesso administrativo de usuários | 1 | 2 |
| Cadastro de produtos | 20 | 2 |
| Acessibilidade | 3 | 4 |
| **Total** | **73** | **8** |

## Organização do projeto

| Local | Responsabilidade |
|---|---|
| [tests/e2e](../tests/e2e) | Cenários de interface, navegação e acessibilidade, organizados por funcionalidade. |
| [tests/api](../tests/api) | Pasta reservada para testes de API; atualmente contém apenas um README, sem arquivos de teste. |
| [src/pages](../src/pages) | Page Objects que centralizam seletores e ações de login, home, cadastro de usuários, listagem de usuários e cadastro de produtos. |
| [src/fixtures/test.ts](../src/fixtures/test.ts) | Fixture `user`, responsável por criar um usuário normal ou administrador via API para o teste. |
| [src/api/users.api.ts](../src/api/users.api.ts) | Cliente que cria usuários via `POST /usuarios` para preparar dados. É suporte aos testes E2E, não uma suíte de testes de API. |
| [src/data](../src/data) | Factories para gerar dados de usuários e produtos. O e-mail do usuário e o nome do produto usam UUID. |
| [src/config/env.ts](../src/config/env.ts) | Configuração das URLs da aplicação e da API. |
| [playwright.config.ts](../playwright.config.ts) | Configura navegador, workers, timeouts, retries e relatórios. |
| [.github/workflows/playwright.yml](../.github/workflows/playwright.yml) | Pipeline de verificação dos serviços e execução dos testes. |
| [scripts/generate-github-summary.mjs](../scripts/generate-github-summary.mjs) | Produz um resumo dos resultados no GitHub Actions. |
| [scripts/generate-github-summary.test.mjs](../scripts/generate-github-summary.test.mjs) | Testa separadamente a classificação dos resultados no resumo. |
| [docs/QA_GUIDE.md](QA_GUIDE.md) | Guia de instalação, execução e manutenção dos testes. |

### Dados e reset noturno

O ambiente ServeRest é externo e **apaga os dados à noite, inclusive usuários**. Os testes usam dados gerados para cada execução; não devem depender de contas ou produtos de dias anteriores. A fixture fecha o contexto de API ao final, mas não exclui os usuários criados. Cenários de sucesso também criam produtos; esses registros permanecem no ambiente até o reset.

## Cenários implementados

### 1. Login — 13 testes

Fonte: [login.spec.ts](../tests/e2e/login.spec.ts).

1. Login de usuário normal e navegação para a home.
2. Login de administrador e navegação para a home.
3. Login com e-mail e senha vazios, verificando os alertas dos dois campos.
4. Login com e-mail vazio, verificando o alerta correspondente.
5. Login com senha vazia, verificando o alerta correspondente.
6. Tentativa com e-mail e senha inválidos.
7. Tentativa com e-mail inválido e senha de um usuário criado para o teste.
8. Tentativa com e-mail de um usuário criado para o teste e senha inválida.
9. Exibição da tela de login e dos controles esperados.
10. Tipos dos campos de e-mail e senha.
11. Tentativa com formato de e-mail inválido.
12. Preservação dos valores dos campos após tentativa malsucedida.
13. Envio das credenciais com a tecla Enter.

**Limite das verificações:** nos casos de credenciais inválidas e formato inválido, o código verifica principalmente a permanência na rota de login; não valida uma mensagem específica de erro em todos eles.

### 2. Home — 2 testes

Fonte: [home.spec.ts](../tests/e2e/home.spec.ts).

1. Usuário normal alcança a home após login.
2. Administrador alcança a home após login.

Esses testes validam a rota da home. Existem testes de login semelhantes, mas eles são contabilizados separadamente pelo runner.

### 3. Cadastro público de usuários — 17 testes

Fonte: [register-user.spec.ts](../tests/e2e/register-user.spec.ts).

1. Cadastro de usuário normal com redirecionamento para a home.
2. Login com usuário normal recém-cadastrado.
3. Cadastro de administrador com redirecionamento para a home.
4. Cadastro com nome contendo acentos e caracteres especiais, verificando a navegação para a home.
5. Exibição da tela de cadastro e dos controles esperados.
6. Tipos e atributos `name` dos campos.
7. Todos os campos vazios, com os alertas de nome, e-mail e senha.
8. Nome vazio, com o alerta correspondente.
9. E-mail vazio, com o alerta correspondente.
10. Senha vazia, com o alerta correspondente.
11. Formato de e-mail inválido, verificando a validação nativa do campo.
12. E-mail duplicado, verificando a mensagem apresentada.
13. Preservação dos valores submetidos após erro de e-mail duplicado.
14. Marcar e desmarcar a opção de administrador.
15. Navegação para a tela de login.
16. Envio do formulário com Enter.
17. Campo de senha com tipo `password`.

O teste de nome acentuado da tela pública confirma o redirecionamento; ele não consulta a persistência exata do nome.

### 4. Cadastro de usuários pela área administrativa — 17 testes

Fonte: [register-user.spec.ts](../tests/e2e/register-user.spec.ts).

1. Cadastrar usuário normal e verificar seus dados na listagem.
2. Cadastrar administrador e verificar seus dados e perfil na listagem.
3. Cadastrar nome acentuado e verificar sua preservação na listagem.
4. Fazer login com usuário normal recém-cadastrado.
5. Exibir os controles da tela administrativa de cadastro.
6. Verificar tipos e atributos `name` dos campos.
7. Todos os campos vazios, com os alertas de nome, e-mail e senha.
8. Nome vazio, com o alerta correspondente.
9. E-mail vazio, com o alerta correspondente.
10. Senha vazia, com o alerta correspondente.
11. Formato de e-mail inválido, verificando a validação nativa do campo.
12. E-mail duplicado, verificando a mensagem apresentada.
13. Preservação dos valores após erro de e-mail duplicado, incluindo a opção de administrador.
14. Marcar e desmarcar a opção de administrador.
15. Navegar do cadastro administrativo para a lista de usuários.
16. Enviar o formulário com Enter e verificar o usuário na lista.
17. Campo de senha com tipo `password`.

Nos cadastros bem-sucedidos validados na lista, [UsersListPage](../src/pages/users-list.page.ts) verifica a rota, o cabeçalho e a linha correspondente ao e-mail, incluindo nome, e-mail, senha e valor `true` ou `false` da coluna Administrador. A coluna Ações não é validada.

### 5. Acesso às rotas administrativas de usuários — 3 testes

Fonte: [register-user.spec.ts](../tests/e2e/register-user.spec.ts).

1. Sem autenticação, acessar diretamente as rotas administrativas de cadastro e listagem e verificar redirecionamento para login.
2. Com usuário normal, verificar que o formulário administrativo de cadastro não é exposto — **falha esperada**.
3. Com usuário normal, verificar que a lista administrativa de usuários não é exposta — **falha esperada**.

As duas últimas expectativas estão marcadas com `test.fail()` após login e navegação: o frontend público permitiu os acessos indevidos. As falhas esperadas não reprovam a execução e não indicam que os defeitos foram corrigidos.

### 6. Cadastro de produtos — 22 testes

Fonte: [register-product.spec.ts](../tests/e2e/register-product.spec.ts).

Os cinco cenários de campos obrigatórios autenticam um administrador criado para o próprio teste e verificam a permanência na rota de cadastro.

1. Todos os campos obrigatórios vazios: verificar os quatro alertas de nome, preço, descrição e quantidade.
2. Nome vazio, com os demais valores preenchidos: esperar somente o alerta de nome obrigatório.
3. Preço vazio, com os demais valores preenchidos: esperar somente o alerta de preço obrigatório.
4. Descrição vazia, com os demais valores preenchidos: esperar somente o alerta de descrição obrigatória.
5. Quantidade vazia, com os demais valores preenchidos: esperar somente o alerta de quantidade obrigatória.

6. Cadastro sem imagem e verificação dos dados na listagem.
7. Cadastro com imagem e verificação do nome do arquivo após atualizar a listagem.
8. Cadastro com preço mínimo de 1 e quantidade zero.
9. Preservação de acentos no nome e na descrição.
10. Navegação para o formulário pelo cartão da home; os demais cenários administrativos usam o menu.
11. Nome duplicado: alerta, preservação dos valores e ausência de outro registro.
12. Correção do nome ausente e tentativa de concluir o cadastro — **falha esperada**.
13. Rejeição de preço zero.
14. Rejeição de preço negativo.
15. Rejeição de quantidade negativa.
16. Rejeição de preço decimal pela validação nativa.
17. Rejeição de quantidade decimal pela validação nativa.
18. Envio do formulário com Enter.
19. Duplo clique no envio sem criação de produto duplicado.
20. Rótulos e ordem de navegação por teclado nos controles do formulário.
21. Acesso sem autenticação redirecionado para login.
22. Usuário normal não deve ter acesso ao formulário administrativo — **falha esperada**.

Na execução de 24/11/2026, **20 passaram e 2 falharam**: ao corrigir o nome, o formulário apresentou alertas de outros campos que continuavam visualmente preenchidos; um usuário normal conseguiu abrir o formulário administrativo. Ambas as falhas foram reproduzidas e os cenários foram posteriormente marcados com `test.fail()`. Nessa execução, os cinco cenários de obrigatoriedade passaram.

O teste de imagem verifica apenas o nome do arquivo exibido na listagem, não o armazenamento ou a recuperação do conteúdo. Formatos e limites de imagem não foram especificados. Unicidade do nome e limites numéricos seguem o contrato publicado em `https://serverest.dev/swagger.json`.

### 7. Acessibilidade — 7 testes

Fonte: [accessibility.spec.ts](../tests/e2e/accessibility.spec.ts).

1. Análise automatizada Axe WCAG 2.0 A/AA na tela de login — marcada com `test.fail()` por violações conhecidas.
2. Análise Axe WCAG 2.0 A/AA no cadastro público — marcada com `test.fail()`.
3. Análise Axe WCAG 2.0 A/AA na home autenticada — marcada com `test.fail()`.
4. Nomes acessíveis e alcance por teclado dos controles de login.
5. Nomes acessíveis e alcance por teclado dos controles de cadastro público.
6. Home autenticada: verificar que pelo menos um controle é alcançado por teclado.
7. Acesso por teclado ao controle de login na tela de cadastro — marcado com `test.fail()` porque o frontend foi identificado sem elemento focável para esse controle.

`test.fail()` significa que o Playwright **espera que o cenário falhe**; não significa que a aplicação passou na verificação. Além desses testes de acessibilidade, quatro cenários de autorização e produtos também estão marcados como falhas esperadas. Se um cenário marcado passar, o Playwright reporta sucesso inesperado.

### 8. Teste de suporte da pipeline — 1 teste

Fonte: [generate-github-summary.test.mjs](../scripts/generate-github-summary.test.mjs).

1. Verificar que o resumo contabiliza separadamente aprovação, falha esperada, sucesso inesperado, falha, flaky e teste ignorado.

Esse teste usa o runner nativo do Node.js. **Não faz parte dos 81 cenários Playwright**, não é executado por `npm test` e não está incluído no workflow atual. Foi executado com sucesso na validação anterior.

## Configuração, execução e CI

- **Navegador:** Chromium, em um único projeto do Playwright.
- **Concorrência:** um worker local e na CI.
- **Timeouts:** 30 segundos por teste, 5 segundos por asserção, 10 segundos por ação e 15 segundos para navegação.
- **CI:** uma nova tentativa em caso de falha; um teste que passa apenas após retry é tratado como flaky e faz a execução falhar.
- **Evidências:** saída em lista, HTML, JUnit e JSON; screenshot em falhas e trace na primeira tentativa repetida.
- **Pipeline:** health check do frontend e da API; instalação de dependências, auditoria, lint, typecheck, instalação de navegadores, execução dos testes, resumo e publicação de relatórios.
- **Resumo da pipeline:** falhas esperadas são contabilizadas separadamente dos testes aprovados e das falhas inesperadas.
- **Dependências externas:** a execução requer acesso ao frontend e à API configurados; uma verificação de disponibilidade não garante que todas as operações de cadastro funcionarão.

Comandos na raiz do projeto:

| Objetivo | Comando |
|---|---|
| Todos os testes | `npm test` |
| Testes E2E | `npm run test:e2e` |
| Login | `npm run test:login` |
| Cadastro de usuários e acesso administrativo | `npm run test:register:user` |
| Cadastro de produtos | `npm run test:register:product` |
| Acessibilidade | `npm run test:a11y` |
| Verificar tipos / lint | `npm run typecheck` / `npm run lint` |
| Abrir relatório HTML | `npm run report` |
| Testar resumo da pipeline separadamente | `node --test scripts/generate-github-summary.test.mjs` |

Embora exista `npm run test:api`, a pasta [tests/api](../tests/api) não contém cenários executáveis no estado analisado.

## Limitações e próximos pontos de atenção

- A suíte depende do ambiente público compartilhado; indisponibilidade, concorrência de outras execuções e o reset noturno podem afetar os resultados.
- O acesso de usuário normal às três rotas administrativas e a correção de formulário de produto falharam em 24/11/2026; os quatro cenários estão marcados como falhas esperadas, sem corrigir a aplicação.
- Uma falha diferente ocorrida depois de uma marcação `test.fail()` também pode ser classificada como esperada; examine as evidências do relatório.
- Regras de borda de cadastro de usuários, como limites de tamanho e tratamento de espaços, dependem de requisitos confirmados e não estão cobertas aqui.
- Não há neste inventário cenários de compra ou carrinho implementados nos cinco arquivos analisados.
- A análise Axe automatizada não garante, por si só, conformidade integral de acessibilidade.
