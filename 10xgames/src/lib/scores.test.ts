import { afterEach, describe, expect, it, vi } from 'vitest';
import { addScore, getScores } from './scores';

afterEach(() => {
	localStorage.clear();
	vi.useRealTimers();
});

describe('getScores', () => {
	it('returns an empty list when no scores are stored', () => {
		expect(getScores()).toEqual([]);
	});

	it('retains valid scores when storage contains an invalid entry', () => {
		localStorage.setItem(
			'10xgames:scores',
			JSON.stringify([
				{ name: 'Ada', score: 42, date: '2026-08-31T20:00:00.000Z' },
				{ name: 'Broken', score: 'not-a-number', date: '2026-08-31T20:00:00.000Z' },
			]),
		);

		expect(getScores()).toEqual([{ name: 'Ada', score: 42, date: '2026-08-31T20:00:00.000Z' }]);
	});
});

describe('addScore', () => {
	it('adds a score and makes it available on the next read', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-31T20:00:00.000Z'));

		expect(addScore({ name: 'Ada', score: 42 })).toEqual([
			{ name: 'Ada', score: 42, date: '2026-08-31T20:00:00.000Z' },
		]);
		expect(getScores()).toEqual([
			{ name: 'Ada', score: 42, date: '2026-08-31T20:00:00.000Z' },
		]);
	});

	it('sorts scores descending and retains only the top ten', () => {
		for (let score = 1; score <= 11; score += 1) {
			addScore({ name: `Player ${score}`, score });
		}

		expect(getScores().map(({ score }) => score)).toEqual([
			11, 10, 9, 8, 7, 6, 5, 4, 3, 2,
		]);
	});

	it('does not evict a higher score when adding a lower eleventh score', () => {
		for (let score = 10; score >= 1; score -= 1) {
			addScore({ score });
		}
		addScore({ score: 0 });

		expect(getScores().map(({ score }) => score)).toEqual([
			10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
		]);
	});

	it('uses Anonymous when the name is missing or blank', () => {
		addScore({ score: 20 });
		addScore({ name: '   ', score: 10 });

		expect(getScores().map(({ name }) => name)).toEqual(['Anonymous', 'Anonymous']);
	});

	it('does not persist a non-finite runtime score', () => {
		addScore({ name: 'Ada', score: 42 });
		addScore({ name: 'Broken', score: Number.NaN });

		expect(getScores().map(({ score }) => score)).toEqual([42]);
	});
});
