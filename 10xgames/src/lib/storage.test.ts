import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeGetItem, safeSetItem } from './storage';

afterEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

describe('safeGetItem', () => {
	it('returns the stored value on a successful read', () => {
		localStorage.setItem('k', 'v');
		expect(safeGetItem('k')).toBe('v');
	});

	it('returns null when the key does not exist', () => {
		expect(safeGetItem('missing')).toBeNull();
	});

	it('returns null instead of throwing when getItem throws', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('storage disabled');
		});
		expect(safeGetItem('k')).toBeNull();
	});
});

describe('safeSetItem', () => {
	it('persists the value on a successful write', () => {
		safeSetItem('k', 'v');
		expect(localStorage.getItem('k')).toBe('v');
	});

	it('does not throw when setItem throws', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('quota exceeded');
		});
		expect(() => safeSetItem('k', 'v')).not.toThrow();
	});
});
