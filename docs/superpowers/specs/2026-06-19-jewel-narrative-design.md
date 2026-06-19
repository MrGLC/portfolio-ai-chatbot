# Jewel Narrative Redesign — Design

**Date:** 2026-06-19
**Status:** approved-for-spec-review
**Scope:** `frontend/` (Home page jewel choreography, labels, and copy)

## Problem

The 3D jewel performs fine but reads as **decoration** — "just a gem there," no purpose,
no flex, no tie to the page's message. The narrative machinery already exists: a 4-chapter
arc in `chapterResolver.ts` (raw stone → engineering knot → growth columns → crown) with a
morph/dash engine. It just doesn't *land* — a visitor experiences a floating gem, not the
stone→crown story.

Goal: make the jewel **narrate the consulting message with craft** (chosen direction:
**B — The Illustrator**). The jewel sits beside the copy it illustrates, morphs to each
chapter's shape, and carries an always-visible gold micro-label that names the meaning. The
flex is the *precision sync* of position + morph + label + copy — it feels engineered, not
ornamental.

This is a **legibility/choreography redesign, not new capability**. All four shapes already
exist as distinct meshes in `shapes.ts` (no new geometry). No performance work.

## Approved decisions (2026-06-19)

- Direction **B — The Illustrator** (jewel beside copy, morphed to illustrate, tied label).
- Choreography (the 4-chapter storyboard) approved as shown.
- **Anchor** the jewel to **one side (right)** throughout — text reads left, jewel sits in
  the right margin. (Calmer and more intentional than the zigzag alternative.)
- Labels **always visible** (one label element; text crossfades on chapter change).
- **Rewrite** the Home section copy to match the stone→crown journey.

## The narrative model

| # | Section id | Shape (existing mesh) | Label (gold pill) | Message |
|---|------------|-----------------------|-------------------|---------|
| 1 | `story-hero` | `ico` (rough stone) — largest | **Raw stone** | raw potential |
| 2 | `story-chatbot` | `knot` (engineering knot) | **The model** | the AI mind, trained on you |
| 3 | `story-portfolio` | `growth` (ascending columns) | **The results** | measurable outcomes |
| 4 | `story-cta` | `crown` (glowing, particles bloom) | **Transformed** | business transformed |

Note on shape 2: `knot` ("nudo de ingeniería") is the existing AI-mind costume. We keep it.
If, on screenshot review during implementation, the knot does not read as "the model," a
dedicated neural-lattice geometry is a *follow-up*, not part of this spec — flag it, don't
build it inline.

## Component changes

### 1. `chapterResolver.ts` — anchor-right keyframes
Rewrite `KEYFRAMES` so every desktop chapter anchors the jewel to the right band (x ≈ 0.78–0.82)
with the text on the left. Keep each chapter's `shape`, `spin`, and particle `p`. Sizes:
hero largest (`s` 1.0), middle chapters medium (~0.52), crown a touch larger (~0.56) as the
payoff. Proposed desktop values (final values tuned with screenshots in the plan):

```
story-hero:      { x: 0.78, y: 0.45, s: 1.00, shape: 'ico',    spin: 0.30, p: 0.50 }
story-chatbot:   { x: 0.80, y: 0.45, s: 0.52, shape: 'knot',   spin: 0.55, p: 0.00 }
story-portfolio: { x: 0.80, y: 0.45, s: 0.52, shape: 'growth', spin: 0.35, p: 0.00 }
story-cta:       { x: 0.80, y: 0.50, s: 0.56, shape: 'crown',  spin: 0.35, p: 0.75 }
```

Mobile overrides (`mx/my/ms`): anchoring beside text is too tight on narrow screens — keep the
existing **jewel-top, content-below** model (jewel centered-high, behind content), tuned so it
never collides with the now-left-aligned copy. Resolver math (`resolveChapter`, fraction↔world
helpers) is unchanged.

### 2. `JewelRig.tsx` — surface the active chapter (change-only)
`JewelRig` already computes the active chapter every frame (`resolveChapter`, ~line 296). Add
an `onChapterChange?: (id: string) => void` prop. Track the last emitted id in a ref; call the
callback **only when the resolved id changes** (≈4 times per full scroll), never per frame —
preserves the no-React-in-the-frame-loop perf contract.

