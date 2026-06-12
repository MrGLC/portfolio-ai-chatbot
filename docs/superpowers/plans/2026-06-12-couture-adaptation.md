# Couture Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt the USB design handoff's tokens/typography/element treatments and its "dash & wait" jewel engine into the existing multi-page site, per `docs/superpowers/specs/2026-06-12-couture-adaptation-design.md`.

**Architecture:** Theme rewrite first (everything downstream inherits). Jewel engine v2 replaces scroll-lerp/vertex-morph with a five+one mesh crossfade Group driven by a chapter resolver (nearest-section-center) and dash easing; canvas floats above content with a screen-space hit proxy preserving drag/tap. Pages then get element-treatment sweeps. Behavioral battery + screenshots gate the deploy.

**Tech Stack:** unchanged (three 0.184, fiber 8.18, Chakra 2.10, Vitest). Branch: `phase4-couture` off main.

**Canonical references (committed in-repo — exact values live there, do not invent):**
- `docs/design-reference/design_handoff_portfolio_la_realeza/README.md` — tokens, typography scale, nav/element treatments, jewel materials/lighting/keyframes/behavior formulas, dust spec. THE source of truth for all visual values.
- `docs/superpowers/specs/2026-06-12-couture-adaptation-design.md` — what we adopt vs skip, our chapter mapping, hit-proxy decision.

**Established working patterns:** gates from frontend/ dir (`npx tsc --noEmit && npx vitest run && npm run build`); screenshot loop via karakeep-chrome puppeteer (CLOSE every page, disconnect, kill preview — leaked pages poison the rig); behavioral CDP probes (cursor/localStorage) for interactions — NEVER trust visuals alone for interactivity; r3f `e.target` is an Object3D (DOM work goes on `e.nativeEvent.target`).

---

### Task 1: Theme rewrite — tokens, fonts, treatments

**Files:**
- Modify: `frontend/src/theme/index.ts`, `frontend/index.html` (font links), `frontend/src/index.css` (if base styles reference old fonts)
- Test: existing suite must stay green (33)

- [ ] **Step 1:** Read the handoff README "Design Tokens" section + current `theme/index.ts` fully.
- [ ] **Step 2:** Fonts: replace the Google Fonts head link with `Bodoni+Moda:ital,wght@0,400..700;1,400..700` + `Hanken+Grotesk:wght@400..700` (variable ranges — smaller than enumerating). `theme.fonts`: heading `'Bodoni Moda', Didot, 'Times New Roman', serif`; body `'Hanken Grotesk', Inter, sans-serif`.
- [ ] **Step 3:** Colors: REMAP existing token names to handoff values so component sweeps stay minimal — `brand.cream → #f6efe2`, `brand.creamLight → #f9f3e9` (alt), ADD `brand.bgCard #fbf7ef`, `brand.text → #181428` (ink), `brand.textSecondary → #5f5970`, `brand.textMuted → #6a6478`, `brand.secondary → #c10e35` (crimson), `brand.redDark → #7e0a23` (crimsonDeep; old value dies), `brand.accent → #c2a05c` (gold), `brand.goldRich → #a8863f` (goldText), ADD `brand.goldBright #e8b765`, `brand.creamText #f3e9d8`, `brand.placeholderTone #b3a98f`. Update the custom `red` scale 600 → `#c10e35`. Search for hex stragglers afterward: `grep -rn "#DC143C\|#FFD700\|#F5E6D3" src/ --include="*.ts*"` → remap any found in components to tokens (3D scene files keep their own scene constants — Task 2 replaces those wholesale).
- [ ] **Step 4:** textStyles per handoff scale: pageTitle `clamp(40px,6vw,76px)` lh 1.02 ls -0.015em w 600; sectionTitle `clamp(32px,4.6vw,56px)` lh 1.05 w 600; cardTitle 24px w 600; eyebrow 12px w 600 caps ls 0.28em color goldRich; lead 15-19px lh 1.7. Container: add `sizes.container.xl = '1180px'` usage note — pages use maxW="1400px"/"7xl" today; sweep to `1180px` happens per-page in Tasks 3-4.
- [ ] **Step 5:** Component treatments in theme: Button crimson solid variant shadow `0 16px 34px -16px rgba(193,14,53,.9)` + hover translateY(-2px); Card variant `royal` → handoff card (bg `brand.bgCard`, radius 12, hover translateY(-7px) + border `rgba(194,160,92,.6)` + shadow `0 34px 64px -42px rgba(24,20,40,.55)`, transition .35s); Tag/chip pill with gold border 11px uppercase.
- [ ] **Step 6:** Gates: tsc, 33 tests, build. Quick preview screenshot of Home hero to confirm fonts swapped (Bodoni serif headings visible) — one page, close it.
- [ ] **Step 7:** Commit: `git add frontend && git commit -m "style: couture tokens — handoff palette, Bodoni Moda/Hanken Grotesk, element treatments"`

