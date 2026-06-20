# Home Sections — Content to Match the Jewel Beats

**Date:** 2026-06-19
**Status:** approved-for-spec-review
**Scope:** `frontend/` (Home story-section bodies + i18n)

## Problem

The jewel now narrates stone → model → metrics → crown, and the section *headlines* already match.
But the section *bodies* don't: worst of all, the metrics beat ("Outcomes you can put a number on")
shows a fake agency grid — `Branding / Web Design / Marketing / Project 1·2·3` — no numbers, wrong
industry. The page doesn't back the gem's story with real proof.

Goal: reshape each of the four story-section bodies to embody its beat, using Luis's **vetted real
content** (memory `portfolio-real-proof`), with strict honesty markers. Visual treatment shifts are out
of scope — this is body content only.

## Honesty constraints (binding)

- `~60% cache hit` → render with the `~`.
- Appen `P99 < 500ms` → label "designed for" (not measured).
- Do NOT use: anything from Solda; "zero critical failures / real money"; "10K data points/sec,
  99.9% uptime". (All unverified / pulled from CV.)

## Per-beat body design

### Beat 1 — `story-hero` (stone / the promise)
Keep the promise headline + description. **Add a credibility numbers strip** below the CTA buttons —
five stats, gold-accented figure + small caption each:
`3+ yrs AI in production · 5 AI roles (fintech·health·data) · 100+ concurrent users in prod ·
250K+ contributors/mo served · 9.01/10 GPA (Biomed Eng)`.

### Beat 2 — `story-chatbot` (neural / the model)
Keep heading "A model that thinks like your business" + description + the existing `ThreeJsChatbot`
demo. **Add two short "real systems" proof lines** beside/under the heading so "the model" reads as
engineered intelligence, not a toy:
- "Primero Trader — transformer fine-tuning on SageMaker, drift retraining, a live MCP ecosystem."
- "Appen — a two-agent voice interviewer (AWS Strands + Bedrock), RAG-grounded scorecards."

### Beat 3 — `story-portfolio` (bars / the metrics) — the big change
Delete the fake `SimpleGrid` (and its `branding/webDesign/marketing/project` i18n keys). Replace with a
responsive grid of **four real project cards** (reuse the existing gold-bordered `Card` "royal" variant
+ gold `Tag` chips). Each card: title, one-line, and 2–3 hard stats with honesty markers.

| Project | One-line | Stats / proof |
|---|---|---|
| **Primero Trader** | "TradingView of MCPs" — real-time market intelligence | Flask monolith → event-driven microservices · Redis→Valkey **zero-downtime** · **~60%** cache hit · 300+ fields/ticker |
| **Appen** | AI that interviews the global workforce | **250K+** contributors/mo · two-agent voice (Strands + Bedrock) · **P99 < 500ms** *(designed for)* |
| **Clinical CV** | Hemorrhage detection from medical imaging | **87%** precision / **83%** recall · 10,000+ images · Springer publication |
| **Interaction AI** | Multimodal intent on the edge | **78%** accuracy · YOLOv5 + speech-to-text · deployed on Raspberry Pi |

Keep a "View all" affordance only if a real target exists; otherwise drop it (it currently points
nowhere meaningful).

### Beat 4 — `story-cta` (crown / transformed)
Keep "Let's build your edge" + description + the CTA button. **Add, above the CTA**: a synthesis line
*"From the human body to financial markets — the same systems brain."*; **domain badges**
(Finance · Health · Workforce eval · Voice AI · Computer Vision · Edge) as gold `Tag` chips; and a
muted **stack cloud** (Python · FastAPI · LangChain · AWS Bedrock/AgentCore/SageMaker · Docker ·
Valkey/Redis · Hugging Face · RAG · MCP · Multi-agent).

## Implementation approach

- **Structured data** (project cards, badges, stack, hero stats) lives in a typed module
  `frontend/src/pages/home/proofData.ts` — figures and tech names are language-neutral; this keeps
  HomePage lean and the data in one focused place.
- **Prose** (headings, one-liners, the synthesis line, stat captions) goes through i18n in BOTH `en`
  and `es`. New keys under `home.proof.*`; remove dead `home.portfolio.branding/webDesign/marketing/
  project` keys.
- Reuse existing components/tokens: `Card` variant `royal`, `Tag` variant `gold`, `textStyle`
  `cardTitle`/`eyebrow`/`lead`, `brand.*` colors. No new visual system.
- The credibility strip and badges/stack are small presentational subcomponents
  (`StatStrip`, `BadgeCloud`) under `frontend/src/pages/home/` to keep HomePage focused.

## Testing (Vitest)

- A render test for the metrics section: the four real project titles appear; a representative stat
  string (e.g. `87%`, `250K+`) appears; the old fake labels (`Branding`, `Web Design`, `Marketing`)
  do NOT appear anywhere.
- Hero stat strip renders all five figures.
- Route smoke tests stay green (headlines unchanged); `tsc --noEmit` clean.
- Both locale files parse; `home.portfolio.branding/webDesign/marketing/project` keys removed in both.

## Out of scope

- Per-section visual-treatment/mood shifts (backgrounds, spacing ramps) — a later pass.
- A real "all projects" detail page/route.
- The builder-angle homelab content (optional; defer).
- 2D motion de-chonk and the visual-system token sweep — still separate sessions.

## Content source

All figures/projects from memory `portfolio-real-proof` (vetted by Luis 2026-06-19). ES copy is
produced during the plan (mirror of the EN prose above).
