export type FruitId =
	| 'blueberry'
	| 'strawberry'
	| 'lemon'
	| 'orange'
	| 'kiwi'
	| 'apple'
	| 'mangosteen'
	| 'pineapple'
	| 'mango'
	| 'durian'
	| 'coconut';

export type FruitRushStatus = 'playing' | 'game-over';

export type FruitRushEvent =
	| 'ready'
	| 'drop-accepted'
	| 'drop-rejected'
	| 'merge'
	| 'game-over';

/** A pairwise physics contact between two same-level fruit bodies, as reported by the adapter. */
export interface FruitRushContact {
	firstId: string;
	secondId: string;
	fruitId: FruitId;
}

export interface FruitDefinition {
	id: FruitId;
	label: string;
	order: number;
	radius: number;
	scoreValue: number;
	nextId?: FruitId;
	color: string;
}

export interface FruitBodySnapshot {
	id: string;
	fruitId: FruitId;
	x: number;
	y: number;
	radius: number;
	vx: number;
	vy: number;
	settled: boolean;
}

export interface FruitRushState {
	status: FruitRushStatus;
	board: FruitBodySnapshot[];
	nextFruit: FruitId;
	queue: FruitId[];
	score: number;
	dangerLineY: number;
	spawnX: number;
	dangerGraceMs: number;
	/**
	 * Most recent transition only (accept/reject/merge/score/game-over).
	 * Intentional simplification vs. an accumulating event log: a chain of
	 * merges within one `dropFruit()` call only surfaces the final event.
	 */
	lastEvent: FruitRushEvent;
}

export interface FruitRushDropResult {
	accepted: boolean;
	event: 'drop-accepted' | 'drop-rejected';
	state: FruitRushState;
}
