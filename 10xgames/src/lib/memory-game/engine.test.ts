import { describe, it, expect } from 'vitest';
import {
	createInitialGameState,
	startRound,
	tickPreview,
	tickTimer,
	flipCard,
	resolveMismatch,
	calculateFinalScore,
	shuffle,
	BASE_MATCH_POINTS,
	MISMATCH_PENALTY_POINTS,
	TIME_BONUS_PER_SECOND,
	PREVIEW_SECONDS,
	ROUND_SECONDS,
	ROUND_DIFFICULTY,
	TOTAL_ROUNDS,
	type GameState,
} from './engine';

const TEST_SYMBOLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];

describe('Memory Game Engine', () => {
	describe('createInitialGameState', () => {
		it('creates 16 cards (8 pairs) in preview state with cards face up', () => {
			const state = createInitialGameState(TEST_SYMBOLS, 8);

			expect(state.status).toBe('preview');
			expect(state.cards.length).toBe(16);
			expect(state.totalPairs).toBe(8);
			expect(state.matchedPairs).toBe(0);
			expect(state.score).toBe(0);
			expect(state.combo).toBe(0);
			expect(state.previewSecondsRemaining).toBe(PREVIEW_SECONDS);
			expect(state.roundSecondsRemaining).toBe(ROUND_SECONDS);
			expect(state.cards.every((c) => c.isFlipped === true)).toBe(true);
			expect(state.cards.every((c) => c.isMatched === false)).toBe(true);

			// Check that each of the first 8 symbols appears exactly twice
			const symbolCounts: Record<string, number> = {};
			for (const card of state.cards) {
				symbolCounts[card.symbolId] = (symbolCounts[card.symbolId] || 0) + 1;
			}
			for (const symbol of TEST_SYMBOLS.slice(0, 8)) {
				expect(symbolCounts[symbol]).toBe(2);
			}
		});

		it('throws an error if not enough unique symbols are provided', () => {
			expect(() => createInitialGameState(['a', 'b'], 4)).toThrow(
				/Not enough unique symbols/,
			);
		});

		it('defaults to round 1 of 1 with no explicit round options', () => {
			const state = createInitialGameState(TEST_SYMBOLS, 8);

			expect(state.round).toBe(1);
			expect(state.roundsTotal).toBe(1);
		});

		it('supports skipPreview to start directly in playing status with cards face down', () => {
			const state = createInitialGameState(TEST_SYMBOLS, 10, {
				round: 2,
				roundsTotal: 5,
				initialScore: 500,
				skipPreview: true,
			});

			expect(state.status).toBe('playing');
			expect(state.score).toBe(500);
			expect(state.round).toBe(2);
			expect(state.roundsTotal).toBe(5);
			expect(state.previewSecondsRemaining).toBe(0);
			expect(state.cards.every((c) => c.isFlipped === false)).toBe(true);
		});
	});

	describe('ROUND_DIFFICULTY / startRound', () => {
		it('defines exactly 5 rounds with the expected pair counts and preview rule', () => {
			expect(TOTAL_ROUNDS).toBe(5);
			expect(ROUND_DIFFICULTY).toEqual([
				{ round: 1, totalPairs: 8, skipPreview: false },
				{ round: 2, totalPairs: 10, skipPreview: true },
				{ round: 3, totalPairs: 12, skipPreview: true },
				{ round: 4, totalPairs: 14, skipPreview: true },
				{ round: 5, totalPairs: 16, skipPreview: true },
			]);
		});

		it('starts round 1 with a preview and zero carried-over score', () => {
			const state = startRound(1, TEST_SYMBOLS, 0);

			expect(state.status).toBe('preview');
			expect(state.round).toBe(1);
			expect(state.roundsTotal).toBe(5);
			expect(state.totalPairs).toBe(8);
			expect(state.score).toBe(0);
		});

		it('starts round 2+ without a preview and carries the score forward', () => {
			const state = startRound(3, TEST_SYMBOLS, 750);

			expect(state.status).toBe('playing');
			expect(state.round).toBe(3);
			expect(state.totalPairs).toBe(12);
			expect(state.score).toBe(750);
			expect(state.cards.every((c) => c.isFlipped === false)).toBe(true);
		});

		it('clamps a round number beyond TOTAL_ROUNDS to the last round', () => {
			const state = startRound(99, TEST_SYMBOLS, 100);

			expect(state.round).toBe(5);
			expect(state.totalPairs).toBe(16);
		});
	});

	describe('shuffle', () => {
		it('returns a new array with all elements preserved', () => {
			const input = [1, 2, 3, 4, 5, 6, 7, 8];
			const result = shuffle(input);

			expect(result).toHaveLength(input.length);
			expect(result.sort()).toEqual(input.sort());
		});
	});

	describe('tickPreview', () => {
		it('decrements preview countdown while above zero', () => {
			let state = createInitialGameState(TEST_SYMBOLS, 8);
			expect(state.previewSecondsRemaining).toBe(3);

			state = tickPreview(state);
			expect(state.status).toBe('preview');
			expect(state.previewSecondsRemaining).toBe(2);
			expect(state.cards.every((c) => c.isFlipped)).toBe(true);

			state = tickPreview(state);
			expect(state.previewSecondsRemaining).toBe(1);
			expect(state.status).toBe('preview');
		});

		it('turns all cards face down and sets status to playing on zero', () => {
			let state = createInitialGameState(TEST_SYMBOLS, 8);
			state = tickPreview(state); // 2
			state = tickPreview(state); // 1
			state = tickPreview(state); // 0 -> playing

			expect(state.status).toBe('playing');
			expect(state.previewSecondsRemaining).toBe(0);
			expect(state.cards.every((c) => c.isFlipped === false)).toBe(true);
		});

		it('does nothing if status is not preview', () => {
			let state = createInitialGameState(TEST_SYMBOLS, 8);
			state = tickPreview(state);
			state = tickPreview(state);
			state = tickPreview(state); // now playing

			const untouched = tickPreview(state);
			expect(untouched).toBe(state);
		});
	});

	describe('tickTimer', () => {
		it('decrements roundSecondsRemaining during playing', () => {
			let state = createInitialGameState(TEST_SYMBOLS, 8);
			state = tickPreview(state);
			state = tickPreview(state);
			state = tickPreview(state); // playing

			expect(state.roundSecondsRemaining).toBe(ROUND_SECONDS);
			state = tickTimer(state);
			expect(state.roundSecondsRemaining).toBe(ROUND_SECONDS - 1);
		});

		it('transitions to time_up and reveals cards when timer hits 0', () => {
			let state = createInitialGameState(TEST_SYMBOLS, 8);
			state = tickPreview(state);
			state = tickPreview(state);
			state = tickPreview(state); // playing
			state = { ...state, roundSecondsRemaining: 1 };

			state = tickTimer(state);
			expect(state.status).toBe('time_up');
			expect(state.roundSecondsRemaining).toBe(0);
			expect(state.cards.every((c) => c.isFlipped)).toBe(true);
		});
	});

	describe('flipCard & matching mechanics', () => {
		function getPlayingState(): GameState {
			const rawCards = [
				{ id: 0, symbolId: 'git', isFlipped: false, isMatched: false },
				{ id: 1, symbolId: 'git', isFlipped: false, isMatched: false },
				{ id: 2, symbolId: 'code', isFlipped: false, isMatched: false },
				{ id: 3, symbolId: 'code', isFlipped: false, isMatched: false },
			];
			return {
				status: 'playing',
				cards: rawCards,
				flippedIndices: [],
				score: 0,
				combo: 0,
				matchedPairs: 0,
				totalPairs: 2,
				previewSecondsRemaining: 0,
				roundSecondsRemaining: 40,
				round: 1,
				roundsTotal: 1,
			};
		}

		it('ignores clicks when not in playing status', () => {
			const previewState = createInitialGameState(TEST_SYMBOLS, 8);
			const result = flipCard(previewState, 0);
			expect(result.nextState).toBe(previewState);
			expect(result.event).toBeUndefined();
		});

		it('flips the first card', () => {
			const state = getPlayingState();
			const { nextState, event } = flipCard(state, 0);

			expect(event).toBe('flip');
			expect(nextState.cards[0].isFlipped).toBe(true);
			expect(nextState.flippedIndices).toEqual([0]);
			expect(nextState.status).toBe('playing');
		});

		it('ignores clicking the same already flipped card', () => {
			const state = getPlayingState();
			const { nextState: firstFlip } = flipCard(state, 0);
			const { nextState: secondFlip, event } = flipCard(firstFlip, 0);

			expect(secondFlip).toBe(firstFlip);
			expect(event).toBeUndefined();
		});

		it('detects a match and awards points + combo streak', () => {
			const state = getPlayingState();
			const { nextState: firstFlip } = flipCard(state, 0);
			const { nextState: matchState, event } = flipCard(firstFlip, 1);

			expect(event).toBe('match');
			expect(matchState.matchedPairs).toBe(1);
			expect(matchState.combo).toBe(1);
			expect(matchState.score).toBe(BASE_MATCH_POINTS);
			expect(matchState.cards[0].isMatched).toBe(true);
			expect(matchState.cards[1].isMatched).toBe(true);
			expect(matchState.flippedIndices).toEqual([]);
			expect(matchState.status).toBe('playing');
		});

		it('ignores re-clicking a matched card', () => {
			const state = getPlayingState();
			const { nextState: firstFlip } = flipCard(state, 0);
			const { nextState: matchState } = flipCard(firstFlip, 1);
			const { nextState, event } = flipCard(matchState, 0);

			expect(nextState).toBe(matchState);
			expect(event).toBeUndefined();
		});

		it('increases combo multiplier on consecutive matches', () => {
			const state = getPlayingState();
			const { nextState: flip1 } = flipCard(state, 0);
			const { nextState: match1 } = flipCard(flip1, 1); // combo 1: +150

			const { nextState: flip2 } = flipCard(match1, 2);
			const { nextState: match2, event } = flipCard(flip2, 3); // combo 2: +200 (+150 + 50)

			expect(event).toBe('completed');
			expect(match2.matchedPairs).toBe(2);
			expect(match2.combo).toBe(2);
			// Base score = 150 + 200 = 350. Time bonus = 40 * 10 = 400. Total = 750.
			expect(match2.score).toBe(350 + 40 * TIME_BONUS_PER_SECOND);
			expect(match2.status).toBe('completed');
		});

		it('detects a mismatch, resets combo, applies penalty and sets status to checking', () => {
			let state = getPlayingState();
			state = { ...state, score: 200, combo: 2 };

			const { nextState: flip1 } = flipCard(state, 0); // 'git'
			const { nextState: mismatchState, event } = flipCard(flip1, 2); // 'code'

			expect(event).toBe('mismatch');
			expect(mismatchState.status).toBe('checking');
			expect(mismatchState.combo).toBe(0);
			expect(mismatchState.score).toBe(200 - MISMATCH_PENALTY_POINTS);
			expect(mismatchState.flippedIndices).toEqual([0, 2]);
			expect(mismatchState.cards[0].isFlipped).toBe(true);
			expect(mismatchState.cards[2].isFlipped).toBe(true);
		});

		it('ignores a third card click while a mismatch is pending', () => {
			const state = getPlayingState();
			const { nextState: firstFlip } = flipCard(state, 0);
			const { nextState: mismatchState } = flipCard(firstFlip, 2);
			const { nextState, event } = flipCard(mismatchState, 1);

			expect(nextState).toBe(mismatchState);
			expect(event).toBeUndefined();
		});

		it('prevents negative scores on penalty', () => {
			const state = getPlayingState();
			const { nextState: flip1 } = flipCard(state, 0);
			const { nextState: mismatchState } = flipCard(flip1, 2);

			expect(mismatchState.score).toBe(0);
		});

		it('allows a new match after resolving a mismatch', () => {
			const state = getPlayingState();
			const { nextState: firstFlip } = flipCard(state, 0);
			const { nextState: mismatchState } = flipCard(firstFlip, 2);
			const resolvedState = resolveMismatch(mismatchState);
			const { nextState: nextFlip } = flipCard(resolvedState, 1);
			const { nextState: matchState, event } = flipCard(nextFlip, 0);

			expect(event).toBe('match');
			expect(matchState.status).toBe('playing');
			expect(matchState.matchedPairs).toBe(1);
			expect(matchState.cards[0].isMatched).toBe(true);
			expect(matchState.cards[1].isMatched).toBe(true);
		});

		it('emits round_complete (not completed) when an earlier round finishes', () => {
			const state: GameState = { ...getPlayingState(), round: 2, roundsTotal: 5 };
			const { nextState: flip1 } = flipCard(state, 0);
			const { nextState: match1 } = flipCard(flip1, 1); // git/git matched
			const { nextState: flip2 } = flipCard(match1, 2);
			const { nextState: roundCompleteState, event } = flipCard(flip2, 3); // code/code matched -> round complete

			expect(event).toBe('round_complete');
			expect(roundCompleteState.status).toBe('round_complete');
			expect(roundCompleteState.matchedPairs).toBe(2);
		});

		it('emits completed when the final round finishes', () => {
			const state: GameState = { ...getPlayingState(), round: 5, roundsTotal: 5 };
			const { nextState: flip1 } = flipCard(state, 0);
			const { nextState: match1 } = flipCard(flip1, 1); // git/git matched
			const { nextState: flip2 } = flipCard(match1, 2);
			const { nextState: completedState, event } = flipCard(flip2, 3); // code/code matched -> completed

			expect(event).toBe('completed');
			expect(completedState.status).toBe('completed');
		});
	});

	describe('resolveMismatch', () => {
		it('flips mismatched cards face down and returns to playing status', () => {
			const rawCards = [
				{ id: 0, symbolId: 'git', isFlipped: true, isMatched: false },
				{ id: 1, symbolId: 'git', isFlipped: false, isMatched: false },
				{ id: 2, symbolId: 'code', isFlipped: true, isMatched: false },
				{ id: 3, symbolId: 'code', isFlipped: false, isMatched: false },
			];
			const checkingState: GameState = {
				status: 'checking',
				cards: rawCards,
				flippedIndices: [0, 2],
				score: 100,
				combo: 0,
				matchedPairs: 0,
				totalPairs: 2,
				previewSecondsRemaining: 0,
				roundSecondsRemaining: 30,
				round: 1,
				roundsTotal: 1,
			};

			const resolved = resolveMismatch(checkingState);

			expect(resolved.status).toBe('playing');
			expect(resolved.flippedIndices).toEqual([]);
			expect(resolved.cards[0].isFlipped).toBe(false);
			expect(resolved.cards[2].isFlipped).toBe(false);
		});

		it('does nothing if status is not checking', () => {
			const state = createInitialGameState(TEST_SYMBOLS, 8);
			const result = resolveMismatch(state);
			expect(result).toBe(state);
		});
	});

	describe('calculateFinalScore', () => {
		it('adds time bonus to base score', () => {
			expect(calculateFinalScore(300, 25)).toBe(300 + 25 * 10);
		});

		it('handles zero or negative time gracefully', () => {
			expect(calculateFinalScore(300, 0)).toBe(300);
			expect(calculateFinalScore(300, -5)).toBe(300);
		});
	});
});
