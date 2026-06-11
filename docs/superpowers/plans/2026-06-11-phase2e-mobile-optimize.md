# Phase 2e: Mobile Optimization + Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the Living Jewel experience — visibility-aware rendering, no three.js on mobile accent pages, fixed font loading chain (LCP), better mobile hero composition, dead-code sweep. No new features; Luis adds customization after.

**Architecture:** Rendering becomes visibility- and tier-aware: the hero scene stops rendering when scrolled offscreen (IntersectionObserver → frameloop toggling), FieldAccent mounts a pure-CSS gradient on lite tier (three.js chunk never downloads on phones for non-Home pages) and runs at half rate on desktop. Fonts move from serialized CSS @import to parallel head links with trimmed weights.

**Tech Stack:** unchanged. Branch: `phase2e-mobile-optimize` off main.

**Verified audit facts (2026-06-11):**
- Fonts: `src/index.css:1-3` — THREE Google-Fonts families via CSS `@import` inside the bundled stylesheet (serialized: HTML→JS→CSS→fonts.googleapis CSS→woff2). Hero H1 (Playfair) is the LCP element. IBM Plex Mono is referenced ONLY by `theme/index.ts:88` `fonts.mono` token — grep shows no component uses a mono font: dead family.
- FieldAccent (`src/components/JewelScene/FieldAccent.tsx`): mounts a full Canvas on every non-Home page (Layout) on ALL tiers → phones download the ~234KB-gz three chunk for a barely-visible accent.
- JewelScene hero Canvas keeps rendering when scrolled offscreen (Home page is ~6900px tall on mobile; hero is the first 844px — 85% of scroll time is wasted GPU/battery).
- Mobile hero composition (screenshot `lj2-home-mobile.png`): gem centered BEHIND the text/buttons — reads as a dark blob, interaction undiscoverable. Lite placement is `x=0, scale 0.7` (JewelRig).
- Dead code: `home.chatbot`-unrelated i18n key `consulting.learnMoreButton` (EN+ES, unused since Phase 2c), `MeshTransmissionMaterial` line in `src/test/routes.test.tsx:18` drei mock (import deleted long ago), `brand.redDeep` theme token unused in any component (verify before removing — it was added "for Phase 3", KEEP it, it's intentional).

---

### Task 1: Visibility-aware hero + cheap FieldAccent

**Files:**
- Modify: `frontend/src/components/JewelScene/index.tsx`, `frontend/src/components/JewelScene/FieldAccent.tsx`
- Test: `frontend/src/test/visibilityFrameloop.test.ts` (new, for the helper)

- [ ] **Step 1 (TDD the helper): failing test `src/test/visibilityFrameloop.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { resolveFrameloop } from '../components/JewelScene/visibility';

describe('resolveFrameloop', () => {
  it('never when reduced motion', () => {
    expect(resolveFrameloop(false, true)).toBe('never');
    expect(resolveFrameloop(true, true)).toBe('never');
  });
  it('never when offscreen', () => {
    expect(resolveFrameloop(false, false)).toBe('never');
  });
  it('always when visible and animating', () => {
    expect(resolveFrameloop(true, false)).toBe('always');
  });
});
```

- [ ] **Step 2: FAIL run** (`npx vitest run src/test/visibilityFrameloop.test.ts` from frontend/).
- [ ] **Step 3: Create `src/components/JewelScene/visibility.ts`:**

```ts
import { useEffect, useRef, useState } from 'react';

export function resolveFrameloop(visible: boolean, reducedMotion: boolean): 'always' | 'never' {
  if (reducedMotion || !visible) return 'never';
  return 'always';
}

// Tracks whether a wrapper element is in the viewport (hero scene pause-when-scrolled-past).
export function useInViewport<T extends HTMLElement>(): { ref: React.RefObject<T>; visible: boolean } {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}
```

- [ ] **Step 4: Tests pass (3) — full suite 20 green.**
- [ ] **Step 5: Wire into `index.tsx` (JewelScene):** wrapper Box gets `ref` from `useInViewport<HTMLDivElement>()`; Canvas `frameloop={resolveFrameloop(visible, !profile.animate)}`. NOTE r3f quirk: switching frameloop prop at runtime is supported (it maps to setFrameloop). Scene freezes when scrolled past — acceptable visual (it's offscreen).
- [ ] **Step 6: FieldAccent lite-tier CSS fallback + desktop half-rate.** In `FieldAccent.tsx`:
  - `if (profile.tier === 'lite') return <Box position="fixed" inset={0} zIndex={0} pointerEvents="none" aria-hidden bgGradient="radial(rgba(220,20,60,0.06) 0%, transparent 60%)" />;` — NO Canvas, NO three import executed at runtime (the chunk still exists but only downloads when the component path loads it — verify: since FieldAccent module statically imports FieldLayer→three, the lite return must come BEFORE Canvas mount but the import already happened. To truly avoid the three download on phones, split: `FieldAccent.tsx` becomes the tier gate that lazy-imports `FieldAccentCanvas.tsx` (the current body) only when tier full: `const FieldAccentCanvas = lazy(() => import('./FieldAccentCanvas'));`. Layout already lazy-loads FieldAccent itself — the gate file is tiny and three-free.)
  - Desktop half-rate: in the Canvas version set `frameloop="demand"` and drive `invalidate()` at 30fps via `setInterval(() => invalidate(), 33)` in a child component using `useThree` — plus still advance uTime by real delta. Simpler reliable alternative (choose this): keep frameloop 'always' but skip every other frame in FieldLayer's useFrame when a new `halfRate` prop is true (`frameCount.current++ % 2` → skip uTime write AND skip uniform updates; renderer still draws but scene is static between updates — GPU cost remains. NOT good enough.) → Use the demand+interval approach; it genuinely halves render calls. Clean up interval on unmount.
- [ ] **Step 7: Gates:** tsc clean, vitest 20 green, build green. Check chunk graph: `npm run build 2>&1 | grep -iE "FieldAccent|three|usePerfProfile"` — the FieldAccent gate chunk must NOT include three (expect a separate FieldAccentCanvas chunk).
- [ ] **Step 8: Commit:** `git add -A && git commit -m "perf: pause hero offscreen, CSS-only accent on mobile, 30fps accent on desktop"`

### Task 2: Font loading fix (LCP)

**Files:**
- Modify: `frontend/index.html`, `frontend/src/index.css`, `frontend/src/theme/index.ts`

- [ ] **Step 1: Remove all three `@import` lines from `src/index.css`.**
- [ ] **Step 2: Add to `frontend/index.html` `<head>` (before any stylesheet/script):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

Weights trimmed: Inter drops 300 (audit: grep `fontWeight.*300\|fontWeight={3` — if 300 IS used in pages, keep it and report); Playfair drops 900 (textStyles use 600/700; grep `900`). IBM Plex Mono dropped entirely (token-only, no usage).
- [ ] **Step 3: `theme/index.ts` fonts.mono** → `"Menlo, Monaco, Consolas, monospace"` (drop the IBM Plex name).
- [ ] **Step 4: Verify weights used:** `grep -rn "fontWeight" frontend/src/pages frontend/src/components frontend/src/theme | grep -oE "[0-9]{3}" | sort -u` — every weight in output must be covered by the link (or map to a loaded neighbor). Adjust the link if needed; report final weight set.
- [ ] **Step 5: Gates + visual:** build green; preview + screenshot Home desktop — headings still Playfair (compare against `/tmp/lr-shots/lj2-home-desktop.png` rendering, same glyphs).
- [ ] **Step 6: Commit:** `git add -A && git commit -m "perf: parallel font loading via head links, trim unused families/weights — was serialized CSS @import"`

### Task 3: Mobile hero composition

**Files:**
- Modify: `frontend/src/components/JewelScene/JewelRig.tsx` (lite placement), possibly `frontend/src/pages/HomePage.tsx` (hero content spacing)

- [ ] **Step 1: Reposition gem on lite tier.** Current: `x=0, scale 0.7` (dead center behind text). Change lite placement to lower-third hero: `position [0, -2.1, 0]`, `scale 0.85` — gem sits below the CTA buttons among the field particles, fully visible, obviously tappable. (Camera fov 40 at z=8: y=-2.1 lands ~lower quarter of frame.) Keep float amplitude but reduce to ±0.08 on lite (so it doesn't collide with buttons).
- [ ] **Step 2: Screenshot loop (the implementer DOES this):** build + preview (`npx vite preview --host 100.90.190.14 --port 3195`), screenshot 390×844 via the karakeep-chrome puppeteer pattern, READ the png, judge: gem fully visible below buttons? not clipped by hero bottom fade? tappable area ≥ ~120px? Iterate y/scale up to 3 rounds; report final values + attach final screenshot path.
- [ ] **Step 3: Tap still works on mobile:** CDP tap at gem position → screenshot after 450ms → silhouette changed (morph). Report.
- [ ] **Step 4: Gates; commit:** `git add -A && git commit -m "style: mobile hero — gem visible in lower third, clearly tappable"`

### Task 4: Dead-code sweep

**Files:**
- Modify: `frontend/src/i18n/locales/en/translation.json`, `frontend/src/i18n/locales/es/translation.json`, `frontend/src/test/routes.test.tsx`, `frontend/src/services/api.js`

- [ ] **Step 1:** Remove `consulting.learnMoreButton` from BOTH locale files (verify zero refs: `grep -rn "learnMoreButton" frontend/src/`).
- [ ] **Step 2:** Remove the `MeshTransmissionMaterial: () => null,` line from the drei mock in `src/test/routes.test.tsx`.
- [ ] **Step 3:** `src/services/api.js` — the chatbotApi dead surface (15+ methods targeting the nonexistent :5002 service: sessions, MCP store, models, facts, analysis). KEEP `sendMessage` (live) and `createWebSocketConnection` (Phase-3 seam, documented); DELETE the rest (getUserConversations, getSessionConversation, createNewSession, getUserFacts, updateUserSettings, getModels, getCurrentModel, switchModel, getMCPServers, connectMCPServer, getMCPTools, executeMCPTool, getHealth, getAnalysis). Verify zero component references first (`grep -rn "chatbotAPI\." frontend/src/ | grep -v sendMessage`) — if any are referenced, keep those and report.
- [ ] **Step 4:** `brand.redDeep` — KEEP (intentional Phase 3 reserve). Just confirm nothing else became orphaned: `grep -rn "creamWarm\|creamSoft\|textMuted" frontend/src/pages | head -3` (should have hits; report if a token lost all users).
- [ ] **Step 5: Gates (tsc, 20 tests, build); commit:** `git add -A && git commit -m "chore: dead-code sweep — unused i18n keys, stale mocks, phantom chatbot API surface"`

### Task 5: Measure, deploy, verify

- [ ] **Step 1: Full local gate:** tsc + vitest (20) + build.
- [ ] **Step 2: Local preview measurements** (puppeteer via karakeep-chrome):
  - Network: count requests to fonts.googleapis/gstatic on Home (expect 2 CSS + ≤4 woff2, all starting <500ms after nav start — read `performance.getEntriesByType('resource')`)
  - Mobile About page: assert NO request matching `three|FieldAccentCanvas` chunk (lite tier gate works) — `performance.getEntriesByType('resource')` filter
  - Hero pause: on Home, scroll to y=3000, wait 1s, evaluate `document.querySelector('canvas')` — can't directly read frameloop; instead verify via `requestAnimationFrame` counting? Simpler: trust the unit-tested helper + react wiring, spot-check no console errors.
- [ ] **Step 3: Merge to main, push (GIT_SSH_COMMAND port 443 pattern), deploy VPS (`ssh la-realeza 'cd /opt/la-realeza/app && git pull -q && docker compose -f docker-compose.prod.yml -f docker-compose.vps.yml up -d --build frontend'`).**
- [ ] **Step 4: Live Lighthouse ×2** (karakeep rig pattern): expect TBT ≤ baseline (~10s) and FCP/LCP improved vs 3.2s/6.5s baseline (fonts parallel now). Try PSI API too (quota may have reset — authoritative if available).
- [ ] **Step 5: Live mobile screenshots:** Home (gem placement final), About (CSS accent). Send to Luis.
- [ ] **Step 6: Tag `phase2e-deployed`, push tag.**

## Out of scope
- New 3D features/shapes (Luis's customization comes next).
- SSR/prerender (the remaining LCP ceiling — note in final report if LCP still >4s; it's an architecture decision for later).
- Chatbot orb scene.

## Risks
- frameloop prop toggling mid-flight: r3f supports it; if the canvas freezes showing a stale frame when scrolling back up, fall back to keeping 'always' and skipping work in useFrame via a visibility ref (cheaper than render-stop but safe).
- Font weight trim could subtly change a text that used 300/900 — Step 4 of Task 2 verifies usage before trimming.
