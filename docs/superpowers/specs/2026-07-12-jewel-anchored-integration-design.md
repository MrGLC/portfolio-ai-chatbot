# Jewel Anchored Integration (engine v3) — Design

**Date:** 2026-07-12
**Status:** approved (storyboard + crown placement approved by Luis in visual session)
**Scope:** `frontend/` — Home page jewel engine, section layouts, chatbot state bridge
**Supersedes:** the viewport-normalized choreography of `storyTimeline.ts` (engine v2). Builds on 2026-06-19-jewel-narrative-design.md (the stone→neural→growth→crown story and shapes stay exactly as they are).

## Problem

The v2 jewel is a full-viewport `position:fixed` transparent canvas floating at z5 ABOVE all
content, with poses defined in normalized viewport coordinates (`STOPS` in `storyTimeline.ts`).
Sections never reserve space for it. Result (Luis, 2026-07-12): "un solo elemento ahí flotando
todo feo, no hay cohesión, se siente flotante y con poca resolución."

Two distinct defects:
1. **No cohesion** — the gem lives in viewport space, not page space. Structural, not tunable.
2. **Cheap/flat look** — perceived "low resolution" is material/lighting quality (no environment
   map → flat highlights), not pixel density (dpr is already [1,2] + antialias on desktop).

The story itself is approved and untouched: raw stone → the model → the results → the crown.

## Approved storyboard (visual session 2026-07-12)

Hybrid: **anchored per section, animated flights between sections.**

| Beat | Section id | Shape | Anchor lives in | Behavior |
|---|---|---|---|---|
| 1 | `story-hero` | `ico` (stone) | Hero right column | As today — approved as-is. |
| 2 | `story-chatbot` | `neural` | Chat card, slot beside messages | Gem docks INTO the chat and "powers" it: pulse states tied to real chat activity. |
| 3 | `story-portfolio` | `growth` | One slot per project card | Gem splits into N mini growth-charts, one embedded per card; each grows when its card enters viewport. |
| 4 | `story-cta` | `crown` | Reserved slot ABOVE the CTA title | Crown docks in its own layout row — title, copy and buttons below. Never overlaps content (approved option A). |

Flights: on focus change the gem shrinks/morphs and glides to the next anchor (existing maath
damp easing). Beat 2→3 is a split (one → N); beat 3→4 is a converge (N → one → crown).

## Components

### 1. Anchor system — `useJewelAnchors` (new hook) + `data-jewel-anchor` slots
- Each beat section renders an invisible, layout-reserving `<div data-jewel-anchor="hero|chat|project-<i>|cta">`.
- The hook discovers anchors by attribute, measures `getBoundingClientRect()` on scroll/resize
  (rAF-throttled, passive listeners; no setState in the frame loop — same discipline as the
  existing hit proxy), and exposes current rects in canvas CSS px.
- `JewelRig` converts the active anchor rect → NDC pose (x, y, scale-to-fit-rect) and damps
  toward it. `storyTimeline.ts`'s role shrinks to: beat boundaries, shape weights, spin/particle
  params per beat. Its normalized `x/y/s` STOPS die.
- The canvas stays ONE fixed transparent layer (that part of v2 works — flights need a shared
  surface). Cohesion comes from the gem always resting inside a real, space-reserving DOM box.

### 2. Chat power bridge — beat 2
- `ThreeJsChatbot` publishes its activity as a minimal shared store (module-level subscribe/
  emit pair, no new dependency): `'idle' | 'thinking' | 'answering'`.
- Docked gem modulation: idle = slow pulse (scale ±2%), thinking = fast pulse + emissive ramp,
  answering = brief flash then settle. Read inside the rig's frame loop from the store ref.
- Chat card visual: the anchor slot sits beside the message list; a subtle gold hairline
  connects slot to card border (CSS), so the dock reads as designed, not coincidental.

### 3. Multiply engine — beat 3
- New `GrowthInstances` component: `THREE.InstancedMesh` of the growth geometry, count = number
  of project cards visible in the home grid (3 today; read from the same source the grid maps over).
- Handoff choreography: entering beat 3, the hero gem damps to scale 0 at the first card's
  anchor while instances fade in at each card anchor (crossfade ≤300ms — reads as a split).
  Leaving beat 3 downward: instances converge (damp to the CTA-ward exit point) and the single
  gem takes over for the crown morph. Reverse scroll mirrors it.
- Per-instance growth: each instance's bar-heights scale 0→1 driven by its own card's viewport
  entry (IntersectionObserver per card, threshold ~0.4), NOT global scroll progress.

### 4. CTA layout — beat 4 (approved option A)
- `story-cta` section becomes a single column: `[crown slot (reserved height, ~180px desktop /
  ~120px mobile)] → [title] → [copy] → [buttons] → [BadgeCloud]`.
- The crown docks centered in the slot; particle bloom stays. Nothing ever underlaps it.

### 5. Quality pass (kills the "flat/cheap" read)
- `drei <Environment>` with a neutral studio preset (files bundled locally — CSP/self-host, no
  CDN fetch at runtime) + material upgrade to `MeshPhysicalMaterial` (metalness/roughness/
  clearcoat tuned per shape; gold facets should pick up real reflections).
- Soft contact shadow at docked anchors (drei `<ContactShadows>` scoped to dock poses, subtle).
- Keep perf profile tiers: env map + clearcoat only on `tier: 'full'`; `lite` keeps current
  materials.

### 6. Degradations
- **Reduced motion:** no flights. The gem renders statically AT each section's anchor as the
  user scrolls (per-section static pose swap; canvas absolute as today).
- **Mobile (<768px):** anchors stack above their section content (hero: below title; chat: top
  of card; projects: one shared chart above the grid instead of N instances; crown: same
  reserved slot, smaller). Multiply engine disabled on `lite` tier.
- **WebGL unavailable:** unchanged — error boundary renders nothing, layout slots collapse
  (`data-jewel-anchor` divs get zero height when the scene reports failure, so no dead gaps).

## Data flow

```
scroll/resize ──> useJewelAnchors (rect cache) ──┐
beat progress ──> storyTimeline (weights/spin) ──┼──> JewelRig frame loop ──> pose damp ──> gem
chat store    ──> power state (beat 2 only)   ───┘
card IO       ──> GrowthInstances bar heights (beat 3)
```

## Error handling

- Anchor missing (section not mounted yet — lazy HomePage): rig holds last pose; hook retries
  discovery on a 500ms timer until all anchors exist (same pattern as the story-hero IO attach).
- Anchor rect degenerate (zero size, display:none): treat as missing.
- Chat store never emits: gem stays in idle pulse — no coupling failure.

## Testing

- Unit (vitest): `useJewelAnchors` rect→pose math; chat store emit/subscribe; beat-boundary
  resolution with anchors mocked.
- Existing route smoke tests must stay green (JewelScene renders inside error boundary).
- Visual: dev-server screenshot pass per beat (desktop + 390px mobile) at each beat boundary —
  checklist: gem inside its anchor box, no overlap with text/buttons at any beat, crown slot
  clean, chat dock aligned.
- Perf: frame time spot-check with instances active (3 instanced draws — expected negligible);
  `lite` tier verified to skip env map + multiply.

## Non-goals

- No new shapes, no story/copy changes (v2 narrative content stays).
- No scrollytelling pinning (rejected option C).
- No backend changes.
- No new npm dependencies beyond what `@react-three/drei` already provides.
