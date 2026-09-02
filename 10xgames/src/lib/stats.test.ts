import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	clearStats,
	getGameStats,
	getGameStatsSummary,
	getStats,
	recordCompletedGame,
	recordGameOpened,
	recordGameTime,
	recordPlatformTime,
} from './stats';
import { addScore, getScoresForGame } from './scores';

afterEach(() => {
	localStorage.clear();
	vi.useRealTimers();
});

describe('getStats', () => {
	it('returns empty defaults when no stats are stored', () => {
		expect(getStats()).toEqual({
			totalPlatformTimeMs: 0,
			games: {},
		});
		expect(getGameStats('memory-cards')).toEqual({
			totalPlayTimeMs: 0,
			totalPoints: 0,
			gamesPlayed: 0,
			lastPlayedAt: null,
		});
	});

	it('returns empty defaults for malformed or invalid stats', () => {
		localStorage.setItem('10xgames:stats', JSON.stringify({ totalPlatformTimeMs: -1, games: [] }));

		expect(getStats()).toEqual({
			totalPlatformTimeMs: 0,
			games: {},
		});
	});
});

describe('recordPlatformTime', () => {
	it('accumulates positive platform time and ignores invalid durations', () => {
		recordPlatformTime(1500);
		recordPlatformTime(-100);
		recordPlatformTime(Number.NaN);

		expect(getStats().totalPlatformTimeMs).toBe(1500);
	});
});

describe('recordGameOpened', () => {
	it('records last played without incrementing completed-game counters', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-02T20:00:00.000Z'));

		recordGameOpened('memory-cards');

		expect(getGameStats('memory-cards')).toEqual({
			totalPlayTimeMs: 0,
			totalPoints: 0,
			gamesPlayed: 0,
			lastPlayedAt: '2026-09-02T20:00:00.000Z',
		});
	});
});

describe('recordGameTime', () => {
	it('accumulates game time per game and updates last played', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-02T20:00:00.000Z'));

		recordGameTime('memory-cards', 1000);
		recordGameTime('memory-cards', 2500);
		recordGameTime('future-game', 750);

		expect(getGameStats('memory-cards').totalPlayTimeMs).toBe(3500);
		expect(getGameStats('memory-cards').lastPlayedAt).toBe('2026-09-02T20:00:00.000Z');
		expect(getGameStats('future-game').totalPlayTimeMs).toBe(750);
	});
});

describe('recordCompletedGame', () => {
	it('accumulates total points, games played, and derived averages per game', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-02T20:00:00.000Z'));

		recordGameTime('memory-cards', 1000);
		recordCompletedGame('memory-cards', 100);
		recordGameTime('memory-cards', 3000);
		recordCompletedGame('memory-cards', 300);
		recordCompletedGame('future-game', 900);

		expect(getGameStatsSummary('memory-cards')).toEqual({
			totalPlayTimeMs: 4000,
			totalPoints: 400,
			gamesPlayed: 2,
			lastPlayedAt: '2026-09-02T20:00:00.000Z',
			averagePoints: 200,
			averagePlayTimeMs: 2000,
		});
		expect(getGameStatsSummary('future-game')).toMatchObject({
			totalPoints: 900,
			gamesPlayed: 1,
			averagePoints: 900,
		});
	});
});

describe('clearStats', () => {
	it('clears stats without clearing scores', () => {
		recordPlatformTime(1000);
		recordGameTime('memory-cards', 2000);
		recordCompletedGame('memory-cards', 300);
		addScore({ gameId: 'memory-cards', name: 'Ada', score: 300 });

		clearStats();

		expect(getStats()).toEqual({
			totalPlatformTimeMs: 0,
			games: {},
		});
		expect(getScoresForGame('memory-cards')).toHaveLength(1);
	});
});
