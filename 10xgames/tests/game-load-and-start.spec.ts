import { test, expect } from '@playwright/test';
import { clearTestStorage } from './helpers/test-utils';

// Provenance: protects Risk #1 in context/foundation/test-plan.md
// ("The landing page or Memory Cards game does not load or start.")
// Modeled on tests/seed.spec.ts (getByRole locators, state-based waits, cleanup).
test.describe('Risk #1: catalogue and Memory Cards load and start', () => {
  test.afterEach(async ({ page }) => {
    await clearTestStorage(page);
  });

  test('a fresh visit loads the catalogue and starts a playable Memory Cards round', async ({
    page,
  }) => {
    await test.step('A fresh visit loads the game catalogue', async () => {
      await page.goto('/10xdev3.0/');
      await expect(page.getByRole('heading', { name: /choose your game/i })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /launch memory cards/i }),
      ).toBeVisible();
    });

    await test.step('Selecting Memory Cards starts a playable round', async () => {
      await page.getByRole('button', { name: /launch memory cards/i }).click();

      // The game view (and its HUD) must actually mount, not just become visible.
      await expect(page.getByRole('heading', { name: /memory cards/i })).toBeVisible();

      // A playable round means the card grid is populated and clickable,
      // not just that the container is present.
      await expect(page.getByRole('button', { name: /^Card \d+$/ })).toHaveCount(16);
      await expect(page.getByRole('button', { name: 'Card 1', exact: true })).toBeEnabled();
    });
  });
});
