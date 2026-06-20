# Jewel Scrollytelling Redesign — Design

**Date:** 2026-06-19
**Status:** approved-for-spec-review
**Scope:** `frontend/` (Home jewel: geometry, scroll mechanism, story layout, copy)
**Supersedes:** the positioning/anchor approach in `2026-06-19-jewel-narrative-design.md`. Keeps that
spec's labels, copy direction, and chapter wiring; replaces "anchor-right dash" with a scroll-scrubbed
timeline and adds real per-chapter geometry + a restructured story layout.

## Problem

The first jewel pass (branch `jewel-narrative-session-2`) added anchor + labels + copy, but on dev the
gem still "looks identical" and the page never restructured. Two root causes, both confirmed:

1. **The forms don't change visibly.** The four costumes are too similar (hero `ico` and `crown` share
   the same icosahedron — start ≈ end), too small (≈0.52 in the margin), and the crossfade flashes by.
2. **No real choreography or coupling.** The gem free-floats as a fixed overlay toward the nearest
   chapter (the "dash" engine), which leaves it in awkward mid-positions, and the page content was never
   structured around it.

The user wants the gem to be the **focus**, transforming through a clear story as a **clean
animation step-to-step that never lands in an ugly position** — without scroll-jacking (the wheel must
stay native and comfortable).

## Approved decisions (2026-06-19)

- **Forms** (silhouettes approved): rough **stone** (ch1), **neural lattice** (ch2, new), ascending
  **columns** (ch3, keep `growth`), faceted **crown** (ch4, new — a real crown, not the gold ball).
- **Narrative arc**: 1 **The promise** → 2 **The shape of the promise** → 3 **The metrics** →
  4 **The result**. Content aligned to each gem form.
- **Choreography**: gem anchored **right** beside copy for beats 1–2 (setup), then **migrates to
  center stage** for beats 3–4 (climax), growing in scale toward the crown.
- **Beat 3 layout flipped**: text on **top**, the columns gem on the **bottom**, so scrolling down
  grows the columns up and completes the morph.
- **Scroll mechanism**: **sticky-scrub scrollytelling, no snap.** A tall story track with a
  `position: sticky` stage; the gem's pose is a smooth function of scroll progress through the track.
  Native wheel, no interception, no forced snap. Every scroll position maps to a designed frame on the
  timeline, so the gem is never in an ugly in-between.

## Build techniques (researched)

- **Neural lattice** (new): one `InstancedMesh` of ~12 small spheres at procedural points on a sphere
  shell (gold) + one `LineSegments` edge buffer connecting node pairs (crimson) = 2 draw calls, all
  procedural. Wrapped in a `Group`.
- **Crown** (new): a `Group` — band via `LatheGeometry`/open `CylinderGeometry`; spikes via radial
  `ConeGeometry` or `ExtrudeGeometry` from a `THREE.Shape` (moveTo/lineTo, beveled facets); small
  crimson sphere "set jewels" at the tips. `flatShading: true`; keep the existing emissive-pulse
  material on the band.
- **Stone** (tweak `ico`): displace a non-indexed `IcosahedronGeometry` with deterministic per-vertex
  noise (no `Math.random` — stable across loads, same pattern as the existing `growth` build),
  `flatShading`.
- **Columns** (keep `growth`): existing geometry; just larger and scroll-driven.

Sources: three.js docs (InstancedMesh, ExtrudeGeometry, LatheGeometry), Tom Sawyer graph-viz pattern
(InstancedMesh nodes + LineSegments edges).

## Architecture

### A. The scroll timeline (replaces the dash engine)

A pure resolver maps **scroll progress** to a fully-interpolated gem pose, so the gem is always on its
designed path.

- **`storyTimeline.ts`** (new, pure, TDD): a `STOPS` array of 4 keyframes (one per beat) carrying
  `{ x, y, s, shape, spin, p }` in the existing viewport-fraction space, plus mobile variants. Export
  `resolvePose(progress: number): Pose` that finds the surrounding two stops for `progress ∈ [0,1]`
  and linearly interpolates position/scale/spin/particle, and computes per-shape crossfade **weights**
  as a function of progress (so the morph scrubs continuously with scroll — readable, never a flash).
  This replaces `chapterResolver.resolveChapter` for Home. The fraction↔world helpers in
  `chapterResolver.ts` are reused unchanged.
- The 4 stops encode the approved choreography: beats 1–2 anchored right (x≈0.78), beat 3 drifting to
  center + larger, beat 4 centered + largest + crown glow (p high). Sizes bumped well above the current
  0.45–0.52 so the forms read (hero ≈ 1.1, climax crown ≈ 1.4 — final values tuned on dev screenshots).

### B. Sticky story structure (HomePage)

