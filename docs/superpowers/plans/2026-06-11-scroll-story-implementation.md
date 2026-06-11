# Scroll Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Scroll Story amendment (`docs/superpowers/specs/2026-06-11-scroll-story-amendment.md`): scroll-driven jewel journey through Home, interaction affordances, editorial content lanes.

**Architecture:** Pure `resolveStoryFrame` resolver (TDD) consumed by a scrollRef-fed useFrame — the jewel's target/position/scale follow scroll with zero React re-renders. JewelScene canvas goes fixed+transparent on Home; hero paints its own dark background; field/backdrop fade out with the hero. Two new morph targets join the registry.

**Tech Stack:** unchanged. Branch: `phase3a-scroll-story` off main.

**Working patterns (use as established this session):** vitest/tsc/build FROM frontend dir; screenshot loop via karakeep-chrome puppeteer (ALWAYS `p.close()` every page and `b.disconnect()` — leaked pages poison the rig at 590% CPU); preview via `npx vite preview --host 100.90.190.14 --port 3195`; kill preview after.

---

### Task 1: New morph targets `neural` + `lattice` (TDD)

**Files:**
- Modify: `frontend/src/components/JewelScene/morphTargets.ts`, `frontend/src/test/morphTargets.test.ts`

- [ ] **Step 1: Extend the test** — TARGET_NAMES becomes `['gem', 'gemBreath', 'neural', 'lattice']`; vertex-parity test already iterates TARGET_NAMES (covers new ones automatically); update the names assertion; add shape-sanity tests:

```ts
it('neural is organic — smoothly displaced, bounded', () => {
  const a = targets.gem.positions, b = targets.neural.positions;
  let maxR = 0;
  for (let i = 0; i < b.length; i += 3) {
    maxR = Math.max(maxR, Math.hypot(b[i], b[i + 1], b[i + 2]));
  }
  expect(maxR).toBeGreaterThan(1.2);
  expect(maxR).toBeLessThan(2.6);
  expect(b).not.toEqual(a);
});

it('lattice clusters vertices toward snap points', () => {
  const b = targets.lattice.positions;
  // every vertex sits within 0.45 of a 1.1-spaced grid point (cluster snapping)
  for (let i = 0; i < b.length; i += 3) {
    for (const c of [b[i], b[i + 1], b[i + 2]]) {
      const d = Math.abs(c - Math.round(c / 1.1) * 1.1);
      expect(d).toBeLessThanOrEqual(0.45 + 1e-6);
    }
  }
});
```

- [ ] **Step 2: FAIL run.**
- [ ] **Step 3: Implement in `morphTargets.ts`:**

```ts
// neural: vertices pushed onto a unit-ish sphere then displaced by layered deterministic
// noise — organic thinking-blob. Same vertex array length as gem by construction.
function buildNeural(gemPos: Float32Array): Float32Array {
  const out = new Float32Array(gemPos.length);
  for (let i = 0; i < gemPos.length; i += 3) {
    const x = gemPos[i], y = gemPos[i + 1], z = gemPos[i + 2];
    const len = Math.hypot(x, y, z) || 1;
    const nx = x / len, ny = y / len, nz = z / len;
    const n1 = pseudoNoise(nx * 2.1, ny * 2.1, nz * 2.1) - 0.5;
    const n2 = pseudoNoise(nx * 5.3 + 7.7, ny * 5.3, nz * 5.3) - 0.5;
    const r = 1.55 + n1 * 0.7 + n2 * 0.25;
    out[i] = nx * r; out[i + 1] = ny * r; out[i + 2] = nz * r;
  }
  return out;
}

// lattice: each face's centroid snaps toward the nearest point of a 1.1-spaced grid,
// face shrinks toward its centroid — reads as a cluster of small crystals.
function buildLattice(gemPos: Float32Array): Float32Array {
  const out = new Float32Array(gemPos.length);
  const SNAP = 1.1, SHRINK = 0.38;
  for (let f = 0; f < gemPos.length; f += 9) {
    const cx = (gemPos[f] + gemPos[f + 3] + gemPos[f + 6]) / 3;
    const cy = (gemPos[f + 1] + gemPos[f + 4] + gemPos[f + 7]) / 3;
    const cz = (gemPos[f + 2] + gemPos[f + 5] + gemPos[f + 8]) / 3;
    const sx = Math.round((cx * 1.35) / SNAP) * SNAP;
    const sy = Math.round((cy * 1.35) / SNAP) * SNAP;
    const sz = Math.round((cz * 1.35) / SNAP) * SNAP;
    for (let v = 0; v < 9; v += 3) {
      out[f + v] = sx + (gemPos[f + v] - cx) * SHRINK;
      out[f + v + 1] = sy + (gemPos[f + v + 1] - cy) * SHRINK;
      out[f + v + 2] = sz + (gemPos[f + v + 2] - cz) * SHRINK;
    }
  }
  return out;
}
```

