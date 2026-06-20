# Jewel Scrollytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Home jewel the focus of a clean scroll-scrubbed story — real distinct forms (stone → neural lattice → columns → crown), bigger and scroll-readable, migrating side→center, driven by continuous scroll progress (native wheel, never an ugly in-between).

**Architecture:** The gem is already a fixed full-viewport canvas overlay (always "pinned"). We realize the approved **sticky-scrub** feel by keeping the four Home story sections (they supply ~400vh of natural scroll height) and replacing the old "dash to nearest chapter" with a pure `storyTimeline.resolvePose(progress)` that interpolates the gem's pose + shape-crossfade continuously from scroll progress across the story span. Two new Three.js geometries (neural lattice, faceted crown) plus a roughened stone join the costume set. This is a lower-risk realization than a new 400vh sticky DOM container and is strictly better for "don't make scroll uncomfortable."

**Tech Stack:** React 18 + TS, @react-three/fiber 8, three 0.184, Chakra UI v2, framer-motion v11, i18next, Vitest.

## Global Constraints

- Build directly in `frontend/` (NOT `frontend_iterations/`).
- The gem stays a **fixed pointer-events:none canvas overlay**; the existing hit-proxy / `pan-y` interaction from prior work is untouched.
- Pose is driven by **continuous scroll progress** — the `useFrame` loop must NOT call React setState per frame (only the active-beat change emits, via the existing `chapterChanged` helper pattern).
- New geometry is **procedural + deterministic** (no `Math.random` in build — stable across loads, same rule as the existing `growth`/`pseudoNoise` code).
- Forms per beat: beat0 `ico` (rough stone), beat1 `neural` (new), beat2 `growth` (columns), beat3 `crown` (new faceted crown). Sizes bumped so forms read (hero ≈1.1, crown ≈1.4; final values tuned on dev).
- Reduced-motion: gem snaps to the nearest beat pose (no continuous scrub), text/label swap instantly, no auto-spin.
- Every user-facing string in BOTH en and es translation files. Reuse `brand.*` tokens.
- Run tests from `frontend/`: `npm test`, `npx tsc --noEmit`. Commit per task (Conventional Commits) ending with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- **Visual verification on `dev.la-realeza.com` is REQUIRED** — geometry silhouettes and scroll feel are not unit-testable. After the geometry/rig tasks, redeploy the branch to dev and eyeball before final sign-off.

---

### Task 1: Roughen the stone (ch0 `ico`)

Replace the neat icosahedron with a rough, asymmetric crystal via deterministic per-vertex displacement.

**Files:**
- Modify: `frontend/src/components/JewelScene/shapes.ts` (the `ico` build inside `buildShapes`, ~line 105-111; add a `buildStoneGeometry` helper near `buildGrowthGeometry`)
- Test: `frontend/src/test/shapes.test.ts` (new)

**Interfaces:**
- Produces: `buildStoneGeometry(): THREE.BufferGeometry` (module-internal); `ico` costume now uses it. No public signature change to `buildShapes`.

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/test/shapes.test.ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildShapes, SHAPE_NAMES } from '../components/JewelScene/shapes';

