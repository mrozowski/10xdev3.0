import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const FRUIT_RUSH_DIR = join(process.cwd(), 'src/lib/fruit-rush');

describe('Fruit Rush import boundary', () => {
	it('keeps Matter.js isolated to the physics adapter', () => {
		const sourceFiles = readdirSync(FRUIT_RUSH_DIR)
			.filter((fileName) => fileName.endsWith('.ts') && !fileName.endsWith('.test.ts'))
			.sort();
		const matterImports = sourceFiles.filter((fileName) => {
			const source = readFileSync(join(FRUIT_RUSH_DIR, fileName), 'utf8');
			return source.includes('matter-js');
		});

		expect(matterImports).toEqual(['physics-adapter.ts']);
	});
});
