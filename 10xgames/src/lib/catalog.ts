import { getScoresForGame } from './scores';

export type GameTopScoreSummary = {
	gameId: string;
	topScore: number | null;
	topName: string | null;
};

export function getGameTopScoreSummary(gameId: string): GameTopScoreSummary {
	if (gameId !== 'memory-cards') {
		return {
			gameId,
			topScore: null,
			topName: null,
		};
	}

	const scores = getScoresForGame(gameId);
	const topScore = scores[0] ?? null;

	return {
		gameId,
		topScore: topScore?.score ?? null,
		topName: topScore?.name ?? null,
	};
}
