---
change_id: local-score-replay
title: Local score naming and highlight on replay
status: implemented
created: 2026-09-01
updated: 2026-09-02
roadmap_ref: S-02
prd_refs: [FR-004, FR-007, US-02]
---

# Change: Local score naming and highlight on replay

## Summary

Adds an optional local-name-entry field to the existing victory/game-over modal, deferring `addScore()` until the player confirms, then highlights the newly saved entry in the TOP SCORES list. Builds on `local-score-contract` (F-01) and `first-memory-round` (S-01). "Return to the game list" is scoped out — no catalogue page exists yet (S-05 is a separate, still-proposed slice).

## Links

- Roadmap item: S-02 in `context/foundation/roadmap.md`
- Plan: `context/changes/local-score-replay/plan.md`
- Plan brief: `context/changes/local-score-replay/plan-brief.md`
