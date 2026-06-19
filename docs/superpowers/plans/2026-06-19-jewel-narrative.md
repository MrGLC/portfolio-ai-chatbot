# Jewel Narrative Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Home jewel narrate the stone→crown consulting story — anchored beside the copy, morphing through 4 chapters with always-visible gold labels and rewritten journey copy.

**Architecture:** Reuse the existing 4-shape morph engine and `chapterResolver`/`JewelRig` dash loop. Change keyframes to anchor the jewel right; add a change-only `onChapterChange` callback from the frame loop; render a new DOM `ChapterLabel` overlay driven by the active chapter; rewrite the four story sections' copy. No new geometry, no perf work.

**Tech Stack:** React 18 + TypeScript, @react-three/fiber 8, three 0.184, Chakra UI v2, framer-motion v11, i18next, Vitest.

## Global Constraints

- Build directly in `frontend/` (NOT `frontend_iterations/`).
- No new Three.js geometry — reuse `shapes.ts` costumes `ico/knot/growth/crown`. No performance changes.
- Jewel anchors to the **right** on desktop (text left); keep the existing **mobile** keyframe model (jewel top/centered) — change desktop `x/y/s` only, leave `mx/my/ms` untouched.
- Chapter → label mapping is exact: `story-hero`→`rawStone`, `story-chatbot`→`theModel`, `story-portfolio`→`theResults`, `story-cta`→`transformed`.
- The frame loop (`useFrame`) must NOT call React setState per frame — only on chapter-id change (≈4×/scroll).
- Every user-facing string in BOTH `frontend/src/i18n/locales/en/translation.json` and `.../es/translation.json`.
- Reuse design tokens (`brand.*`) — no new hardcoded hex except values copied from the existing hint-pill style.
- Run tests from `frontend/`: `npm test`; typecheck `npx tsc --noEmit`. Commit per task (Conventional Commits) ending with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: Anchor-right keyframes

Reposition every desktop chapter into the right band; resize so hero is largest and the crown is a slightly larger payoff. Keep shapes, spin, particle `p`, and all mobile overrides.

**Files:**
- Modify: `frontend/src/components/JewelScene/chapterResolver.ts:13-18` (the `KEYFRAMES` table)
- Test: `frontend/src/test/chapterResolver.test.ts`

**Interfaces:**
- Produces: unchanged `KEYFRAMES` shape; new desktop values consumed by `JewelRig` (no signature change).

- [ ] **Step 1: Add failing tests**

Append inside `frontend/src/test/chapterResolver.test.ts` (before the final closing of the file, as new `it` blocks in the existing `describe('resolveChapter', ...)` or a new describe):

```ts
describe('anchor-right choreography', () => {
  it('anchors every desktop chapter to the right band (x >= 0.7)', () => {
    for (const id of ['story-hero', 'story-chatbot', 'story-portfolio', 'story-cta']) {
      expect(KEYFRAMES[id].x).toBeGreaterThanOrEqual(0.7);
    }
  });
  it('hero is the largest costume; crown is the payoff (> middles)', () => {
    const s = (id: string) => KEYFRAMES[id].s;
    expect(s('story-hero')).toBeGreaterThan(s('story-chatbot'));
    expect(s('story-hero')).toBeGreaterThan(s('story-portfolio'));
    expect(s('story-cta')).toBeGreaterThan(s('story-chatbot'));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npx vitest run src/test/chapterResolver.test.ts`
Expected: FAIL — `story-chatbot` x is currently `0.12` (< 0.7), and `story-cta` s (`0.42`) is not > `story-chatbot` s (`0.50`).

- [ ] **Step 3: Rewrite the KEYFRAMES desktop values**

Replace `frontend/src/components/JewelScene/chapterResolver.ts:13-18` with (only desktop `x/y/s` change; `shape/spin/p` and all `mx/my/ms` preserved):

```ts
export const KEYFRAMES: Record<string, Keyframe> = {
  'story-hero':      { x: 0.78, y: 0.45, s: 1.00, shape: 'ico',    spin: 0.30, p: 0.50, mx: 0.50, my: 0.74, ms: 0.60 },
  'story-chatbot':   { x: 0.80, y: 0.45, s: 0.52, shape: 'knot',   spin: 0.55, p: 0.00, mx: 0.16, my: 0.08, ms: 0.26 },
  'story-portfolio': { x: 0.80, y: 0.45, s: 0.52, shape: 'growth', spin: 0.35, p: 0.00, mx: 0.86, my: 0.08, ms: 0.24 },
  'story-cta':       { x: 0.80, y: 0.50, s: 0.56, shape: 'crown',  spin: 0.35, p: 0.75, mx: 0.50, my: 0.10, ms: 0.32 },
};
```

