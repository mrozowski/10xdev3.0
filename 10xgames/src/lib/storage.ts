/**
 * Safe wrappers around `localStorage`. All storage failures (quota exceeded,
 * storage disabled, private browsing, or `localStorage` unavailable outside a
 * browser) are swallowed here so callers never need to handle them — the game
 * must stay playable even when persistence silently fails.
 */

export function safeGetItem(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function safeSetItem(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		// Ignore: persistence is best-effort, gameplay must not break.
	}
}
