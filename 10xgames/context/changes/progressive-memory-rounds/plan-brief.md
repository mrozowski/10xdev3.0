# Progressive Memory Cards Round Difficulty — Plan Brief

> Full plan: `context/changes/progressive-memory-rounds/plan.md`
> Research: `context/changes/progressive-memory-rounds/research.md`

## What & Why

Extend the current single-round Memory Cards game into a 5-round progression: round 1 keeps today's 8-pair board with its 3-second preview reveal, rounds 2-5 skip the preview and get progressively harder (10, 12, 14, 16 pairs). This delivers roadmap slice S-03 and PRD requirement FR-008/US-03 — players advancing through increasingly difficult rounds is a must-have gameplay loop, not an optional mode.

## Starting Point

Today the game is single-round only: `engine.ts` (pure state machine) always builds a fixed 8-pair board and ends at `'completed'`/`'time_up'` with no continuation; `MemoryGame.astro` offers only "PLAY AGAIN" (full restart). Only 8 theme symbols exist, and the grid is hardcoded to 4 columns in a 520px-max-width wrapper — both are hard blockers for reaching a 16-pair round.

## Desired End State

A player completes round 1, sees "NEXT ROUND", and continues through rounds 2-5 with their score carrying over and a visible "ROUND N/5" indicator. Finishing round 5, or running out of time on any round, ends the session and saves exactly one cumulative score locally. The card grid (16 to 32 cards across the 5 rounds) stays playable on phones, tablets, and desktop.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Difficulty curve | 5 rounds, +2 pairs each: 8→10→12→14→16, preview only on round 1 | Gentle, predictable escalation the user chose over a steeper 3-round curve or endless scaling. |
| Symbol pool | Grow from 8 to 16 symbols | Matches the curve's max round exactly; only 8 exist today so round 5 would otherwise throw. |
| Grid strategy | JS-computed column count per pair count + narrow-viewport cap | Column count depends on two independent inputs (viewport width, pair count) that pure CSS breakpoints can't express cleanly. |
| Round timer | Flat 60s every round | User chose simplicity over scaling the timer with pair count. |
| Loss handling | Time-up always ends the session immediately | User chose this over allowing a retry-same-round or "continue anyway" model. |
| Score persistence | One cumulative score saved at session end, with a new optional `roundsCompleted` field | User chose a single end-of-session save over saving after every round. |

## Scope

**In scope:** 5-round difficulty curve, round HUD indicator, round-complete vs. session-end modal flows, responsive grid columns, symbol pool expansion, `roundsCompleted` score field.

**Out of scope:** 6+ rounds or endless scaling, per-round score entries, retry-same-round-on-loss, new sound effects, the animals theme (separate S-04 change), device-based pair-count capping.

## Architecture / Approach

The existing engine/UI split is preserved: all round-progression logic (curve data, score carry-over, round-complete vs. final-completion branching) lives in the pure `engine.ts` state machine as a new `startRound()` transition; `MemoryGame.astro` only orchestrates DOM rendering, timers, and which of the three end-state modals (round-complete, victory, game-over) to show, reusing the existing single modal markup with a mode flag.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Engine round-progression model | `round_complete` status, `ROUND_DIFFICULTY` curve, `startRound()` | Getting score-carryover and round-complete-vs-final branching right at every boundary |
| 2. Theme symbol pool expansion | 8 new symbols (8→16 total) | New icons must stay visually distinct at small card sizes |
| 3. Score contract round tracking | Optional `roundsCompleted` field, backward-compatible | None significant — additive, optional field |
| 4. Game UI integration | Round HUD, next-round/victory/game-over flows, responsive grid | Grid must stay playable at 32 cards on narrow phones |

**Prerequisites:** S-01 (`first-memory-round`) is done and provides the engine/UI foundation this plan extends.
**Estimated effort:** ~4 sessions across 4 phases.

## Open Risks & Assumptions

- The 8 new theme symbol icons are hand-authored inline SVG (same as the existing 8) — visual quality depends on care taken during implementation, not a design handoff.
- Widening the game island from 520px to 640px changes visual proportions slightly on desktop; this is a minor, low-risk layout tweak validated via manual testing.

## Success Criteria (Summary)

- A player can play all 5 rounds end-to-end, seeing the round indicator and carried-over score throughout.
- Exactly one score entry is saved per session, correctly reflecting rounds completed on both a win and a mid-progression loss.
- The grid remains playable and tappable at every round's pair count on phone, tablet, and desktop widths.
