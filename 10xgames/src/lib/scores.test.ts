import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	addScore,
	clearScoresForGame,
	deleteScore,
	getScoresForGame,
	renameScore,
} from './scores';

afterEach(() => {
	localStorage.clear();
	vi.useRealTimers();
});

describe('getScoresForGame', () => {
	it('returns an empty list when no scores are stored for the game', () => {
		expect(getScoresForGame('memory-cards')).toEqual([]);
	});

	it('retains valid scores and ignores invalid or legacy entries', () => {
		localStorage.setItem(
			'10xgames:scores',
			JSON.stringify([
				{
					id: 'score-1',
					gameId: 'memory-cards',
					name: 'Ada',
					score: 42,
					date: '2026-08-31T20:00:00.000Z',
				},
				{ name: 'Legacy', score: 99, date: '2026-08-31T20:00:00.000Z' },
				{
					id: 'score-2',
					gameId: 'memory-cards',
					name: 'Broken',
					score: 'not-a-number',
					date: '2026-08-31T20:00:00.000Z',
				},
			]),
		);

		expect(getScoresForGame('memory-cards')).toEqual([
			{
				id: 'score-1',
				gameId: 'memory-cards',
				name: 'Ada',
				score: 42,
				date: '2026-08-31T20:00:00.000Z',
			},
		]);
	});
});

describe('addScore', () => {
	it('adds a game-scoped score and makes it available on the next read', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-31T20:00:00.000Z'));

		const scores = addScore({ gameId: 'memory-cards', name: 'Ada', score: 42 });

		expect(scores).toEqual([
			{
				id: expect.any(String),
				gameId: 'memory-cards',
				name: 'Ada',
				score: 42,
				date: '2026-08-31T20:00:00.000Z',
			},
		]);
		expect(getScoresForGame('memory-cards')).toEqual(scores);
	});

	it('sorts scores descending and retains only the top ten per game', () => {
		for (let score = 1; score <= 11; score += 1) {
			addScore({ gameId: 'memory-cards', name: `Player ${score}`, score });
			addScore({ gameId: 'future-game', name: `Other ${score}`, score: score + 100 });
		}

		expect(getScoresForGame('memory-cards').map(({ score }) => score)).toEqual([
			11, 10, 9, 8, 7, 6, 5, 4, 3, 2,
		]);
		expect(getScoresForGame('future-game').map(({ score }) => score)).toEqual([
			111, 110, 109, 108, 107, 106, 105, 104, 103, 102,
		]);
	});

	it('does not evict a higher score when adding a lower eleventh score', () => {
		for (let score = 10; score >= 1; score -= 1) {
			addScore({ gameId: 'memory-cards', score });
		}
		addScore({ gameId: 'memory-cards', score: 0 });

		expect(getScoresForGame('memory-cards').map(({ score }) => score)).toEqual([
			10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
		]);
	});

	it('uses Anonymous when the name is missing or blank', () => {
		addScore({ gameId: 'memory-cards', score: 20 });
		addScore({ gameId: 'memory-cards', name: '   ', score: 10 });

		expect(getScoresForGame('memory-cards').map(({ name }) => name)).toEqual([
			'Anonymous',
			'Anonymous',
		]);
	});

	it('persists long and special-character names as safe text', () => {
		const longName = 'A'.repeat(500);
		const specialName = '<img src=x onerror=alert(1)> & "quoted"';

		addScore({ gameId: 'memory-cards', name: longName, score: 20 });
		addScore({ gameId: 'memory-cards', name: specialName, score: 10 });

		expect(getScoresForGame('memory-cards').map(({ name }) => name)).toEqual([
			longName,
			specialName,
		]);
	});

	it('does not persist a non-finite runtime score', () => {
		addScore({ gameId: 'memory-cards', name: 'Ada', score: 42 });
		addScore({ gameId: 'memory-cards', name: 'Broken', score: Number.NaN });

		expect(getScoresForGame('memory-cards').map(({ score }) => score)).toEqual([42]);
	});

	it('round-trips roundsCompleted when provided', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-31T20:00:00.000Z'));

		const scores = addScore({
			gameId: 'memory-cards',
			name: 'Ada',
			score: 42,
			roundsCompleted: 5,
		});

		expect(scores).toEqual([
			{
				id: expect.any(String),
				gameId: 'memory-cards',
				name: 'Ada',
				score: 42,
				date: '2026-08-31T20:00:00.000Z',
				roundsCompleted: 5,
			},
		]);
	});
});

describe('renameScore', () => {
	it('renames one score label without changing score facts or neighboring scores', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-31T20:00:00.000Z'));

		const [first] = addScore({ gameId: 'memory-cards', name: 'Ada', score: 100 });
		const [second] = addScore({ gameId: 'memory-cards', name: 'Grace', score: 200 });
		const renamedScores = renameScore('memory-cards', first.id, '  Updated Ada  ');
		const renamed = renamedScores.find(({ id }) => id === first.id);
		const untouched = renamedScores.find(({ id }) => id === second.id);

		expect(renamed).toEqual({ ...first, name: 'Updated Ada' });
		expect(untouched).toEqual(second);
	});

	it('uses Anonymous when renaming to a blank label', () => {
		const [score] = addScore({ gameId: 'memory-cards', name: 'Ada', score: 100 });

		renameScore('memory-cards', score.id, '   ');

		expect(getScoresForGame('memory-cards')[0].name).toBe('Anonymous');
	});

	it('does not rename a score from another game', () => {
		const [memoryScore] = addScore({ gameId: 'memory-cards', name: 'Ada', score: 100 });
		addScore({ gameId: 'future-game', name: 'Grace', score: 200 });

		renameScore('future-game', memoryScore.id, 'Wrong Game');

		expect(getScoresForGame('memory-cards')[0].name).toBe('Ada');
	});
});

describe('deleteScore', () => {
	it('deletes one game-scoped score by id', () => {
		const [first] = addScore({ gameId: 'memory-cards', name: 'Ada', score: 100 });
		addScore({ gameId: 'memory-cards', name: 'Grace', score: 200 });

		deleteScore('memory-cards', first.id);

		expect(getScoresForGame('memory-cards').map(({ name }) => name)).toEqual(['Grace']);
	});

	it('does not delete a score from another game with the same id', () => {
		localStorage.setItem(
			'10xgames:scores',
			JSON.stringify([
				{
					id: 'same-id',
					gameId: 'memory-cards',
					name: 'Ada',
					score: 100,
					date: '2026-08-31T20:00:00.000Z',
				},
				{
					id: 'same-id',
					gameId: 'future-game',
					name: 'Grace',
					score: 200,
					date: '2026-08-31T20:00:00.000Z',
				},
			]),
		);

		deleteScore('memory-cards', 'same-id');

		expect(getScoresForGame('memory-cards')).toEqual([]);
		expect(getScoresForGame('future-game')).toHaveLength(1);
	});
});

describe('clearScoresForGame', () => {
	it('clears only the selected game scores', () => {
		addScore({ gameId: 'memory-cards', name: 'Ada', score: 100 });
		addScore({ gameId: 'future-game', name: 'Grace', score: 200 });

		clearScoresForGame('memory-cards');

		expect(getScoresForGame('memory-cards')).toEqual([]);
		expect(getScoresForGame('future-game').map(({ name }) => name)).toEqual(['Grace']);
	});
});
