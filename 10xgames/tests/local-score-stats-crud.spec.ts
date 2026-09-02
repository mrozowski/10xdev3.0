import { test, expect } from '@playwright/test';
import { clearTestStorage } from './helpers/test-utils';

// Provenance: protects the local score CRUD/statistics risk in
// context/foundation/test-plan.md. Modeled on tests/seed.spec.ts.
test.describe('Risk #6: local score CRUD and statistics', () => {
  test.afterEach(async ({ page }) => {
    await clearTestStorage(page);
  });

  test('a player can save, rename, delete a score, and clear local statistics', async ({
    page,
  }) => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const originalName = `CRUD-${uniqueSuffix}`;
    const renamedName = `Renamed-${uniqueSuffix}`;

    await page.addInitScript(() => {
      const nativeSetInterval = window.setInterval.bind(window);
      window.setInterval = ((handler: TimerHandler, _timeout?: number, ...args: unknown[]) =>
        nativeSetInterval(handler, 20, ...args)) as typeof window.setInterval;
    });

    await test.step('Open Memory Cards and save a completed-game score', async () => {
      await page.goto('/10xdev3.0/');
      await page.getByRole('button', { name: /launch memory cards/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.getByLabel('Save score as:').fill(originalName);
      await page.getByRole('button', { name: 'PLAY AGAIN' }).click();

      await expect(page.getByText(originalName)).toBeVisible();
    });

    await test.step('Rename the saved score without leaving the game', async () => {
      await page.getByRole('button', { name: `Rename score for ${originalName}` }).click();
      await page.getByLabel(`New name for ${originalName}`).fill(renamedName);
      await page.getByRole('button', { name: 'SAVE' }).click();

      await expect(page.getByText(renamedName)).toBeVisible();
      await expect(page.getByText(originalName)).toHaveCount(0);
    });

    await test.step('Delete only the renamed score', async () => {
      page.once('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: `Delete score for ${renamedName}` }).click();

      await expect(page.getByText(renamedName)).toHaveCount(0);
      await expect(page.getByText(/no memory cards scores yet/i)).toBeVisible();
    });

    await test.step('Clear statistics independently of the score list', async () => {
      page.once('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: 'CLEAR STATS' }).click();

      await expect(page.getByText('Last played')).toBeVisible();
      await expect(page.getByText('Never')).toBeVisible();
    });
  });
});
