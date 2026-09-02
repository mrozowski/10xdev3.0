import { test, expect } from '@playwright/test';
import { clearTestStorage } from './helpers/test-utils';

// Provenance: protects Risk #3 in context/foundation/test-plan.md
// ("Saving a score, replaying, or leaving becomes blocked or loses local score data.")
// Modeled on tests/seed.spec.ts (role locators, state-based waits, isolated cleanup).
test.describe('Risk #3: local score save and replay', () => {
  test.afterEach(async ({ page }) => {
    await clearTestStorage(page);
  });

  test('saving a completed game score preserves the name and starts a fresh round', async ({
    page,
  }) => {
    const playerName = `Replay-${Date.now()}`;

    // Complete the game-over path with accelerated intervals so the browser test
    // does not wait through the production preview and game timer durations.
    await page.addInitScript(() => {
      const nativeSetInterval = window.setInterval.bind(window);
      window.setInterval = ((handler: TimerHandler, _timeout?: number, ...args: unknown[]) =>
        nativeSetInterval(handler, 1, ...args)) as typeof window.setInterval;
    });

    await test.step('Open Memory Cards with an isolated local score list', async () => {
      await page.goto('/10xdev3.0/');
      await expect(page.getByRole('heading', { name: /choose your game/i })).toBeVisible();
      await page.getByRole('button', { name: /launch memory cards/i }).click();
      await expect(page.getByRole('heading', { name: /memory cards/i })).toBeVisible();
    });

    await test.step('Wait for the completed-game modal before saving', async () => {
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByLabel('Save score as:')).toBeVisible();
      await expect(page.getByLabel('Save score as:')).toHaveValue('');
      await expect(page.getByText(playerName)).toHaveCount(0);
    });

    await test.step('Save the named score and replay from round one', async () => {
      await page.getByLabel('Save score as:').fill(playerName);
      await page.getByRole('button', { name: 'PLAY AGAIN' }).click();

      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.getByText(playerName)).toBeVisible();
      await expect(page.getByText('ROUND')).toBeVisible();
      await expect(page.getByText('1/5')).toBeVisible();
    });
  });
});
