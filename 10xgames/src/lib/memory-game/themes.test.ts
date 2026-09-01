import { describe, it, expect } from 'vitest';
import {
	getThemeSymbols,
	getThemeSymbolIds,
	DEV_THEME_SYMBOLS,
} from './themes';

describe('Theme Registry', () => {
	it('provides exactly 16 unique symbols for software-dev theme', () => {
		const symbols = getThemeSymbols('software-dev');

		expect(symbols).toHaveLength(16);
		expect(symbols).toBe(DEV_THEME_SYMBOLS);

		const ids = symbols.map((s) => s.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(16);
	});

	it('ensures every symbol contains valid SVG markup and hex color', () => {
		const symbols = getThemeSymbols('software-dev');

		for (const symbol of symbols) {
			expect(symbol.id.length).toBeGreaterThan(0);
			expect(symbol.name.length).toBeGreaterThan(0);
			expect(symbol.color).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(symbol.svgPath).toMatch(/<(path|circle|rect|ellipse)/);
		}
	});

	it('returns symbol IDs array matching getThemeSymbols', () => {
		const ids = getThemeSymbolIds('software-dev');
		expect(ids).toEqual([
			'terminal',
			'code',
			'git-branch',
			'database',
			'cpu',
			'bug',
			'rocket',
			'shield',
			'keyboard',
			'monitor',
			'folder',
			'cloud',
			'network',
			'lock',
			'mouse',
			'server',
		]);
	});
});