describe('shapes', () => {
  it('stone (ico) is roughened and deterministic across builds', () => {
    const a = buildShapes().ico.mesh as THREE.Mesh;
    const b = buildShapes().ico.mesh as THREE.Mesh;
    const pa = (a.geometry.getAttribute('position').array as Float32Array);
    const pb = (b.geometry.getAttribute('position').array as Float32Array);
    expect(pa.length).toBeGreaterThan(0);
    expect(Array.from(pa)).toEqual(Array.from(pb)); // deterministic: no Math.random
    // roughened: vertex radii vary (not all equal to a single sphere radius)
    const radii = new Set<number>();
    for (let i = 0; i < pa.length; i += 3) {
      radii.add(Math.round(Math.hypot(pa[i], pa[i + 1], pa[i + 2]) * 100) / 100);
    }
    expect(radii.size).toBeGreaterThan(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/shapes.test.ts`
Expected: FAIL — `ico` is a smooth `IcosahedronGeometry` (uniform radius → `radii.size` is 1).

- [ ] **Step 3: Implement `buildStoneGeometry` and use it for `ico`**

Add near `buildGrowthGeometry` in `shapes.ts` (reuses the existing `pseudoNoise`):

```ts
// Rough crystalline stone: detail-1 icosahedron with deterministic per-vertex
// radial displacement (no Math.random — geometry identical across loads).
function buildStoneGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
  const pos = geo.getAttribute('position').array as Float32Array;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    const d = 0.78 + pseudoNoise(x, y, z) * 0.34; // radial scale 0.78..1.12
    pos[i] = x * d; pos[i + 1] = y * d; pos[i + 2] = z * d;
  }
  geo.computeVertexNormals();
  return geo;
}
```

In `buildShapes`, replace the `icoGeo` line:

```ts
  // 1. ico — piedra en bruto (hero): roughened crystal
  const icoGeo = buildStoneGeometry();
```

(Leave the `icoMat` and the rest of the `ico` block as-is.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/shapes.test.ts`
Expected: PASS.

- [ ] **Step 5: Full suite + typecheck + commit**

Run: `cd frontend && npm test && npx tsc --noEmit` (expected: clean)

```bash
git add frontend/src/components/JewelScene/shapes.ts frontend/src/test/shapes.test.ts
git commit -m "feat(jewel): roughen the stone costume (deterministic displacement)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Neural lattice costume (ch1, new geometry)

A new `neural` costume: gold InstancedMesh nodes + crimson LineSegments edges in a `Group`.

**Files:**
- Modify: `frontend/src/components/JewelScene/chapterResolver.ts:2` (add `'neural'` to `ShapeName`)
- Modify: `frontend/src/components/JewelScene/shapes.ts` (add `buildNeural`; add to `buildShapes` return + `SHAPE_NAMES`; widen `BuiltShape.mesh` to `THREE.Object3D`)
- Test: `frontend/src/test/shapes.test.ts`

**Interfaces:**
- Consumes: `ShapeName` (now includes `'neural'`).
- Produces: `BuiltShape { mesh: THREE.Object3D; material: THREE.Material }`; `buildShapes().neural` → a `Group` with an `InstancedMesh` (12 instances) + `LineSegments`; `SHAPE_NAMES` includes `'neural'`.

- [ ] **Step 1: Write the failing test**

Append to `frontend/src/test/shapes.test.ts`:

```ts
import { InstancedMesh, LineSegments, Group } from 'three';

describe('neural costume', () => {
  it('builds a Group with instanced nodes + line edges; listed in SHAPE_NAMES', () => {
    expect(SHAPE_NAMES).toContain('neural');
    const n = buildShapes().neural.mesh;
    expect(n).toBeInstanceOf(Group);
    const inst = n.children.find((c) => c instanceof InstancedMesh) as InstancedMesh;
    const edges = n.children.find((c) => c instanceof LineSegments);
    expect(inst).toBeTruthy();
    expect(inst.count).toBe(12);
    expect(edges).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/shapes.test.ts`
Expected: FAIL — `SHAPE_NAMES` has no `'neural'`; `buildShapes().neural` is undefined.

- [ ] **Step 3: Add `'neural'` to `ShapeName`**

In `frontend/src/components/JewelScene/chapterResolver.ts` line 2:

```ts
export type ShapeName = 'ico' | 'octa' | 'sphere' | 'knot' | 'crown' | 'growth' | 'neural';
```

- [ ] **Step 4: Implement `buildNeural` + widen `BuiltShape`**

In `shapes.ts`, widen the interface:

```ts
export interface BuiltShape {
  mesh: THREE.Object3D;
  material: THREE.Material;
}
```

Add the builder (deterministic Fibonacci-sphere node placement; each node linked to its 2 nearest):

```ts
// Neural lattice: gold instanced node-spheres on a sphere shell + crimson edge
// lines to each node's two nearest neighbours. Deterministic placement.
function buildNeural(): { group: THREE.Group; material: THREE.Material } {
  const N = 12;
  const R = 1.3;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    pts.push(new THREE.Vector3(
      R * Math.sin(phi) * Math.cos(theta),
      R * Math.sin(phi) * Math.sin(theta),
      R * Math.cos(phi),
    ));
  }
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0xe6b964, metalness: 0.6, roughness: 0.3,
    emissive: new THREE.Color(0x7e0a23), emissiveIntensity: 0.15,
  });
  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 12, 12), nodeMat, N);
  const m = new THREE.Matrix4();
  pts.forEach((v, i) => { m.makeTranslation(v.x, v.y, v.z); nodes.setMatrixAt(i, m); });
  nodes.instanceMatrix.needsUpdate = true;

  const linePos: number[] = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of near) {
      linePos.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
    }
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const edges = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0xc10e35, transparent: true, opacity: 0.6 }),
  );

  const group = new THREE.Group();
  group.add(nodes);
  group.add(edges);
  return { group, material: nodeMat };
}
```

In `buildShapes`, before the `return`, build it and add to the return + `SHAPE_NAMES`:

```ts
  const neural = buildNeural();
