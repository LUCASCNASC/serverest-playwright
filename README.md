# ServeRest Playwright

Playwright automation project for the ServeRest web application and API. The project is written in TypeScript and currently runs browser tests in Chromium.

## Quick Start

Run these commands from the project root:

```powershell
git clone <repository-url>
Set-Location .\serverest-playwright
npm ci
npx playwright install chromium
npm run typecheck
npm test
```

The application under test is external. The test suite does not start a local application server.

## Requirements

- Node.js LTS.
- npm, installed with Node.js.
- Chromium installed through Playwright.
- Network access to the ServeRest frontend and API.
- PowerShell on Windows, or an equivalent shell on macOS/Linux.

Check the installed versions:

```powershell
node --version
npm --version
```

## Environment Configuration

The default URLs are:

```text
WEB_BASE_URL=https://front.serverest.dev
API_BASE_URL=https://serverest.dev
```

To use different environments, create a `.env` file in the project root:

```powershell
@"
WEB_BASE_URL=https://front.serverest.dev
API_BASE_URL=https://serverest.dev
"@ | Set-Content .env
```

The Playwright configuration loads `.env` automatically. Never commit `.env`, credentials, tokens, or real user data.

You can also override a URL for one PowerShell command without changing `.env`:

```powershell
$env:WEB_BASE_URL = 'https://front.serverest.dev'; npm run test:e2e
```

## Project Structure

```text
serverest-playwright/
|-- .github/workflows/playwright.yml  # CI, health check, tests, and artifacts
|-- scripts/                          # CI report helpers
|-- src/
|   |-- api/                           # API clients used by setup and API tests
|   |-- config/                        # Environment configuration
|   |-- data/                          # Data types and dynamic factories
|   |-- fixtures/                      # Shared Playwright fixtures
|   `-- pages/                         # Page Objects for UI screens
|-- tests/
|   |-- api/                           # API scenarios by resource
|   `-- e2e/                           # Browser scenarios by feature
|-- playwright.config.ts               # Playwright execution settings
|-- package.json                       # Scripts and dependencies
|-- package-lock.json                  # Locked dependency tree
|-- test-results/                      # Generated failure evidence and reports
`-- playwright-report/                 # Generated HTML report
```

## Test Data

Tests do not depend on permanent users. The shared `user` fixture creates a unique normal or administrator user through `POST /usuarios` before a test that needs an existing account.

Registration tests generate their own data with the factory. This keeps tests independent from the daily data reset and from execution order.

The default roles are:

- `normal`: regular user.
- `admin`: administrator user.

## Commands

Run all tests in the terminal:

```powershell
npm test
```

Run all UI/E2E tests:

```powershell
npm run test:e2e
```

Run only the login suite:

```powershell
npm run test:login
```

Run only the registration suite:

```powershell
npm run test:register
```

Run accessibility and WCAG checks:

```powershell
npm run test:a11y
```

Run API tests:

```powershell
npm run test:api
```

Run with a visible browser:

```powershell
npm run test:headed
```

Run one suite with a visible browser:

```powershell
npx playwright test tests/e2e/login.spec.ts --headed
```

Open Playwright UI mode:

```powershell
npm run test:ui
```

Run only Chromium:

```powershell
npm run test:chromium
```

Check TypeScript without running tests:

```powershell
npm run typecheck
```

Audit dependencies for high-severity vulnerabilities:

```powershell
npm run audit
```

## Reports and Failure Evidence

Playwright generates the following files after execution:

- `playwright-report/`: HTML report.
- `test-results/playwright-results.xml`: JUnit report.
- `test-results/playwright-results.json`: JSON report.
- `test-results/<test-folder>/`: screenshots, traces, and error context for failures.

Open the HTML report:

```powershell
npm run report
```

Failure screenshots are configured with `screenshot: 'only-on-failure'`. Do not share reports outside the intended audience without checking for test credentials or personal data captured in the evidence.

## CI Pipeline

The GitHub Actions workflow in `.github/workflows/playwright.yml`:

1. Checks frontend and API availability.
2. Installs dependencies with `npm ci`.
3. Runs the dependency security audit.
4. Installs Chromium and its system dependencies.
5. Executes the Playwright suite.
6. Publishes the HTML, JUnit, JSON, screenshots, and traces as artifacts.

The CI job uses one worker to reduce contention against the shared environment. Local execution uses two workers.

## Troubleshooting

### Application URL is unavailable

Check the URLs manually:

```powershell
Invoke-WebRequest https://front.serverest.dev/login
Invoke-WebRequest https://serverest.dev/usuarios
```

If you use custom URLs, verify `WEB_BASE_URL` and `API_BASE_URL` in `.env`.

### Browser is not installed

```powershell
npx playwright install chromium
```

### A test fails in CI

Open the HTML report and inspect the corresponding folder under `test-results/`. Look for the screenshot, `error-context.md`, and trace before changing timeouts or adding retries.

### User creation fails

The fixture creates users through the external API. Check API availability, response status, timeout, and whether the test is using unique data before changing the UI test.

## Additional Documentation

See [docs/QA_GUIDE.md](docs/QA_GUIDE.md) for detailed guidance on Page Objects, fixtures, test-data strategy, accessibility tests, reports, and adding new scenarios.
