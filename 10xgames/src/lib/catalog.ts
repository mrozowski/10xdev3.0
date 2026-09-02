export type GameCatalogueEntry = {
	id: string;
	title: string;
	description: string;
};

export const GAME_CATALOGUE: readonly GameCatalogueEntry[] = [
	{
		id: 'memory-cards',
		title: 'Memory Cards',
		description: 'Match every pair before the timer runs out.',
	},
] as const;