```

Return object — add the entry:

```ts
    neural: { mesh: neural.group, material: neural.material },
```

And extend the exported list:

```ts
export const SHAPE_NAMES: ShapeName[] = ['ico', 'octa', 'sphere', 'knot', 'crown', 'growth', 'neural'];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/shapes.test.ts`
Expected: PASS.

- [ ] **Step 6: Full suite + typecheck + commit**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: clean. (Existing `chapterResolver.test.ts` still green — `ShapeName` only gained a member.)

```bash
git add frontend/src/components/JewelScene/shapes.ts frontend/src/components/JewelScene/chapterResolver.ts frontend/src/test/shapes.test.ts
git commit -m "feat(jewel): neural-lattice costume (instanced nodes + edge lines)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Faceted crown costume (ch3, rebuild)

Replace the gold-icosahedron "crown" with a real crown `Group`: band + radial spikes + crimson set-jewels. Keep an emissive material the rig can pulse.

**Files:**
- Modify: `frontend/src/components/JewelScene/shapes.ts` (the `crown` build ~line 138-144; add `buildCrown`)
- Test: `frontend/src/test/shapes.test.ts`

**Interfaces:**
- Produces: `buildShapes().crown` → a `Group`; `buildShapes().crown.material` is a `THREE.MeshStandardMaterial` (the band gold, with `emissive`) so `JewelRig`'s pulse (`shapes.crown.material.emissiveIntensity = …`) still works.

- [ ] **Step 1: Write the failing test**

Append to `frontend/src/test/shapes.test.ts`:

```ts
import { MeshStandardMaterial } from 'three';

describe('crown costume', () => {
  it('is a Group of band + spikes + jewels with a pulsable emissive material', () => {
    const c = buildShapes().crown;
    expect(c.mesh).toBeInstanceOf(Group);
    // 1 band + 8 spikes + 8 jewels = 17 children
    expect(c.mesh.children.length).toBe(17);
    expect(c.material).toBeInstanceOf(MeshStandardMaterial);
    expect((c.material as MeshStandardMaterial).emissive).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/shapes.test.ts`
Expected: FAIL — `crown.mesh` is a single `Mesh`, not a `Group` of 17.

- [ ] **Step 3: Implement `buildCrown` and use it**

Add to `shapes.ts`:

```ts
// Faceted crown: open cylinder band + radial cone spikes + crimson set-jewels.
// The band's gold material carries the emissive the rig pulses.
function buildCrown(): { group: THREE.Group; material: THREE.MeshStandardMaterial } {
  const SPIKES = 8;
  const RING = 1.0;
  const gold = new THREE.MeshStandardMaterial({
    color: 0xe8b765, metalness: 0.85, roughness: 0.3, flatShading: true,
    emissive: new THREE.Color(0xc10e35), emissiveIntensity: 0.25,
  });
  const jewelMat = new THREE.MeshStandardMaterial({ color: 0xc10e35, metalness: 0.4, roughness: 0.2 });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(RING, RING, 0.8, 12, 1, true), gold)); // band
  for (let i = 0; i < SPIKES; i++) {
    const a = (i / SPIKES) * Math.PI * 2;
    const x = Math.cos(a) * RING, z = Math.sin(a) * RING;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 4), gold);
    spike.position.set(x, 0.6, z);
    group.add(spike);
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), jewelMat);
    jewel.position.set(x, 1.05, z);
    group.add(jewel);
  }
  return { group, material: gold };
}
```

