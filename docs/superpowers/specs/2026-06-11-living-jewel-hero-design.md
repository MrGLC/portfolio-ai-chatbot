# The Living Jewel — 3D Hero System Design

**Date:** 2026-06-11
**Repo:** portfolio-ai-chatbot
**Goal:** Replace the legacy Three.js layer with a professional, unique hero system: an interactive particle-field wallpaper behind a draggable jewel protagonist that is architected to morph through the site's story in later phases.

## Context

- Current 3D (written originally by Sonnet 3.5, perf-rescued in Phase 2): `RedJewelBackground` (site-wide fixed scene), `LightPattern` (Home accents), chatbot orb scene. Functional but visually cluttered; no narrative.
- Three working prototypes were built and screenshot-tested on the real hero (branch `phase2d-three-rework`, `/proto/:id` harness): Jewel (single gold-lit gem), Field (flowing particle current), Facets (interactive surface). Luis chose **Field + Jewel combined**, with this vision: *field is a mouse-interactive background wallpaper; the jewel sits in front, clickable/movable now, and will transform into things on scroll and interaction later.*
- Stack: React 18.3.1, three 0.184, @react-three/fiber 8.18, @react-three/drei 9.122, Chakra 2.10, `usePerfProfile` hook (tier/dpr/particleScale/animate), Vitest (8 tests green).
- Perf history: Phase 2 cut TBT 34s→~10s on the test rig. That gain is non-negotiable.

## Decisions

| Topic | Decision |
|---|---|
| Direction | Field (background wallpaper) + Jewel (foreground protagonist) |
| Interactivity now | Field parts around the cursor; jewel drag-rotates with inertia, tap pulses |
| Future story | Jewel morphs into shapes on scroll/section triggers — architecture must support this WITHOUT rework; actual scroll choreography is a later phase |
| Placement | Home hero: full scene. Other pages: `FieldAccent` (low-density field, no jewel, no pointer). Chatbot orb scene untouched. `LightPattern` and `RedJewelBackground` deleted. |
| Canvas count | ONE per page |
| Perf budget | All particle/displacement motion in shaders; ≤2 useFrame uniform-write hooks + jewel transform per frame; usePerfProfile gates everything |

## Architecture

### One Canvas, two layers (Home hero)

