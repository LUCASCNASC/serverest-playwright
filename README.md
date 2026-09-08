# ServeRest Playwright

E2E and API automation project for the ServeRest application.

## Structure

- `tests/e2e`: UI scenarios organized by feature.
- `tests/api`: API scenarios organized by resource.
- `src/pages`: UI Page Objects.
- `src/api`: API clients.
- `src/data`: factories and test data contracts.
- `src/fixtures`: fixtures shared across tests.
- `src/config`: environment variables and configuration.
- `playwright.config.ts`: global test configuration.

## Environment

Copy `.env.example` to `.env` when you need to override URLs. The `.env` file must not be committed.

## Commands

- `npm test`: runs all tests.
- `npm run test:e2e`: runs UI tests.
- `npm run test:api`: runs API tests.
- `npm run test:headed`: runs tests with a visible browser.
- `npm run test:ui`: opens Playwright UI mode.
- `npm run typecheck`: checks TypeScript types.
