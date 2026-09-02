import { type Page } from '@playwright/test';

export async function clearTestStorage(page: Page) {
  await page.evaluate(() => {
    window.localStorage.clear();
  });
}

export function createUniqueSessionId(prefix = 'playwright-seed') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function seedTestSession(page: Page, sessionId: string) {
  // Persist a unique test id so the UI can be exercised with a predictable, isolated state.
  // This makes the test easier to reason about and avoids collisions with other browser sessions.
  await page.evaluate((value) => {
    window.localStorage.setItem('playwright-seed-session', value);
  }, sessionId);
}
