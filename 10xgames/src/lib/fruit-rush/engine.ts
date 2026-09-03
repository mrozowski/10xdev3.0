import { FRUIT_DEFINITIONS, FRUIT_ORDER, getFruitDefinition, getNextFruitId } from './fruits';
import type { FruitBodySnapshot, FruitId, FruitRushDropResult, FruitRushState } from './types';

export const DEFAULT_DANGER_LINE_Y = 0.22;
export const BOARD_MIN_X = 0.08;
export const BOARD_MAX_X = 0.92;
export const DEFAULT_QUEUE_SIZE = 3;
export const DEFAULT_DANGER_GRACE_MS = 450;
export const FRUIT_SPAWN_WEIGHTS: Readonly<Record<FruitId, number>> = {
	blueberry: 28,
	strawberry: 24,
	lemon: 18,
	orange: 13,
	kiwi: 8,
	apple: 5,
	mangosteen: 2,
	pineapple: 1,
	mango: 0.6,
	durian: 0.3,
	coconut: 0.1,
};

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function createBodyId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}
	return `fruit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createRandomFruitId(random: () => number = Math.random): FruitId {
	const totalWeight = FRUIT_ORDER.reduce(
		(total, fruitId) => total + FRUIT_SPAWN_WEIGHTS[fruitId],
		0,
	);
	let threshold = random() * totalWeight;

	for (const fruitId of FRUIT_ORDER) {
		threshold -= FRUIT_SPAWN_WEIGHTS[fruitId];
		if (threshold <= 0) {
			return fruitId;
		}
	}

	return FRUIT_ORDER[0];
}

export function createFruitQueue(
	length: number = DEFAULT_QUEUE_SIZE,
	random: () => number = Math.random,
): FruitId[] {
	return Array.from({ length }, () => createRandomFruitId(random));
}

export function createInitialState(
	options: Partial<{
		initialScore: number;
		queue: FruitId[];
		nextFruit: FruitId;
		queueSize: number;
		spawnX: number;
		dangerLineY: number;
		dangerGraceMs: number;
		random: () => number;
	}> = {},
): FruitRushState {
	const queue = options.queue ?? createFruitQueue(options.queueSize ?? DEFAULT_QUEUE_SIZE, options.random ?? Math.random);
	const nextFruit = options.nextFruit ?? queue[0] ?? FRUIT_ORDER[0];
	const normalizedQueue = queue.length > 0 ? [...queue] : [nextFruit];

	return {
		status: 'playing',
		board: [],
		nextFruit,
		queue: normalizedQueue,
		score: options.initialScore ?? 0,
		spawnX: options.spawnX ?? 0.5,
		dangerLineY: options.dangerLineY ?? DEFAULT_DANGER_LINE_Y,
		dangerGraceMs: options.dangerGraceMs ?? DEFAULT_DANGER_GRACE_MS,
		lastEvent: 'ready',
	};
}

function makeBody(fruitId: FruitId, x: number, y: number): FruitBodySnapshot {
	const definition = getFruitDefinition(fruitId);
	return {
		id: createBodyId(),
		fruitId,
		x: clamp(x, BOARD_MIN_X, BOARD_MAX_X),
		y,
		radius: definition.radius,
		vx: 0,
		vy: 0,
		settled: false,
	};
}

function distanceBetween(a: FruitBodySnapshot, b: FruitBodySnapshot): number {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

function createMergedBody(
	first: FruitBodySnapshot,
	second: FruitBodySnapshot,
	nextFruitId: FruitId,
): FruitBodySnapshot {
	const definition = getFruitDefinition(nextFruitId);
	return {
		id: createBodyId(),
		fruitId: nextFruitId,
		x: (first.x + second.x) / 2,
		y: Math.min(first.y, second.y) - definition.radius * 0.15,
		radius: definition.radius,
		vx: 0,
		vy: 0,
		settled: false,
	};
}

export function resolveBoardState(state: FruitRushState): FruitRushState {
	let working: FruitRushState = {
		...state,
		board: state.board.map((body) => ({ ...body })),
	};

	let resolvedOne = true;
	while (resolvedOne) {
		resolvedOne = false;
		const ordered = [...working.board].sort((left, right) => left.y - right.y || left.x - right.x);
		for (let index = 0; index < ordered.length; index++) {
			const first = ordered[index];
			for (let cmp = index + 1; cmp < ordered.length; cmp++) {
				const second = ordered[cmp];
				if (first.fruitId !== second.fruitId) {
					continue;
				}

				const nextFruitId = getNextFruitId(first.fruitId);
				if (!nextFruitId) {
					continue;
				}

				const distance = distanceBetween(first, second);
				if (distance > first.radius + second.radius + 0.01) {
					continue;
				}

				const survivors = working.board.filter(
					(body) => body.id !== first.id && body.id !== second.id,
				);
				survivors.push(createMergedBody(first, second, nextFruitId));
				working = {
					...working,
					board: survivors,
					score: working.score + getFruitDefinition(nextFruitId).scoreValue,
					lastEvent: 'merge',
				};
				resolvedOne = true;
				break;
			}
			if (resolvedOne) {
				break;
			}
		}
	}

	const board = working.board.map((body) => ({ ...body }));
	const status = working.status === 'game-over' ? 'game-over' : 'playing';

	return {
		...working,
		board,
		status,
		lastEvent: status === 'game-over' ? 'game-over' : working.lastEvent,
	};
}

export function advanceDangerGrace(state: FruitRushState, elapsedMs: number): FruitRushState {
	if (state.status === 'game-over') {
		return state;
	}

	const hasSettledOverflow = state.board.some(
		(body) => body.settled && body.y > state.dangerLineY && body.y - body.radius <= state.dangerLineY,
	);
	if (!hasSettledOverflow) {
		return {
			...state,
			dangerGraceMs: DEFAULT_DANGER_GRACE_MS,
		};
	}

	const nextGrace = Math.max(0, state.dangerGraceMs - elapsedMs);
	if (nextGrace <= 0) {
		return {
			...state,
			dangerGraceMs: 0,
			status: 'game-over',
			lastEvent: 'game-over',
		};
	}

	return {
		...state,
		dangerGraceMs: nextGrace,
	};
}

export function dropFruit(
	state: FruitRushState,
	x: number,
	random: () => number = Math.random,
): FruitRushDropResult {
	if (state.status === 'game-over') {
		return {
			accepted: false,
			event: 'drop-rejected',
			state,
		};
	}

	const candidateX = clamp(Number.isFinite(x) ? x : state.spawnX, BOARD_MIN_X, BOARD_MAX_X);
	if (x < BOARD_MIN_X || x > BOARD_MAX_X) {
		return {
			accepted: false,
			event: 'drop-rejected',
			state,
		};
	}

	const fruitId = state.nextFruit;
	const nextQueue = [...state.queue];
	nextQueue.shift();
	nextQueue.push(createRandomFruitId(random));
	const body = makeBody(fruitId, candidateX, getFruitDefinition(fruitId).radius);
	const nextState: FruitRushState = {
		...state,
		board: [...state.board, body],
		nextFruit: nextQueue[0] ?? fruitId,
		queue: nextQueue,
		lastEvent: 'drop-accepted',
	};

	const resolved = resolveBoardState(nextState);
	return {
		accepted: true,
		event: 'drop-accepted',
		state: {
			...resolved,
			dangerGraceMs: resolved.board.some(
				(body) =>
					body.settled &&
					body.y > resolved.dangerLineY &&
					body.y - body.radius <= resolved.dangerLineY,
			)
				? state.dangerGraceMs
				: DEFAULT_DANGER_GRACE_MS,
		},
	};
}

export function resetGame(
	state: FruitRushState,
	random: () => number = Math.random,
): FruitRushState {
	const queue = createFruitQueue(DEFAULT_QUEUE_SIZE, random);
	const nextFruit = queue[0] ?? FRUIT_ORDER[0];
	return {
		...createInitialState({
			queue,
			nextFruit,
			initialScore: 0,
			spawnX: state.spawnX,
			dangerLineY: state.dangerLineY,
			dangerGraceMs: DEFAULT_DANGER_GRACE_MS,
			random,
		}),
		status: 'playing',
		lastEvent: 'ready',
	};
}

export { FRUIT_DEFINITIONS };
