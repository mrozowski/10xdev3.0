# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Use :global() for CSS Reaching Outside Component Scope

- **Context**: Astro component/global CSS styling (e.g. Memory Cards game and shared layout components)
- **Problem**: CSS changes scoped to an Astro component don't apply because Astro scopes <style> blocks per-component by default; this happened twice, most recently in the last session, requiring the styles to be marked :global to take effect.
- **Rule**: When a CSS change targets elements rendered outside the component's own template (e.g. via slots, dynamically injected markup, or shared/child markup), use Astro's :global() selector or a global stylesheet — plain scoped <style> rules will not apply.
- **Applies to**: implement
