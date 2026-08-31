import type { Theme } from '../preferences';

export interface ThemeSymbol {
	id: string;
	name: string;
	color: string;
	svgPath: string;
}

export const SOFTWARE_DEV_SYMBOLS: readonly ThemeSymbol[] = [
	{
		id: 'terminal',
		name: 'Terminal',
		color: '#00ff9f',
		svgPath:
			'<path d="M4 17l6-6-6-6m8 14h8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
	},
	{
		id: 'code',
		name: 'Code Tags',
		color: '#00f0ff',
		svgPath:
			'<path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
	},
	{
		id: 'git-branch',
		name: 'Git Branch',
		color: '#ff79c6',
		svgPath:
			'<circle cx="18" cy="6" r="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6" cy="6" r="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M18 9a9 9 0 01-9 9m-3-9v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
	},
	{
		id: 'database',
		name: 'Database',
		color: '#ffb86c',
		svgPath:
			'<ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" stroke-width="2" fill="none"/>',
	},
	{
		id: 'cpu',
		name: 'Microchip CPU',
		color: '#bd93f9',
		svgPath:
			'<rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="9" y="9" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 1v3m6-3v3m-6 17v3m6-3v3M1 9h3m-3 6h3m17-6h3m-3 6h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
	},
	{
		id: 'bug',
		name: 'Debug Bug',
		color: '#ff5555',
		svgPath:
			'<rect x="7" y="9" width="10" height="11" rx="5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 5v4M4 13h3m10 0h3M5 7l2.5 2.5M19 7l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
	},
	{
		id: 'rocket',
		name: 'Deploy Rocket',
		color: '#f1fa8c',
		svgPath:
			'<path d="M12 2c3 0 7 4 7 9 0 3-2 6-4 8l-3-3-3 3c-2-2-4-5-4-8 0-5 4-9 7-9z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="9" r="2" fill="currentColor"/><path d="M7 14l-4 4 4-1 1-3m9 0l4 4-4-1-1-3" stroke="currentColor" stroke-width="1.5" fill="none"/>',
	},
	{
		id: 'shield',
		name: 'Security Shield',
		color: '#50fa7b',
		svgPath:
			'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
	},
] as const;

export function getThemeSymbols(theme: Theme = 'software-dev'): readonly ThemeSymbol[] {
	switch (theme) {
		case 'software-dev':
		default:
			return SOFTWARE_DEV_SYMBOLS;
	}
}

export function getThemeSymbolIds(theme: Theme = 'software-dev'): string[] {
	return getThemeSymbols(theme).map((symbol) => symbol.id);
}
