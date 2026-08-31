import { afterEach, describe, expect, it } from 'vitest';
import { getPreferences, setSoundEnabled, setTheme } from './preferences';

const STORAGE_KEY = '10xgames:preferences';

afterEach(() => {
	localStorage.clear();
});

describe('getPreferences', () => {
	it('returns defaults when no preferences are stored', () => {
		expect(getPreferences()).toEqual({
			theme: 'software-dev',
			soundEnabled: true,
		});
	});

	it('returns defaults when stored preferences contain malformed JSON', () => {
		localStorage.setItem(STORAGE_KEY, '{not json');

		expect(getPreferences()).toEqual({
			theme: 'software-dev',
			soundEnabled: true,
		});
	});

	it('returns defaults when stored preferences have an invalid shape', () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ theme: 'unknown', soundEnabled: 'yes' }),
		);

		expect(getPreferences()).toEqual({
			theme: 'software-dev',
			soundEnabled: true,
		});
	});
});

describe('preference updates', () => {
	it('persists the selected theme', () => {
		setTheme('software-dev');

		expect(getPreferences().theme).toBe('software-dev');
	});

	it('persists the sound setting', () => {
		setSoundEnabled(false);

		expect(getPreferences().soundEnabled).toBe(false);
	});
});
