import type { Theme } from '../preferences';

export interface ThemeSymbol {
	id: string;
	name: string;
	color: string;
	svgPath: string;
}

/**
 * Retro neon software-development icon set.
 *
 * Each `svgPath` is a self-contained fragment for a 24x24 viewBox using explicit
 * fills/strokes (never `currentColor`) so the artwork stays colourful regardless
 * of the inherited text colour. Imagery only — no text elements.
 */
export const DEV_THEME_SYMBOLS: readonly ThemeSymbol[] = [
	{
		id: 'terminal',
		name: 'Terminal',
		color: '#00ff9f',
		svgPath: `
			<rect x="2" y="3.5" width="20" height="17" rx="2.5" fill="#0a1622" stroke="#00ff9f" stroke-width="1.5"/>
			<path d="M2 8.2h20" stroke="#00ff9f" stroke-width="1.4"/>
			<circle cx="5.2" cy="5.9" r="0.95" fill="#ff5f56"/>
			<circle cx="8.1" cy="5.9" r="0.95" fill="#ffbd2e"/>
			<circle cx="11" cy="5.9" r="0.95" fill="#27c93f"/>
			<path d="M5.6 11.6l3.1 2.6-3.1 2.6" fill="none" stroke="#00ff9f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M11.6 16.8h6.6" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
		`,
	},
	{
		id: 'code',
		name: 'Code Brackets',
		color: '#00f0ff',
		svgPath: `
			<rect x="1.8" y="3" width="20.4" height="18" rx="3" fill="#101a2b" stroke="#00f0ff" stroke-width="1.4"/>
			<path d="M8.4 8.4L5.2 12l3.2 3.6" fill="none" stroke="#00f0ff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M15.6 8.4L18.8 12l-3.2 3.6" fill="none" stroke="#ff79c6" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M13.3 7.2l-2.6 9.6" stroke="#ffe600" stroke-width="1.9" stroke-linecap="round"/>
		`,
	},
	{
		id: 'git-branch',
		name: 'Git Branch',
		color: '#ff79c6',
		svgPath: `
			<path d="M7 8.1v7.8" stroke="#ff79c6" stroke-width="2.1" stroke-linecap="round"/>
			<path d="M17 9.2v1.1a4.2 4.2 0 01-4.2 4.2H9.4" fill="none" stroke="#ff79c6" stroke-width="2.1" stroke-linecap="round"/>
			<circle cx="7" cy="5.4" r="2.7" fill="#1b1030" stroke="#00ff9f" stroke-width="1.8"/>
			<circle cx="7" cy="18.6" r="2.7" fill="#1b1030" stroke="#00ff9f" stroke-width="1.8"/>
			<circle cx="17" cy="6.5" r="2.7" fill="#1b1030" stroke="#ffe600" stroke-width="1.8"/>
		`,
	},
	{
		id: 'database',
		name: 'Database',
		color: '#ffb86c',
		svgPath: `
			<path d="M4 10.8v4.9c0 1.7 3.6 3.1 8 3.1s8-1.4 8-3.1v-4.9z" fill="#c9763a"/>
			<ellipse cx="12" cy="10.8" rx="8" ry="3.1" fill="#ffb86c"/>
			<path d="M4 5.6v4.9c0 1.7 3.6 3.1 8 3.1s8-1.4 8-3.1V5.6z" fill="#c9763a"/>
			<ellipse cx="12" cy="5.6" rx="8" ry="3.1" fill="#ffb86c"/>
			<ellipse cx="12" cy="5.6" rx="8" ry="3.1" fill="none" stroke="#ffe0b8" stroke-width="0.9"/>
			<circle cx="16.9" cy="9.4" r="0.75" fill="#00ff9f"/>
			<circle cx="16.9" cy="14.6" r="0.75" fill="#00ff9f"/>
		`,
	},
	{
		id: 'cpu',
		name: 'Processor',
		color: '#bd93f9',
		svgPath: `
			<path d="M9 2.4v3.8M12 2.4v3.8M15 2.4v3.8M9 17.8v3.8M12 17.8v3.8M15 17.8v3.8M2.4 9h3.8M2.4 12h3.8M2.4 15h3.8M17.8 9h3.8M17.8 12h3.8M17.8 15h3.8" stroke="#00f0ff" stroke-width="1.6" stroke-linecap="round"/>
			<rect x="5.8" y="5.8" width="12.4" height="12.4" rx="1.8" fill="#2a1f47" stroke="#bd93f9" stroke-width="1.7"/>
			<rect x="9.3" y="9.3" width="5.4" height="5.4" rx="1" fill="#bd93f9"/>
			<rect x="10.9" y="10.9" width="2.2" height="2.2" rx="0.4" fill="#f0e6ff"/>
		`,
	},
	{
		id: 'bug',
		name: 'Bug',
		color: '#ff5555',
		svgPath: `
			<path d="M9.4 5.1l1.6 2.3M14.6 5.1l-1.6 2.3" stroke="#ff8c8c" stroke-width="1.7" stroke-linecap="round"/>
			<path d="M6.9 10.6H3.4M6.9 14.2H3.1M7.4 17.6l-2.9 2.2M17.1 10.6h3.5M17.1 14.2h3.8M16.6 17.6l2.9 2.2" stroke="#ff8c8c" stroke-width="1.6" stroke-linecap="round"/>
			<rect x="6.9" y="7.2" width="10.2" height="12.4" rx="5.1" fill="#ff5555"/>
			<path d="M12 8.4v10.4" stroke="#8f1f2b" stroke-width="1.3"/>
			<circle cx="9.9" cy="10.6" r="1.05" fill="#12060a"/>
			<circle cx="14.1" cy="10.6" r="1.05" fill="#12060a"/>
			<circle cx="10.2" cy="14.6" r="0.85" fill="#ffd0d0"/>
			<circle cx="13.8" cy="16.4" r="0.85" fill="#ffd0d0"/>
		`,
	},
	{
		id: 'rocket',
		name: 'Rocket',
		color: '#ffe600',
		svgPath: `
			<path d="M8.1 12.6L4.4 16.3l3.3.6.9-2.6zM15.9 12.6l3.7 3.7-3.3.6-.9-2.6z" fill="#ff5555"/>
			<path d="M12 1.9c2.9 2.4 4.6 5.9 4.6 9.5 0 2.3-.6 4.2-1.6 5.6H9c-1-1.4-1.6-3.3-1.6-5.6 0-3.6 1.7-7.1 4.6-9.5z" fill="#e6edf7"/>
			<path d="M12 1.9c2.9 2.4 4.6 5.9 4.6 9.5 0 2.3-.6 4.2-1.6 5.6H12z" fill="#aab8cc"/>
			<circle cx="12" cy="9.3" r="2.1" fill="#00f0ff" stroke="#0a1622" stroke-width="0.9"/>
			<path d="M10.1 17.9h3.8L12 22.4z" fill="#ffb86c"/>
			<path d="M11.2 17.9h1.6L12 20.9z" fill="#ffe600"/>
		`,
	},
	{
		id: 'shield',
		name: 'Shield',
		color: '#50fa7b',
		svgPath: `
			<path d="M12 2.1l8.2 3.1v6.3c0 5.4-4.3 9.1-8.2 10.4-3.9-1.3-8.2-5-8.2-10.4V5.2z" fill="#0d3b2a" stroke="#50fa7b" stroke-width="1.6"/>
			<path d="M12 2.1l8.2 3.1v6.3c0 5.4-4.3 9.1-8.2 10.4z" fill="#14543b"/>
			<path d="M8.3 12.1l2.7 2.7 4.8-5.1" fill="none" stroke="#50fa7b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
		`,
	},
	{
		id: 'keyboard',
		name: 'Keyboard',
		color: '#8be9fd',
		svgPath: `
			<rect x="2" y="6.5" width="20" height="12" rx="2" fill="#0f2233" stroke="#8be9fd" stroke-width="1.5"/>
			<rect x="4.4" y="9" width="2.4" height="2.4" rx="0.5" fill="#8be9fd"/>
			<rect x="7.8" y="9" width="2.4" height="2.4" rx="0.5" fill="#8be9fd"/>
			<rect x="11.2" y="9" width="2.4" height="2.4" rx="0.5" fill="#8be9fd"/>
			<rect x="14.6" y="9" width="2.4" height="2.4" rx="0.5" fill="#8be9fd"/>
			<rect x="18" y="9" width="1.6" height="2.4" rx="0.5" fill="#8be9fd"/>
			<rect x="4.4" y="12.4" width="2.4" height="2.4" rx="0.5" fill="#54c6de"/>
			<rect x="7.8" y="12.4" width="2.4" height="2.4" rx="0.5" fill="#54c6de"/>
			<rect x="11.2" y="12.4" width="2.4" height="2.4" rx="0.5" fill="#54c6de"/>
			<rect x="14.6" y="12.4" width="2.4" height="2.4" rx="0.5" fill="#54c6de"/>
			<rect x="18" y="12.4" width="1.6" height="2.4" rx="0.5" fill="#54c6de"/>
			<rect x="7.8" y="15.8" width="8.4" height="1.9" rx="0.6" fill="#8be9fd"/>
		`,
	},
	{
		id: 'monitor',
		name: 'Monitor',
		color: '#ff9f1c',
		svgPath: `
			<rect x="2.4" y="3.4" width="19.2" height="13" rx="1.8" fill="#241407" stroke="#ff9f1c" stroke-width="1.6"/>
			<rect x="4.4" y="5.4" width="15.2" height="9" rx="0.8" fill="#3a230d"/>
			<path d="M6.4 8.4l3 2.1-3 2.1M11 12.4h4.6" stroke="#ff9f1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M9.6 16.4h4.8v3h-4.8z" fill="#ff9f1c"/>
			<path d="M7 21h10" stroke="#ff9f1c" stroke-width="1.8" stroke-linecap="round"/>
		`,
	},
	{
		id: 'folder',
		name: 'Folder',
		color: '#ffd60a',
		svgPath: `
			<path d="M2.5 7.6c0-1 .8-1.8 1.8-1.8h5l2 2.4h8.4c1 0 1.8.8 1.8 1.8v8.6c0 1-.8 1.8-1.8 1.8H4.3c-1 0-1.8-.8-1.8-1.8z" fill="#b5860a"/>
			<path d="M2.5 9.4c0-1 .8-1.8 1.8-1.8h15.4c1 0 1.8.8 1.8 1.8v8.2c0 1-.8 1.8-1.8 1.8H4.3c-1 0-1.8-.8-1.8-1.8z" fill="#ffd60a"/>
		`,
	},
	{
		id: 'cloud',
		name: 'Cloud',
		color: '#a0e7ff',
		svgPath: `
			<path d="M7.2 17.4a4.1 4.1 0 01-.5-8.2 5.4 5.4 0 0110.4-1.5 3.9 3.9 0 014.2 3.9 3.9 3.9 0 01-3.9 3.9H7.4z" fill="#134559" stroke="#a0e7ff" stroke-width="1.5"/>
			<path d="M7.4 17.4a3.2 3.2 0 01-.4-6.4 4.5 4.5 0 018.7-1.5 3.2 3.2 0 013.5 3.2 3.2 3.2 0 01-3.2 3.2z" fill="#a0e7ff"/>
		`,
	},
	{
		id: 'network',
		name: 'Network',
		color: '#7bffb0',
		svgPath: `
			<circle cx="12" cy="4.6" r="2.3" fill="#0d3324" stroke="#7bffb0" stroke-width="1.4"/>
			<circle cx="4.8" cy="18.4" r="2.3" fill="#0d3324" stroke="#7bffb0" stroke-width="1.4"/>
			<circle cx="19.2" cy="18.4" r="2.3" fill="#0d3324" stroke="#7bffb0" stroke-width="1.4"/>
			<path d="M12 6.9v5.4M12 12.3l-7.2 4.2M12 12.3l7.2 4.2" fill="none" stroke="#7bffb0" stroke-width="1.6" stroke-linecap="round"/>
			<circle cx="12" cy="4.6" r="1" fill="#7bffb0"/>
			<circle cx="4.8" cy="18.4" r="1" fill="#7bffb0"/>
			<circle cx="19.2" cy="18.4" r="1" fill="#7bffb0"/>
		`,
	},
	{
		id: 'lock',
		name: 'Lock',
		color: '#ff6ec7',
		svgPath: `
			<path d="M7.4 10.2V7.6a4.6 4.6 0 019.2 0v2.6" fill="none" stroke="#ff6ec7" stroke-width="1.9" stroke-linecap="round"/>
			<rect x="5.2" y="10.2" width="13.6" height="10.6" rx="2.2" fill="#3a0f2b" stroke="#ff6ec7" stroke-width="1.6"/>
			<circle cx="12" cy="14.6" r="1.6" fill="#ff6ec7"/>
			<path d="M12 16.2v2.3" stroke="#3a0f2b" stroke-width="1.4" stroke-linecap="round"/>
		`,
	},
	{
		id: 'mouse',
		name: 'Mouse',
		color: '#c792ea',
		svgPath: `
			<path d="M12 3.4c-3.6 0-6.4 3-6.4 6.7v3.8c0 3.7 2.8 6.7 6.4 6.7s6.4-3 6.4-6.7v-3.8c0-3.7-2.8-6.7-6.4-6.7z" fill="#2a1440" stroke="#c792ea" stroke-width="1.6"/>
			<path d="M12 3.4v6.6" stroke="#c792ea" stroke-width="1.6" stroke-linecap="round"/>
			<rect x="10.7" y="6.5" width="2.6" height="4.4" rx="1.3" fill="#c792ea"/>
		`,
	},
	{
		id: 'server',
		name: 'Server',
		color: '#5ce1e6',
		svgPath: `
			<rect x="3.2" y="3.8" width="17.6" height="6.2" rx="1.4" fill="#0c2a2e" stroke="#5ce1e6" stroke-width="1.5"/>
			<rect x="3.2" y="14" width="17.6" height="6.2" rx="1.4" fill="#0c2a2e" stroke="#5ce1e6" stroke-width="1.5"/>
			<circle cx="6.4" cy="6.9" r="1" fill="#5ce1e6"/>
			<circle cx="6.4" cy="17.1" r="1" fill="#5ce1e6"/>
			<path d="M10 6.9h8M10 17.1h8" stroke="#5ce1e6" stroke-width="1.3" stroke-linecap="round"/>
		`,
	},
] as const;

export function getThemeSymbols(theme: Theme = 'software-dev'): readonly ThemeSymbol[] {
	switch (theme) {
		case 'software-dev':
		default:
			return DEV_THEME_SYMBOLS;
	}
}

export function getThemeSymbolIds(theme: Theme = 'software-dev'): string[] {
	return getThemeSymbols(theme).map((symbol) => symbol.id);
}
