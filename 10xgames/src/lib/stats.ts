import { safeGetItem, safeSetItem } from './storage';

export type GameStats = {
	totalPlayTimeMs: number;
	totalPoints: number;
	gamesPlayed: number;
	lastPlayedAt: string | null;
};

export type LocalStats = {
	totalPlatformTimeMs: number;
	games: Record<string, GameStats>;
};

export type GameStatsSummary = GameStats & {
	averagePoints: number;
	averagePlayTimeMs: number;
};

const STORAGE_KEY = '10xgames:stats';

const EMPTY_GAME_STATS: GameStats = {
	totalPlayTimeMs: 0,
	totalPoints: 0,
	gamesPlayed: 0,
	lastPlayedAt: null,
};

const EMPTY_STATS: LocalStats = {
	totalPlatformTimeMs: 0,
	games: {},
};

function isNonNegativeFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isGameStats(value: unknown): value is GameStats {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const stats = value as Record<string, unknown>;
	return (
		isNonNegativeFiniteNumber(stats.totalPlayTimeMs) &&
		isNonNegativeFiniteNumber(stats.totalPoints) &&
		isNonNegativeFiniteNumber(stats.gamesPlayed) &&
		(stats.lastPlayedAt === null || typeof stats.lastPlayedAt === 'string')
	);
}

function isLocalStats(value: unknown): value is LocalStats {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const stats = value as Record<string, unknown>;
	if (!isNonNegativeFiniteNumber(stats.totalPlatformTimeMs)) {
		return false;
	}

	if (typeof stats.games !== 'object' || stats.games === null || Array.isArray(stats.games)) {
		return false;
	}

	return Object.values(stats.games).every(isGameStats);
}

function cloneGameStats(stats: GameStats): GameStats {
	return { ...stats };
}

function cloneStats(stats: LocalStats): LocalStats {
	return {
		totalPlatformTimeMs: stats.totalPlatformTimeMs,
		games: Object.fromEntries(
			Object.entries(stats.games).map(([gameId, gameStats]) => [
				gameId,
				cloneGameStats(gameStats),
			]),
		),
	};
}

function saveStats(stats: LocalStats): void {
	safeSetItem(STORAGE_KEY, JSON.stringify(stats));
}

function normalizeDuration(durationMs: number): number {
	return Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 0;
}

export function getStats(): LocalStats {
	const storedStats = safeGetItem(STORAGE_KEY);

	if (storedStats === null) {
		return cloneStats(EMPTY_STATS);
	}

	try {
		const stats: unknown = JSON.parse(storedStats);
		return isLocalStats(stats) ? cloneStats(stats) : cloneStats(EMPTY_STATS);
	} catch {
		return cloneStats(EMPTY_STATS);
	}
}

export function getGameStats(gameId: string): GameStats {
	return cloneGameStats(getStats().games[gameId] ?? EMPTY_GAME_STATS);
}

export function getGameStatsSummary(gameId: string): GameStatsSummary {
	const gameStats = getGameStats(gameId);
	const averagePoints =
		gameStats.gamesPlayed === 0 ? 0 : gameStats.totalPoints / gameStats.gamesPlayed;
	const averagePlayTimeMs =
		gameStats.gamesPlayed === 0 ? 0 : gameStats.totalPlayTimeMs / gameStats.gamesPlayed;

	return {
		...gameStats,
		averagePoints,
		averagePlayTimeMs,
	};
}

export function recordPlatformTime(durationMs: number): LocalStats {
	const stats = getStats();
	const nextStats: LocalStats = {
		...stats,
		totalPlatformTimeMs: stats.totalPlatformTimeMs + normalizeDuration(durationMs),
	};

	saveStats(nextStats);
	return nextStats;
}

export function recordGameOpened(gameId: string): GameStats {
	const stats = getStats();
	const current = stats.games[gameId] ?? EMPTY_GAME_STATS;
	const nextGameStats: GameStats = {
		...current,
		lastPlayedAt: new Date().toISOString(),
	};

	saveStats({
		...stats,
		games: {
			...stats.games,
			[gameId]: nextGameStats,
		},
	});
	return cloneGameStats(nextGameStats);
}

export function recordGameTime(gameId: string, durationMs: number): GameStats {
	const stats = getStats();
	const current = stats.games[gameId] ?? EMPTY_GAME_STATS;
	const nextGameStats: GameStats = {
		...current,
		totalPlayTimeMs: current.totalPlayTimeMs + normalizeDuration(durationMs),
		lastPlayedAt: new Date().toISOString(),
	};

	saveStats({
		...stats,
		games: {
			...stats.games,
			[gameId]: nextGameStats,
		},
	});
	return cloneGameStats(nextGameStats);
}

export function recordCompletedGame(gameId: string, points: number): GameStats {
	const stats = getStats();
	const current = stats.games[gameId] ?? EMPTY_GAME_STATS;
	const nextGameStats: GameStats = {
		...current,
		totalPoints: current.totalPoints + (Number.isFinite(points) ? points : 0),
		gamesPlayed: current.gamesPlayed + 1,
		lastPlayedAt: new Date().toISOString(),
	};

	saveStats({
		...stats,
		games: {
			...stats.games,
			[gameId]: nextGameStats,
		},
	});
	return cloneGameStats(nextGameStats);
}

export function clearStats(): LocalStats {
	const stats = cloneStats(EMPTY_STATS);
	saveStats(stats);
	return stats;
}
