import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test.js';
import type { Page } from '@playwright/test';

async function expectNoWcagViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(', ')),
  }));

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

async function getKeyboardReachableControls(page: Page, maxTabCount = 20): Promise<Set<string>> {
  const controls = new Set<string>();

  for (let index = 0; index < maxTabCount; index += 1) {
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) {
        return { key: null, tagName: null };
      }

      return {
        key: element.getAttribute('data-testid') ?? element.getAttribute('placeholder') ?? element.tagName.toLowerCase(),
        tagName: element.tagName.toLowerCase(),
      };
    });

    if (activeElement.tagName === 'body') {
      break;
    }

    if (activeElement.key) {
      controls.add(activeElement.key);
    }
  }

  return controls;
}

test.describe('WCAG accessibility', () => {
  test('login page has no automated WCAG A or AA violations', async ({ page }) => {
    test.fail(true, 'The external frontend currently has known contrast and image-alt violations.');
    await page.goto('/login');

    await expectNoWcagViolations(page);
  });

  test('registration page has no automated WCAG A or AA violations', async ({ page }) => {
    test.fail(true, 'The external frontend currently has known contrast and image-alt violations.');
    await page.goto('/cadastrarusuarios');

    await expectNoWcagViolations(page);
  });

  test('login controls have accessible names and keyboard access', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('Digite seu email');
    const passwordInput = page.getByPlaceholder('Digite sua senha');
    const loginButton = page.getByRole('button', { name: 'Entrar' });

    await expect(emailInput).toHaveAccessibleName('Digite seu email');
    await expect(passwordInput).toHaveAccessibleName('Digite sua senha');
    await expect(loginButton).toHaveAccessibleName('Entrar');

    const reachableControls = await getKeyboardReachableControls(page);
    expect([...reachableControls]).toEqual(expect.arrayContaining([
      'email',
      'senha',
      'entrar',
    ]));
  });

  test('registration controls have accessible names and keyboard access', async ({ page }) => {
    await page.goto('/cadastrarusuarios');

    await expect(page.getByTestId('nome')).toHaveAccessibleName('Digite seu nome');
    await expect(page.getByTestId('email')).toHaveAccessibleName('Digite seu email');
    await expect(page.getByTestId('password')).toHaveAccessibleName('Digite sua senha');
    await expect(page.getByRole('checkbox', { name: 'Cadastrar como administrador?' })).toBeVisible();
    await expect(page.getByTestId('cadastrar')).toHaveAccessibleName('Cadastrar');

    const reachableControls = await getKeyboardReachableControls(page);
    expect([...reachableControls]).toEqual(expect.arrayContaining([
      'nome',
      'email',
      'password',
      'checkbox',
      'cadastrar',
    ]));
  });

  test('registration login link is keyboard accessible', async ({ page }) => {
    test.fail(true, 'The external frontend renders Entrar without a keyboard-focusable link element.');
    await page.goto('/cadastrarusuarios');

    const reachableControls = await getKeyboardReachableControls(page);

    expect([...reachableControls]).toContain('entrar');
  });
});