### Task 2: Jewel engine v2 — dash & wait

**Files:**
- Create: `frontend/src/components/JewelScene/chapterResolver.ts`, `frontend/src/components/JewelScene/shapes.ts`
- Rewrite: `frontend/src/components/JewelScene/JewelRig.tsx`, `frontend/src/components/JewelScene/index.tsx`
- Delete: `frontend/src/components/JewelScene/storyResolver.ts`, `morphTargets.ts`, `useJewelStory.tsx` + their tests (replaced)
- Test: `frontend/src/test/chapterResolver.test.ts`, keep/adapt `frontend/src/test/perfProfile.test.ts`, `visibilityFrameloop.test.ts`, `routes.test.tsx`

- [ ] **Step 1 (TDD): `src/test/chapterResolver.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { resolveChapter, KEYFRAMES, type SectionRange } from '../components/JewelScene/chapterResolver';

const ranges: SectionRange[] = [
  { id: 'story-hero', top: 0, bottom: 2000 },
  { id: 'story-chatbot', top: 2000, bottom: 4000 },
  { id: 'story-portfolio', top: 4000, bottom: 6000 },
  { id: 'story-cta', top: 6000, bottom: 7000 },
];

describe('resolveChapter', () => {
  it('keyframe table covers our four chapters with handoff fields', () => {
    for (const id of ['story-hero', 'story-chatbot', 'story-portfolio', 'story-cta']) {
      const k = KEYFRAMES[id];
      expect(k).toBeDefined();
      for (const f of ['x', 'y', 's', 'shape', 'spin', 'p', 'mx', 'my', 'ms'] as const) {
        expect(k).toHaveProperty(f);
      }
    }
    expect(KEYFRAMES['story-hero'].shape).toBe('ico');
    expect(KEYFRAMES['story-chatbot'].shape).toBe('knot');
    expect(KEYFRAMES['story-portfolio'].shape).toBe('growth');
    expect(KEYFRAMES['story-cta'].shape).toBe('crown');
  });
  it('picks the section whose center is nearest the viewport center', () => {
    expect(resolveChapter(100, ranges, 800).id).toBe('story-hero');     // probe 500 → hero center 1000 closest
    expect(resolveChapter(2600, ranges, 800).id).toBe('story-chatbot'); // probe 3000 = chatbot center
    expect(resolveChapter(9999, ranges, 800).id).toBe('story-cta');     // beyond end clamps to last
  });
  it('boundary: exactly between two centers picks the later (>=)', () => {
    // hero center 1000, chatbot center 3000 → midpoint probe 2000 → scrollY 1600
    expect(resolveChapter(1600, ranges, 800).id).toBe('story-chatbot');
  });
  it('returns desktop vs mobile fractions', () => {
    const d = resolveChapter(100, ranges, 800, false);
    const m = resolveChapter(100, ranges, 800, true);
    expect(d.kf.x).not.toBe(m.kf.x); // hero: x .72 desktop vs .50 mobile
    expect(m.kf.x).toBe(KEYFRAMES['story-hero'].mx);
  });
});
```

- [ ] **Step 2: FAIL run.**
- [ ] **Step 3: Implement `chapterResolver.ts`:**

