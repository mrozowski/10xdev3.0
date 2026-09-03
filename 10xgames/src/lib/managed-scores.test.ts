import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addScore, clearScoresForGame } from './scores';
import { renderManagedScores } from './managed-scores';

describe('renderManagedScores', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	it('renders the same empty state copy for any game label', () => {
		const list = document.createElement('ul');

		renderManagedScores({
			gameId: 'fruit-rush',
			gameLabel: 'Fruit Rush',
			listElement: list,
		});

		expect(list.textContent).toBe('No Fruit Rush scores yet.');
	});

	it('renders stored scores sorted by score and scoped to the requested game', () => {
		const list = document.createElement('ul');
		addScore({ gameId: 'fruit-rush', name: 'Low', score: 100 });
		addScore({ gameId: 'memory-cards', name: 'Memory', score: 999 });
		addScore({ gameId: 'fruit-rush', name: 'High', score: 300 });

		renderManagedScores({
			gameId: 'fruit-rush',
			gameLabel: 'Fruit Rush',
			listElement: list,
		});

		const rows = Array.from(list.querySelectorAll('.managed-score-row'));
		expect(rows).toHaveLength(2);
		expect(rows[0]?.textContent).toContain('#1High300 pts');
		expect(rows[1]?.textContent).toContain('#2Low100 pts');
		expect(list.textContent).not.toContain('Memory');
	});

	it('renames and deletes scores through the shared controls', () => {
		const list = document.createElement('ul');
		const [score] = addScore({ gameId: 'fruit-rush', name: 'Player', score: 200 });
		vi.spyOn(window, 'confirm').mockReturnValue(true);

		renderManagedScores({
			gameId: 'fruit-rush',
			gameLabel: 'Fruit Rush',
			listElement: list,
		});

		list.querySelector<HTMLButtonElement>('[aria-label="Rename score for Player"]')?.click();
		const input = list.querySelector<HTMLInputElement>('[aria-label="New name for Player"]');
		expect(input).not.toBeNull();
		if (!input || !score) {
			throw new Error('Expected a rendered score row');
		}
		input.value = 'Renamed';
		list.querySelector<HTMLButtonElement>('button')?.click();
		expect(list.textContent).toContain('Renamed');

		list.querySelector<HTMLButtonElement>('[aria-label="Delete score for Renamed"]')?.click();
		expect(list.textContent).toBe('No Fruit Rush scores yet.');

		clearScoresForGame(score.gameId);
	});
});