- [ ] **Step 4: Run the full resolver test + suite**

Run: `cd frontend && npx vitest run src/test/chapterResolver.test.ts`
Expected: PASS — new anchor tests green; the existing `returns desktop vs mobile fractions` test still passes (hero desktop x `0.78` ≠ mobile mx `0.50`).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/JewelScene/chapterResolver.ts frontend/src/test/chapterResolver.test.ts
git commit -m "feat(jewel): anchor-right keyframes for the narrative choreography

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Chapter-change emitter (pure helper + JewelRig callback)

Add a pure change-detection helper and wire a change-only `onChapterChange` callback out of the frame loop, so the label can follow the active chapter without per-frame React updates.

**Files:**
- Modify: `frontend/src/components/JewelScene/chapterResolver.ts` (add `chapterChanged` export)
- Modify: `frontend/src/components/JewelScene/JewelRig.tsx:50-61` (prop), `:75-79` (destructure), refs near `:174`, loop near `:308`
- Test: `frontend/src/test/chapterResolver.test.ts`

**Interfaces:**
- Produces: `chapterChanged(prev: string | null, next: string): boolean`; `JewelRig` gains optional prop `onChapterChange?: (id: string) => void`.

- [ ] **Step 1: Add a failing test for the helper**

Append to `frontend/src/test/chapterResolver.test.ts`:

```ts
import { chapterChanged } from '../components/JewelScene/chapterResolver';

describe('chapterChanged', () => {
  it('emits only when the id changes', () => {
    expect(chapterChanged(null, 'story-hero')).toBe(true);
    expect(chapterChanged('story-hero', 'story-hero')).toBe(false);
    expect(chapterChanged('story-hero', 'story-chatbot')).toBe(true);
  });
});
```

(Move the `chapterChanged` import up with the existing top import from the same module if your linter prefers a single import line.)

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/chapterResolver.test.ts`
Expected: FAIL — `chapterChanged` is not exported.

- [ ] **Step 3: Implement the helper**

Add to `frontend/src/components/JewelScene/chapterResolver.ts` (after `resolveChapter`):

```ts
/** True when the active chapter id differs from the last emitted one.
 *  Lets the frame loop fire onChapterChange on transitions only (≈4×/scroll),
 *  never per frame. */
