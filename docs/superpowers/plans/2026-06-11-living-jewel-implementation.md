# Living Jewel Hero System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Living Jewel hero (interactive field wallpaper + morph-ready draggable jewel) per spec `docs/superpowers/specs/2026-06-11-living-jewel-hero-design.md`, replace the legacy 3D layer site-wide, deploy.

**Architecture:** One Canvas on Home hero containing FieldLayer (pointer-aware shader points) and JewelRig (gem with onBeforeCompile morph injection, drag/tap interaction, procedural Lightformer environment). `useJewelStory` context exposes the morph API for future scroll choreography. `FieldAccent` (low-density field) replaces `RedJewelBackground` on all pages. Old 3D components and prototypes deleted.

**Tech Stack:** three 0.184, fiber 8.18, drei 9.122 (Float, Environment+Lightformer), React 18.3.1, Vitest. NO new dependencies.

**Branch:** `phase2d-three-rework` (continue; prototypes already on it under `src/components/ThreeBackground/prototypes/` — ProtoField.tsx and ProtoJewel.tsx are the starting material, evolve their shader/scene code, then delete the folder in Task 6).

**Research findings (context7, 2026-06-11) — follow these exactly:**
- onBeforeCompile (three official example pattern): prepend uniform/attribute declarations to `shader.vertexShader`, `replace('#include <begin_vertex>', ...)` to set `vec3 transformed`, blend normals at `#include <beginnormal_vertex>` (`vec3 objectNormal`), store `material.userData.shader = shader` for uniform updates, and set `material.customProgramCacheKey = () => 'jewel-morph'` so the renderer doesn't share programs.
- r3f pointer capture: `e.stopPropagation(); e.target.setPointerCapture(e.pointerId)` in onPointerDown; release in onPointerUp. Drag handlers ONLY on the gem mesh → page scroll untouched elsewhere.
- drei `Environment preset` loads from CDN — **forbidden in production**. Use procedural env: `<Environment resolution={256} frames={1}>` containing emissive Lightformer panels (gold key, cream fill, red floor) — zero network, royal-palette reflections, rendered once.

---

### Task 1: morphTargets registry (TDD)

**Files:**
- Create: `frontend/src/components/JewelScene/morphTargets.ts`
- Test: `frontend/src/test/morphTargets.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildMorphTargets, TARGET_NAMES } from '../components/JewelScene/morphTargets';

describe('morphTargets', () => {
  const targets = buildMorphTargets();

  it('registers gem and gemBreath', () => {
    expect(TARGET_NAMES).toEqual(['gem', 'gemBreath']);
    expect(Object.keys(targets)).toEqual(TARGET_NAMES);
  });

  it('all targets share identical vertex count', () => {
    const counts = TARGET_NAMES.map((n) => targets[n].positions.length);
    expect(new Set(counts).size).toBe(1);
    expect(counts[0] % 9).toBe(0); // non-indexed triangles: 3 verts * 3 components
  });

  it('gemBreath differs from gem but stays bounded', () => {
    const a = targets.gem.positions, b = targets.gemBreath.positions;
    let maxDelta = 0, sumDelta = 0;
    for (let i = 0; i < a.length; i++) {
      const d = Math.abs(a[i] - b[i]);
      maxDelta = Math.max(maxDelta, d); sumDelta += d;
    }
    expect(sumDelta).toBeGreaterThan(0);     // actually different
    expect(maxDelta).toBeLessThan(0.5);      // subtle, not a different object
  });

  it('is deterministic', () => {
    const again = buildMorphTargets();
    expect(again.gemBreath.positions).toEqual(targets.gemBreath.positions);
  });
});
```

- [ ] **Step 2: Run, expect FAIL (module not found):** `cd frontend && npx vitest run src/test/morphTargets.test.ts`

- [ ] **Step 3: Implement `frontend/src/components/JewelScene/morphTargets.ts`**

