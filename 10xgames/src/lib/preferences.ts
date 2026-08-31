import { safeGetItem, safeSetItem } from './storage';

export const THEMES = ['software-dev'] as const;

export type Theme = (typeof THEMES)[number];

export type Preferences = {
	theme: Theme;
	soundEnabled: boolean;
};

const STORAGE_KEY = '10xgames:preferences';
const DEFAULT_PREFERENCES: Preferences = {
	theme: THEMES[0],
	soundEnabled: true,
};

function isTheme(value: unknown): value is Theme {
	return typeof value === 'string' && THEMES.includes(value as Theme);
}

function isPreferences(value: unknown): value is Preferences {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const preferences = value as Record<string, unknown>;
	return isTheme(preferences.theme) && typeof preferences.soundEnabled === 'boolean';
}

function savePreferences(preferences: Preferences): void {
	safeSetItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function getPreferences(): Preferences {
	const storedPreferences = safeGetItem(STORAGE_KEY);

	if (storedPreferences === null) {
		return { ...DEFAULT_PREFERENCES };
	}

	try {
		const preferences: unknown = JSON.parse(storedPreferences);
		return isPreferences(preferences) ? preferences : { ...DEFAULT_PREFERENCES };
	} catch {
		return { ...DEFAULT_PREFERENCES };
	}
}

export function setTheme(theme: Theme): void {
	savePreferences({ ...getPreferences(), theme });
}

export function setSoundEnabled(enabled: boolean): void {
	savePreferences({ ...getPreferences(), soundEnabled: enabled });
}