`src/components/JewelScene/index.tsx` renders the single `<Canvas>` (dpr/frameloop/antialias from `usePerfProfile`, alpha:false, bg #140306) containing:

1. **`FieldLayer.tsx`** (back, z<0) — evolved from ProtoField:
   - 3500 points (× particleScale → ~875 lite) in THREE.Points, custom ShaderMaterial
   - Vertex shader: curl-flow along a horizontal current (uTime), band in lower ~30% of frame
   - **Pointer interaction:** `uPointer` (world-space, lerped in useFrame) — particles within radius R get pushed radially with smooth falloff, return to flow when pointer leaves; implemented purely in the vertex shader
   - Fragment: soft sprites, deep red dominant, dim cream, ~10% gold, additive capped (rgb × 0.55, alpha ≤ 0.35)
   - Lite tier: pointer interaction disabled (uPointer strength 0)
2. **`JewelRig.tsx`** (front) — evolved from tuned ProtoJewel:
   - One icosahedron-based gem, meshPhysicalMaterial (ruby base, transmission 0.9, clearcoat, gold specular), `<Environment preset="city" />` on full tier / 3-light fallback on lite
   - Key/fill/rim lights (gold key upper-left, gold rim behind-right, red ambient)
   - Composition: gem at x≈+1.5 desktop, centered scale 0.7 mobile
   - ≤300 shader-animated dust particles around it

### Morph pipeline (the story enabler)

- **`morphTargets.ts`**: registry of named target geometries with IDENTICAL vertex counts/order. Built by generating each shape (icosahedron, future: brain-ish blob, chip, graph node, etc.) and resampling to a shared vertex budget (~2500 verts). Day 1 ships: `gem` and `gemBreath` (subtle organic variant) — proves the pipeline.
- **Vertex-shader morphing:** gem material gets an `onBeforeCompile` injection (no new dependency): `position = mix(position, aTargetPosition, uMorph)` with `aTargetPosition` as a buffer attribute; normals blended likewise (acceptable approximation for a flat-shaded gem — exact fallback is derivative normals, see Risks).
- **`useJewelStory.tsx`**: React context + hook. API:
  - `setTarget(name: string)` — swaps the B-attribute to the named geometry and animates uMorph 0→1 (spring), then promotes B→A
  - `setProgress(p: number)` — direct 0..1 control for scroll-driven morphs later
  - `pulse()` — the tap effect, also exposed so future sections can trigger it
- Later phases connect scroll position → `setProgress`/`setTarget`. Nothing in JewelRig changes for that.

### Interaction model (now)

- **Drag:** pointer-down on gem captures drag; pointer velocity maps to angular momentum; on release, rotation decays with inertia (damping ~0.95/frame). Implemented with refs + the existing useFrame (no extra hooks, no re-renders).
- **Tap/click** (movement < 6px between down/up): scale spring pulse (1→1.12→1) + brief gold emissive flash + `pulse()` exposed via context.
- **Idle:** slow auto-rotation (~60s/rev) + gentle float, paused while dragging.
- Touch: same handlers (pointer events unify). Reduced-motion: no auto-rotation, drag still works (user-initiated motion is exempt per WCAG).

### Site-wide

- **`FieldAccent.tsx`**: the field shader at ~15% density (≈500 points desktop / 150 mobile), slower, no pointer uniform, fixed-position behind all pages — replaces `RedJewelBackground` in `Layout/index.tsx` (lazy, Suspense fallback null, same pattern).
- Deletions: `ThreeBackground/RedJewelBackground.tsx`, `ThreeBackground/LightPattern.tsx`, the barrel file if empty, the `prototypes/` folder and `/proto/:id` route (after the real scene lands).
- HomePage: `LightPattern` usages removed; hero section hosts `<JewelScene />` absolutely positioned behind hero content.
- Chatbot orb scene: untouched this phase.

## File structure

```
frontend/src/components/JewelScene/
  index.tsx          # Canvas + layer composition + JewelStoryProvider
  FieldLayer.tsx     # background current (pointer-aware shader points)
  JewelRig.tsx       # gem mesh, lights, env, drag/tap interaction, dust
  morphTargets.ts    # named geometry registry, shared vertex budget
  useJewelStory.tsx  # context: setTarget / setProgress / pulse
  FieldAccent.tsx    # low-density field for non-Home pages
```

Each file one responsibility; JewelRig consumes morphTargets + story context; layers don't know about each other.

## Performance budget (hard gates)

- One Canvas per page. All particle/morph/displacement motion in shaders (uTime/uPointer/uMorph uniforms).
- useFrame total on Home hero: FieldLayer uniform write, JewelRig (uniforms + rotation/inertia transforms). Nothing else.
- usePerfProfile gates: dpr cap, particle counts × particleScale, antialias full-only, frameloop 'never' under reduced-motion, Environment HDR full-tier-only (lite = 3-light fallback).
- Regression gate: TBT on the karakeep-chrome rig must stay ≤ ~10s (current level); entry bundle stays three-free (JewelScene lazy-loaded like its predecessors).

## Error handling

- WebGL unavailable (old devices/SSR-less edge): r3f Canvas fails → ErrorBoundary around JewelScene renders the static radial-gradient backdrop (plain CSS, same colors) — page stays beautiful, just not 3D.
- Environment HDR fetch failure: drei suspends; Suspense fallback shows scene without env (lights-only) — gem still readable thanks to the 3-light rig.

## Testing

- Existing 8 tests keep passing; route-test mocks updated from ThreeBackground paths to JewelScene paths.
- New unit tests: `morphTargets` (all registered targets share vertex count; resampler output deterministic), `useJewelStory` reducer logic (target swap promotes B→A, progress clamps 0..1).
- Visual gate before deploy: headless-chrome screenshots desktop 1280 + mobile 390 of Home (idle), other pages (FieldAccent), reviewed against this spec's composition rules; overflow check stays zero.
- Perf gate: Lighthouse TBT on the same rig, compared to current ~10s baseline.

## Out of scope (later phases)

- Scroll-driven morph choreography and section-triggered transformations (the API ships now; the story content comes with Phase 3 content work).
- New morph target shapes beyond `gem`/`gemBreath`.
- Chatbot orb scene rework.
- Real LLM chatbot.

## Risks

- Morph normal blending on flat-shaded geometry can shimmer mid-transition — acceptable for v1 (transitions are brief); fallback is fragment-derivative normals (dFdx/dFdy) which are exact for flat shading.
- Environment "city" HDR ≈ a few hundred KB — full tier only, lazy with the scene chunk; if it measurably hurts LCP, swap to the 3-light rig permanently (visual delta verified acceptable in prototype tuning).
- Drag interaction vs page scroll on touch: gem drag must NOT hijack vertical scroll — pointer-down on gem only (raycast hit), and touch-action stays default outside the gem hitbox.