Wire both into `buildMorphTargets()` (normals: build a BufferGeometry per target, `computeVertexNormals`, extract — same as gemBreath). Update `TARGET_NAMES`. NOTE the lattice test bound (0.45): verify `max |face vertex - snapped centroid| = SHRINK * max face radius` stays under it — icosahedron(1.7, detail 1) face radius ≈ 0.55 ⇒ 0.38 × 0.55 ≈ 0.21 ✓.
- [ ] **Step 4: Tests pass; suite 20→22+. tsc clean.**
- [ ] **Step 5: Commit:** `git add frontend && git commit -m "feat: neural and lattice morph targets for the scroll story"`

### Task 2: Story resolver (TDD)

**Files:**
- Create: `frontend/src/components/JewelScene/storyResolver.ts`
- Test: `frontend/src/test/storyResolver.test.ts`

- [ ] **Step 1: Failing test:**

```ts
import { describe, it, expect } from 'vitest';
import { resolveStoryFrame, STORY_SECTIONS } from '../components/JewelScene/storyResolver';

// sections: hero 0-2000, chatbot 2000-4000, portfolio 4000-6000, cta 6000-7000; viewport 800
const ranges = [
  { id: 'story-hero', top: 0, bottom: 2000 },
  { id: 'story-chatbot', top: 2000, bottom: 4000 },
  { id: 'story-portfolio', top: 4000, bottom: 6000 },
  { id: 'story-cta', top: 6000, bottom: 7000 },
];

describe('resolveStoryFrame', () => {
  it('exposes the section→target map', () => {
    expect(STORY_SECTIONS).toEqual({
      'story-hero': 'gem',
      'story-chatbot': 'neural',
      'story-portfolio': 'lattice',
      'story-cta': 'gem',
    });
  });
  it('deep inside hero: pure gem, progress 0', () => {
    const f = resolveStoryFrame(100, ranges, 800, false);
    expect(f.from).toBe('gem'); expect(f.to).toBe('gem'); expect(f.progress).toBe(0);
  });
  it('mid-blend between hero and chatbot', () => {
    // boundary at 2000; blend zone = ±0.2*viewport (160px); center of viewport at boundary → scrollY = 2000-400=1600
    const f = resolveStoryFrame(1600, ranges, 800, false);
    expect(f.from).toBe('gem'); expect(f.to).toBe('neural');
    expect(f.progress).toBeGreaterThan(0.4); expect(f.progress).toBeLessThan(0.6);
  });
  it('deep inside portfolio: lattice settled', () => {
    const f = resolveStoryFrame(4600, ranges, 800, false);
    expect(f.from).toBe('lattice'); expect(f.to).toBe('lattice'); expect(f.progress).toBe(0);
  });
  it('positions: hero right lane desktop, lower-center mobile', () => {
    const d = resolveStoryFrame(0, ranges, 800, false);
    expect(d.position[0]).toBeCloseTo(1.5, 1);
    const m = resolveStoryFrame(0, ranges, 800, true);
    expect(m.position[0]).toBeCloseTo(0, 1);
    expect(m.position[1]).toBeLessThan(-1.5);
  });
  it('chatbot section: left lane desktop, mobile center-offset', () => {
    const d = resolveStoryFrame(2800, ranges, 800, false);
    expect(d.position[0]).toBeLessThan(-1);
    const m = resolveStoryFrame(2800, ranges, 800, true);
    expect(Math.abs(m.position[0])).toBeLessThanOrEqual(0.8 + 1e-6);
  });
  it('clamps beyond last section to cta frame', () => {
    const f = resolveStoryFrame(99999, ranges, 800, false);
    expect(f.to).toBe('gem'); expect(f.scale).toBeCloseTo(1.1, 1);
  });
});
```

- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement `storyResolver.ts`:** pure function. Reference point = scrollY + viewportH/2 (viewport center). For each section: keyframe `{target, position, scale}`:

```ts
import type { TargetName } from './morphTargets';

export interface SectionRange { id: string; top: number; bottom: number; }
export interface StoryFrame {
  from: TargetName; to: TargetName; progress: number;
  position: [number, number, number]; scale: number;
}

export const STORY_SECTIONS: Record<string, TargetName> = {
  'story-hero': 'gem',
  'story-chatbot': 'neural',
  'story-portfolio': 'lattice',
  'story-cta': 'gem',
};

interface Keyframe { target: TargetName; pos: [number, number, number]; mobilePos: [number, number, number]; scale: number; mobileScale: number; }

const KEYFRAMES: Record<string, Keyframe> = {
  'story-hero':      { target: 'gem',     pos: [1.5, 0, 0],    mobilePos: [0, -2.05, 0],  scale: 1,   mobileScale: 0.8 },
  'story-chatbot':   { target: 'neural',  pos: [-2.2, 0, 0],   mobilePos: [-0.8, -1.6, 0], scale: 0.7, mobileScale: 0.55 },
  'story-portfolio': { target: 'lattice', pos: [2.2, 0, 0],    mobilePos: [0.8, -1.6, 0],  scale: 0.8, mobileScale: 0.6 },
  'story-cta':       { target: 'gem',     pos: [1.2, 0, 0],    mobilePos: [0, -1.2, 0],    scale: 1.1, mobileScale: 0.85 },
};

const BLEND = 0.2; // fraction of viewport height on EACH side of a boundary

export function resolveStoryFrame(
  scrollY: number, ranges: SectionRange[], viewportH: number, mobile: boolean
): StoryFrame {
  const probe = scrollY + viewportH / 2;
  const zone = BLEND * viewportH;
  const lerp3 = (a: number[], b: number[], t: number): [number, number, number] =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const kf = (id: string) => KEYFRAMES[id] ?? KEYFRAMES['story-hero'];
  const pick = (k: Keyframe) => ({ pos: mobile ? k.mobilePos : k.pos, scale: mobile ? k.mobileScale : k.scale });

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    const next = ranges[i + 1];
    if (next && probe >= next.top - zone && probe <= next.top + zone) {
      // inside the blend window around the boundary between r and next
      const t = (probe - (next.top - zone)) / (2 * zone);
      const a = kf(r.id), b = kf(next.id);
      const pa = pick(a), pb = pick(b);
      return {
        from: a.target, to: b.target, progress: Math.min(1, Math.max(0, t)),
        position: lerp3(pa.pos, pb.pos, t),
        scale: pa.scale + (pb.scale - pa.scale) * t,
      };
    }
    if (probe >= r.top && probe < r.bottom) {
      const k = kf(r.id); const p = pick(k);
      return { from: k.target, to: k.target, progress: 0, position: [...p.pos] as [number, number, number], scale: p.scale };
    }
  }
  const last = kf(ranges[ranges.length - 1]?.id ?? 'story-cta'); const p = pick(last);
  return { from: last.target, to: last.target, progress: 0, position: [...p.pos] as [number, number, number], scale: p.scale };
}
```

