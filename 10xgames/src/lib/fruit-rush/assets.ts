import { FRUIT_ORDER } from './fruits';
import type { FruitId } from './types';

export interface FruitAsset {
	id: FruitId;
	src: string;
}

const BASE_PATH = import.meta.env.BASE_URL;

export const FRUIT_ASSETS: readonly FruitAsset[] = FRUIT_ORDER.map((id) => ({
	id,
	src: `${BASE_PATH}fruit-rush/${id}.svg`,
}));

export const FRUIT_ASSET_BY_ID = Object.fromEntries(
	FRUIT_ASSETS.map((asset) => [asset.id, asset]),
) as Record<FruitId, FruitAsset>;

export function getFruitAsset(fruitId: FruitId): FruitAsset {
	return FRUIT_ASSET_BY_ID[fruitId];
}
