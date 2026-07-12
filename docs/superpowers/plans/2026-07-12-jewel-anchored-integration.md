# Jewel Anchored Integration (engine v3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anchor the jewel INSIDE real page components (hero column, chat card, project cards, CTA crown slot) with animated flights between them — killing the "floating disconnected gem" — plus a material/lighting quality pass.

**Architecture:** One fixed transparent canvas stays (flights need a shared surface). Poses stop coming from normalized-viewport STOPS and start coming from DOM anchor rects (`data-jewel-anchor` slots that reserve real layout space). A tiny pub/sub bus lets the chat power the docked gem. Beat 3 hands off to an InstancedMesh (one mini growth chart per project card). Spec: `docs/superpowers/specs/2026-07-12-jewel-anchored-integration-design.md`.

**Tech Stack:** React 18 + TypeScript, @react-three/fiber, @react-three/drei (Environment + Lightformer + ContactShadows), maath, vitest.

## Global Constraints

- NO new npm dependencies. Environment lighting must be procedural (`<Environment resolution={256}>` + `<Lightformer>`), never a CDN/HDR fetch.
- No React state in frame loops — refs only (existing discipline; see JewelRig header comment).
- The story/copy/shapes stay untouched: `ico → neural → growth → crown`, existing i18n.
- Perf tiers respected: env map, clearcoat, ContactShadows and the multiply engine run only on `tier: 'full'` (`usePerfProfile`); `lite` (<768px or reduced-motion) keeps current materials and a single gem.
- Repo conventions: work on branch `jewel-narrative-session-2`; `npm test` (vitest) and `npm run build` (tsc + vite) must pass before every commit; commits in English, conventional style.
- All source paths below are relative to `frontend/`.

### Shared geometry facts (used by several tasks)

- `CAMERA_FOV = 42`, `CAMERA_Z = 5`, `VIS_H = 2*tan(21°)*5 ≈ 3.84` world units of visible height (chapterResolver.ts:52-55).
- `fractionToWorld(fx, fy, aspect)` maps viewport fractions (0..1, y down) to world x/y at z=0 (chapterResolver.ts:65-67).
- `JEWEL_WORLD_RADIUS = 1.3` (JewelRig.tsx:64) → jewel world diameter ≈ 2.6.

---

### Task 1: `jewelBus` — chat→jewel activity store

**Files:**
- Create: `src/components/JewelScene/jewelBus.ts`
- Test: `src/test/jewelBus.test.ts`

**Interfaces:**
- Produces: `type ChatActivity = 'idle' | 'thinking' | 'answering'`; `jewelBus.get(): ChatActivity`, `jewelBus.set(a: ChatActivity): void`, `jewelBus.subscribe(fn: (a: ChatActivity) => void): () => void`. Frame loops read via `get()` (no subscription needed in the loop).

- [ ] **Step 1: Write the failing test**

```ts
// src/test/jewelBus.test.ts
import { describe, it, expect, vi } from 'vitest';
import { jewelBus } from '../components/JewelScene/jewelBus';

describe('jewelBus', () => {
  it('starts idle and stores the latest activity', () => {
    expect(jewelBus.get()).toBe('idle');
    jewelBus.set('thinking');
    expect(jewelBus.get()).toBe('thinking');
    jewelBus.set('idle');
  });

  it('notifies subscribers on change only, and unsubscribes cleanly', () => {
    const fn = vi.fn();
    const off = jewelBus.subscribe(fn);
    jewelBus.set('answering');
    jewelBus.set('answering'); // same value → no second call
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('answering');
    off();
    jewelBus.set('idle');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/jewelBus.test.ts`
Expected: FAIL — cannot resolve `../components/JewelScene/jewelBus`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/JewelScene/jewelBus.ts
// Chat → jewel activity bridge. Module-level store: the chat writes, the rig's
// frame loop polls get() (never subscribes — no setState in frame loops), and
// React consumers may subscribe. Decoupled: if nobody ever set()s, gem idles.
export type ChatActivity = 'idle' | 'thinking' | 'answering';