```ts
export interface SectionRange { id: string; top: number; bottom: number; }
export type ShapeName = 'ico' | 'octa' | 'sphere' | 'knot' | 'crown' | 'growth';

export interface Keyframe {
  x: number; y: number; s: number;        // viewport fractions + scale (desktop)
  shape: ShapeName; spin: number; p: number; // rest spin rad/s, particle target opacity
  mx: number; my: number; ms: number;     // mobile overrides
}

// Adapted from the handoff's 7-chapter table to our 4 Home chapters.
// Story: raw stone (potential) -> engineering knot (AI mind) -> growth columns
// (results) -> glowing crown (transformed business).
export const KEYFRAMES: Record<string, Keyframe> = {
  'story-hero':      { x: 0.72, y: 0.47, s: 1.00, shape: 'ico',    spin: 0.30, p: 0.50, mx: 0.50, my: 0.74, ms: 0.60 },
  'story-chatbot':   { x: 0.12, y: 0.42, s: 0.50, shape: 'knot',   spin: 0.55, p: 0.00, mx: 0.16, my: 0.08, ms: 0.26 },
  'story-portfolio': { x: 0.88, y: 0.40, s: 0.45, shape: 'growth', spin: 0.35, p: 0.00, mx: 0.86, my: 0.08, ms: 0.24 },
  'story-cta':       { x: 0.70, y: 0.45, s: 0.55, shape: 'crown',  spin: 0.35, p: 0.75, mx: 0.50, my: 0.10, ms: 0.32 },
};

export interface ChapterPick { id: string; kf: { x: number; y: number; s: number; shape: ShapeName; spin: number; p: number }; }

export function resolveChapter(
  scrollY: number, ranges: SectionRange[], viewportH: number, mobile = false
): ChapterPick {
  const probe = scrollY + viewportH / 2;
  let best = ranges[0], bestDist = Infinity;
  for (const r of ranges) {
    const center = (r.top + r.bottom) / 2;
    const d = Math.abs(probe - center);
    if (d <= bestDist) { best = r; bestDist = d; } // <= so later section wins ties
  }
  const k = KEYFRAMES[best.id] ?? KEYFRAMES['story-hero'];
  return {
    id: best.id,
    kf: mobile
      ? { x: k.mx, y: k.my, s: k.ms, shape: k.shape, spin: k.spin, p: k.p }
      : { x: k.x, y: k.y, s: k.s, shape: k.shape, spin: k.spin, p: k.p },
  };
}
```

- [ ] **Step 4: Tests pass. Delete `storyResolver.ts`, `morphTargets.ts`, `useJewelStory.tsx` and their test files** (suite shrinks — that's correct; final suite = routes 5 + perfProfile 3 + visibility 3 + chapterResolver 4 = 15).
- [ ] **Step 5: Create `shapes.ts`** — builds the six meshes' geometries+materials per the handoff table ("La joya 3D — el reparto"). Exact values FROM THE HANDOFF README (geometries: Icosahedron(1.62,1) / Octahedron(1.5) y×1.32 / Icosahedron(1.42,3) / TorusKnot(0.92,0.27,160,24) / Icosahedron(1.62,1) crown; materials incl. edges via EdgesGeometry+LineBasicMaterial where specified; crown pulsing emissive intensity formula goes in the rig's loop). `growth`: PORT the column-builder from the deleted morphTargets (buildGrowth → standalone geometry: build the Float32Array then `new BufferGeometry()` + position attr + computeVertexNormals), material crimson flatShading like ico with gold edges. Export `buildShapes(): Record<ShapeName, { mesh: THREE.Mesh; edges?: THREE.LineSegments }>`.
- [ ] **Step 6: Rewrite `JewelRig.tsx`** as the dash-engine (formulas verbatim from handoff README "El comportamiento"):
  - Group with all six shapes; per-frame crossfade: target weight 1 for active shape else 0, `w += (target - w) * 0.13`; shape scale = `w` (hide mesh when w < 0.01).
  - Refs: scrollRef (passive listener), velRef (`vel = vel*0.92 + Δ*0.08`), mouseRef (pointermove on window, normalized), rangesRef (measure ids on mount/resize/+1500ms — keep the getBoundingClientRect+scrollY technique from the old rig).
  - useFrame: pick = resolveChapter(...); world target from fractions: `visH = 2*tan(21°)*5; visW = visH*aspect; tx = (kf.x-.5)*visW; ty = -(kf.y-.5)*visH`; dist = hypot in FRACTION space (convert current world pos back to fractions for the dist used by easing/shrink formulas); `k = min(0.22, 0.06 + dist*0.5)`; pos lerp by k; scale: target `kf.s * (1 - min(0.30, dist*1.25)) * (1 + sin(t*1.15)*0.028*settled)` where `settled = max(0, 1 - dist*9)`, lerped by `max(0.08, k*0.8)`; rotation `rot.y += dt*kf.spin + vel*0.0006 + dist*dt*2.6`; `rot.x = sin(t*0.3)*0.1 + mouseY*0.25`; `rot.z` eased 0.08 toward `clamp(vel,±140)*-0.0007`; mouse parallax pos += `(mouseX-.5)*0.22 / -(mouseY-.5)*0.16`; crown emissive pulse when crown active: `0.18 + w*(0.3 + sin(t*2.2)*0.16)`.
  - Drag/tap: keep handlers (rotation impulse + pulse-scale flash) but mounted via the HIT PROXY (Step 7) — handlers receive plain PointerEvents now (no r3f raycast). Reuse the inertia/cursor/hint-dismiss logic; DELETE the tap morph-toggle.
  - Dust: 200 points, shell r 2.1-3.4 flattened y×0.72, 50/50 `#e6b964`/`#d11e44`, size 0.042, depthWrite false; follows group pos with lerp 0.05; scale `0.5 + s*0.65`; opacity `kf.p * (0.3 + 0.7*settled)`, hidden < 0.02.
  - Lighting per handoff: ambient .55, key `#fff1d6` ×1.5 (-3,4,5), point `#e8b765` ×1.25 dist 22 (-2.6,2.6,3.2), rim `#ff5a7a` ×0.75 (4,-2,-3). Lightformer Environment DELETED (handoff materials are tuned for plain lights). Backdrop plane + old Dust + FieldLayer usage on Home: DELETED from the rig/scene (FieldLayer file stays — FieldAccentCanvas uses it; recolor its constants to crimson/gold tokens).
  - Reduced motion: static at hero keyframe, no spin/breath (drag still allowed). document.hidden: rAF auto-pauses (note in comment).
