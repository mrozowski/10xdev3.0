import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	playSound,
	setAudioMuted,
	isSoundActive,
	getOrCreateAudioContext,
	resetAudioContextForTesting,
} from './sound';
import { setSoundEnabled } from './preferences';

describe('Sound Synthesizer', () => {
	beforeEach(() => {
		setAudioMuted(null);
		resetAudioContextForTesting();
		localStorage.clear();
	});

	afterEach(() => {
		setAudioMuted(null);
		resetAudioContextForTesting();
		vi.restoreAllMocks();
	});

	it('respects soundEnabled preference', () => {
		setSoundEnabled(true);
		expect(isSoundActive()).toBe(true);

		setSoundEnabled(false);
		expect(isSoundActive()).toBe(false);
	});

	it('respects setAudioMuted overrides', () => {
		setSoundEnabled(true);
		setAudioMuted(true);
		expect(isSoundActive()).toBe(false);

		setAudioMuted(false);
		expect(isSoundActive()).toBe(true);

		setAudioMuted(null);
		expect(isSoundActive()).toBe(true);
	});

	it('handles playSound safely without throwing when AudioContext is unavailable', () => {
		expect(() => {
			playSound('flip');
			playSound('match');
			playSound('mismatch');
			playSound('tick');
			playSound('victory');
			playSound('gameover');
		}).not.toThrow();
	});

	it('creates oscillator nodes when mock AudioContext is running', () => {
		const createdOscs: unknown[] = [];
		const createdGains: unknown[] = [];

		class MockAudioContext {
			state = 'running';
			currentTime = 10;
			destination = {};
			createOscillator = vi.fn(() => {
				const osc = {
					type: 'square',
					frequency: {
						setValueAtTime: vi.fn(),
						exponentialRampToValueAtTime: vi.fn(),
					},
					connect: vi.fn(),
					start: vi.fn(),
					stop: vi.fn(),
				};
				createdOscs.push(osc);
				return osc;
			});
			createGain = vi.fn(() => {
				const gain = {
					gain: {
						setValueAtTime: vi.fn(),
						exponentialRampToValueAtTime: vi.fn(),
					},
					connect: vi.fn(),
				};
				createdGains.push(gain);
				return gain;
			});
			resume = vi.fn().mockResolvedValue(undefined);
		}

		vi.stubGlobal('AudioContext', MockAudioContext);

		setSoundEnabled(true);
		playSound('flip');

		const ctx = getOrCreateAudioContext();
		expect(ctx).toBeDefined();
		expect(createdOscs.length).toBeGreaterThan(0);
		expect(createdGains.length).toBeGreaterThan(0);
	});
});
