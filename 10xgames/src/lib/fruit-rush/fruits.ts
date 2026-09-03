import type { FruitDefinition, FruitId } from './types';

export const FRUIT_DEFINITIONS: readonly FruitDefinition[] = [
	{ id: 'blueberry', label: 'Blueberry', order: 1, radius: 0.06, scoreValue: 10, nextId: 'strawberry', color: '#5fd4ff' },
	{ id: 'strawberry', label: 'Strawberry', order: 2, radius: 0.068, scoreValue: 25, nextId: 'lemon', color: '#ff6078' },
	{ id: 'lemon', label: 'Lemon', order: 3, radius: 0.078, scoreValue: 40, nextId: 'orange', color: '#ffe066' },
	{ id: 'orange', label: 'Orange', order: 4, radius: 0.088, scoreValue: 65, nextId: 'kiwi', color: '#ff9f43' },
	{ id: 'kiwi', label: 'Kiwi', order: 5, radius: 0.098, scoreValue: 90, nextId: 'apple', color: '#8fe365' },
	{ id: 'apple', label: 'Apple', order: 6, radius: 0.11, scoreValue: 140, nextId: 'mangosteen', color: '#ef5d5d' },
	{ id: 'mangosteen', label: 'Mangosteen', order: 7, radius: 0.122, scoreValue: 200, nextId: 'pineapple', color: '#d5a2ff' },
	{ id: 'pineapple', label: 'Pineapple', order: 8, radius: 0.136, scoreValue: 300, nextId: 'mango', color: '#ffdb5c' },
	{ id: 'mango', label: 'Mango', order: 9, radius: 0.15, scoreValue: 450, nextId: 'durian', color: '#ffad42' },
	{ id: 'durian', label: 'Durian', order: 10, radius: 0.166, scoreValue: 700, nextId: 'coconut', color: '#d4c291' },
	{ id: 'coconut', label: 'Coconut', order: 11, radius: 0.182, scoreValue: 1000, color: '#f1d6a5' },
] as const;

export const FRUIT_ORDER: readonly FruitId[] = FRUIT_DEFINITIONS.map((fruit) => fruit.id);

export const FRUIT_BY_ID = Object.fromEntries(
	FRUIT_DEFINITIONS.map((fruit) => [fruit.id, fruit]),
) as Record<FruitId, FruitDefinition>;

export function getFruitDefinition(fruitId: FruitId): FruitDefinition {
	const definition = FRUIT_BY_ID[fruitId];
	if (!definition) {
		throw new Error(`Unknown Fruit Rush fruit: ${String(fruitId)}`);
	}
	return definition;
}

export function getNextFruitId(fruitId: FruitId): FruitId | undefined {
	return getFruitDefinition(fruitId).nextId;
}

export function getFruitScore(fruitId: FruitId): number {
	return getFruitDefinition(fruitId).scoreValue;
}

export function isTerminalFruit(fruitId: FruitId): boolean {
	return !getFruitDefinition(fruitId).nextId;
}
