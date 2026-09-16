# E2E tests

# E2E Tests

Organize browser scenarios by feature. Use Page Objects from `src/pages` and create test data dynamically through the API instead of relying on persistent users.

## Page Object Model

The Page Object owns selectors and user interactions. A spec should describe the behavior being validated, not repeat locator details.

Current Page Objects:

- `LoginPage`: opens login, submits credentials by button or keyboard, and checks the login route.
- `RegisterPage`: opens registration, submits normal or administrator users, and navigates to login.

When adding a screen:

1. Create one Page Object in `src/pages`.
2. Keep locators private inside the class.
3. Add methods named after user actions, such as `open`, `submit`, or `goToLogin`.
4. Keep assertions in the spec unless the assertion represents the Page Object's loaded state.
5. Prefer `data-testid`, accessible roles, and stable placeholders over CSS classes or DOM position.

## Test Data

Use `createUserData()` for registration scenarios. Use the `user` fixture when a test needs a user that already exists, such as login or duplicate e-mail validation.

Do not share credentials between tests. Each test should create or receive its own data so execution order and parallel workers do not affect the result.

## Assertions and Stability

- Prefer Playwright web-first assertions such as `toHaveURL`, `toBeVisible`, and `toHaveValue`.
- Avoid `waitForTimeout`; wait for an observable state instead.
- Assert the business result, not only that a click completed.
- Keep negative scenarios explicit about the invalid field or combination.
- If a test depends on the external API, check whether the failure happened during data setup or in the UI flow.

## Accessibility Scenarios

Accessibility checks are kept in `accessibility.spec.ts`. They combine Axe rules with keyboard and accessible-name checks. Do not remove a failing accessibility assertion only to make the pipeline pass; identify whether the defect belongs to this test project or the external frontend first.
