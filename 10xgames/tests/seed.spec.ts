import { test, expect, type Page } from '@playwright/test';
import { clearTestStorage, createUniqueSessionId, seedTestSession } from './helpers/test-utils';

test.describe('seed e2e conventions', () => {
  test.afterEach(async ({ page }) => {
    await clearTestStorage(page);
  });

  test('Risk #2: catalogue launches Memory Cards and returns to catalogue', async ({ page }) => {
    const uniqueSessionId = createUniqueSessionId();

    await test.step('Open the catalogue and seed a unique test session', async () => {
      await openCatalogue(page);
      await seedTestSession(page, uniqueSessionId);
    });

    await test.step('Launch Memory Cards from the catalogue', async () => {
      await launchMemoryCards(page);
    });

    await test.step('Return to the catalogue from the game view', async () => {
      await returnToCatalogue(page);
    });
  });
});




async function openCatalogue(page: Page) {
  await page.goto('/10xdev3.0/');
  await expect(page.getByRole('heading', { name: /choose your game/i })).toBeVisible();
}

async function launchMemoryCards(page: Page) {
  const launchButton = page.getByRole('button', { name: /launch memory cards/i });
  await expect(launchButton).toBeVisible();
  await launchButton.click();

  await expect(page.getByRole('button', { name: /catalogue/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /memory cards/i })).toBeVisible();
}

async function returnToCatalogue(page: Page) {
  await page.getByRole('button', { name: /catalogue/i }).click();

  await expect(page.getByRole('heading', { name: /choose your game/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /launch memory cards/i })).toBeVisible();
}