- [ ] **Step 7: Rewrite `index.tsx`:** Canvas wrapper `position=fixed inset 0 zIndex={5}` with `pointerEvents="none"` (canvas now ABOVE content; Navigation must sit above — check its zIndex ≥ 1000 ✓; ALSO the chat panel/forms interactive elements sit below 5 — verify no element between z1-z5 needs to render above the jewel; content shows THROUGH because canvas is transparent). Camera `fov 42, position z 5`. Hit proxy: a fixed `<div ref={proxyRef}>` (size 0, pointerEvents auto, borderRadius full, `touchAction: 'none'`, zIndex 6) whose transform/size the rig updates ~every 6th frame via a callback prop (`onProxyRect(x, y, r)`) writing DIRECT style mutations (`style.transform`, width/height) — NO setState. Proxy carries the pointer handlers (down/move/up) wired to the rig's drag refs via a small imperative handle (forwardRef or callback registry — implementer's choice, document it). Hint pill keeps working (dismiss on proxy pointerdown). frameloop/profile/dpr/ErrorBoundary unchanged.
- [ ] **Step 8: HomePage:** remove FieldLayer-era leftovers if any import remains; hero bg → `brand.cream` radial per handoff hero (`radial-gradient(120% 90% at 78% 18%, #fbf6ec, #f6efe2 42%, #f1e7d6)`); the bottom cream fade updates to blend with new tokens.
- [ ] **Step 9: Gates:** tsc; suite 15 green (routes mocks unchanged — JewelScene still mocked); build. Dev-server eyeball: jewel dashes between chapters with shrink-in-transit, breathes when settled.
- [ ] **Step 10: Commit:** `git add frontend && git commit -m "feat: jewel engine v2 — dash & wait choreography, six-shape crossfade, hit-proxy interaction"`

### Task 3: Nav + Home restyle