```ts
import * as THREE from 'three';

export interface MorphTarget {
  positions: Float32Array;
  normals: Float32Array;
}

export const TARGET_NAMES = ['gem', 'gemBreath'] as const;
export type TargetName = (typeof TARGET_NAMES)[number];

// Deterministic pseudo-noise (no Math.random — targets must be stable across loads)
function pseudoNoise(x: number, y: number, z: number): number {
  return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 + 0.5;
}

function baseGeometry(): THREE.BufferGeometry {
  // detail 1 icosahedron, non-indexed so every face owns its vertices (flat shading + per-face morph freedom)
  return new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
}

export function buildMorphTargets(): Record<TargetName, MorphTarget> {
  const gemGeo = baseGeometry();
  gemGeo.computeVertexNormals();
  const gemPos = gemGeo.getAttribute('position').array as Float32Array;
  const gemNorm = gemGeo.getAttribute('normal').array as Float32Array;

  // gemBreath: vertices displaced outward along normals by smooth deterministic noise
  const breathPos = new Float32Array(gemPos.length);
  for (let i = 0; i < gemPos.length; i += 3) {
    const n = pseudoNoise(gemPos[i], gemPos[i + 1], gemPos[i + 2]) * 0.22;
    breathPos[i] = gemPos[i] + gemNorm[i] * n;
    breathPos[i + 1] = gemPos[i + 1] + gemNorm[i + 1] * n;
    breathPos[i + 2] = gemPos[i + 2] + gemNorm[i + 2] * n;
  }
  const breathGeo = new THREE.BufferGeometry();
  breathGeo.setAttribute('position', new THREE.BufferAttribute(breathPos, 3));
  breathGeo.computeVertexNormals();
  const breathNorm = breathGeo.getAttribute('normal').array as Float32Array;

  const result: Record<TargetName, MorphTarget> = {
    gem: { positions: gemPos.slice(), normals: gemNorm.slice() },
    gemBreath: { positions: breathPos, normals: breathNorm },
  };
  gemGeo.dispose(); breathGeo.dispose();
  return result;
}
```

- [ ] **Step 4: Tests pass:** `npx vitest run src/test/morphTargets.test.ts` → 4 passing
- [ ] **Step 5: Commit:** `git add -A && git commit -m "feat: morph target registry — shared-vertex geometry states for the jewel story"`

### Task 2: useJewelStory controller (TDD)

**Files:**
- Create: `frontend/src/components/JewelScene/useJewelStory.tsx`
- Test: `frontend/src/test/jewelStory.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, vi } from 'vitest';
import { JewelStoryController } from '../components/JewelScene/useJewelStory';

describe('JewelStoryController', () => {
  it('starts on gem with progress 0', () => {
    const c = new JewelStoryController();
    expect(c.state).toEqual({ from: 'gem', to: 'gem', progress: 0 });
  });

  it('setTarget sets to-target and resets progress', () => {
    const c = new JewelStoryController();
    c.setTarget('gemBreath');
    expect(c.state.to).toBe('gemBreath');
    expect(c.state.progress).toBe(0);
  });

  it('setProgress clamps 0..1 and promotes at 1', () => {
    const c = new JewelStoryController();
    c.setTarget('gemBreath');
    c.setProgress(1.7);
    expect(c.state).toEqual({ from: 'gemBreath', to: 'gemBreath', progress: 0 }); // promoted B→A
    c.setProgress(-3);
    expect(c.state.progress).toBe(0);
  });

  it('notifies subscribers on every change and on pulse', () => {
    const c = new JewelStoryController();
    const fn = vi.fn();
    c.subscribe(fn);
    c.setTarget('gemBreath');   // 1
    c.setProgress(0.5);          // 2
    c.pulse();                   // 3 (event kind 'pulse')
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn.mock.calls[2][0]).toBe('pulse');
  });
});
```

- [ ] **Step 2: FAIL run.** `npx vitest run src/test/jewelStory.test.ts`

- [ ] **Step 3: Implement `useJewelStory.tsx`**

