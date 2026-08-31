import { getPreferences } from './preferences';

export type SoundEffect =
	| 'flip'
	| 'match'
	| 'mismatch'
	| 'tick'
	| 'victory'
	| 'gameover';

let audioCtx: AudioContext | null = null;
let isMutedOverride: boolean | null = null;

export function resetAudioContextForTesting(): void {
	audioCtx = null;
}

/**
 * Lazily initializes and returns the AudioContext.
 * Call this on a user gesture (pointerdown/click) to unlock browser audio.
 */
export function getOrCreateAudioContext(): AudioContext | null {
	if (typeof window === 'undefined') {
		return null;
	}

	const AudioContextClass =
		window.AudioContext ||
		(window as unknown as { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;

	if (!AudioContextClass) {
		return null;
	}

	if (!audioCtx) {
		try {
			audioCtx = new AudioContextClass();
		} catch {
			return null;
		}
	}

	if (audioCtx.state === 'suspended') {
		void audioCtx.resume().catch(() => {
			// Browser policy prevented resume
		});
	}

	return audioCtx;
}

/**
 * Initializes the audio context on user interaction.
 */
export function initAudioContext(): void {
	getOrCreateAudioContext();
}

/**
 * Overrides or resets the muted state in-memory (useful for testing or direct controls).
 */
export function setAudioMuted(muted: boolean | null): void {
	isMutedOverride = muted;
}

/**
 * Checks whether sound is enabled according to user preferences and overrides.
 */
export function isSoundActive(): boolean {
	if (isMutedOverride !== null) {
		return !isMutedOverride;
	}
	try {
		return getPreferences().soundEnabled;
	} catch {
		return true;
	}
}

/**
 * Helper to schedule a tone with an envelope.
 */
function scheduleTone(
	ctx: AudioContext,
	type: OscillatorType,
	freqStart: number,
	freqEnd: number,
	duration: number,
	startTime: number,
	gainPeak: number = 0.15,
): void {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = type;
	osc.frequency.setValueAtTime(freqStart, startTime);
	if (freqStart !== freqEnd) {
		osc.frequency.exponentialRampToValueAtTime(
			Math.max(1, freqEnd),
			startTime + duration,
		);
	}

	gain.gain.setValueAtTime(gainPeak, startTime);
	gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start(startTime);
	osc.stop(startTime + duration);
}

/**
 * Synthesizes 8-bit procedural retro sound effects without external audio files.
 */
export function playSound(effect: SoundEffect): void {
	if (!isSoundActive()) {
		return;
	}

	const ctx = getOrCreateAudioContext();
	if (!ctx || ctx.state !== 'running') {
		return;
	}

	const now = ctx.currentTime;

	switch (effect) {
		case 'flip':
			// Quick pitch sweep
			scheduleTone(ctx, 'triangle', 220, 580, 0.06, now, 0.12);
			break;

		case 'match':
			// Ascending 3-note retro chime (C5, E5, G5)
			scheduleTone(ctx, 'square', 523.25, 523.25, 0.08, now, 0.1);
			scheduleTone(ctx, 'square', 659.25, 659.25, 0.08, now + 0.07, 0.1);
			scheduleTone(ctx, 'square', 783.99, 783.99, 0.14, now + 0.14, 0.12);
			break;

		case 'mismatch':
			// Low double buzz
			scheduleTone(ctx, 'sawtooth', 140, 110, 0.08, now, 0.12);
			scheduleTone(ctx, 'sawtooth', 120, 90, 0.1, now + 0.09, 0.12);
			break;

		case 'tick':
			// Short high tick for preview countdown
			scheduleTone(ctx, 'triangle', 880, 880, 0.03, now, 0.08);
			break;

		case 'victory':
			// 4-note victory fanfare
			scheduleTone(ctx, 'square', 523.25, 523.25, 0.09, now, 0.12);
			scheduleTone(ctx, 'square', 659.25, 659.25, 0.09, now + 0.09, 0.12);
			scheduleTone(ctx, 'square', 783.99, 783.99, 0.09, now + 0.18, 0.12);
			scheduleTone(ctx, 'square', 1046.5, 1046.5, 0.28, now + 0.27, 0.15);
			break;

		case 'gameover':
			// Descending minor tones
			scheduleTone(ctx, 'sawtooth', 300, 260, 0.12, now, 0.12);
			scheduleTone(ctx, 'sawtooth', 240, 200, 0.12, now + 0.11, 0.12);
			scheduleTone(ctx, 'sawtooth', 180, 120, 0.25, now + 0.22, 0.14);
			break;
	}
}
