# Robustness Pass — Session 1 Design

**Date:** 2026-06-19
**Status:** approved-for-spec-review
**Scope:** `frontend/` (build directly, not via `frontend_iterations` — these are plumbing/infra, not visual experiments)

## Problem

The site looks fine (the elements are liked) but *feels* unserious to use: it behaves
"without intent, without limits — things break and don't even know they're breaking."
Concretely:

- **No app-level error boundary.** Any render crash = white screen of death, no message.
  Only `JewelScene` has a local boundary (for WebGL).
- **`Suspense fallback={null}`** on lazy routes → every navigation flashes blank. Reads as broken.
- **Contact form lies.** `handleSubmit` (ContactPage.tsx:158–168) validates fields, then
  `console.log(formData)` + `setSent(true)`. The message goes nowhere; the visitor sees a
  green "✓ sent". Silent break.
- **Chonky motion.** `prefers-reduced-motion` is honored *only* in the jewel (`usePerfProfile`).
  Page scroll/entrance animations (framer-motion) ignore it and feel overwrought.
- **Jewel layout shift.** The Three.js scene pops in and shifts surrounding layout on load.

The fix is **behavioral/experiential robustness**, not a visual restyle. Guiding principle:
*limits and graceful failure are code-enforced primitives, not conventions. Nothing breaks
silently; when it fails, it fails beautifully and explains why.*

## Approach

Approach C (hybrid): build only the primitives that directly serve today's worst pain, apply
them to fix the felt wounds, defer the broad visual-system discipline sweep to session 2.

## Primitives (new, in `frontend/src`)

### `components/feedback/ErrorState.tsx`
The beautiful, explained failure surface. Couture-styled (crimson/gold/cream tokens, Bodoni
heading). Props:
```ts
interface ErrorStateProps {
  title?: string;          // default: friendly headline
  message?: string;        // human "what happened"
  detail?: string;         // optional technical detail (collapsed/small)
  onRetry?: () => void;    // shows a retry button when provided
  homeHref?: string;       // shows a "back home" link when provided
}
```
Reused by `ErrorBoundary`, future data-error states, and 404. No raw error dumps to the user;
`detail` is optional and de-emphasized.

### `components/feedback/ErrorBoundary.tsx`
Class component (`getDerivedStateFromError` + `componentDidCatch`). Renders `ErrorState` on
catch with a retry that resets boundary state. Logs the error to console for the developer.
Placement:
- One wrapping the whole app (last-resort catch).
- One per route element, so a crash on one page doesn't blank the whole shell.

### `components/feedback/RouteFallback.tsx`
Replaces `Suspense fallback={null}`. A quiet branded loading skin (cream background, subtle
centered mark/spinner using existing tokens) sized to the viewport so navigation never flashes
blank. Must respect reduced-motion (no spinning if reduced).

### `theme/motion.ts`
Single source of truth for motion. Exports:
- duration/easing/spring tokens (lighter than current hand-rolled values — less "chonk").
- `useMotion()` hook returning the active motion config, auto-neutralized when
  `prefers-reduced-motion: reduce` (durations → ~0, transforms → opacity-only or none).

Pages stop hand-rolling framer-motion `transition`/`initial`/`animate` values and consume these.
This session: introduce the module + adopt it in the heaviest offenders (Home hero/entrance,
scroll-reveal blocks). Full adoption across every page can finish in session 2 if needed.

### `JewelFrame` (wrapper near `components/JewelScene` / Home usage)
Reserves the jewel's box via fixed aspect-ratio / min-height before the canvas mounts, so the
scene fading in cannot shift surrounding layout. Fade-in on ready.

## Wounds → fix mapping

| Wound | Fix |
|---|---|
| White screen on crash | `ErrorBoundary` (app + per-route) → `ErrorState` |
| Blank navigation flash | `RouteFallback` replaces `fallback={null}` |
| Lying contact form | mailto handoff + honest states (below) |
| Chonky page motion | `theme/motion.ts` + reduced-motion across pages |
| Jewel layout shift | `JewelFrame` reserves space |

## Contact form (ContactPage.tsx)

Replace the fake-success path. On valid submit:
1. Build a `mailto:ingbmluisgomez@gmail.com?subject=...&body=...` from `formData`
   (name/email/message), URL-encoded.
2. Open it (`window.location.href = mailtoUrl`), which launches the visitor's mail client with
   a pre-filled draft.
3. Show an **honest** state: "Opening your email app…" — not "✓ sent" (we can't confirm sending).
4. Always render a visible **direct fallback**: "Or email me directly at
   ingbmluisgomez@gmail.com" (a real `mailto:` link), so visitors with no configured mail
   client are never stranded.

Keep existing field validation. No backend, no third-party service this session.

## Out of scope (deferred to session 2)

- `<Section>` primitive (locks spacing + width rhythm).
- Spacing / container-width token unification (kill `1180/900/800/700/600px` drift).
- Removing legacy `royal` button variant, `royal-gradient`, `golden` shadow, `yellow.*`
  rainbow leftovers — the "lacks seriousness" visual cleanup.
- **`useMotion()` adoption across pages** (HomePage hero/scroll-reveals, ContactPage). The
  policy module ships this session but is NOT yet wired into any component — adoption moved
  to session 2 (decision 2026-06-19).
- **General motion de-chonk** — lightening the base springs/durations in `theme/animations.ts`
  so motion feels smoother for *all* users (the policy module only neutralizes for
  reduced-motion; it does not change the default feel).

## Session 1 closeout (2026-06-19)

Delivered: ErrorBoundary + ErrorState (white-screen → explained failure), RouteFallback
(no blank nav flash), honest mailto contact form (no fake "sent"), jewel fade-in mount, and
the `theme/motion.ts` policy module. Full suite 24/24, tsc clean.

Not delivered (deferred): motion adoption and general de-chonk above. The reduced-motion
goal is therefore only partially met — the policy exists but reduced-motion users still see
the un-gated page entrance/scroll animations until session 2 wires `useMotion()` in.

## Testing (Vitest, already configured)

- `ErrorBoundary`: a child that throws renders `ErrorState`; retry resets and re-renders child.
- `theme/motion.ts`: `useMotion()` returns neutral (near-zero duration / no transform) under
  mocked `prefers-reduced-motion: reduce`.
- Contact form: valid submit triggers a mailto navigation (assert the built URL) and shows the
  "opening your email app" state; invalid submit still blocks with field errors.
- Existing route tests still pass with `RouteFallback` in place.

## Risks / notes

- `window.location.href = mailto:` can be hard to assert in jsdom; abstract URL construction
  into a pure `buildMailto(formData)` function and unit-test that, trigger navigation separately.
- Per-route error boundaries must not break the `AnimatePresence mode="wait"` route transition;
  verify boundary wraps inside the route element, not around `Routes`.