```tsx
import React, { createContext, useContext, useRef } from 'react';
import type { TargetName } from './morphTargets';

export interface JewelStoryState {
  from: TargetName;
  to: TargetName;
  progress: number; // 0..1 blend from→to
}

type Listener = (event: 'state' | 'pulse', state: JewelStoryState) => void;

// Plain controller (unit-testable, no React). The rig reads state via subscription
// inside useFrame — no React re-renders on progress changes.
export class JewelStoryController {
  state: JewelStoryState = { from: 'gem', to: 'gem', progress: 0 };
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  setTarget(name: TargetName): void {
    this.state = { from: this.state.to, to: name, progress: 0 };
    this.emit('state');
  }

  setProgress(p: number): void {
    const clamped = Math.min(1, Math.max(0, p));
    if (clamped === 1) {
      this.state = { from: this.state.to, to: this.state.to, progress: 0 }; // promote B→A
    } else {
      this.state = { ...this.state, progress: clamped };
    }
    this.emit('state');
  }

  pulse(): void {
    this.emit('pulse');
  }

  private emit(kind: 'state' | 'pulse') {
    this.listeners.forEach((fn) => fn(kind, this.state));
  }
}

const JewelStoryContext = createContext<JewelStoryController | null>(null);

export const JewelStoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const controller = useRef(new JewelStoryController());
  return <JewelStoryContext.Provider value={controller.current}>{children}</JewelStoryContext.Provider>;
};

export function useJewelStory(): JewelStoryController {
  const ctx = useContext(JewelStoryContext);
  if (!ctx) throw new Error('useJewelStory must be used inside JewelStoryProvider');
  return ctx;
}
```

- [ ] **Step 4: Tests pass** (4). All previous suites still green: `npx vitest run`.
- [ ] **Step 5: Commit:** `git add -A && git commit -m "feat: jewel story controller — morph API for future scroll choreography"`

### Task 3: FieldLayer with pointer parting

**Files:**
- Create: `frontend/src/components/JewelScene/FieldLayer.tsx` (evolve from `ThreeBackground/prototypes/ProtoField.tsx` — copy its shader, then modify; do NOT delete the prototype yet)

- [ ] **Step 1: Create FieldLayer.** Start from ProtoField's working internals (Points + ShaderMaterial + curl flow + band shaping + glow sprites, counts/alpha as tuned: 3500 base, alpha ≤0.35, rgb×0.55). Changes:

1. Component renders ONLY the scene contents (`<group>` with points + glows) — NO Canvas (the composition root owns it). Props: `{ density?: number; interactive?: boolean }`, default density 1, interactive true.
2. Particle count: `Math.round(3500 * density * profile.particleScale)` — profile via `usePerfProfile()`.
3. Add pointer parting to the vertex shader. New uniforms `uPointer: vec3` (world x, y, strength) lerped in useFrame:

```glsl
// after flow position is computed as vec3 p:
vec2 toPointer = p.xy - uPointer.xy;
float dist = length(toPointer);
float push = uPointer.z * smoothstep(2.2, 0.0, dist);
p.xy += normalize(toPointer + 1e-4) * push * 0.9;
```

