import { describe, expect, it } from 'vitest';
import {
	DEFAULT_DANGER_GRACE_MS,
	DEFAULT_DANGER_LINE_Y,
	advanceDangerGrace,
	createInitialState,
	createFruitQueue,
	dropFruit,
	resetGame,
	resolveBoardState,
} from './engine';
import { FRUIT_DEFINITIONS, FRUIT_ORDER, getFruitDefinition, getNextFruitId } from './fruits';
import type { FruitRushState } from './types';

describe('Fruit Rush engine', () => {
	it('keeps the fruit order stable and exposes the final fruit metadata', () => {
		expect(FRUIT_DEFINITIONS).toHaveLength(11);
		expect(FRUIT_ORDER[0]).toBe('blueberry');
		expect(FRUIT_ORDER.at(-1)).toBe('coconut');
		expect(getNextFruitId('blueberry')).toBe('strawberry');
		expect(getNextFruitId('coconut')).toBeUndefined();
		expect(getFruitDefinition('coconut').scoreValue).toBeGreaterThan(0);
	});

	it('starts in a ready state with a populated next-fruit queue', () => {
		const state = createInitialState({
			queue: ['blueberry', 'strawberry', 'lemon'],
			nextFruit: 'blueberry',
			initialScore: 0,
		});
		expect(state.status).toBe('playing');
		expect(state.board).toHaveLength(0);
		expect(state.queue).toEqual(['blueberry', 'strawberry', 'lemon']);
		expect(state.nextFruit).toBe('blueberry');
		expect(state.score).toBe(0);
		expect(state.dangerLineY).toBe(DEFAULT_DANGER_LINE_Y);
	});

	it('uses weighted random spawning so Coconut is rare', () => {
		expect(createFruitQueue(1, () => 0)).toEqual(['blueberry']);
		expect(createFruitQueue(1, () => 0.95)).not.toEqual(['coconut']);
		expect(createFruitQueue(1, () => 0.9999)).toEqual(['coconut']);
	});

	it('accepts valid drops and advances the queue', () => {
		const state = createInitialState({
			queue: ['blueberry', 'strawberry', 'lemon'],
			nextFruit: 'blueberry',
			initialScore: 0,
		});

		const result = dropFruit(state, 0.5, () => 0.2);
		expect(result.accepted).toBe(true);
		expect(result.event).toBe('drop-accepted');
		expect(result.state.board).toHaveLength(1);
		expect(result.state.board[0]?.fruitId).toBe('blueberry');
		expect(result.state.nextFruit).toBe('strawberry');
		expect(result.state.queue[0]).toBe('strawberry');
	});

	it('rejects invalid drop positions', () => {
		const state = createInitialState({
			queue: ['blueberry', 'strawberry', 'lemon'],
			nextFruit: 'blueberry',
		});

		expect(dropFruit(state, -0.1).accepted).toBe(false);
		expect(dropFruit(state, 1.1).accepted).toBe(false);
	});

	it('merges matching fruits and awards score once', () => {
		const state: FruitRushState = {
			status: 'playing',
			board: [
				{ id: 'a', fruitId: 'blueberry', x: 0.42, y: 0.42, radius: 0.065, vx: 0, vy: 0, settled: false },
				{ id: 'b', fruitId: 'blueberry', x: 0.52, y: 0.42, radius: 0.065, vx: 0, vy: 0, settled: false },
			],
			nextFruit: 'blueberry',
			queue: ['blueberry', 'strawberry'],
			score: 0,
			dangerLineY: DEFAULT_DANGER_LINE_Y,
			spawnX: 0.5,
			dangerGraceMs: DEFAULT_DANGER_GRACE_MS,
			lastEvent: 'ready',
		};

		const resolved = resolveBoardState(state);
		expect(resolved.board).toHaveLength(1);
		expect(resolved.board[0]?.fruitId).toBe('strawberry');
		expect(resolved.score).toBe(getFruitDefinition('strawberry').scoreValue);
		expect(resolved.lastEvent).toBe('merge');
	});

	it('resolves multiple chain merges deterministically in order', () => {
		const state: FruitRushState = {
			status: 'playing',
			board: [
				{ id: 'a', fruitId: 'strawberry', x: 0.35, y: 0.3, radius: 0.08, vx: 0, vy: 0, settled: false },
				{ id: 'b', fruitId: 'strawberry', x: 0.47, y: 0.3, radius: 0.08, vx: 0, vy: 0, settled: false },
				{ id: 'c', fruitId: 'lemon', x: 0.62, y: 0.3, radius: 0.095, vx: 0, vy: 0, settled: false },
				{ id: 'd', fruitId: 'lemon', x: 0.78, y: 0.3, radius: 0.095, vx: 0, vy: 0, settled: false },
			],
			nextFruit: 'strawberry',
			queue: ['strawberry'],
			score: 0,
			dangerLineY: DEFAULT_DANGER_LINE_Y,
			spawnX: 0.5,
			dangerGraceMs: DEFAULT_DANGER_GRACE_MS,
			lastEvent: 'ready',
		};

		const resolved = resolveBoardState(state);
		expect(resolved.board).toHaveLength(2);
		expect(resolved.board.some((body) => body.fruitId === 'orange')).toBe(true);
		expect(resolved.score).toBe(
			getFruitDefinition('lemon').scoreValue + getFruitDefinition('orange').scoreValue,
		);
	});

	it('transitions to game-over when settled fruit reaches the danger line', () => {
		const state: FruitRushState = {
			status: 'playing',
			board: [
				{ id: 'a', fruitId: 'blueberry', x: 0.5, y: 0.25, radius: 0.06, vx: 0, vy: 0, settled: true },
			],
			nextFruit: 'blueberry',
			queue: ['blueberry'],
			score: 0,
			dangerLineY: DEFAULT_DANGER_LINE_Y,
			spawnX: 0.5,
			dangerGraceMs: DEFAULT_DANGER_GRACE_MS,
			lastEvent: 'ready',
		};

		const gameOver = advanceDangerGrace(state, DEFAULT_DANGER_GRACE_MS + 1);
		expect(gameOver.status).toBe('game-over');
		expect(gameOver.lastEvent).toBe('game-over');
	});

	it('does not end the game while a newly dropped fruit starts above the danger line', () => {
		const state: FruitRushState = {
			status: 'playing',
			board: [
				{ id: 'a', fruitId: 'blueberry', x: 0.5, y: 0.06, radius: 0.06, vx: 0, vy: 0, settled: true },
			],
			nextFruit: 'blueberry',
			queue: ['blueberry'],
			score: 0,
			dangerLineY: DEFAULT_DANGER_LINE_Y,
			spawnX: 0.5,
			dangerGraceMs: DEFAULT_DANGER_GRACE_MS,
			lastEvent: 'ready',
		};

		const nextState = advanceDangerGrace(state, DEFAULT_DANGER_GRACE_MS + 1);
		expect(nextState.status).toBe('playing');
		expect(nextState.dangerGraceMs).toBe(DEFAULT_DANGER_GRACE_MS);
	});

	it('resets cleanly to a new game state', () => {
		const state = createInitialState({
			queue: ['blueberry', 'strawberry', 'lemon'],
			nextFruit: 'blueberry',
			initialScore: 900,
		});
		const reset = resetGame(state, () => 0.5);

		expect(reset.status).toBe('playing');
		expect(reset.board).toHaveLength(0);
		expect(reset.score).toBe(0);
		expect(reset.lastEvent).toBe('ready');
	});
});
