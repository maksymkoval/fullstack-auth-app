import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const API_URL = 'http://localhost:3000';
const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.describe('register', () => {
  test('creates an account and lands on the protected dashboard', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');
    await page.getByLabel('Name').fill('E2E Test User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel(/^Password/).fill('testpassword123');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  });

  test('has no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/register');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('login', () => {
  test('wrong password shows an error and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('alert')).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL('/login');
  });

  test('correct credentials land on the protected dashboard', async ({ page, request }) => {
    // Registering through the API instead of the UI here — the register
    // flow itself is already covered above, this test is about login.
    const email = uniqueEmail();
    await request.post(`${API_URL}/auth/register`, {
      data: { name: 'E2E Login User', email, password: 'testpassword123' },
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  });

  test('whole flow works keyboard-only', async ({ page, request }) => {
    const email = uniqueEmail();
    await request.post(`${API_URL}/auth/register`, {
      data: { name: 'E2E Keyboard User', email, password: 'testpassword123' },
    });

    await page.goto('/login');
    await page.getByLabel('Email').focus();
    await page.keyboard.type(email);
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
    await page.keyboard.type('testpassword123');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Log in' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL('/');
  });

  test('has no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('dashboard', () => {
  test('has no WCAG 2.2 AA violations', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/register');
    await page.getByLabel('Name').fill('E2E Dashboard User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel(/^Password/).fill('testpassword123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
