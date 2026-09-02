import { safeGetItem, safeSetItem } from './storage';

export type ScoreEntry = {
	id: string;
	gameId: string;
	name: string;
	score: number;
	date: string;
	roundsCompleted?: number;
};

export type NewScoreEntry = {
	gameId: string;
	name?: string;
	score: number;
	roundsCompleted?: number;
};

const STORAGE_KEY = '10xgames:scores';
const MAX_SCORES = 10;

function normalizeName(name: string | undefined): string {
	return name?.trim() || 'Anonymous';
}

function createScoreId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}

	return `score-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isScoreEntry(value: unknown): value is ScoreEntry {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const scoreEntry = value as Record<string, unknown>;
	if (
		typeof scoreEntry.id !== 'string' ||
		scoreEntry.id.trim() === '' ||
		typeof scoreEntry.gameId !== 'string' ||
		scoreEntry.gameId.trim() === '' ||
		typeof scoreEntry.name !== 'string' ||
		typeof scoreEntry.score !== 'number' ||
		!Number.isFinite(scoreEntry.score) ||
		typeof scoreEntry.date !== 'string'
	) {
		return false;
	}

	if (
		scoreEntry.roundsCompleted !== undefined &&
		(typeof scoreEntry.roundsCompleted !== 'number' || !Number.isFinite(scoreEntry.roundsCompleted))
	) {
		return false;
	}

	return true;
}

function sortScoresForGame(scores: readonly ScoreEntry[]): ScoreEntry[] {
	return scores
		.map((scoreEntry, index) => ({ scoreEntry, index }))
		.sort(
			(first, second) =>
				second.scoreEntry.score - first.scoreEntry.score || first.index - second.index,
		)
		.map(({ scoreEntry }) => scoreEntry);
}

function getAllScores(): ScoreEntry[] {
	const storedScores = safeGetItem(STORAGE_KEY);

	if (storedScores === null) {
		return [];
	}

	try {
		const scores: unknown = JSON.parse(storedScores);
		return Array.isArray(scores) ? scores.filter(isScoreEntry) : [];
	} catch {
		return [];
	}
}

function saveScores(scores: readonly ScoreEntry[]): void {
	safeSetItem(STORAGE_KEY, JSON.stringify(scores));
}

function limitScoresPerGame(scores: readonly ScoreEntry[]): ScoreEntry[] {
	const grouped = new Map<string, ScoreEntry[]>();

	for (const score of scores) {
		grouped.set(score.gameId, [...(grouped.get(score.gameId) ?? []), score]);
	}

	return [...grouped.values()].flatMap((gameScores) =>
		sortScoresForGame(gameScores).slice(0, MAX_SCORES),
	);
}

export function getScoresForGame(gameId: string): ScoreEntry[] {
	return sortScoresForGame(getAllScores().filter((score) => score.gameId === gameId));
}

export function addScore(entry: NewScoreEntry): ScoreEntry[] {
	if (!Number.isFinite(entry.score)) {
		return getScoresForGame(entry.gameId);
	}

	const score: ScoreEntry = {
		id: createScoreId(),
		gameId: entry.gameId,
		name: normalizeName(entry.name),
		score: entry.score,
		date: new Date().toISOString(),
		...(entry.roundsCompleted !== undefined ? { roundsCompleted: entry.roundsCompleted } : {}),
	};
	const scores = limitScoresPerGame([...getAllScores(), score]);

	saveScores(scores);
	return getScoresForGame(entry.gameId);
}

export function renameScore(gameId: string, id: string, name: string): ScoreEntry[] {
	const scores = getAllScores().map((score) =>
		score.gameId === gameId && score.id === id
			? { ...score, name: normalizeName(name) }
			: score,
	);

	saveScores(scores);
	return getScoresForGame(gameId);
}

export function deleteScore(gameId: string, id: string): ScoreEntry[] {
	const scores = getAllScores().filter((score) => score.gameId !== gameId || score.id !== id);

	saveScores(scores);
	return getScoresForGame(gameId);
}

export function clearScoresForGame(gameId: string): ScoreEntry[] {
	const scores = getAllScores().filter((score) => score.gameId !== gameId);

	saveScores(scores);
	return [];
}
