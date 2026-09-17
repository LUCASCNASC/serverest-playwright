# QA Guide

This guide explains how to install, execute, maintain, and troubleshoot the ServeRest automated tests.

## Purpose

This project contains Playwright tests for the ServeRest web application and its API.

The current UI coverage includes:

- Login for normal users and administrators.
- Invalid login attempts and required-field validation.
- User registration for normal users and administrators.
- Duplicate e-mail handling and registration navigation.
- Accessibility checks for the login and registration pages using Axe and keyboard navigation.

## Prerequisites

- Node.js LTS.
- npm.
- Access to the ServeRest frontend and API environments.
- A Chromium browser installed through Playwright.

Install dependencies and browsers from the project root:

```powershell
npm ci
npx playwright install --with-deps
```

For a local setup, copy `.env.example` to `.env` and adjust the URLs when necessary:

```powershell
Copy-Item .env.example .env
```

The `.env` file is local configuration and must not be committed.

## Application URLs

Default URLs:

- Frontend: `https://front.serverest.dev`
- API: `https://serverest.dev`

Environment variables:

```text
WEB_BASE_URL=https://front.serverest.dev
API_BASE_URL=https://serverest.dev
```

`WEB_BASE_URL` is used by browser navigation. `API_BASE_URL` is used by the API client and the user fixture.

## Project Structure

```text
src/
  api/         API clients used for test setup and API scenarios.
  config/      Environment configuration.
  data/        Data types, roles, and dynamic factories.
  fixtures/    Shared Playwright fixtures.
  pages/       Page Objects for UI screens.
tests/
  e2e/         Browser scenarios organized by feature.
  api/         API scenarios organized by resource.
scripts/       CI reporting helpers.
.github/       GitHub Actions workflows.
```

## Test Data Strategy

Tests must not depend on a user created manually or on data that survives overnight.
The application clears data at the end of the day, so automated tests create their own data.

The `user` fixture:

1. Generates a unique user through `createUserData()`.
2. Sets the role as `normal` or `admin`.
3. Creates the user through `POST /usuarios`.
4. Provides the credentials to the test.
5. Disposes the API request context after the test.

Use the fixture when a test needs an existing user:

```ts
import { test, expect } from '../../src/fixtures/test.js';

test('example', async ({ user }) => {
  expect(user.email).toBeTruthy();
});
```

Use `test.use({ userRole: 'admin' })` at describe scope for administrator scenarios:

```ts
test.describe('administrator', () => {
  test.use({ userRole: 'admin' });
});
```

For registration scenarios, create a new user with the factory instead of using the fixture. Use the fixture only when a pre-existing user is required, such as duplicate e-mail coverage.

## Page Objects

Page Objects contain selectors and reusable UI actions. Tests should describe behavior rather than repeat selectors.

Current Page Objects:

- `LoginPage`: opens the login screen and submits credentials.
- `RegisterPage`: opens the registration screen, submits users, and navigates to login.

Prefer stable selectors already provided by the application:

- Registration: `data-testid` selectors.
- Login: placeholders and accessible roles currently exposed by the application.

Do not add arbitrary sleeps such as `waitForTimeout`. Prefer Playwright web-first assertions, which wait for the expected state.

## Test Commands

Run all tests:

```powershell
npm test
```

Run only browser tests:

```powershell
npm run test:e2e
```

Run login tests:

```powershell
npm run test:login
```

Run registration tests:

```powershell
npm run test:register
```

Run accessibility tests:

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

Run a specific file with a visible browser:

```powershell
npx playwright test tests/e2e/login.spec.ts --headed
```

Open Playwright UI mode:

```powershell
npm run test:ui
```

Check TypeScript without running tests:

```powershell
npm run typecheck
```

Audit dependencies for high-severity vulnerabilities:

```powershell
npm run audit
```

## Reports and Evidence

The Playwright configuration generates:

- HTML report in `playwright-report/`.
- JUnit report in `test-results/playwright-results.xml`.
- JSON report in `test-results/playwright-results.json`.
- Screenshots for failed tests in `test-results/`.
- Traces on the first retry of a failed test.

Open the HTML report locally:

```powershell
npm run report
```

In GitHub Actions, the `health-check` job checks the frontend and API URLs before the test job starts. The workflow runs `npm audit --audit-level=high`, uses read-only repository permissions, cancels obsolete runs for the same branch, and uploads `playwright-report/` and `test-results/` as the `playwright-reports` artifact for seven days.

The workflow summary lists each scenario and its final status. A test that passes only after a retry is reported as `flaky`.

## Accessibility Tests

The accessibility suite uses `@axe-core/playwright` with WCAG 2.0 A and AA tags. It checks both automated rules and keyboard access.

A failure is evidence of an accessibility issue, not a reason to weaken the test. Known issues in the external frontend may be marked with `test.fail()` temporarily, but the issue should remain documented and the marker should be removed after the frontend is fixed.

The current external application has reported issues involving:

- Missing alternative text on the logo image.
- Insufficient color contrast.
- The registration `Entrar` control not being keyboard-focusable.

These frontend issues cannot be fixed in this automation repository.

## Troubleshooting

### Tests cannot reach the application

Check the URLs and run the health checks manually:

```powershell
Invoke-WebRequest "$env:WEB_BASE_URL/login"
Invoke-WebRequest "$env:API_BASE_URL/usuarios"
```

If the environment variables are not set, use the default URLs documented above.

### A user cannot be created

The failure may come from the external API, network instability, timeout, or an invalid response. Check the API response in the test output and the current API availability before changing the test.

### A test fails only in CI

Review, in order:

1. The HTML report.
2. The screenshot in `test-results/`.
3. The trace from the first retry.
4. The GitHub Actions summary to see whether the scenario was marked `flaky`.
5. The environment health-check result.

Do not increase timeouts or retries before identifying whether the failure is caused by the application, test data, network, or selector.

### Accessibility tests fail

Read the Axe violation id and affected nodes. Do not ignore a violation only to make the pipeline green. Confirm whether the issue belongs to this repository or to the external ServeRest frontend.

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
