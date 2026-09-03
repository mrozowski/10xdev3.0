import Matter from 'matter-js';
import { getFruitDefinition } from './fruits';
import type { FruitBodySnapshot, FruitId, FruitRushContact } from './types';

export interface FruitRushPhysicsOptions {
	gravityY?: number;
	maxStepsPerFrame?: number;
	fixedStepMs?: number;
}

const BODY_LABEL_PREFIX = 'fruit-rush:';
const FLOOR_LABEL = 'fruit-rush:floor';
const WALL_LABEL = 'fruit-rush:wall';

function fruitLabel(fruitId: FruitId): string {
	return `${BODY_LABEL_PREFIX}${fruitId}`;
}

function fruitIdFromLabel(label: string): FruitId | undefined {
	return label.startsWith(BODY_LABEL_PREFIX)
		? (label.slice(BODY_LABEL_PREFIX.length) as FruitId)
		: undefined;
}

export class FruitRushPhysicsAdapter {
	private readonly engine = Matter.Engine.create();
	private readonly bodiesById = new Map<string, Matter.Body>();
	private readonly idsByBody = new Map<Matter.Body, string>();
	private readonly maxStepsPerFrame: number;
	private readonly fixedStepMs: number;
	private stepAccumulatorMs = 0;

	constructor(options: FruitRushPhysicsOptions = {}) {
		this.fixedStepMs = options.fixedStepMs ?? 1000 / 60;
		this.maxStepsPerFrame = options.maxStepsPerFrame ?? 4;
		this.engine.gravity.y = options.gravityY ?? 1.25;
		this.engine.gravity.scale = 0.000001;

		const wallThickness = 0.05;
		const wallOptions = {
			isStatic: true,
			friction: 0,
			frictionStatic: 0,
			restitution: 0.02,
		};
		const bounds = [
			Matter.Bodies.rectangle(0.5, 1 + wallThickness / 2, 1, wallThickness, {
				...wallOptions,
				label: FLOOR_LABEL,
			}),
			Matter.Bodies.rectangle(-wallThickness / 2, 0.5, wallThickness, 1, {
				...wallOptions,
				label: WALL_LABEL,
			}),
			Matter.Bodies.rectangle(1 + wallThickness / 2, 0.5, wallThickness, 1, {
				...wallOptions,
				label: WALL_LABEL,
			}),
		];
		Matter.Composite.add(this.engine.world, bounds);
	}

	addFruit(
		id: string,
		fruitId: FruitId,
		x: number,
		y: number,
		velocity?: { vx: number; vy: number },
	): FruitBodySnapshot {
		const definition = getFruitDefinition(fruitId);
		const body = Matter.Bodies.circle(x, y, definition.radius, {
			label: fruitLabel(fruitId),
			restitution: 0.14,
			friction: 0.04,
			frictionStatic: 0,
			frictionAir: 0.006,
			slop: 0.004,
		});

		if (velocity) {
			Matter.Body.setVelocity(body, { x: velocity.vx, y: velocity.vy });
		}

		this.bodiesById.set(id, body);
		this.idsByBody.set(body, id);
		Matter.Composite.add(this.engine.world, body);
		return this.snapshotBody(id, body, false);
	}

	removeFruit(id: string): void {
		const body = this.bodiesById.get(id);
		if (!body) {
			return;
		}

		Matter.Composite.remove(this.engine.world, body);
		this.bodiesById.delete(id);
		this.idsByBody.delete(body);
	}

	replaceFruits(
		sourceIds: readonly [string, string],
		nextId: string,
		fruitId: FruitId,
		x: number,
		y: number,
	): FruitBodySnapshot {
		this.removeFruit(sourceIds[0]);
		this.removeFruit(sourceIds[1]);
		return this.addFruit(nextId, fruitId, x, y);
	}

	step(elapsedMs: number): number {
		this.stepAccumulatorMs += Math.max(0, elapsedMs);

		const stepsAvailable = Math.floor(this.stepAccumulatorMs / this.fixedStepMs);
		const stepCount = Math.min(stepsAvailable, this.maxStepsPerFrame);

		for (let index = 0; index < stepCount; index++) {
			Matter.Engine.update(this.engine, this.fixedStepMs);
		}

		this.stepAccumulatorMs -= stepCount * this.fixedStepMs;
		// Avoid runaway accumulation (e.g. after a long tab-hidden pause) once
		// stepping is capped for this frame.
		if (stepsAvailable > this.maxStepsPerFrame) {
			this.stepAccumulatorMs = 0;
		}

		return stepCount;
	}

	getSnapshots(): FruitBodySnapshot[] {
		const supportedFruitIds = this.getSupportedFruitIds();
		return [...this.bodiesById.entries()].map(([id, body]) =>
			this.snapshotBody(
				id,
				body,
				supportedFruitIds.has(id) &&
					Math.abs(body.velocity.y) < 0.02 &&
					Math.abs(body.velocity.x) < 0.02,
			),
		);
	}

	getContacts(): FruitRushContact[] {
		const snapshots = this.getSnapshots();
		const contacts: FruitRushContact[] = [];

		for (let index = 0; index < snapshots.length; index++) {
			const first = snapshots[index];
			if (!first) {
				continue;
			}
			for (let cmp = index + 1; cmp < snapshots.length; cmp++) {
				const second = snapshots[cmp];
				if (!second || first.fruitId !== second.fruitId) {
					continue;
				}

				const distance = Math.hypot(first.x - second.x, first.y - second.y);
				if (distance <= first.radius + second.radius + 0.005) {
					contacts.push({
						firstId: first.id,
						secondId: second.id,
						fruitId: first.fruitId,
					});
				}
			}
		}

		return contacts.sort(
			(first, second) =>
				first.fruitId.localeCompare(second.fruitId) ||
				first.firstId.localeCompare(second.firstId) ||
				first.secondId.localeCompare(second.secondId),
		);
	}

	clear(): void {
		for (const id of [...this.bodiesById.keys()]) {
			this.removeFruit(id);
		}
		Matter.Engine.clear(this.engine);
	}

	private getSupportedFruitIds(): Set<string> {
		const supported = new Set<string>();
		const pairs = (this.engine.pairs as unknown as { list?: Matter.Pair[] }).list ?? [];

		for (const pair of pairs) {
			if (!pair.isActive) {
				continue;
			}

			this.markSupportedFruit(pair.bodyA, pair.bodyB, supported);
			this.markSupportedFruit(pair.bodyB, pair.bodyA, supported);
		}

		return supported;
	}

	private markSupportedFruit(body: Matter.Body, other: Matter.Body, supported: Set<string>): void {
		const id = this.idsByBody.get(body);
		if (!id) {
			return;
		}

		const supportedByFruit =
			other.label !== WALL_LABEL &&
			other.label !== FLOOR_LABEL &&
			fruitIdFromLabel(other.label) &&
			other.position.y > body.position.y;

		if (other.label === FLOOR_LABEL || supportedByFruit) {
			supported.add(id);
		}
	}

	private snapshotBody(
		id: string,
		body: Matter.Body,
		settled: boolean,
	): FruitBodySnapshot {
		const fruitId = fruitIdFromLabel(body.label);
		if (!fruitId) {
			throw new Error(`Cannot serialize non-fruit body: ${body.label}`);
		}

		return {
			id,
			fruitId,
			x: body.position.x,
			y: body.position.y,
			radius: getFruitDefinition(fruitId).radius,
			vx: body.velocity.x,
			vy: body.velocity.y,
			settled,
		};
	}
}
