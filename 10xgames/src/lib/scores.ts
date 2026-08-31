import { safeGetItem, safeSetItem } from './storage';

export type ScoreEntry = {
	name: string;
	score: number;
	date: string;
};

export type NewScoreEntry = {
	name?: string;
	score: number;
};

const STORAGE_KEY = '10xgames:scores';
const MAX_SCORES = 10;

function isScoreEntry(value: unknown): value is ScoreEntry {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const scoreEntry = value as Record<string, unknown>;
	return (
		typeof scoreEntry.name === 'string' &&
		typeof scoreEntry.score === 'number' &&
		Number.isFinite(scoreEntry.score) &&
		typeof scoreEntry.date === 'string'
	);
}

export function getScores(): ScoreEntry[] {
	const storedScores = safeGetItem(STORAGE_KEY);

	if (storedScores === null) {
		return [];
	}

	try {
		const scores: unknown = JSON.parse(storedScores);
		return Array.isArray(scores) && scores.every(isScoreEntry) ? scores : [];
	} catch {
		return [];
	}
}

export function addScore(entry: NewScoreEntry): ScoreEntry[] {
	const score: ScoreEntry = {
		name: entry.name?.trim() || 'Anonymous',
		score: entry.score,
		date: new Date().toISOString(),
	};
	const scores = [...getScores(), score]
		.map((scoreEntry, index) => ({ scoreEntry, index }))
		.sort(
			(first, second) =>
				second.scoreEntry.score - first.scoreEntry.score || first.index - second.index,
		)
		.slice(0, MAX_SCORES)
		.map(({ scoreEntry }) => scoreEntry);

	safeSetItem(STORAGE_KEY, JSON.stringify(scores));
	return scores;
}
