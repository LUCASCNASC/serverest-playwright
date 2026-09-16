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
- `docs/QA_GUIDE.md`: onboarding, execution, test-data, reporting, and troubleshooting guide for QA.

## QA Documentation

For complete guidance on setting up the project, choosing the right command, understanding fixtures, reading reports, and adding tests, see [docs/QA_GUIDE.md](docs/QA_GUIDE.md).

## Environment

Copy `.env.example` to `.env` when you need to override URLs. The `.env` file must not be committed.

## Commands

- `npm test`: runs all tests.
- `npm run test:e2e`: runs UI tests.
- `npm run test:api`: runs API tests.
- `npm run test:headed`: runs tests with a visible browser.
- `npm run test:ui`: opens Playwright UI mode.
- `npm run typecheck`: checks TypeScript types.