**Files:**
- Modify: `frontend/src/components/Layout/Navigation.tsx`, `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Navigation per handoff:** transparent until scrollY>40 → `rgba(246,239,226,.82)` blur(14px) hairline, 0.4s transition; logo = 26px rotated-45° square, crimson gradient + gold border (CSS Box, alongside wordmark in Bodoni 21px — keep the existing brand name text); links 14px/600 ink hover crimson; CTA button crimson; mobile hamburger per handoff (third line short + crimson), panel cream. Keep i18n/lang switcher.
- [ ] **Step 2: Home sweep:** containers → maxW 1180px; section padding `clamp(80px,12vh,140px)` (py token or raw); eyebrows get the 42×1px gold gradient line prefix (compose into the textStyle usage as a small `Kicker` component in HomePage or a shared one in `src/components/Kicker.tsx` — create it, reuse in Task 4); chatbot section re-dress: panel bg `brand.bgCard`, gold hairline border, chips → gold-bordered pills (theme Tag), Bodoni for the chat title; CTA section keeps light treatment with crimson CTAs.
- [ ] **Step 3: Screenshot loop ≤3:** desktop+mobile hero/chatbot/cta — judge against handoff look (nav state change at scroll, kicker lines, Bodoni hierarchy). Iterate.
- [ ] **Step 4: Gates + commit:** `git add frontend && git commit -m "style: handoff nav treatment, Home couture sweep, Kicker component"`

### Task 4: Other pages sweep

**Files:**
- Modify: `frontend/src/pages/{AboutPage,ProjectsPage,ConsultingPage,ContactPage}.tsx`, `frontend/src/components/Layout/Footer.tsx`

- [ ] **Step 1: ConsultingPage:** services grid → hairline-cell treatment (wrapper `bg rgba(24,20,40,.1)` gap 1px radius 12 overflow hidden; cells bg cream, hover bgCard; numerals 01-08 Bodoni 38px gold); process steps → A/B/C 34px gold-border circles + 600 title + 14px desc. Keep all content/i18n.
- [ ] **Step 2: ContactPage:** form panel area adopts dark treatment: section band with handoff `dark-gradient`, form in glass panel (`rgba(255,255,255,.035)`, border `rgba(243,233,216,.14)`, radius 14), labels 12px caps gold, inputs `rgba(255,255,255,.04)` gold focus; validation error styling `#ff8aa3`; success state (green check circle + message) on submit — submit stays console.log + success UI (backend later; note in code). Email display element with gold underline. Text on dark uses `brand.creamText`.
- [ ] **Step 3: AboutPage:** stats row over hairline with Bodoni crimson clamp figures; portrait area gets the ink corner badge ("8 / AÑOS EN IA" style — use his real years from existing content if present, else keep current copy) — photo itself stays the current placeholder.
- [ ] **Step 4: ProjectsPage:** cards → handoff card treatment (serial numbers 01.. Bodoni 34px crimson 16% opacity on the image area, gold chip categories, case-study link with arrow gap-grow hover). Placeholder gradients stay (Phase content).
- [ ] **Step 5: Footer:** light variant of handoff footer (hairline top, small logo square, back-to-top link); keep columns/links.
- [ ] **Step 6: Kicker component reused on all pages.** Screenshot loop ≤3 per page (desktop+mobile), judge, iterate. Gates + overflow sweep.
- [ ] **Step 7: Commit:** `git add frontend && git commit -m "style: couture sweep — consulting cells, contact dark panel, about stats, project cards, footer"`

### Task 5: Verify + deploy

- [ ] **Step 1: Full gates:** tsc, 15 tests, build.
- [ ] **Step 2: Behavioral battery (preview + CDP):** drag via hit proxy desktop (cursor grabbing + rotation change) AND mobile touch; tap → pulse + hint dismissed (localStorage); touch swipe over canvas areas scrolls; nav links + hero CTAs + footer links clickable (elementsFromPoint spot checks — canvas z5 is pointerEvents none but VERIFY); chat input focusable + demo answers.
- [ ] **Step 3: Dash choreography check:** screenshot pairs at the 4 beats after scrollTo + 1.8s settle (dash should be done; shape correct per chapter) desktop+mobile.
- [ ] **Step 4: Overflow sweep 5 routes (zero). 60/30/10 blur judgment on every page screenshot.**
- [ ] **Step 5: Merge main, push (port-443 ssh), VPS deploy, live 200, quiet-rig Lighthouse ×2 (TBT ≤ ~7s baseline).**
- [ ] **Step 6: Live screenshots → send Luis. Tag `phase4-couture-deployed`.**

## Risks
- Canvas z5 above content: any interactive element relying on hover/cursor within the jewel's travel lanes still works (canvas pointerEvents none; only the small proxy div intercepts) — battery verifies.
- Bodoni at small sizes is thin: body stays Hanken; if any figure < 20px looks frail in screenshots, bump weight per judgment.
- Suite shrink (33→15) is intended: vertex-morph/story-controller tests die with their modules. Routes/perf/visibility tests must NOT be touched.
- Dash easing in fraction space: convert world→fraction each frame using the SAME visW/visH math — unit mismatch here makes easing wrong (too fast/slow); implementer must keep one helper for both directions.