Replace the `crown` block in `buildShapes` (the `crownGeo`/`crownMat`/`crown` lines) with:

```ts
  // 5. crown — joya de la corona: real faceted crown. The pulsing emissive
  // (0.18 + w * (0.3 + sin(t*2.2) * 0.16)) is driven in the rig's loop.
  const crownBuilt = buildCrown();
```

And in the return object, change the `crown` entry to:

```ts
    crown: { mesh: crownBuilt.group, material: crownBuilt.material },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/shapes.test.ts`
Expected: PASS.

- [ ] **Step 5: Full suite + typecheck + commit**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: clean. (`JewelRig` reads `shapes.crown.material.emissiveIntensity` — still valid; `mesh.scale`/`visible` work on a Group.)

```bash
git add frontend/src/components/JewelScene/shapes.ts frontend/src/test/shapes.test.ts
git commit -m "feat(jewel): real faceted crown costume (band + spikes + jewels)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `storyTimeline` resolver (pure, TDD)

The scroll-progress → pose engine. Replaces "dash to nearest chapter" with continuous interpolation.

**Files:**
- Create: `frontend/src/components/JewelScene/storyTimeline.ts`
- Test: `frontend/src/test/storyTimeline.test.ts`

**Interfaces:**
- Consumes: `ShapeName` from `chapterResolver`.
- Produces:
  - `BEAT_IDS: string[]` = `['story-hero','story-chatbot','story-portfolio','story-cta']`
  - `interface Pose { x:number; y:number; s:number; spin:number; p:number; weights: Record<ShapeName, number>; beat:number }`
  - `resolvePose(progress: number, mobile?: boolean): Pose`
  - `activeBeat(progress: number): number`

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/test/storyTimeline.test.ts
import { describe, it, expect } from 'vitest';
import { resolvePose, activeBeat, BEAT_IDS } from '../components/JewelScene/storyTimeline';

describe('storyTimeline', () => {
  it('beat0 at progress 0: stone dominant, anchored right', () => {
    const p = resolvePose(0);
    expect(p.weights.ico).toBeCloseTo(1);
    expect(p.x).toBeGreaterThanOrEqual(0.7); // anchored right
    expect(p.beat).toBe(0);
  });
  it('beat3 at progress 1: crown dominant, centered, largest', () => {
    const p = resolvePose(1);
    expect(p.weights.crown).toBeCloseTo(1);
    expect(p.x).toBeGreaterThan(0.42);
    expect(p.x).toBeLessThan(0.58); // centered
    expect(p.s).toBeGreaterThan(resolvePose(0).s); // climax is larger
    expect(p.beat).toBe(3);
  });
  it('midway between two beats blends weights and interpolates position', () => {
    const p = resolvePose(1 / 6); // halfway through segment 0→1
    expect(p.weights.ico).toBeGreaterThan(0);
    expect(p.weights.neural).toBeGreaterThan(0);
    expect(p.weights.ico + p.weights.neural).toBeCloseTo(1);
  });
  it('clamps out-of-range progress', () => {
    expect(resolvePose(-1).beat).toBe(0);
    expect(resolvePose(2).beat).toBe(3);
  });
  it('mobile variants differ from desktop', () => {
    expect(resolvePose(0, true).x).not.toBe(resolvePose(0, false).x);
  });
  it('activeBeat is the nearest stop index; BEAT_IDS has 4 ids', () => {
    expect(BEAT_IDS).toHaveLength(4);
    expect(activeBeat(0)).toBe(0);
    expect(activeBeat(0.5)).toBe(2);
    expect(activeBeat(1)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/storyTimeline.test.ts`
Expected: FAIL — cannot resolve `../components/JewelScene/storyTimeline`.

- [ ] **Step 3: Implement the resolver**