let current: ChatActivity = 'idle';
const subs = new Set<(a: ChatActivity) => void>();

export const jewelBus = {
  get(): ChatActivity {
    return current;
  },
  set(a: ChatActivity): void {
    if (a === current) return;
    current = a;
    for (const fn of subs) fn(a);
  },
  subscribe(fn: (a: ChatActivity) => void): () => void {
    subs.add(fn);
    return () => subs.delete(fn);
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/jewelBus.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/JewelScene/jewelBus.ts src/test/jewelBus.test.ts
git commit -m "feat(jewel): chat activity bus (idle/thinking/answering)"
```

---

### Task 2: `anchorPose` — rect→pose math + `useJewelAnchors` hook

**Files:**
- Create: `src/components/JewelScene/anchorPose.ts`
- Create: `src/components/JewelScene/useJewelAnchors.ts`
- Test: `src/test/anchorPose.test.ts`

**Interfaces:**
- Consumes: `VIS_H` from `./chapterResolver`.
- Produces:
  - `rectToPose(rect: {left,top,width,height}, viewW: number, viewH: number): {x,y,s}` — x/y are viewport FRACTIONS of the rect center (same space as `curRef` in JewelRig); `s` scales the jewel (world diameter 2.6) to fit 88% of the rect's smaller CSS dimension.
  - `ANCHOR_NAMES = ['hero','chat','cta'] as const` (project-card anchors are handled by Task 6's instances, not the main gem).
  - `useJewelAnchors(): { getRect(name: string): DOMRect | null }` — discovers `[data-jewel-anchor]`, re-measures on scroll/resize (rAF-throttled, passive), retries discovery every 500ms until all of ANCHOR_NAMES exist (lazy HomePage), returns null for missing/degenerate (zero-size) anchors.

- [ ] **Step 1: Write the failing test**

```ts
// src/test/anchorPose.test.ts
import { describe, it, expect } from 'vitest';
import { rectToPose } from '../components/JewelScene/anchorPose';
import { VIS_H } from '../components/JewelScene/chapterResolver';

describe('rectToPose', () => {
  const view = { w: 1920, h: 1080 };

  it('centers the pose on the rect center, in viewport fractions', () => {
    const pose = rectToPose({ left: 960, top: 270, width: 480, height: 540 }, view.w, view.h);
    expect(pose.x).toBeCloseTo((960 + 240) / 1920); // 0.625
    expect(pose.y).toBeCloseTo((270 + 270) / 1080); // 0.5
  });

  it('scales the 2.6-world-unit jewel to 88% of the smaller rect dimension', () => {
    const rect = { left: 0, top: 0, width: 480, height: 540 };
    const pose = rectToPose(rect, view.w, view.h);
    // smaller dim = 480 CSS px → world units: (480/1080)*VIS_H; jewel dia 2.6
    const expected = ((480 / 1080) * VIS_H * 0.88) / 2.6;
    expect(pose.s).toBeCloseTo(expected, 5);
  });

  it('clamps degenerate rects to s=0 (treated as missing upstream)', () => {
    expect(rectToPose({ left: 0, top: 0, width: 0, height: 100 }, view.w, view.h).s).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/anchorPose.test.ts`
Expected: FAIL — cannot resolve `anchorPose`.

- [ ] **Step 3: Implement `anchorPose.ts`**

```ts
// src/components/JewelScene/anchorPose.ts
// Pure math: DOM anchor rect (CSS px) → jewel pose in viewport-fraction space.
// Kept free of DOM/react imports so it unit-tests without jsdom gymnastics.
import { VIS_H } from './chapterResolver';

export const ANCHOR_NAMES = ['hero', 'chat', 'cta'] as const;
export type AnchorName = (typeof ANCHOR_NAMES)[number];

/** Jewel world diameter (2 × JEWEL_WORLD_RADIUS in JewelRig). */
export const JEWEL_WORLD_DIAMETER = 2.6;
/** Fill fraction: gem occupies 88% of the anchor's smaller dimension. */
const FILL = 0.88;

export interface RectLike { left: number; top: number; width: number; height: number }

export function rectToPose(rect: RectLike, viewW: number, viewH: number): { x: number; y: number; s: number } {
  if (rect.width <= 0 || rect.height <= 0 || viewW <= 0 || viewH <= 0) {
    return { x: 0.5, y: 0.5, s: 0 };
  }
  const x = (rect.left + rect.width / 2) / viewW;
  const y = (rect.top + rect.height / 2) / viewH;
  const smallerCssPx = Math.min(rect.width, rect.height);
  const worldSize = (smallerCssPx / viewH) * VIS_H;
  const s = (worldSize * FILL) / JEWEL_WORLD_DIAMETER;
  return { x, y, s };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/anchorPose.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement `useJewelAnchors.ts`** (measurement plumbing — verified by typecheck here, behavior by Task 4's integration)

```ts
// src/components/JewelScene/useJewelAnchors.ts
// Discovers [data-jewel-anchor] slots and keeps fresh viewport rects for them.
// All mutation happens in refs; consumers poll getRect() from frame loops.
import { useCallback, useEffect, useRef } from 'react';
import { ANCHOR_NAMES } from './anchorPose';

export function useJewelAnchors(): { getRect: (name: string) => DOMRect | null } {
  const elsRef = useRef<Map<string, HTMLElement>>(new Map());
  const rectsRef = useRef<Map<string, DOMRect>>(new Map());

  useEffect(() => {
    let rafPending = false;
    let retryId: number | undefined;

    const measure = () => {
      rafPending = false;
      for (const [name, el] of elsRef.current) {
        rectsRef.current.set(name, el.getBoundingClientRect());
      }
    };
    const requestMeasure = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(measure);
    };
    const discover = () => {
      const found = document.querySelectorAll<HTMLElement>('[data-jewel-anchor]');
      elsRef.current.clear();
      found.forEach((el) => elsRef.current.set(el.dataset.jewelAnchor as string, el));
      measure();
      // HomePage is lazy: keep retrying until the three named anchors exist.
      const haveAll = ANCHOR_NAMES.every((n) => elsRef.current.has(n));
      if (!haveAll) retryId = window.setTimeout(discover, 500);
    };

    discover();
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);
    return () => {
      window.clearTimeout(retryId);
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
    };
  }, []);

  const getRect = useCallback((name: string): DOMRect | null => {
    const r = rectsRef.current.get(name);
    if (!r || r.width <= 0 || r.height <= 0) return null;
    return r;
  }, []);

  return { getRect };
}
```

- [ ] **Step 6: Full check + commit**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all tests pass, no type errors.

```bash
git add src/components/JewelScene/anchorPose.ts src/components/JewelScene/useJewelAnchors.ts src/test/anchorPose.test.ts
git commit -m "feat(jewel): anchor rect→pose math + DOM anchor measurement hook"
```

---

### Task 3: Anchor slots in HomePage + CTA crown-slot layout

**Files:**
- Modify: `src/pages/HomePage.tsx` (sections `story-hero` ~line 86, `story-chatbot` ~301, `story-cta` ~512)
- Modify: `src/components/Chatbot/ThreeJsChatbot.tsx` (chat anchor slot in the card header area)

**Interfaces:**
- Produces: DOM slots `data-jewel-anchor="hero" | "chat" | "cta"` that RESERVE layout space. Task 4 consumes them via `useJewelAnchors`. (Per-card slots come in Task 6.)

- [ ] **Step 1: Hero anchor.** In `story-hero`, the gem today floats over the right half. Add an explicit right-column slot inside the hero container (the hero copy is already left-aligned). Insert as a sibling of the hero copy container, inside the section:

```tsx
{/* Jewel dock — hero. Reserves the right column the gem occupies; the canvas
    draws OVER this box (canvas stays fixed), but the box is real layout, so
    the gem is always inside a space the section actually reserved. */}
<Box
  data-jewel-anchor="hero"
  aria-hidden="true"
  position="absolute"
  right={{ base: '4%', md: '8%' }}
  top="50%"
  transform="translateY(-50%)"
  w={{ base: '38vw', md: 'min(34vw, 460px)' }}
  h={{ base: '38vw', md: 'min(34vw, 460px)' }}
  pointerEvents="none"
/>
```

(Hero was approved "as-is": these values reproduce today's resting spot — fine-tune by eye in Task 8's visual pass, not here.)

- [ ] **Step 2: Chat anchor.** In `ThreeJsChatbot.tsx`, add the dock slot beside the chat header/messages (top-left of the card), plus the gold hairline that ties it to the card:

```tsx
{/* Jewel dock — the model. The gem parks here and "powers" the chat. */}
<Box
  data-jewel-anchor="chat"
  aria-hidden="true"
  flexShrink={0}
  w={{ base: '56px', md: '84px' }}
  h={{ base: '56px', md: '84px' }}
  alignSelf="flex-start"
  position="relative"
  _after={{
    content: '""',
    position: 'absolute',
    right: '-12px',
    top: '50%',
    width: '12px',
    height: '1px',
    bg: 'rgba(194, 160, 92, 0.55)', // gold hairline into the card body
  }}
/>
```

Place it in the card's header row (flex) so messages flow beside/below it. Exact placement: first child of the chat card's top-level flex container.

- [ ] **Step 3: CTA crown slot (approved option A).** In `story-cta`, restructure the section content to a single column with a RESERVED crown row above the title:

```tsx
{/* Crown slot — reserved height, so the crown NEVER overlaps title/copy/buttons */}
<Box
  data-jewel-anchor="cta"
  aria-hidden="true"
  mx="auto"
  w={{ base: '120px', md: '180px' }}
  h={{ base: '120px', md: '180px' }}
  mb={{ base: 2, md: 4 }}
  pointerEvents="none"
/>
```

Insert as the first child of the CTA section's inner `VStack`/container, above the existing heading. Do not remove any existing content — only add the slot and, if the heading block was absolutely positioned or centered against the section, normalize the column stack order: slot → heading → copy → buttons → BadgeCloud.

- [ ] **Step 4: WebGL-off collapse.** In `src/components/JewelScene/index.tsx`, the `SceneErrorBoundary` currently returns null. Extend it to also flag the document so the empty slots collapse (no dead gaps):

```tsx
static getDerivedStateFromError() {
  document.documentElement.dataset.jewelOff = '1';
  return { failed: true };
}
```

And add a global style (in `src/index.css`):

```css
html[data-jewel-off='1'] [data-jewel-anchor] {
  display: none;
}
```

- [ ] **Step 5: Verify + commit**

Run: `npx vitest run && npx tsc --noEmit`
Expected: green (route smoke tests still render Home).
Then visual: `npm run dev` (or the realeza stack) → hero/chat/CTA sections show reserved space; gem still moves per v2 (anchors not consumed yet — expected).

```bash
git add src/pages/HomePage.tsx src/components/Chatbot/ThreeJsChatbot.tsx src/components/JewelScene/index.tsx src/index.css
git commit -m "feat(jewel): layout anchor slots — hero column, chat dock, CTA crown row"
```

---

### Task 4: Rig consumes anchors — DOM-driven poses

**Files:**
- Modify: `src/components/JewelScene/JewelRig.tsx` (frame-loop step 1-2, ~lines 297-326)
- Modify: `src/components/JewelScene/storyTimeline.ts`
- Test: `src/test/storyTimeline.test.ts` (adjust if it asserts on x/y/s)

**Interfaces:**
- Consumes: `useJewelAnchors().getRect`, `rectToPose` (Task 2), existing `resolvePose` (shape weights/spin/p/beat only).
- Produces: `resolvePose(progress, mobile)` keeps its signature but its returned `x/y/s` are DEFAULTS used only when an anchor is missing; new exported map `BEAT_ANCHOR: (string | null)[] = ['hero', 'chat', null, 'cta']` (beat 2 = projects, main gem has no anchor there — Task 6 owns that beat's visual).

- [ ] **Step 1: storyTimeline — export the beat→anchor map**

```ts
// storyTimeline.ts (add near BEAT_IDS)
/** DOM anchor consumed per beat; null = the multiply engine owns this beat
 *  (main gem exits: it damps toward the NEXT anchor while instances play). */
export const BEAT_ANCHOR: (string | null)[] = ['hero', 'chat', null, 'cta'];
```

- [ ] **Step 2: JewelRig — resolve pose from anchors.** Inside the component add `const { getRect } = useJewelAnchors();` (import from `./useJewelAnchors`, plus `rectToPose` from `./anchorPose`). Replace the pose consumption (after `const pose = resolvePose(progress, lite);`) with:

```ts
// Anchor override: when the active beat has a DOM anchor and it measures,
// the anchor rect drives x/y/s; timeline x/y/s is the fallback (anchor not
// mounted yet). Shape weights/spin/particles always come from the timeline.
const anchorName = BEAT_ANCHOR[pose.beat];
let target = { x: pose.x, y: pose.y, s: pose.s };
if (anchorName) {
  const rect = getRect(anchorName);
  if (rect) target = rectToPose(rect, width, height);
} else {
  // Beat without main-gem anchor (projects): glide toward the NEXT beat's
  // anchor at reduced scale so the handoff to instances reads as an exit.
  const next = getRect('cta');
  if (next) {
    const p = rectToPose(next, width, height);
    target = { x: p.x, y: p.y, s: p.s * 0.4 };
  }
}
```

Then the damp block eases toward `target.x/y/s` instead of `pose.x/y/s` (spin/p keep coming from `pose`):

```ts
if (reduced) {
  cur.x = target.x; cur.y = target.y; cur.s = target.s; cur.spin = pose.spin; cur.p = pose.p;
} else {
  easing.damp(cur, 'x', target.x, 0.34, dt);
  easing.damp(cur, 'y', target.y, 0.34, dt);
  easing.damp(cur, 's', target.s, 0.5, dt);
  easing.damp(cur, 'spin', pose.spin, 0.5, dt);
  easing.damp(cur, 'p', pose.p, 0.5, dt);
}
```

- [ ] **Step 3: Kill the vpScale fudge for anchored poses.** `vpScale` (line ~339) existed to stop viewport overflow; anchored scale is already viewport-correct. Change:

```ts
const vpScale = anchorName || getRect('cta') ? 1 : Math.min(1, Math.max(0.55, Math.min(width, height) / 900));
```

(Fallback path keeps the old clamp.)

- [ ] **Step 4: Chat power modulation.** Import `jewelBus`. In the loop's scale computation (step 4 of the loop), add before `group.scale.setScalar`:

```ts
// Chat "power" pulse — only while docked at the chat anchor.
let power = 1;
if (anchorName === 'chat') {
  const activity = jewelBus.get();
  if (activity === 'thinking') power = 1 + Math.sin(t * 9) * 0.05;
  else if (activity === 'answering') power = 1.1; // brief flash; bus resets to idle
  else power = 1 + Math.sin(t * 2.2) * 0.02; // idle slow pulse
}
```

and multiply it into the setScalar call: `cur.s * vpScale * yieldF * breath * power * (1 + pulseRef.current * 0.12)`.
Also modulate the neural material emissive right after the crown emissive line:

```ts
const neuralMat = shapes.neural.material as THREE.MeshStandardMaterial;
if (neuralMat.emissive !== undefined) {
  neuralMat.emissiveIntensity =
    anchorName === 'chat' && jewelBus.get() === 'thinking'
      ? 0.35 + Math.sin(t * 9) * 0.2
      : 0.15;
}
```

(If `shapes.neural.material` is not a MeshStandardMaterial with emissive, guard exists — check `shapes.ts` during implementation and use the actual material field.)

- [ ] **Step 5: Tests + typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: green. If `storyTimeline.test.ts` asserts on removed x/y/s semantics, update those assertions to test `BEAT_ANCHOR` mapping instead (4 entries, beat 2 null).

- [ ] **Step 6: Visual smoke + commit**

`npm run dev` → scroll: gem rests inside hero slot, flies into chat dock, exits toward CTA during projects, lands in crown slot. Crown never covers text (slot reserved).

```bash
git add src/components/JewelScene/JewelRig.tsx src/components/JewelScene/storyTimeline.ts src/test/storyTimeline.test.ts
git commit -m "feat(jewel): DOM-anchored poses — gem docks inside real layout slots"
```

---

### Task 5: Chat emits activity

**Files:**
- Modify: `src/components/Chatbot/ThreeJsChatbot.tsx` (~lines 151-220: message send flow)

**Interfaces:**
- Consumes: `jewelBus` (Task 1).

- [ ] **Step 1: Wire the three states.** In the send flow (`sendMessage`, line ~191): call `jewelBus.set('thinking')` right after the user message is appended; in the API success handler (line ~205-210) call `jewelBus.set('answering')` before appending the bot message, then `window.setTimeout(() => jewelBus.set('idle'), 900)`; in the error/canned-response paths (line ~198, ~215) same answering→idle sequence. Component unmount: `useEffect(() => () => jewelBus.set('idle'), [])`.

- [ ] **Step 2: Test + commit**

Run: `npx vitest run && npx tsc --noEmit` — green.
Visual: open home, ask the chatbot something → gem fast-pulses while typing indicator shows, flashes on answer, settles.

```bash
git add src/components/Chatbot/ThreeJsChatbot.tsx
git commit -m "feat(chat): emit thinking/answering to the jewel bus"
```

---

### Task 6: Multiply engine — per-card growth instances (beat 3)

**Files:**
- Create: `src/components/JewelScene/GrowthInstances.tsx`
- Modify: `src/pages/HomePage.tsx` (project cards in `story-portfolio`, ~lines 379-512: add `data-jewel-anchor="project-0|1|2"` to each card's chart slot)
- Modify: `src/components/JewelScene/JewelRig.tsx` (mount `<GrowthInstances>`)

**Interfaces:**
- Consumes: `useJewelAnchors` pattern (queries `[data-jewel-anchor^="project-"]` itself), `fractionToWorld`, perf profile.
- Produces: self-contained r3f component; active only while beat 2 is in viewport and `tier === 'full'`.

- [ ] **Step 1: Add card slots.** In each project card in `story-portfolio` (the real-metric cards from commit 89aaa97), add a chart slot above the card title:

```tsx
<Box data-jewel-anchor={`project-${index}`} aria-hidden="true" h="72px" w="100%" pointerEvents="none" />
```

- [ ] **Step 2: Implement `GrowthInstances.tsx`**

```tsx
// src/components/JewelScene/GrowthInstances.tsx
// Beat-3 multiply engine: one mini growth chart per project card, docked at
// the card's [data-jewel-anchor="project-i"] slot. Bars grow when THEIR card
// enters the viewport (IntersectionObserver), not with global scroll.
// Full tier only; mounted by JewelRig.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';
import { fractionToWorld } from './chapterResolver';
import { rectToPose } from './anchorPose';

const BAR_COUNT = 3;
const GOLD = new THREE.Color('#c2a05c');
const CRIMSON = new THREE.Color('#8a1626');

export const GrowthInstances: React.FC = () => {
  const size = useThree((s) => s.size);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const slotsRef = useRef<HTMLElement[]>([]);
  const grownRef = useRef<number[]>([]); // 0..1 growth per card
  const visibleRef = useRef(false);

  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.16, 1, 0.16);
    geo.translate(0, 0.5, 0); // grow upward from the baseline
    const mat = new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.3 });
    const m = new THREE.InstancedMesh(geo, mat, 12); // up to 4 cards × 3 bars
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    return m;
  }, []);

  useEffect(() => () => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }, [mesh]);

  useEffect(() => {
    const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-jewel-anchor^="project-"]'));
    slotsRef.current = slots;
    grownRef.current = slots.map(() => 0);
    const ios = slots.map((el, i) => {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) grownRef.current[i] = grownRef.current[i] || 0.001; },
        { threshold: 0.4 });
      io.observe(el);
      return io;
    });
    const section = document.getElementById('story-portfolio');
    let sectionIo: IntersectionObserver | undefined;
    if (section) {
      sectionIo = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.05 });
      sectionIo.observe(section);
    }
    return () => { ios.forEach((io) => io.disconnect()); sectionIo?.disconnect(); };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const { width, height } = sizeRef.current;
    const aspect = width / Math.max(1, height);
    const slots = slotsRef.current;
    if (!visibleRef.current || slots.length === 0) { mesh.count = 0; return; }

    let idx = 0;
    slots.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      // ease growth once triggered
      if (grownRef.current[i] > 0) {
        grownRef.current[i] = Math.min(1, grownRef.current[i] + dt * 1.6);
      }
      const g = easing.linear(grownRef.current[i]); // 0..1
      const pose = rectToPose(rect, width, height);
      const world = fractionToWorld(pose.x, pose.y, aspect);
      const slotWorldH = pose.s * 2.6; // rectToPose fit: world size of the slot
      for (let b = 0; b < BAR_COUNT; b++) {
        const barH = slotWorldH * (0.35 + 0.3 * b) * g;
        dummy.position.set(world.x + (b - 1) * slotWorldH * 0.32, world.y - slotWorldH / 2, 0);
        dummy.scale.set(slotWorldH * 0.9, Math.max(0.0001, barH), slotWorldH * 0.9);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
        color.copy(GOLD).lerp(CRIMSON, b / (BAR_COUNT - 1));
        mesh.setColorAt(idx, color);
        idx++;
      }
    });
    mesh.count = idx;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return <primitive object={mesh} />;
};

export default GrowthInstances;
```

Note: `easing.linear` — if maath lacks it, use the identity (`const g = grownRef.current[i]`); check at implementation.

Spec deviation, accepted: the spec's exit "convergence" (N instances flying into one body) is simplified to instances holding position while the section scrolls away (`visibleRef` gates count to 0 off-screen) + the main gem's glide-to-CTA selling the handoff. If the visual pass (Task 8) finds the exit reads poorly, implement convergence there as a follow-up — do not build it speculatively here.

- [ ] **Step 3: Mount tier-gated in JewelRig scene JSX**

```tsx
{!lite && <GrowthInstances />}
```

- [ ] **Step 4: Tests + visual + commit**

Run: `npx vitest run && npx tsc --noEmit` — green.
Visual: scroll to projects → three mini bar-charts grow inside their cards as each card enters; main gem is mid-flight to the CTA; scrolling back reverses cleanly.

```bash
git add src/components/JewelScene/GrowthInstances.tsx src/components/JewelScene/JewelRig.tsx src/pages/HomePage.tsx
git commit -m "feat(jewel): multiply engine — per-card growth instances on beat 3"
```

---

### Task 7: Quality pass — procedural environment + physical materials + contact shadows

**Files:**
- Modify: `src/components/JewelScene/JewelRig.tsx` (scene JSX)
- Modify: `src/components/JewelScene/shapes.ts` (material upgrade, full tier)

**Interfaces:**
- Consumes: perf profile tier.

- [ ] **Step 1: Procedural environment (no network — Global Constraint).** In JewelRig's scene JSX, add for full tier only:

```tsx
{!lite && (
  <Environment resolution={256} frames={1}>
    {/* Neutral studio: big soft key, warm gold bounce, cool rim — procedural
        Lightformers render once into the env map (frames={1}), zero fetches. */}
    <Lightformer intensity={1.4} position={[0, 3, 4]} scale={[6, 3, 1]} />
    <Lightformer intensity={0.8} color="#e8b765" position={[-4, 1, 2]} scale={[3, 3, 1]} />
    <Lightformer intensity={0.5} color="#9db8ff" position={[4, -1, -3]} scale={[3, 3, 1]} />
  </Environment>
)}
```

Import: `import { Environment, Lightformer } from '@react-three/drei';`

- [ ] **Step 2: Material upgrade in `shapes.ts`.** Read the current material creation; for each faceted costume switch (full tier) `MeshStandardMaterial` → `MeshPhysicalMaterial` with `metalness: 0.85, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.1` — keep each shape's existing `color`/`emissive` values verbatim. `buildShapes()` gains an optional arg `buildShapes(quality: 'full' | 'lite' = 'full')`; JewelRig passes `profile.tier`. Lite returns exactly today's materials (no regression on mobile).

- [ ] **Step 3: Contact shadow at dock.** Add under the group in JewelRig (full tier):

```tsx
{!lite && <ContactShadows position={[0, -1.6, 0]} opacity={0.28} scale={7} blur={2.6} far={3} frames={Infinity} />}
```

Import from drei. If the fixed shadow plane reads wrong against multi-section scroll (it may — the canvas is viewport-fixed), drop this step and note it in the commit body; the env map is the load-bearing quality change.

- [ ] **Step 4: Tests + visual + commit**

Run: `npx vitest run && npx tsc --noEmit` — green.
Visual: facets show real reflections; gold reads metallic, not flat. FPS spot-check in devtools (full tier should hold 60 on the RTX/desktop).

```bash
git add src/components/JewelScene/JewelRig.tsx src/components/JewelScene/shapes.ts
git commit -m "feat(jewel): procedural env lighting + physical materials + contact shadow"
```

---

### Task 8: Degradations + visual verification pass

**Files:**
- Modify: `src/components/JewelScene/index.tsx` / `JewelRig.tsx` / `src/pages/HomePage.tsx` (responsive anchor values only — findings-driven)

- [ ] **Step 1: Reduced motion.** Verify (OS setting or devtools emulation `prefers-reduced-motion: reduce`): gem renders statically at each section's anchor while scrolling (v2 already snaps `cur` — with Task 4 it snaps to anchor poses; canvas wrapper stays absolute). No flights, no pulsing. Fix anything that animates.

- [ ] **Step 2: Mobile 390px.** Devtools mobile viewport: hero anchor scales down (Task 3 base values), chat dock 56px, multiply engine OFF (lite tier — single gem glides through the section), crown slot 120px, nothing overlaps. Adjust the responsive props from Task 3 by eye — commit whatever changes.

- [ ] **Step 3: WebGL-off.** In devtools run with WebGL disabled (or temporarily throw in JewelRig): anchors collapse via `data-jewel-off` CSS, no dead gaps, page reads fine.

- [ ] **Step 4: Full-suite + screenshot record.** Run: `npx vitest run && npm run build` — green. Take a screenshot per beat (desktop + 390px) into `docs/design-reference/v3-verification/` — the before/after record.

- [ ] **Step 5: Commit + deploy to realeza.lab**

```bash
git add -A && git commit -m "tune(jewel): responsive anchor values + degradation verification"
docker compose -f docker-compose.prod.yml -f docker-compose.sputnik.yml -p realeza up -d --build frontend
```

Expected: https://realeza.lab serves the new build; Luis reviews each beat live.
