import {
	deleteScore,
	getScoresForGame,
	renameScore,
	type ScoreEntry,
} from './scores';

export type ManagedScoreListOptions = {
	gameId: string;
	gameLabel: string;
	listElement: HTMLElement;
	highlightId?: string;
	getMeta?: (score: ScoreEntry) => string;
};

function formatScoreDate(date: string): string {
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) {
		return 'Unknown date';
	}

	return parsed.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function createScoreRow(
	score: ScoreEntry,
	index: number,
	options: ManagedScoreListOptions,
): HTMLLIElement {
	const row = document.createElement('li');
	row.className = 'managed-score-row';
	row.dataset.scoreId = score.id;
	if (options.highlightId === score.id) {
		row.classList.add('newly-saved');
	}

	const details = document.createElement('div');
	details.className = 'managed-score-details';

	const primary = document.createElement('div');
	primary.className = 'managed-score-primary';

	const rank = document.createElement('span');
	rank.className = 'managed-score-rank';
	rank.textContent = `#${index + 1}`;

	const name = document.createElement('span');
	name.className = 'managed-score-name';
	name.textContent = score.name;

	const points = document.createElement('span');
	points.className = 'managed-score-points';
	points.textContent = `${score.score} pts`;

	primary.append(rank, name, points);

	const meta = document.createElement('div');
	meta.className = 'managed-score-meta';
	meta.textContent =
		options.getMeta?.(score) ??
		`Completed: ${score.roundsCompleted ?? 0} - ${formatScoreDate(score.date)}`;

	details.append(primary, meta);

	const actions = document.createElement('div');
	actions.className = 'managed-score-actions';

	const renameButton = document.createElement('button');
	renameButton.className = 'retro-btn compact-btn';
	renameButton.type = 'button';
	renameButton.textContent = 'RENAME';
	renameButton.setAttribute('aria-label', `Rename score for ${score.name}`);
	renameButton.addEventListener('click', () => renderRenameScoreRow(score, options));

	const deleteButton = document.createElement('button');
	deleteButton.className = 'retro-btn compact-btn danger-btn';
	deleteButton.type = 'button';
	deleteButton.textContent = 'DELETE';
	deleteButton.setAttribute('aria-label', `Delete score for ${score.name}`);
	deleteButton.addEventListener('click', () => {
		if (!window.confirm(`Delete ${score.name}'s ${options.gameLabel} score?`)) {
			return;
		}

		deleteScore(options.gameId, score.id);
		renderManagedScores(options);
	});

	actions.append(renameButton, deleteButton);
	row.append(details, actions);
	return row;
}

function renderRenameScoreRow(score: ScoreEntry, options: ManagedScoreListOptions): void {
	const rows = Array.from(options.listElement.querySelectorAll<HTMLLIElement>('.managed-score-row'));
	const row = rows.find((candidate) => candidate.dataset.scoreId === score.id);

	if (!row) {
		return;
	}

	row.replaceChildren();
	row.classList.add('editing');

	const label = document.createElement('label');
	label.className = 'managed-score-edit-label';
	label.textContent = 'Score label';

	const input = document.createElement('input');
	input.className = 'managed-score-input';
	input.type = 'text';
	input.maxLength = 24;
	input.value = score.name;
	input.setAttribute('aria-label', `New name for ${score.name}`);

	const actions = document.createElement('div');
	actions.className = 'managed-score-actions';

	const saveButton = document.createElement('button');
	saveButton.className = 'retro-btn compact-btn';
	saveButton.type = 'button';
	saveButton.textContent = 'SAVE';
	saveButton.addEventListener('click', () => {
		renameScore(options.gameId, score.id, input.value);
		renderManagedScores({ ...options, highlightId: score.id });
	});

	const cancelButton = document.createElement('button');
	cancelButton.className = 'retro-btn compact-btn secondary-action-btn';
	cancelButton.type = 'button';
	cancelButton.textContent = 'CANCEL';
	cancelButton.addEventListener('click', () => renderManagedScores(options));

	actions.append(saveButton, cancelButton);
	row.append(label, input, actions);
	input.focus();
	input.select();
}

export function renderManagedScores(options: ManagedScoreListOptions): void {
	options.listElement.replaceChildren();
	const scores = getScoresForGame(options.gameId);

	if (scores.length === 0) {
		const emptyState = document.createElement('li');
		emptyState.className = 'managed-score-empty';
		emptyState.textContent = `No ${options.gameLabel} scores yet.`;
		options.listElement.appendChild(emptyState);
		return;
	}

	scores.forEach((score, index) => {
		options.listElement.appendChild(createScoreRow(score, index, options));
	});
}