### 3. `ChapterLabel.tsx` — new always-visible label overlay
New DOM overlay (sibling to the existing hint pill in `JewelScene/index.tsx`), gold pill styled
to match the storyboard/hint pill (`rgba(255,255,255,.6)` bg, `rgba(194,160,92,.5)` border,
`brand.goldRich` text, uppercase, letter-spaced). Props: `{ chapterId: string | null }`.
Maps `chapterId` → label text via i18n (`home.jewel.labels.<chapter>`). Positioned on the right
(anchored side), vertically near the jewel's band; on mobile, top-center under the nav. Text
**crossfades** (opacity) when `chapterId` changes; reduced-motion → instant swap. Hidden when
`chapterId` is null (off the story sections).

### 4. `JewelScene/index.tsx` — wire it
Hold `activeChapter` in state, set via `onChapterChange` passed to `JewelRig`. Render
`<ChapterLabel chapterId={activeChapter} />`. State updates only on chapter change (cheap).

### 5. `HomePage.tsx` + i18n — rewritten journey copy
Update the four story sections' narrative strings to the copy below. Functional strings
(buttons, nav) stay. Add the four label strings. All strings in **both** `en` and `es`.

## Rewritten copy (draft — review at spec gate)

**Labels** — `home.jewel.labels`:
| key | EN | ES |
|-----|----|----|
| `rawStone` | Raw stone | Piedra en bruto |
| `theModel` | The model | El modelo |
| `theResults` | The results | Los resultados |
| `transformed` | Transformed | Transformado |

**Chapter 1 — Hero** (`home.hero`):
- `modernTitle`: "AI that earns its place in your business" / "IA que se gana su lugar en tu negocio"
- `description`: "We start with raw potential and cut it into an edge — models built for your data, your rules, your outcomes." / "Partimos del potencial en bruto y lo tallamos en una ventaja — modelos hechos para tus datos, tus reglas, tus resultados."

**Chapter 2 — The model** (`home.chatbot`):
- `heading`: "A model that thinks like your business" / "Un modelo que piensa como tu negocio"
- `description`: "Trained on your data, your rules, your edge cases — not a generic API bolted on." / "Entrenado con tus datos, tus reglas, tus casos límite — no una API genérica."

**Chapter 3 — The results** (`home.portfolio`):
- `title`: "Outcomes you can put a number on" / "Resultados que puedes medir"
- `subtitle`: "Shipped systems and measured lift — work that compounds after we leave." / "Sistemas en producción y mejoras medibles — trabajo que sigue rindiendo."

**Chapter 4 — CTA** (`home.cta`):
- `title`: "Let's build your edge" / "Construyamos tu ventaja"
- `description`: "The raw stone, cut and set — your business, transformed. Tell me what you're building." / "La piedra en bruto, tallada y engastada — tu negocio, transformado. Cuéntame qué estás construyendo."

## Accessibility / reduced-motion

- Label crossfade and jewel dash already respect `usePerfProfile`/reduced-motion; the new label
  must snap (no fade) under reduced-motion. The label is decorative-adjacent but its text is
  meaningful — render it in the DOM (not canvas) so it's selectable/readable; `aria-hidden`
  stays off the label (it carries real words).
- Anchored right layout must not overlap copy at any breakpoint — verify hero CTA buttons and
  the scroll chevron stay clear (the session-1 hit-proxy/`pan-y` work is untouched).

## Testing (Vitest)

- `chapterResolver` keyframes: every desktop chapter's `x` is in the right anchor band
  (`x >= 0.7`); shape mapping is exactly `ico/knot/growth/crown` for the four chapters; hero
  has the largest `s`. Existing `resolveChapter` behavior test stays green.
- Chapter-change detection: extract the "emit only on id change" logic to a pure helper and
  unit-test that a repeated id emits once, a new id emits again.
- `ChapterLabel`: renders the correct i18n label for each `chapterId`; renders nothing when
  `chapterId` is null; under mocked reduced-motion applies no transition.
- Route smoke tests + full suite stay green (JewelScene is mocked there).

## Out of scope (separate sessions)

- New jewel geometry (e.g. a dedicated neural net) — only if `knot` fails review, as a follow-up.
- Three.js performance work — the jewel performs fine.
- **2D page-motion de-chonk** (`useMotion` adoption + base spring tuning) — still its own session.
- **Visual-system discipline** (Section primitive, spacing/width tokens, kill legacy royal/yellow)
  — still its own session.
- Other pages' jewel (`FieldAccent`) and the chatbot orb — untouched.