```ts
// frontend/src/components/JewelScene/storyTimeline.ts
import type { ShapeName } from './chapterResolver';
import { SHAPE_NAMES } from './shapes';

export const BEAT_IDS = ['story-hero', 'story-chatbot', 'story-portfolio', 'story-cta'];

interface Stop {
  x: number; y: number; s: number; shape: ShapeName; spin: number; p: number;
  mx: number; my: number; ms: number; // mobile pose variants
}

// The approved choreography: anchored right for beats 0-1, migrating to centre
// and growing for beats 2-3 (crown climax). Sizes well above the old ~0.5 so the
// forms read. Final values tuned on dev screenshots.
const STOPS: Stop[] = [
  { x: 0.78, y: 0.46, s: 1.10, shape: 'ico',    spin: 0.30, p: 0.50, mx: 0.50, my: 0.30, ms: 0.80 },
  { x: 0.78, y: 0.46, s: 0.95, shape: 'neural', spin: 0.45, p: 0.00, mx: 0.50, my: 0.30, ms: 0.72 },
  { x: 0.58, y: 0.52, s: 1.15, shape: 'growth', spin: 0.35, p: 0.10, mx: 0.50, my: 0.34, ms: 0.86 },
  { x: 0.50, y: 0.50, s: 1.40, shape: 'crown',  spin: 0.30, p: 0.80, mx: 0.50, my: 0.32, ms: 0.95 },
];

export interface Pose {
  x: number; y: number; s: number; spin: number; p: number;
  weights: Record<ShapeName, number>;
  beat: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function activeBeat(progress: number): number {
  return Math.round(clamp01(progress) * (STOPS.length - 1));
}

export function resolvePose(progress: number, mobile = false): Pose {
  const segs = STOPS.length - 1;          // 3 segments for 4 stops
  const g = clamp01(progress) * segs;
  const i = Math.min(segs - 1, Math.floor(g));
  const t = g - i;                         // 0..1 within the segment
  const a = STOPS[i], b = STOPS[i + 1];

  const weights = {} as Record<ShapeName, number>;
  for (const name of SHAPE_NAMES) weights[name] = 0;
  weights[a.shape] += 1 - t;
  weights[b.shape] += t;                   // same shape on both stops sums to 1

  return {
    x: lerp(mobile ? a.mx : a.x, mobile ? b.mx : b.x, t),
    y: lerp(mobile ? a.my : a.y, mobile ? b.my : b.y, t),
    s: lerp(mobile ? a.ms : a.s, mobile ? b.ms : b.s, t),
    spin: lerp(a.spin, b.spin, t),
    p: lerp(a.p, b.p, t),
    weights,
    beat: activeBeat(progress),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/storyTimeline.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Full suite + typecheck + commit**

Run: `cd frontend && npm test && npx tsc --noEmit` (expected: clean)

```bash
git add frontend/src/components/JewelScene/storyTimeline.ts frontend/src/test/storyTimeline.test.ts
git commit -m "feat(jewel): scroll-progress story timeline resolver (TDD)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Drive `JewelRig` from scroll progress

Replace the dash/`resolveChapter` pose driver with continuous `resolvePose(progress)`; emit the active beat for the label.

**Files:**
- Modify: `frontend/src/components/JewelScene/JewelRig.tsx` (imports; the chapter resolution + dash block ~line 296-337; the costume crossfade ~line 376-384; the `onChapterChange` emit ~line 313-320)
- Test: existing suite must stay green; no new unit test (rig is canvas code, mocked in jsdom) — covered by `storyTimeline` + visual verify.

**Interfaces:**
- Consumes: `resolvePose`, `activeBeat`, `BEAT_IDS` (Task 4); `chapterChanged` (existing).
- Produces: `onChapterChange(BEAT_IDS[beat])` on beat change (unchanged prop signature; label keeps working).

- [ ] **Step 1: Add imports + a progress helper**

In `JewelRig.tsx`, add to the `./storyTimeline` import (new) and keep `chapterChanged` from `./chapterResolver`:

```ts
import { resolvePose, activeBeat, BEAT_IDS } from './storyTimeline';
```

The rig already measures section rects into `rangesRef` and tracks `scrollRef`. Compute progress from the story span (first beat top → last beat bottom) inside the loop.

- [ ] **Step 2: Replace the chapter-resolution + dash block**

Replace the block currently spanning the active-chapter resolution through the dash easing (≈ lines 296-337, from `// 1. Active chapter` down to the end of the `else { cur.x += … }` dash) with progress-driven pose:

```ts
    // 1. Scroll progress across the story span (first beat top → last beat bottom).
    const ranges = rangesRef.current;
    let progress = 0;
    if (ranges.length > 0) {
      const top = ranges[0].top;
      const bottom = ranges[ranges.length - 1].bottom;
      const span = Math.max(1, bottom - top - window.innerHeight);
      progress = (sy - top) / span;
    }
    const pose = resolvePose(progress, lite);

    // Emit the active beat to React only on change — drives the DOM label.
    const beatId = BEAT_IDS[pose.beat];
    if (onChapterChange && chapterChanged(lastChapterRef.current, beatId)) {
      lastChapterRef.current = beatId;
      onChapterChange(beatId);
    }

    // 2. Ease the live pose toward the scrubbed target. Reduced motion snaps.
    const kEase = reduced ? 1 : 0.18;
    cur.x += (pose.x - cur.x) * kEase;
    cur.y += (pose.y - cur.y) * kEase;
    cur.s += (pose.s - cur.s) * kEase;
    cur.spin += (pose.spin - cur.spin) * (reduced ? 1 : 0.1);
    cur.p += (pose.p - cur.p) * (reduced ? 1 : 0.1);
    const dist = Math.hypot(pose.x - cur.x, pose.y - cur.y);
```

(Keep the subsequent `settled`, world-position, and scale lines that reference `cur` and `dist` — they are unchanged.)

- [ ] **Step 3: Drive the costume crossfade from pose weights**

Replace the costume-crossfade loop (≈ lines 376-384) so weights come from the pose (scrubs with scroll → readable morph):

```ts
    // 6. Costume crossfade — weights scrub directly with scroll progress.
    const w = weightsRef.current;
    for (const name of SHAPE_NAMES) {
      const target = pose.weights[name];
      w[name] += (target - w[name]) * (reduced ? 1 : 0.13);
      const mesh = shapes[name].mesh;
      mesh.visible = w[name] > 0.015;
      mesh.scale.setScalar(Math.max(0.0001, w[name]));
    }
```

- [ ] **Step 4: Remove the now-unused `resolveChapter`/`KEYFRAMES` imports in this file**

Delete `resolveChapter` and `KEYFRAMES` from the `./chapterResolver` import in `JewelRig.tsx` if they are no longer referenced (keep `chapterChanged` and the fraction helpers `fractionToWorld`/`worldToFraction` and `SectionRange`/`ShapeName` types that the rest of the file still uses). Run `npx tsc --noEmit` to confirm nothing else references them.

- [ ] **Step 5: Full suite + typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS — route smoke tests still green (JewelScene mocked), `storyTimeline`/`shapes`/`chapterResolver` tests green, no TS errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/JewelScene/JewelRig.tsx
git commit -m "feat(jewel): drive pose from continuous scroll progress (sticky-scrub)

Replaces dash-to-nearest with storyTimeline.resolvePose; gem scrubs cleanly
along its designed path, morph reads with scroll, beat emits on change.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Story layout pairing + label retitle

Pair each section's content with the gem's beat pose (text left for 0-1; text-top/gem-bottom for beat 2; centered for beat 3), and retitle the beat-2 label to "The metrics".

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx` (the `story-portfolio` section ~line 365 — align content to the top so the gem sits below; the `story-cta` section ~line 586 — keep centered; hero/chatbot already left/centered)
- Modify: `frontend/src/components/JewelScene/ChapterLabel.tsx` (`CHAPTER_LABEL_KEY` value for `story-portfolio`)
- Modify: `frontend/src/i18n/locales/en/translation.json` + `.../es/translation.json` (`home.jewel.labels`: rename `theResults` → `theMetrics`)
- Test: existing route smoke tests stay green.

**Interfaces:**
- Consumes: `ChapterLabel` mapping; i18n.

- [ ] **Step 1: Retitle the label key (EN + ES)**

In both `translation.json` files, under `home.jewel.labels`, rename the key `theResults` to `theMetrics` and set the text:
- EN: `"theMetrics": "The metrics"`
- ES: `"theMetrics": "Las métricas"`

In `frontend/src/components/JewelScene/ChapterLabel.tsx`, update the map value:

```ts
  'story-portfolio': 'theMetrics',