- [ ] **Step 4: Tests pass (7); tune constants ONLY if a test exposes a logic hole (report). Suite green; tsc clean.**
- [ ] **Step 5: Commit:** `git add frontend && git commit -m "feat: scroll story resolver — scroll position to jewel target/position/scale"`

### Task 3: Wire the journey — fixed transparent canvas + scroll-driven rig

**Files:**
- Modify: `frontend/src/components/JewelScene/index.tsx`, `JewelRig.tsx`, `FieldLayer.tsx`, `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Section ids in HomePage.** Add `id="story-hero"` to the hero Box, `id="story-chatbot"` to the chatbot section wrapper, `id="story-portfolio"` to the portfolio section, `id="story-cta"` to the CTA section. Hero keeps/paints its own dark bg: hero Box gets `bg="#140306"` explicitly (it currently relies on the canvas being opaque inside it).
- [ ] **Step 2: JewelScene goes fixed + transparent on Home.** `index.tsx`: wrapper Box `position="fixed" inset={0} zIndex={0}` (was absolute-in-hero); Canvas `gl.alpha: true`; REMOVE `<color attach="background">`. HomePage: `<JewelScene />` moves OUT of the hero Box to direct child of the page root (still lazy + Suspense); all page sections need `position="relative" zIndex={1}` (audit each top-level section — content must sit above the fixed canvas; the hero already has zIndex 2 content).
  - `useInViewport` pause now observes the page wrapper — on Home the canvas is always "visible"; REPLACE the hero-visibility pause with: pause when `document.hidden` (rAF handles it) — i.e., remove the IO wiring from JewelScene (keep visibility.ts exports; FieldAccent does not use it; the helper's tests stay).
  - CRITICAL pointer-events: the fixed canvas overlays the whole page at z0 — it must NOT block clicks on content. Canvas wrapper gets `pointerEvents="none"`; the GEM still needs drag → r3f events won't fire with pointer-events none. Solution: wrapper `pointerEvents="none"`, and enable events only on the canvas element via `style={{ pointerEvents: 'auto' }}`? Same problem. CORRECT solution: keep wrapper `pointerEvents="auto"` but make the Canvas ignore non-gem hits: r3f `eventSource`/`eventPrefix` won't help; instead set Canvas `style={{ pointerEvents: 'none' }}` and attach events manually? Simplest robust: wrapper stays `pointerEvents: 'none'`; gem interaction moves to a DOM-level pattern — an invisible absolutely-positioned hit div tracking the gem's screen position? Over-engineered. PRAGMATIC: Canvas keeps pointer events ONLY while the hero section is in view (drag/tap is a hero interaction): `pointerEvents: heroVisible ? 'auto' : 'none'` via the existing useInViewport on the hero section element (`document.getElementById('story-hero')` observed). Content above the canvas (zIndex≥1) ALREADY receives clicks first everywhere — buttons/links unaffected even with auto; the only risk is empty-space drags on sections, which scroll normally anyway because the canvas only captures pointer on gem raycast hits (r3f event behavior: events only fire on mesh hits; empty canvas areas pass through? NO — canvas captures the DOM event regardless. With `touch-action` default and no preventDefault, scroll still works on touch; desktop empty-space drag does nothing harmful). DECISION: wrapper z0 + content z1+ + Canvas pointerEvents auto; verify scroll works over empty canvas areas on touch in the screenshot/CDP pass; if touch scroll breaks, flip to `heroVisible ? 'auto' : 'none'`.
- [ ] **Step 3: Scroll → rig.** In `JewelRig.tsx`: new module-scope scratch + refs; a `useEffect` measures section ranges (`['story-hero','story-chatbot','story-portfolio','story-cta'].map(id => el.offsetTop / +offsetHeight)`) on mount + resize (and a 1s-delayed re-measure for lazy content shifting layout); scroll listener writes `scrollRef.current = window.scrollY` (passive). In useFrame: `const frame = resolveStoryFrame(scrollRef.current, rangesRef.current, window.innerHeight, profile.tier === 'lite')`; lerp group position/scale toward frame.position/scale (`1 - exp(-5*delta)`); drive morph: when `frame.from/to` pair differs from current rig pair, rewrite attributes via the story controller (`story.setTarget(frame.to)` keeps the controller authoritative); set `progressRef.current = frame.progress` directly (scroll owns progress now — the tap-toggle morph animation driver yields to scroll when a scroll transition is active; tap-morph still works inside a settled section: keep the existing tap behavior but `setTarget` back to the section's target so the story stays coherent — simplest: tap now toggles to `gemBreath` ONLY when current section target is `gem`, else tap = pulse only).
  - Keep drag/inertia/idle-rotation as-is (they operate on rotation; story owns position/scale/morph).
- [ ] **Step 4: Field + backdrop hero fade.** FieldLayer: new uniform `uFade` (1 in hero, →0 as hero scrolls out: `fade = clamp(1 - (scrollY / (heroBottom * 0.8)), 0, 1)` written in JewelRig's or FieldLayer's useFrame from scrollRef) multiplying final fragment alpha. Backdrop plane in JewelRig: same fade on material opacity (make it `transparent` with opacity driven; it's hero scenery, gone below). Glow sprites same uFade.
- [ ] **Step 5: Gates + manual dev check:** tsc, suite green, build. Dev server: scroll Home — gem travels hero→left(neural)→right(lattice)→center(gem); content clickable everywhere; touch scroll unaffected (CDP swipe test in Task 6).
- [ ] **Step 6: Commit:** `git add frontend && git commit -m "feat: scroll story — jewel travels and morphs through Home sections"`

### Task 4: Affordances

**Files:**
- Modify: `frontend/src/components/JewelScene/index.tsx` (hint pill), `JewelRig.tsx` (magnetic lean), `FieldLayer.tsx` (parting strength), locales (hint strings)

- [ ] **Step 1: Drag hint pill.** In JewelScene (DOM, not 3D): small Chakra pill `position="fixed"`, placed near the gem's hero position (desktop: right-center `right="18%" top="52%"`; mobile: `bottom="22%"` centered), text `t('home.jewel.hint')` — EN "Drag me · tap to transform", ES "Arrástrame · toca para transformar" (add `home.jewel.hint` to BOTH locale files). Soft float animation (framer-motion y ±4). Visibility: only while hero in view AND `!localStorage.getItem('jewelHintDismissed')`; JewelRig sets the flag + a callback on first pointerdown on the gem (pass `onFirstInteraction` prop from index.tsx; also dismiss on first tap). Pill `pointerEvents="none"` (pure signpost).
- [ ] **Step 2: Magnetic lean.** JewelRig useFrame (full tier, not dragging): lean toward pointer up to 0.14 rad: `targetLean.x = state.pointer.y * 0.14; targetLean.y = state.pointer.x * 0.14;` lerped, ADDED to the idle/drag rotation as a separate group nesting (wrap gem mesh in an inner group for lean so drag rotation and lean don't fight).
- [ ] **Step 3: Parting ×2.** FieldLayer vertex shader: `push * 0.9` → `push * 1.8`.
- [ ] **Step 4: Gates; i18n parity check; commit:** `git add frontend && git commit -m "feat: drag-me hint, magnetic lean, stronger field parting"`

### Task 5: Editorial content lanes (Home)

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Hero asymmetry (desktop):** hero text container `maxW={{ base: 'full', lg: '52%' }}`, left-aligned block (kill any `mx="auto"`/center on lg+; keep mobile centered), heading `textStyle="pageTitle"` stays, lead width capped `maxW="46ch"`. CTAs `justify="flex-start"` on lg.
- [ ] **Step 2: Section lanes:** chatbot section content wrapper `ml={{ base: 0, lg: '28%' }} maxW={{ base: 'full', lg: '68%' }}` (jewel owns the left lane); portfolio section header block `mr={{ base: 0, lg: '30%' }} maxW={{ base: 'full', lg: '64%' }}` text-align start (jewel right lane; the project GRID stays full width below the header — only the header shifts); CTA stays centered (jewel sits center-right behind at low scale).
- [ ] **Step 3: Screenshot judgment loop (≤3 iters):** desktop 1280 screenshots at scroll positions: 0, chatbot mid, portfolio mid, cta (`window.scrollTo` + settle 800ms between shots, CLOSE pages). READ each: does the jewel sit in clear negative space beside content? content lanes feel intentional? Adjust margins.
- [ ] **Step 4: Mobile pass:** same captures at 390px; lanes are subtle offsets (±0.8 world) — content stays centered full-width; verify no overlap of jewel with text (jewel y −1.6 keeps it lower-third).
- [ ] **Step 5: Gates + overflow sweep (zero); commit:** `git add frontend && git commit -m "style: editorial hero asymmetry and content lanes along the jewel path"`

### Task 6: Verify, deploy

- [ ] **Step 1: Full gates:** tsc, vitest (29+), build.
- [ ] **Step 2: CDP interaction battery (local preview):** (a) touch swipe over empty canvas mid-hero → page scrolls (`window.scrollY` increases); (b) drag on gem desktop → rotation changes; (c) click "View Portfolio" → navigates; (d) scroll to each section → screenshot pair, verify morph/position per spec table; (e) hint pill visible on fresh profile, gone after gem pointerdown (localStorage check).
- [ ] **Step 3: Overflow sweep all 5 routes (zero interactive).**
- [ ] **Step 4: Merge main, push (port-443 pattern), VPS deploy, live 200.**
- [ ] **Step 5: Lighthouse ×2 on QUIET rig (check `docker stats karakeep-chrome-1` <10% first; close stray targets): TBT ≤ baseline ~10s.**
- [ ] **Step 6: Live screenshots desktop+mobile of all four story beats → send to Luis. Tag `phase3a-deployed`.**

## Risks
- Fixed transparent canvas + content z-order: any section with its own opaque full-bleed bg hides the traveling jewel — audit Home section bgs in Task 3 Step 1 (hero dark block is intended; below sections should be cream/transparent ON TOP of canvas? NO — jewel must be visible BETWEEN content blocks: sections keep their bg but the jewel lane margins (Task 5) expose the canvas around content columns. The page root bg must be the cream (canvas transparent over it... wait — canvas is BEHIND content at z0; page root bg would hide canvas if painted above it. ORDER: html/body bg cream → fixed canvas z0 (transparent, draws jewel) → content z1 with section bgs LIMITED to their content columns or semi-transparent). PRACTICAL: sections that currently paint full-width cream bgs continue to do so but the canvas sits ABOVE the body bg and BELOW sections — the jewel will be hidden behind full-width opaque sections! Resolution implemented in Task 3/5: give Home's below-hero sections `bg="transparent"` and set the PAGE wrapper bg cream... that hides the jewel equally. FINAL resolution (decide in Task 3, verify by screenshot): the jewel lane works because sections' CONTENT columns are narrowed (Task 5) and the page bg shows in the lane — therefore set Home page wrapper bg to cream, canvas z0 sits ON TOP of the page wrapper bg? A fixed div at z0 + body bg behind it: canvas is above body bg ✓; sections at z1 narrowed ✓; full-width section bgs must become column-scoped or transparent on Home. The implementer applies: below-hero Home sections get `bg="transparent"` (their cream came from the page anyway) unless a section deliberately contrasts (diagonal red transitions — keep, they're narrow strips).
- Scroll-driven `setTarget` thrash at blend boundaries (rapid scroll direction changes): controller promotes targets only at progress 1 — resolver drives progress directly, so jitter is bounded; if visible popping occurs, add hysteresis (switch pair only when progress crosses 0.05/0.95). Implementer notes if needed.
- Tap-toggle vs story conflict handled in Task 3 Step 3 (tap = breath only in gem sections).
