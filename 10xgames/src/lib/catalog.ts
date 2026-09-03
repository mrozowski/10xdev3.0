export type GameCatalogueEntry = {
	id: string;
	title: string;
	description: string;
	icon: string;
};

export const GAME_CATALOGUE: readonly GameCatalogueEntry[] = [
	{
		id: 'memory-cards',
		title: 'Memory Cards',
		description: 'Match every pair before the timer runs out.',
		icon: '🧠',
	},
	{
		id: 'fruit-rush',
		title: 'Fruit Rush',
		description: 'Drop fruits, merge matches, and survive the overflow.',
		icon: '🍓',
	},
] as const;