export function chapterChanged(prev: string | null, next: string): boolean {
  return prev !== next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/chapterResolver.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire the callback into JewelRig**

In `frontend/src/components/JewelScene/JewelRig.tsx`:

(a) Add `chapterChanged` to the existing import from `./chapterResolver` (the import currently brings in `resolveChapter`, `KEYFRAMES`, etc. near line 7-11):

```ts
import {
  resolveChapter,
  chapterChanged,
  KEYFRAMES,
  // ...existing named imports unchanged...
} from './chapterResolver';
```

(b) Add the prop to `JewelRigProps` (after `registerPointerHandlers` at line 60):

```ts
  /** Fired with the active chapter id ONLY when it changes (≈4×/scroll).
   *  Never per frame — drives the DOM ChapterLabel. */
  onChapterChange?: (id: string) => void;
```

(c) Destructure it (in the component params at line 75-79):

```ts
export const JewelRig: React.FC<JewelRigProps> = ({
  onFirstInteraction,
  onProxyRect,
  registerPointerHandlers,
  onChapterChange,
}) => {
```

(d) Add a ref beside the other refs (near line 174, after `frameCountRef`):

```ts
  const lastChapterRef = useRef<string | null>(null);
```

(e) In the `useFrame` loop, right after `const kf = pick.kf;` (currently line 308), add:

```ts
    // Emit the active chapter to React only on change — drives the DOM label.
    if (onChapterChange && chapterChanged(lastChapterRef.current, pick.id)) {
      lastChapterRef.current = pick.id;
      onChapterChange(pick.id);
    }
```

- [ ] **Step 6: Run full suite + typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS — `chapterChanged` tests green, route smoke tests still green (JewelScene is mocked there), no TS errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/JewelScene/chapterResolver.ts frontend/src/components/JewelScene/JewelRig.tsx frontend/src/test/chapterResolver.test.ts
git commit -m "feat(jewel): emit active chapter on change for the narrative label

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `ChapterLabel` overlay component + label i18n

A DOM gold pill that names the active chapter, always visible while a chapter is active, crossfading on change, instant under reduced-motion.

**Files:**
- Create: `frontend/src/components/JewelScene/ChapterLabel.tsx`
- Modify: `frontend/src/i18n/locales/en/translation.json` (`home.jewel.labels`)
- Modify: `frontend/src/i18n/locales/es/translation.json` (`home.jewel.labels`)
- Test: `frontend/src/test/chapterLabel.test.tsx`

**Interfaces:**
- Consumes: i18n keys `home.jewel.labels.{rawStone,theModel,theResults,transformed}`.
- Produces: `interface ChapterLabelProps { chapterId: string | null }`; `ChapterLabel: React.FC<ChapterLabelProps>`; const map `CHAPTER_LABEL_KEY: Record<string, string>`.

- [ ] **Step 1: Add the label i18n keys (EN)**

In `frontend/src/i18n/locales/en/translation.json`, inside `home.jewel` (which already has `hint`), add a `labels` object:

```json
"labels": {
  "rawStone": "Raw stone",
  "theModel": "The model",
  "theResults": "The results",
  "transformed": "Transformed"
}
```

- [ ] **Step 2: Add the label i18n keys (ES)**

In `frontend/src/i18n/locales/es/translation.json`, inside `home.jewel`, add:

```json
"labels": {
  "rawStone": "Piedra en bruto",
  "theModel": "El modelo",
  "theResults": "Los resultados",
  "transformed": "Transformado"
}
```

- [ ] **Step 3: Write the failing test**

```tsx
// frontend/src/test/chapterLabel.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import theme from '../theme';
import { ChapterLabel } from '../components/JewelScene/ChapterLabel';

const renderWith = (chapterId: string | null) =>
  render(
    <I18nextProvider i18n={i18n}>
      <ChakraProvider theme={theme}>
        <ChapterLabel chapterId={chapterId} />
      </ChakraProvider>
    </I18nextProvider>
  );

describe('ChapterLabel', () => {
  it('shows the mapped label for each chapter', () => {
    renderWith('story-hero');
    expect(screen.getByText('Raw stone')).toBeInTheDocument();
  });
  it('maps the AI chapter to "The model"', () => {
    renderWith('story-chatbot');
    expect(screen.getByText('The model')).toBeInTheDocument();
  });
  it('renders nothing when chapterId is null', () => {
    const { container } = renderWith(null);
    expect(container.textContent).toBe('');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/chapterLabel.test.tsx`
Expected: FAIL — cannot resolve `../components/JewelScene/ChapterLabel`.

- [ ] **Step 5: Implement `ChapterLabel`**

```tsx
// frontend/src/components/JewelScene/ChapterLabel.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export interface ChapterLabelProps {
  chapterId: string | null;
}

// Chapter id -> i18n label key (home.jewel.labels.*). Exact mapping per spec.
export const CHAPTER_LABEL_KEY: Record<string, string> = {
  'story-hero': 'rawStone',
  'story-chatbot': 'theModel',
  'story-portfolio': 'theResults',
  'story-cta': 'transformed',
};

const MotionBox = motion.create(Box);

/**
 * Always-visible gold pill naming the jewel's current chapter. Anchored to the
 * right (the jewel's side) on desktop, top-centre on mobile. Text crossfades on
 * chapter change; reduced-motion swaps instantly. Renders nothing when no
 * chapter is active (off the story sections).
 */
export const ChapterLabel: React.FC<ChapterLabelProps> = ({ chapterId }) => {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const key = chapterId ? CHAPTER_LABEL_KEY[chapterId] : undefined;
  if (!key) return null;

  return (
    <Box
      position="fixed"
      zIndex={7}
      pointerEvents="none"
      // Desktop: right margin, vertically centred near the jewel band.
      // Mobile: top-centre under the nav.
      right={{ base: 0, md: '7%' }}
      left={{ base: 0, md: 'auto' }}
      top={{ base: '88px', md: '50%' }}
      transform={{ base: 'none', md: 'translateY(-50%)' }}
      display="flex"
      justifyContent={{ base: 'center', md: 'flex-end' }}
    >
      <AnimatePresence mode="wait">
        <MotionBox
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
          px="9px"
          py="4px"
          borderRadius="20px"
          bg="rgba(255,255,255,.6)"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="rgba(194,160,92,.5)"
        >
          <Text
            fontSize="11px"
            fontWeight={700}
            letterSpacing=".12em"
            textTransform="uppercase"
            color="brand.goldRich"
            whiteSpace="nowrap"
          >
            {t(`home.jewel.labels.${key}`)}
          </Text>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};

export default ChapterLabel;
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/chapterLabel.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/JewelScene/ChapterLabel.tsx frontend/src/test/chapterLabel.test.tsx frontend/src/i18n/locales/en/translation.json frontend/src/i18n/locales/es/translation.json
git commit -m "feat(jewel): ChapterLabel overlay naming the active chapter

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Wire `ChapterLabel` + `onChapterChange` into `JewelScene`

Hold the active chapter in state, feed it from `JewelRig`'s callback, and render the label.

**Files:**
- Modify: `frontend/src/components/JewelScene/index.tsx` (state near the other `useState` ~line 58-65; pass prop to `<JewelRig>` ~line 150-154; render `<ChapterLabel>` near the hint pill ~line 192)

**Interfaces:**
- Consumes: `JewelRig` prop `onChapterChange` (Task 2); `ChapterLabel` (Task 3).

- [ ] **Step 1: Import ChapterLabel + add state**

In `frontend/src/components/JewelScene/index.tsx`, add the import near the other local imports (after the `JewelRig` import ~line 8):

```ts
import { ChapterLabel } from './ChapterLabel';
```

Add state near the other `useState` calls (after the `ready` state added in session 1, ~line 65):

```ts
  // Active narrative chapter — set on change by the rig, drives the label.
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
```

- [ ] **Step 2: Pass the callback to JewelRig**

In the `<JewelRig ... />` element (currently lines 150-154), add the prop (keep the existing props):

```tsx
              <JewelRig
                onFirstInteraction={handleFirstInteraction}
                onProxyRect={handleProxyRect}
                registerPointerHandlers={registerPointerHandlers}
                onChapterChange={setActiveChapter}
              />
```

- [ ] **Step 3: Render the label**

Just after the closing `</Box>` of the canvas wrapper and before/near the hint-pill block (after line 184, the `</Box>` that closes the fixed canvas wrapper), add:

```tsx
      <ChapterLabel chapterId={activeChapter} />
```

- [ ] **Step 4: Run full suite + typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS — route smoke tests still green (JewelScene is mocked in `routes.test.tsx`, so the wiring doesn't affect them), no TS errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/JewelScene/index.tsx
git commit -m "feat(jewel): wire active-chapter state to the ChapterLabel overlay

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Rewritten journey copy (i18n EN+ES) + route test marker

Rewrite the four story sections' narrative strings to the stone→crown journey. Update the Home route smoke-test marker, which asserts the (now-changed) hero title.

**Files:**
- Modify: `frontend/src/i18n/locales/en/translation.json` (`home.hero`, `home.chatbot`, `home.portfolio`, `home.cta`)
- Modify: `frontend/src/i18n/locales/es/translation.json` (same)
- Modify: `frontend/src/test/routes.test.tsx:40` (the `/` marker)

**Interfaces:**
- Consumes: nothing new. `HomePage.tsx` already renders these keys (no JSX change).

- [ ] **Step 1: Update the Home route marker first (RED)**

In `frontend/src/test/routes.test.tsx`, the `/` row currently reads:

```ts
  ['/', /Modern AI Excellence/i],
```

Change it to the new hero title:

```ts
  ['/', /earns its place/i],
```

- [ ] **Step 2: Run the route test to verify it fails**

Run: `cd frontend && npx vitest run src/test/routes.test.tsx`
Expected: FAIL on `/` — the page still renders the old `home.hero.modernTitle` ("Modern AI Excellence"), so `/earns its place/i` is not found yet.

- [ ] **Step 3: Rewrite EN copy**

In `frontend/src/i18n/locales/en/translation.json`, set these exact values (leave all other keys, including buttons, unchanged):

- `home.hero.modernTitle` → `"AI that earns its place in your business"`
- `home.hero.description` → `"We start with raw potential and cut it into an edge — models built for your data, your rules, your outcomes."`
- `home.chatbot.heading` → `"A model that thinks like your business"`
- `home.chatbot.description` → `"Trained on your data, your rules, your edge cases — not a generic API bolted on."`
- `home.portfolio.title` → `"Outcomes you can put a number on"`
- `home.portfolio.subtitle` → `"Shipped systems and measured lift — work that compounds after we leave."`
- `home.cta.title` → `"Let's build your edge"`
- `home.cta.description` → `"The raw stone, cut and set — your business, transformed. Tell me what you're building."`

- [ ] **Step 4: Rewrite ES copy**

In `frontend/src/i18n/locales/es/translation.json`, set:

- `home.hero.modernTitle` → `"IA que se gana su lugar en tu negocio"`
- `home.hero.description` → `"Partimos del potencial en bruto y lo tallamos en una ventaja — modelos hechos para tus datos, tus reglas, tus resultados."`
- `home.chatbot.heading` → `"Un modelo que piensa como tu negocio"`
- `home.chatbot.description` → `"Entrenado con tus datos, tus reglas, tus casos límite — no una API genérica."`
- `home.portfolio.title` → `"Resultados que puedes medir"`
- `home.portfolio.subtitle` → `"Sistemas en producción y mejoras medibles — trabajo que sigue rindiendo."`
- `home.cta.title` → `"Construyamos tu ventaja"`
- `home.cta.description` → `"La piedra en bruto, tallada y engastada — tu negocio, transformado. Cuéntame qué estás construyendo."`

- [ ] **Step 5: Run the route test + full suite**

Run: `cd frontend && npm test`
Expected: PASS — `/` now finds `/earns its place/i`; all other route markers and tests still green.

- [ ] **Step 6: Typecheck + commit**

Run: `cd frontend && npx tsc --noEmit` (expected: clean)

```bash
git add frontend/src/i18n/locales/en/translation.json frontend/src/i18n/locales/es/translation.json frontend/src/test/routes.test.tsx
git commit -m "feat(home): rewrite story copy to the stone->crown journey

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Manual verification (after all tasks)

Run `cd frontend && npm run dev` (or deploy preview) and scroll Home:
- Jewel stays anchored on the right; copy reads on the left; it travels + morphs ico→knot→growth→crown across the 4 sections.
- The gold label updates in step: Raw stone → The model → The results → Transformed.
- Copy reads as the journey; hero shows "AI that earns its place in your business".
- With OS reduced-motion on: jewel parks at hero, label shows "Raw stone" with no crossfade; no errors.
- **Screenshot check the `knot` chapter** — if it doesn't read as "the model", log a follow-up for a dedicated neural-lattice geometry (NOT built in this plan).

## Self-Review

**Spec coverage:**
- Anchor-right keyframes → Task 1. ✅
- Active-chapter callback (change-only, no per-frame setState) → Task 2. ✅
- ChapterLabel overlay (always-visible, crossfade, reduced-motion, i18n, exact mapping) → Task 3. ✅
- Wire into JewelScene → Task 4. ✅
- Rewritten journey copy EN+ES + labels → Tasks 3 (labels) + 5 (sections). ✅
- Keep mobile model / change desktop only → Task 1 constraint + values. ✅
- Reduced-motion label snap → Task 3 (`duration: reduced ? 0 : 0.3`). ✅
- No new geometry / no perf work → Global Constraints + manual-verification follow-up note. ✅
- Route smoke test depends on hero copy → handled in Task 5. ✅

**Placeholder scan:** no TBD/TODO; every code step shows complete code. Label position values are concrete (screenshot-tuning noted as optional polish, not a blank). ✅

**Type consistency:** `chapterChanged(prev: string | null, next: string)` defined in Task 2 and used in Task 2's JewelRig wiring; `onChapterChange?: (id: string) => void` consumed by Task 4's `setActiveChapter` (`useState<string | null>`); `ChapterLabelProps.chapterId: string | null` matches `activeChapter`; `CHAPTER_LABEL_KEY` keys match the four section ids. ✅