4. useFrame (the layer's single hook): `uTime += delta`; when `interactive && profile.tier === 'full'`, unproject `state.pointer` to the band's plane (z≈0): `const v = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)` — direction from camera, intersect z=0 plane; write lerped `uPointer` (strength lerps to 1 while pointer over canvas, else to 0). Reuse ONE preallocated Vector3 (module-scope or ref) — no per-frame allocation.
5. Export `FieldLayer` (named + default).

- [ ] **Step 2: Verify compile:** `npx tsc --noEmit` clean. (Visual verify happens in Task 5 harness.)
- [ ] **Step 3: Commit:** `git add -A && git commit -m "feat: FieldLayer — pointer-aware particle current (scene-graph component)"`

### Task 4: JewelRig — morph shader, drag/tap, procedural environment

**Files:**
- Create: `frontend/src/components/JewelScene/JewelRig.tsx` (evolve gem/lights/dust from `ThreeBackground/prototypes/ProtoJewel.tsx`)

- [ ] **Step 1: Create JewelRig.** Scene-graph component (no Canvas). Structure:

```tsx
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import { buildMorphTargets } from './morphTargets';
import { useJewelStory } from './useJewelStory';
```

1. **Geometry + morph attribute:** `useMemo`: build targets once; create `BufferGeometry` with `position` = targets.gem.positions, `normal` = targets.gem.normals, plus attributes `aTargetPosition` and `aTargetNormal` (initialized to gem too).
2. **Material (the researched onBeforeCompile pattern):**

```tsx
const material = useMemo(() => {
  const m = new THREE.MeshPhysicalMaterial({
    color: '#8B0000', metalness: 0.1, roughness: 0.05,
    transmission: 0.9, thickness: 2, ior: 2.4,
    clearcoat: 1, clearcoatRoughness: 0.05,
    emissive: '#6B0F1F', emissiveIntensity: 0.18,
    specularColor: new THREE.Color('#FFD700'),
    envMapIntensity: 2.8, flatShading: true,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uMorph = { value: 0 };
    shader.vertexShader =
      'uniform float uMorph;\nattribute vec3 aTargetPosition;\nattribute vec3 aTargetNormal;\n' +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      'vec3 objectNormal = normalize(mix(normal, aTargetNormal, uMorph));'
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      'vec3 transformed = mix(position, aTargetPosition, uMorph);'
    );
    m.userData.shader = shader;
  };
  m.customProgramCacheKey = () => 'jewel-morph';
  return m;
}, []);
```

3. **Story subscription:** `useEffect` subscribes to `useJewelStory()`: on `state` events, write `targets[state.from]` into `position`/`normal` attributes and `targets[state.to]` into `aTargetPosition`/`aTargetNormal` (set `.needsUpdate = true` — happens only on target CHANGE, not per frame), and stash `state.progress` in a ref; on `pulse` events set `pulseRef.current = 1`.
4. **useFrame (the rig's single hook):**
   - `material.userData.shader.uniforms.uMorph.value = progressRef.current` (guard: shader may not exist before first compile)
   - idle rotation `rot.y += delta * (Math.PI * 2 / 60)` unless dragging; float `pos.y = baseY + sin(t*0.5)*0.15`
   - drag inertia: apply `angularVel.current` to rotation, decay `angularVel.current *= Math.pow(0.95, delta * 60)`
   - pulse decay: `scale = 1 + pulseRef.current * 0.12; pulseRef.current *= Math.pow(0.85, delta * 60)`
   - dust uTime uniform (dust copied from ProtoJewel — ≤300 × particleScale shader-driven points)
5. **Pointer handlers on the gem mesh ONLY** (research pattern):

```tsx
onPointerDown={(e) => {
  e.stopPropagation();
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 };
}}
onPointerMove={(e) => {
  const d = dragRef.current;
  if (!d.active) return;
  const dx = e.clientX - d.lastX, dy = e.clientY - d.lastY;
  d.moved += Math.abs(dx) + Math.abs(dy);
  groupRef.current.rotation.y += dx * 0.005;
  groupRef.current.rotation.x += dy * 0.005;
  angularVel.current = { x: dy * 0.002, y: dx * 0.002 };
  d.lastX = e.clientX; d.lastY = e.clientY;
}}
onPointerUp={(e) => {
  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  if (dragRef.current.moved < 6) { story.pulse(); story.setTarget(story.state.to === 'gem' ? 'gemBreath' : 'gem'); }
  dragRef.current.active = false;
}}
```

   Tap = pulse + toggles gem↔gemBreath via the story API (proves morph end-to-end in production). Morph animation: when target changes, animate progress in useFrame: `progressRef.current = Math.min(1, progressRef.current + delta * 1.5)`, and call `story.setProgress(progressRef.current)` ONLY when reaching 1 (promote) — avoid re-render loops.
6. **Lights + environment:** gold key (3.8, upper-left), gold rim (#FFD060, 2.0, behind-right), cool fill, red ambient (from tuned ProtoJewel). Environment — full tier only, PROCEDURAL (no CDN/network):

```tsx
{profile.tier === 'full' && (
  <Environment resolution={256} frames={1}>
    <Lightformer intensity={4} color="#FFD700" position={[-3, 2, 2]} scale={[3, 2, 1]} />
    <Lightformer intensity={2} color="#F5E6D3" position={[3, 1, -2]} scale={[2, 3, 1]} />
    <Lightformer intensity={1.5} color="#DC143C" position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[4, 4, 1]} />
  </Environment>
)}
```

7. Composition: group at x=+1.5 scale 1 (full) / x=0 scale 0.7 (lite). Backdrop gradient plane from ProtoJewel comes along (it's the hero bg).

- [ ] **Step 2: `npx tsc --noEmit` clean; existing tests green** (`npx vitest run` — 16 tests by now).
- [ ] **Step 3: Commit:** `git add -A && git commit -m "feat: JewelRig — morphing gem with drag inertia, tap pulse, procedural royal environment"`

### Task 5: Composition root + Home integration + FieldAccent

**Files:**
- Create: `frontend/src/components/JewelScene/index.tsx`, `frontend/src/components/JewelScene/FieldAccent.tsx`
- Modify: `frontend/src/pages/HomePage.tsx`, `frontend/src/components/Layout/index.tsx`, `frontend/src/test/routes.test.tsx`

- [ ] **Step 1: `index.tsx`** — Canvas + provider + error boundary:

```tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import { JewelStoryProvider } from './useJewelStory';
import FieldLayer from './FieldLayer';
import JewelRig from './JewelRig';

class SceneErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      // WebGL unavailable — static CSS stand-in keeps the hero composed
      return <Box position="absolute" inset={0} bgGradient="radial(#5A1020 20%, #1A0508 75%)" />;
    }
    return this.props.children;
  }
}

export const JewelScene: React.FC = () => {
  const profile = usePerfProfile();
  return (
    <Box position="absolute" inset={0} aria-hidden="true">
      <SceneErrorBoundary>
        <JewelStoryProvider>
          <Canvas
            dpr={profile.dpr}
            frameloop={profile.animate ? 'always' : 'never'}
            gl={{ antialias: profile.tier === 'full', alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 8], fov: 40 }}
          >
            <color attach="background" args={['#140306']} />
            <Suspense fallback={null}>
              <FieldLayer />
              <JewelRig />
            </Suspense>
          </Canvas>
        </JewelStoryProvider>
      </SceneErrorBoundary>
    </Box>
  );
};
export default JewelScene;
```

- [ ] **Step 2: `FieldAccent.tsx`** — own (cheap) Canvas, fixed position, for non-Home pages:

```tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import FieldLayer from './FieldLayer';

export const FieldAccent: React.FC = () => {
  const profile = usePerfProfile();
  return (
    <Box position="fixed" inset={0} zIndex={0} pointerEvents="none" aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        frameloop={profile.animate ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 40 }}
      >
        <Suspense fallback={null}>
          <FieldLayer density={0.15} interactive={false} />
        </Suspense>
      </Canvas>
    </Box>
  );
};
export default FieldAccent;
```

NOTE: alpha:true here — accent sits over the page's cream background, so the canvas must be transparent; FieldLayer must not render an opaque background when `interactive === false` (guard the `<color attach>` — it lives in index.tsx Canvas, not FieldLayer, so nothing to change; verify FieldLayer carries no background of its own and its glow sprites are skipped when density < 0.5).

- [ ] **Step 3: HomePage hero swap.** In `frontend/src/pages/HomePage.tsx`: remove `LightPattern` lazy imports + usages and their Suspense wrappers; hero section (the minH=100vh Box) gets `<Suspense fallback={null}><JewelScene /></Suspense>` (lazy import like the old pattern: `const JewelScene = lazy(() => import('../components/JewelScene'))`) as first child, hero content keeps `position="relative" zIndex={2}`. Check hero text colors still read on the new dark bg (#140306) — hero was already dark red, verify cream text props remain.
- [ ] **Step 4: Layout swap.** In `frontend/src/components/Layout/index.tsx`: replace lazy `RedJewelBackground` with lazy `FieldAccent` (`import('../JewelScene/FieldAccent')`), remove the red tint overlay Box ONLY if it visually fights the accent (judge after screenshot; default keep). Home renders Layout too — FieldAccent under HomePage is acceptable (hero's opaque Canvas covers it in the hero viewport; below the hero it gives continuity).
- [ ] **Step 5: Update test mocks** in `frontend/src/test/routes.test.tsx`: mock module paths `../components/JewelScene` → `() => null`, `../components/JewelScene/FieldAccent` → `() => null` (replace old ThreeBackground mocks; keep fiber Canvas mock). Run `npx vitest run` → all suites green.
- [ ] **Step 6: `npx tsc --noEmit && npm run build`** — green; note chunk layout (JewelScene should be its own lazy chunk with three).
- [ ] **Step 7: Commit:** `git add -A && git commit -m "feat: Living Jewel scene live on Home hero, FieldAccent site-wide"`

### Task 6: Delete legacy 3D + prototypes

**Files:**
- Delete: `frontend/src/components/ThreeBackground/` (RedJewelBackground.tsx, LightPattern.tsx, barrel, prototypes/), `/proto/:id` route + ProtoView import in `frontend/src/App.tsx`

- [ ] **Step 1:** `git rm -r frontend/src/components/ThreeBackground` ; remove ProtoView lazy import + `<Route path="/proto/:id" .../>` from App.tsx.
- [ ] **Step 2:** `grep -rn "ThreeBackground\|ProtoView\|RedJewelBackground\|LightPattern" frontend/src/` → zero hits (fix any stragglers).
- [ ] **Step 3:** `npx tsc --noEmit && npx vitest run && npm run build` green.
- [ ] **Step 4: Commit:** `git add -A && git commit -m "chore: delete legacy ThreeBackground components and prototype harness"`

### Task 7: Visual + perf gate, deploy

**Files:** none (verify + ship)

- [ ] **Step 1: Local visual verification.** Build + preview (`npm run build && (npx vite preview --host 100.90.190.14 --port 3196 &)`), then screenshot via the karakeep-chrome pattern (puppeteer-core, `docker run --rm --network container:karakeep-chrome-1 -v /tmp/lr-shots:/shots -w /work node:24-alpine`): Home desktop 1280×800 + mobile 390×844, About mobile (FieldAccent visible, content legible). Check against spec composition: gem right of headline desktop / centered mobile; field band lower third; hero text legible. Controller (main session) reviews the PNGs.
- [ ] **Step 2: Interaction smoke via CDP:** on the preview Home page, dispatch pointer events over the gem (`p.mouse.move(900, 400); p.mouse.down(); p.mouse.move(950, 420); p.mouse.up();`) then screenshot — gem rotation should differ from idle frame; a click without move should trigger the pulse/morph (screenshot ~400ms after click, expect silhouette change from gemBreath morph).
- [ ] **Step 3: Overflow check** (the established sweep): zero interactive elements past 391px on all 5 routes.
- [ ] **Step 4: Merge + deploy:**

```bash
cd /home/luisgg/projects/personal/portfolio-ai-chatbot
git checkout main && git merge --no-ff phase2d-three-rework -m "Phase 2d: Living Jewel hero system"
GIT_SSH_COMMAND="ssh -o HostName=ssh.github.com -p 443 -o ConnectTimeout=20" git push origin main phase2d-three-rework
ssh la-realeza 'cd /opt/la-realeza/app && git pull -q && docker compose -f docker-compose.prod.yml -f docker-compose.vps.yml up -d --build frontend 2>&1 | tail -2'
```

- [ ] **Step 5: Perf gate.** Lighthouse on the karakeep rig (same command as Phase 2): TBT must be ≤ ~10s (current baseline ~9-10.7s). If PSI quota available, capture authoritative score too. If TBT regresses >20%: bisect — most likely suspect is FieldAccent running site-wide (drop its density to 0.08 or make it Home-only) before touching the hero.
- [ ] **Step 6: Tag:** `git tag phase2d-deployed && push the tag` ; send Home desktop+mobile screenshots to Luis.

---

## Out of scope
- Scroll-driven morph choreography + additional target shapes (API ready; content comes with Phase 3).
- Chatbot orb scene rework.

## Risks
- Morph normals shimmer mid-blend: acceptable v1 (blends ~0.7s); fallback = derivative normals.
- `setPointerCapture` on r3f targets: per research, available ONLY via `e.target` — the plan's handlers comply; if a browser quirk throws, wrap in try/catch and continue (drag still works via move events).
- FieldAccent over cream pages: additive blending against light background may look washed — if so, switch accent fragment to normal blending with dark particles (one material flag + color swap), decided at Task 7 screenshot review.
