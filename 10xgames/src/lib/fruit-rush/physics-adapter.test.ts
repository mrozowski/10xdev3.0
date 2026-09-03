import { describe, expect, it } from 'vitest';
import { FruitRushPhysicsAdapter } from './physics-adapter';

describe('FruitRushPhysicsAdapter', () => {
	it('steps fruit downward with fixed bounded simulation steps', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 1, maxStepsPerFrame: 2, fixedStepMs: 16 });
		adapter.addFruit('fruit-a', 'blueberry', 0.5, 0.2);

		const before = adapter.getSnapshots()[0];
		const steps = adapter.step(160);
		const after = adapter.getSnapshots()[0];

		expect(steps).toBe(2);
		expect(before).toBeDefined();
		expect(after).toBeDefined();
		expect(after?.y).toBeGreaterThan(before?.y ?? 0);
	});

	it('accumulates sub-step frame deltas so gravity still advances on high refresh-rate displays', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 1, maxStepsPerFrame: 4, fixedStepMs: 16 });
		adapter.addFruit('fruit-a', 'blueberry', 0.5, 0.2);

		const before = adapter.getSnapshots()[0];
		// Simulate a 120Hz display: every frame delta (~8ms) is smaller than
		// fixedStepMs (16ms), so a single call would always floor to 0 steps.
		let totalSteps = 0;
		for (let index = 0; index < 40; index++) {
			totalSteps += adapter.step(8);
		}
		const after = adapter.getSnapshots()[0];

		expect(totalSteps).toBeGreaterThan(0);
		expect(after?.y).toBeGreaterThan(before?.y ?? 0);
	});

	it('keeps fruit inside the container floor', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 3, maxStepsPerFrame: 4, fixedStepMs: 16 });
		adapter.addFruit('fruit-a', 'blueberry', 0.5, 0.8);

		for (let index = 0; index < 90; index++) {
			adapter.step(64);
		}

		const snapshot = adapter.getSnapshots()[0];
		expect(snapshot).toBeDefined();
		expect((snapshot?.y ?? 0) + (snapshot?.radius ?? 0)).toBeLessThanOrEqual(1.06);
	});

	it('marks fruit settled when supported by the floor', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 3, maxStepsPerFrame: 4, fixedStepMs: 16 });
		adapter.addFruit('fruit-a', 'blueberry', 0.5, 0.8);

		for (let index = 0; index < 120; index++) {
			adapter.step(64);
		}

		expect(adapter.getSnapshots()[0]?.settled).toBe(true);
	});

	it('does not mark fruit settled from wall contact alone', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 0, maxStepsPerFrame: 4, fixedStepMs: 16 });
		adapter.addFruit('fruit-a', 'blueberry', 0.01, 0.24);

		for (let index = 0; index < 10; index++) {
			adapter.step(64);
		}

		expect(adapter.getSnapshots()[0]?.settled).toBe(false);
	});

	it('extracts stable same-level contacts', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 0 });
		adapter.addFruit('fruit-a', 'blueberry', 0.45, 0.4);
		adapter.addFruit('fruit-b', 'blueberry', 0.56, 0.4);
		adapter.addFruit('fruit-c', 'lemon', 0.8, 0.4);

		expect(adapter.getContacts()).toEqual([
			{ firstId: 'fruit-a', secondId: 'fruit-b', fruitId: 'blueberry' },
		]);
	});

	it('removes source bodies and creates a merged body snapshot', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 0 });
		adapter.addFruit('fruit-a', 'blueberry', 0.45, 0.4);
		adapter.addFruit('fruit-b', 'blueberry', 0.56, 0.4);

		const merged = adapter.replaceFruits(['fruit-a', 'fruit-b'], 'fruit-c', 'strawberry', 0.5, 0.36);
		const snapshots = adapter.getSnapshots();

		expect(merged.fruitId).toBe('strawberry');
		expect(snapshots).toHaveLength(1);
		expect(snapshots[0]?.id).toBe('fruit-c');
		expect(snapshots[0]?.fruitId).toBe('strawberry');
	});

	it('serializes snapshots without exposing Matter objects', () => {
		const adapter = new FruitRushPhysicsAdapter({ gravityY: 0 });
		adapter.addFruit('fruit-a', 'blueberry', 0.5, 0.2);

		const snapshot = adapter.getSnapshots()[0];
		expect(snapshot).toMatchObject({
			id: 'fruit-a',
			fruitId: 'blueberry',
			radius: expect.any(Number),
			x: expect.any(Number),
			y: expect.any(Number),
			vx: expect.any(Number),
			vy: expect.any(Number),
			settled: expect.any(Boolean),
		});
		expect(Object.keys(snapshot ?? {})).toEqual(['id', 'fruitId', 'x', 'y', 'radius', 'vx', 'vy', 'settled']);
	});
});