- The four Home story sections become one **story track**: a tall container (≈`400vh`) whose direct
  child is a `position: sticky; top: 0; height: 100vh` **stage**. Scrolling the 400vh scrubs the
  timeline; the sticky stage keeps the gem + active text in view the whole way.
- **Scroll progress** = how far the track has scrolled through the viewport, from the track's
  `getBoundingClientRect()` (0 when the track top hits the viewport top, 1 when its bottom reaches the
  viewport bottom). Computed in a passive scroll listener / rAF, written to a ref (no per-frame React
  state).
- **Text beats**: a `StoryBeat` overlay in the sticky stage shows the active beat's copy; beats
  crossfade as progress crosses their thresholds (reduced-motion: instant). Beat layout per the
  choreography — beats 1–2 text-left, beat 3 text-top/gem-bottom, beat 4 centered. The gold chapter
  label (from the prior pass) rides along, naming the form.
- The jewel `<Canvas>` stays a transparent overlay but is now positioned within / tracked to the sticky
  stage so it pins with it; its pose is driven by `resolvePose(progress)` instead of the dash loop.

### C. JewelRig — drive pose from progress

`JewelRig`'s `useFrame` reads the `progress` ref and calls `resolvePose(progress)` to set position,
scale, spin, particles, and shape-crossfade weights directly (still no React state in the loop). The
existing drag/tap interaction, dust, and tilt stay. The "nearest-chapter dash" math (and
`resolveChapter` for Home) is removed; `onChapterChange` now fires when the progress-derived active beat
changes (drives the label).

### D. Geometry (shapes.ts)

Build the four costumes above. Widen `BuiltShape.mesh` to `THREE.Object3D` (crown/neural are `Group`s).
Expose a primary material per costume for the rig (crown band material keeps the emissive pulse). Add
`'neural'` to `ShapeName`/`SHAPE_NAMES`; the story uses `ico`(stone)/`neural`/`growth`/`crown`. The
unused prototype costumes (`octa`, `sphere`, `knot`) may remain (out of scope) — but the story no longer
references `knot`.

## Copy

Keep the journey copy from the prior pass; retitle the chapter labels to the arc beats:
Raw stone · The model · **The metrics** · Transformed (EN), with ES equivalents. Section copy already
matches promise → model → results → result.

## Reduced motion / accessibility

- Reduced-motion: the sticky stage still works (native scroll); the gem **snaps to the nearest beat's
  pose** rather than scrubbing continuously, and text beats swap instantly. No auto-spin, no morph
  scrub. Drag remains (user-initiated).
- The story track must remain navigable by keyboard and not trap focus; sticky is CSS-only (no wheel
  interception). Content remains in the DOM and selectable.
- Mobile: the sticky-scrub still applies but with mobile pose variants (gem smaller, centered-high);
  verify the gem never overlaps text at any breakpoint.

## Testing (Vitest)

- `storyTimeline.resolvePose`: at progress 0 → beat-1 pose (stone dominant, anchored right); at 1 →
  beat-4 pose (crown dominant, centered, largest); at a midpoint → interpolated position between the
  surrounding stops and blended crossfade weights summing sensibly; mobile vs desktop variants differ.
- Active-beat derivation: progress→beat index is monotonic and emits on change only (reuse the
  `chapterChanged` helper pattern).
- `shapes.ts`: `buildShapes()` returns all costumes including `neural` and `crown` as non-empty
  `Object3D`s; stone displacement is deterministic (two builds → identical positions); `SHAPE_NAMES`
  includes `neural`.
- Route smoke tests stay green (JewelScene mocked); `tsc --noEmit` clean.
- Visual verification on `dev.la-realeza.com` is REQUIRED for this feature (geometry + scroll feel can't
  be unit-tested): confirm each form reads, the side→center migration is clean, the wheel feels native
  (no jacking), and reduced-motion degrades gracefully.

## Out of scope (separate)

- 2D page-motion de-chonk (`useMotion` adoption + base spring tuning) — still its own session.
- Visual-system discipline (Section primitive, spacing/width tokens, legacy `royal`/`yellow`) — separate.
- Other pages' `FieldAccent` and the chatbot orb — untouched.
- Removing unused prototype costumes (`octa`/`sphere`/`knot`) — leave for now.

## Risk note

This is the largest jewel change yet: it replaces the scroll-positioning engine (free-float dash →
sticky-scrub timeline), adds two real geometries, and restructures the Home story DOM. Expect multiple
dev-deploy/screenshot iterations on the geometry silhouettes and the scroll feel. The plan should
sequence geometry first (independently visible), then the timeline resolver (TDD), then the sticky DOM
restructure + rig wiring, so each stage is testable/previewable on its own.
