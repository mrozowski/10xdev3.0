export type GameStatus =
	| 'idle'
	| 'preview'
	| 'playing'
	| 'checking'
	| 'round_complete'
	| 'completed'
	| 'time_up';

export interface Card {
	id: number;
	symbolId: string;
	isFlipped: boolean;
	isMatched: boolean;
}

export interface GameState {
	status: GameStatus;
	cards: Card[];
	flippedIndices: number[];
	score: number;
	combo: number;
	matchedPairs: number;
	totalPairs: number;
	previewSecondsRemaining: number;
	roundSecondsRemaining: number;
	round: number;
	roundsTotal: number;
}

export type FlipEvent = 'flip' | 'match' | 'mismatch' | 'round_complete' | 'completed';

export interface FlipResult {
	nextState: GameState;
	event?: FlipEvent;
}

export const PREVIEW_SECONDS = 3;
export const ROUND_SECONDS = 60;
export const BASE_MATCH_POINTS = 150;
export const COMBO_MULTIPLIER_POINTS = 50;
export const MISMATCH_PENALTY_POINTS = 25;
export const TIME_BONUS_PER_SECOND = 10;

/**
 * Fixed 5-round difficulty curve: round 1 shows the preview reveal, later
 * rounds skip it and increase the pair count while keeping the round timer flat.
 */
export interface RoundDifficulty {
	round: number;
	totalPairs: number;
	skipPreview: boolean;
}

export const ROUND_DIFFICULTY: readonly RoundDifficulty[] = [
	{ round: 1, totalPairs: 8, skipPreview: false },
	{ round: 2, totalPairs: 10, skipPreview: true },
	{ round: 3, totalPairs: 12, skipPreview: true },
	{ round: 4, totalPairs: 14, skipPreview: true },
	{ round: 5, totalPairs: 16, skipPreview: true },
] as const;

export const TOTAL_ROUNDS = ROUND_DIFFICULTY.length;

/**
 * Standard Fisher-Yates shuffle algorithm.
 */
