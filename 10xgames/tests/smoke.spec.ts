import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/10xdev3.0/');
  await expect(page).toHaveTitle(/10x Games/);
  await expect(page.locator('body')).toBeVisible();
});