```

(and update `frontend/src/test/chapterLabel.test.tsx` if it asserts the old `theResults` text — it does not by default; the existing tests use `story-hero`/`story-chatbot`, so no change needed.)

- [ ] **Step 2: Align the beat-2 (`story-portfolio`) content to the top**

In `HomePage.tsx`, the `story-portfolio` section's content container: set its vertical alignment so the copy sits in the **top** half and the lower half is clear for the gem (which beat-2 poses lower-centre). Change the section's content `VStack`/`Flex` to `justify="flex-start"` and add top padding, leaving the bottom ~45% open. Concretely, on the section's inner content wrapper add:

```tsx
        pt={{ base: '64px', md: '88px' }}
        pb={{ base: '40vh', md: '46vh' }}
```

(so the text occupies the top band and the gem's lower-centre pose has clear space beneath).

- [ ] **Step 3: Confirm hero/chatbot/cta alignment**

Hero (`story-hero`) and chatbot already place text left/centre with the gem to the right — unchanged. CTA (`story-cta`) is already centred — unchanged (the gem poses centred behind it at beat 3). No edits needed beyond verifying they read with the larger centred gem; final spacing tuned on dev.

- [ ] **Step 4: Run the suite + typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS — all five route markers still match (copy unchanged this task), no TS errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/HomePage.tsx frontend/src/components/JewelScene/ChapterLabel.tsx frontend/src/i18n/locales/en/translation.json frontend/src/i18n/locales/es/translation.json
git commit -m "feat(home): pair story content to the gem beats; label 'The metrics'

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Manual verification (REQUIRED — redeploy branch to dev.la-realeza.com)

After Task 6, push the branch and redeploy the `app-dev` stack, then on `dev.la-realeza.com`:
- Each form reads distinctly: rough stone → neural lattice → ascending columns → faceted crown (no two look alike; hero ≠ crown now).
- The gem is large enough to read; the morph scrubs smoothly with scroll (slow scroll = slow morph).
- The gem migrates right → centre across the four beats; beat-2 columns sit below the text; beat-3 crown is centred + glowing.
- The wheel feels 100% native — no jacking, no forced snap, never an ugly mid-position.
- Reduced-motion (OS setting): gem snaps to nearest beat, label/text instant, no auto-spin.
- Mobile: gem centred-high, never overlapping text.

Expect 1–3 screenshot iterations tuning the `STOPS` values (positions/sizes) and geometry silhouettes — adjust `storyTimeline.ts` STOPS and the geometry builders, redeploy, re-check.

## Self-Review

**Spec coverage:**
- Roughen stone → Task 1. ✅
- Neural lattice (new) → Task 2. ✅
- Faceted crown (new) → Task 3. ✅
- Scroll-progress timeline resolver (sticky-scrub) → Task 4. ✅
- Rig driven by progress, morph scrubs, beat emits → Task 5. ✅
- Story layout pairing (side→centre, beat-2 flip) + label retitle → Task 6. ✅
- Reduced-motion snap → Task 4 (`activeBeat`) + Task 5 (`kEase`/crossfade `reduced ? 1`). ✅
- Bigger gem + readable morph → Task 4 STOPS sizes + Task 5 weight scrub. ✅
- Visual verification required → manual-verification section. ✅
- Architecture deviation from spec's 400vh sticky DOM (uses existing fixed overlay + natural section height) → stated in Architecture + flagged at handoff. ✅

**Placeholder scan:** every code step has complete code; STOPS values concrete with "tuned on dev" noted (not a blank — real starting values given). ✅

**Type consistency:** `Pose`/`resolvePose`/`activeBeat`/`BEAT_IDS` defined in Task 4 and consumed in Task 5; `BuiltShape.mesh: THREE.Object3D` (Task 2) lets crown/neural be `Group`s (Tasks 2-3) and the rig's `mesh.scale`/`visible` still apply; `ShapeName` gains `'neural'` (Task 2) used by `STOPS` (Task 4) and `SHAPE_NAMES` loop (Task 5); `chapterChanged` reused (Task 5). ✅
