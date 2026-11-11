# E2E tests

# E2E Tests

Organize browser scenarios by feature. Use Page Objects from `src/pages` and create test data dynamically through the API instead of relying on persistent users.

## Page Object Model

The Page Object owns selectors and user interactions. A spec should describe the behavior being validated, not repeat locator details.

Current Page Objects:

- `LoginPage`: opens login, submits credentials by button or keyboard, and checks the login route.
- `RegisterPage`: opens registration, submits normal or administrator users, and navigates to login.
- `AdminRegisterPage`: submits users through the administrator area.
- `UsersListPage`: checks that an administrator-created user appears with the submitted name, e-mail, password, and role.
- `HomePage`: opens the administrator user-registration screen from the home card.

When adding a screen:

1. Create one Page Object in `src/pages`.
2. Keep locators private inside the class.
3. Add methods named after user actions, such as `open`, `submit`, or `goToLogin`.
4. Keep assertions in the spec unless the assertion represents the Page Object's loaded state.
5. Prefer `data-testid`, accessible roles, and stable placeholders over CSS classes or DOM position.

## Test Data

Use `createUserData()` for registration scenarios. Use the `user` fixture when a test needs a user that already exists, such as login or duplicate e-mail validation.

Do not share credentials between tests. Each test should create or receive its own data so execution order and parallel workers do not affect the result.
Admin-area registration tests use a newly created administrator fixture and dynamically generated users; they verify successful registrations in the users list, including the `Administrador` value. These tests write temporary data to the external ServeRest environment, which is reset nightly.

## Registration validation and authorization

Required-field scenarios assert the corresponding visible validation messages, and malformed e-mails are checked against the browser's native email constraint. Administrator registration and list routes are also tested with no session and with a normal user.

The current public ServeRest frontend allows a normal user to open both administrator routes directly. The normal-user authorization tests intentionally fail while that behavior remains, so the gap stays visible in test runs rather than being hidden as an expected failure. Do not try to create an administrator through this unauthorized path in tests.

## Assertions and Stability

- Prefer Playwright web-first assertions such as `toHaveURL`, `toBeVisible`, and `toHaveValue`.
- Avoid `waitForTimeout`; wait for an observable state instead.
- Assert the business result, not only that a click completed.
- Keep negative scenarios explicit about the invalid field or combination.
- If a test depends on the external API, check whether the failure happened during data setup or in the UI flow.

## Accessibility Scenarios

Accessibility checks are kept in `accessibility.spec.ts`. They combine Axe rules with keyboard and accessible-name checks. Do not remove a failing accessibility assertion only to make the pipeline pass; identify whether the defect belongs to this test project or the external frontend first.