export function shuffle<T>(items: readonly T[]): T[] {
	const array = [...items];
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

export interface CreateGameStateOptions {
	round?: number;
	roundsTotal?: number;
	initialScore?: number;
	skipPreview?: boolean;
}

/**
 * Creates the initial game state with shuffled card pairs.
 */
export function createInitialGameState(
	symbolIds: string[],
	totalPairs: number = 8,
	options: CreateGameStateOptions = {},
): GameState {
	const {
		round = 1,
		roundsTotal = 1,
		initialScore = 0,
		skipPreview = false,
	} = options;

	const selectedSymbols = symbolIds.slice(0, totalPairs);
	if (selectedSymbols.length < totalPairs) {
		throw new Error(
			`Not enough unique symbols provided: expected ${totalPairs}, got ${selectedSymbols.length}`,
		);
	}

	const rawCards: Array<{ symbolId: string }> = [];
	for (const symbolId of selectedSymbols) {
		rawCards.push({ symbolId }, { symbolId });
	}

	const shuffled = shuffle(rawCards);
	const cards: Card[] = shuffled.map((card, index) => ({
		id: index,
		symbolId: card.symbolId,
		isFlipped: !skipPreview, // Initially flipped face-up during preview, face-down when skipped
		isMatched: false,
	}));

	return {
		status: skipPreview ? 'playing' : 'preview',
		cards,
		flippedIndices: [],
		score: initialScore,
		combo: 0,
		matchedPairs: 0,
		totalPairs,
		previewSecondsRemaining: skipPreview ? 0 : PREVIEW_SECONDS,
		roundSecondsRemaining: ROUND_SECONDS,
		round,
		roundsTotal,
	};
}

/**
 * Starts a specific round of the progression, looking up its difficulty from
 * `ROUND_DIFFICULTY` (clamping to the last entry if `round` exceeds `TOTAL_ROUNDS`)
 * and carrying the player's score forward from the previous round.
 */
export function startRound(
	round: number,
	symbolIds: string[],
	previousScore: number = 0,
): GameState {
	const clampedRound = Math.min(Math.max(round, 1), TOTAL_ROUNDS);
	const difficulty = ROUND_DIFFICULTY[clampedRound - 1];

	return createInitialGameState(symbolIds, difficulty.totalPairs, {
		round: difficulty.round,
		roundsTotal: TOTAL_ROUNDS,
		initialScore: previousScore,
		skipPreview: difficulty.skipPreview,
	});
}

/**
 * Ticks the initial preview countdown timer down by 1 second.
 * When it reaches 0, all non-matched cards are turned face-down and status becomes 'playing'.
 */
export function tickPreview(state: GameState): GameState {
	if (state.status !== 'preview') {
		return state;
	}

	const nextSeconds = state.previewSecondsRemaining - 1;
	if (nextSeconds > 0) {
		return {
			...state,
			previewSecondsRemaining: nextSeconds,
		};
	}

	// Preview finished: turn all cards face down and transition to playing
	return {
		...state,
		status: 'playing',
		previewSecondsRemaining: 0,
		cards: state.cards.map((card) => ({
			...card,
			isFlipped: false,
		})),
	};
}

/**
 * Ticks the round countdown timer down by 1 second.
 * When it reaches 0 during active play, transitions to 'time_up'.
 */
export function tickTimer(state: GameState): GameState {
	if (state.status !== 'playing' && state.status !== 'checking') {
		return state;
	}

	const nextSeconds = state.roundSecondsRemaining - 1;
	if (nextSeconds <= 0) {
		return {
			...state,
			status: 'time_up',
			roundSecondsRemaining: 0,
			cards: state.cards.map((card) => ({
				...card,
				isFlipped: true, // Reveal all cards upon game over
			})),
		};
	}

	return {
		...state,
		roundSecondsRemaining: nextSeconds,
	};
}

/**
 * Calculates the final score including remaining time bonus.
 */
export function calculateFinalScore(
	baseScore: number,
	roundSecondsRemaining: number,
): number {
	const timeBonus = Math.max(0, roundSecondsRemaining) * TIME_BONUS_PER_SECOND;
	return Math.max(0, baseScore + timeBonus);
}

/**
 * Handles a card click/flip.
 */
export function flipCard(state: GameState, cardIndex: number): FlipResult {
	if (state.status !== 'playing') {
		return { nextState: state };
	}

	const card = state.cards[cardIndex];
	if (!card || card.isFlipped || card.isMatched) {
		return { nextState: state };
	}

	// First card flip of a pair attempt
	if (state.flippedIndices.length === 0) {
		const nextCards = state.cards.map((c, idx) =>
			idx === cardIndex ? { ...c, isFlipped: true } : c,
		);
		return {
			nextState: {
				...state,
				cards: nextCards,
				flippedIndices: [cardIndex],
			},
			event: 'flip',
		};
	}

	// Second card flip
	if (state.flippedIndices.length === 1) {
		const firstIndex = state.flippedIndices[0];
		const firstCard = state.cards[firstIndex];
		const nextCards = state.cards.map((c, idx) =>
			idx === cardIndex ? { ...c, isFlipped: true } : c,
		);

		// Matching pair!
		if (firstCard.symbolId === card.symbolId) {
			const matchedCards = nextCards.map((c, idx) =>
				idx === firstIndex || idx === cardIndex ? { ...c, isMatched: true } : c,
			);
			const nextMatchedPairs = state.matchedPairs + 1;
			const nextCombo = state.combo + 1;
			const pointsEarned =
				BASE_MATCH_POINTS + (nextCombo - 1) * COMBO_MULTIPLIER_POINTS;
			const nextScore = state.score + pointsEarned;
			const isComplete = nextMatchedPairs >= state.totalPairs;

			if (isComplete) {
				const finalScore = calculateFinalScore(
					nextScore,
					state.roundSecondsRemaining,
				);
				const isFinalRound = state.round >= state.roundsTotal;
				return {
					nextState: {
						...state,
						status: isFinalRound ? 'completed' : 'round_complete',
						cards: matchedCards,
						flippedIndices: [],
						score: finalScore,
						combo: nextCombo,
						matchedPairs: nextMatchedPairs,
					},
					event: isFinalRound ? 'completed' : 'round_complete',
				};
			}

			return {
				nextState: {
					...state,
					cards: matchedCards,
					flippedIndices: [],
					score: nextScore,
					combo: nextCombo,
					matchedPairs: nextMatchedPairs,
				},
				event: 'match',
			};
		}

		// Mismatched pair: enter 'checking' state
		const penalizedScore = Math.max(0, state.score - MISMATCH_PENALTY_POINTS);
		return {
			nextState: {
				...state,
				status: 'checking',
				cards: nextCards,
				flippedIndices: [firstIndex, cardIndex],
				score: penalizedScore,
				combo: 0,
			},
			event: 'mismatch',
		};
	}

	return { nextState: state };
}

/**
 * Resolves a mismatch after the cooldown timer, flipping the two mismatched cards back face down.
 */
export function resolveMismatch(state: GameState): GameState {
	if (state.status !== 'checking' || state.flippedIndices.length !== 2) {
		return state;
	}

	const [firstIndex, secondIndex] = state.flippedIndices;
	const nextCards = state.cards.map((card, idx) =>
		idx === firstIndex || idx === secondIndex ? { ...card, isFlipped: false } : card,
	);

	return {
		...state,
		status: 'playing',
		cards: nextCards,
		flippedIndices: [],
	};
}
