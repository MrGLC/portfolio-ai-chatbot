# Couture Adaptation — Handoff Styling + Jewel Engine v2 into the Existing Site

**Date:** 2026-06-12
**Source:** USB design handoff `design_handoff_portfolio_la_realeza/` (Claude Design, high-fidelity, archived copy at `docs/design-reference/` — see Assets). Luis's adoption decision: **styling (colors, element treatments) + jewel engine only; routes/pages/architecture unchanged; chatbot stays (restyled); ES/EN stays.**

## 1. Design tokens (replace current theme values)

Colors (new `brand.*` canon; old tokens remapped, not duplicated):
`bgCream #f6efe2` (page) · `bgCreamAlt #f9f3e9` (alt sections) · `bgCard #fbf7ef` · `ink #181428` (headings/body strong) · `body1 #5f5970` · `body2 #6a6478` · `crimson #c10e35` (THE accent: CTAs, links, jewel, figures) · `crimsonDeep #7e0a23` · `gold #c2a05c` (lines, chip borders, edges) · `goldText #a8863f` (eyebrows) · `goldBright #e8b765` · `placeholderTone #b3a98f` · `creamText #f3e9d8` (on dark) · `success #1f9d63` · `darkGradient linear(165deg, #1c0710, #330a1c 55%, #190610)` (Contact page hero/footer band adopt this).

Typography: **Bodoni Moda** (display: headings, figures, logo, quotes; 400-700 + italic) + **Hanken Grotesk** (body/UI). Self-host consideration: Google Fonts head links (same pattern as today, weights audited). Scale: H1 `clamp(40px,6vw,76px)` lh 1.02 ls -0.015em; H2 `clamp(32px,4.6vw,56px)` lh 1.05; card H3 24px/600; eyebrow 12px/600/caps/0.28em in goldText preceded by a 42×1px fading gold line; body 15-19px lh 1.65-1.75. Replaces Playfair/Inter and the current textStyles values (names stay: pageTitle/sectionTitle/cardTitle/eyebrow/lead).

Shape/space: container 1180px, side pad `clamp(20px,5vw,40px)`; section pad `clamp(80px,12vh,140px)`; radii 5-8 buttons, 10-12 cards, pill chips; crimson CTA shadow `0 16px 34px -16px rgba(193,14,53,.9)` + hover lift; card hover `translateY(-7px)` + gold border + `0 34px 64px -42px rgba(24,20,40,.55)` 0.35s.

Nav: transparent → `rgba(246,239,226,.82)` + blur(14px) + hairline after 40px scroll; logo = crimson-gradient gold-bordered rotated square 26px + wordmark in Bodoni; links ink → crimson hover; Hablemos/Get Started crimson solid. Mobile hamburger style per handoff.

## 2. Jewel engine v2 — "dash & wait" (replaces scroll-lerp + vertex morph)

- **Five-mesh crossfade** in one Group (scale-lerp 0.13/frame, never two at full scale): `ico` raw stone (crimson flat, crimson-deep edges) · `octa` cut diamond (crimson, gold edges) · `sphere` polished (smooth, metal .72) · `knot` TorusKnot gold engineering · `crown` goldBright with pulsing crimson emissive + gold edges. PLUS our custom `growth` columns mesh as a sixth shape (Luis-approved narrative beat).
- **Home chapter mapping** (our sections): `story-hero`=ico (potential) → `story-chatbot`=knot (the engineering mind; chatbot = 8th-chapter equivalent) → `story-portfolio`=growth (results) → `story-cta`=crown (transformed business). Keyframes table adapted from handoff (viewport-fraction coords + mobile overrides + per-section particle opacity + spin).
- **Behavior per handoff spec**: chapter = section center nearest viewport center; dash easing `k=min(0.22, 0.06+dist·0.5)`; shrink in transit `1−min(0.30, dist·1.25)`; morph during dash; settled breathing `×(1+sin(t·1.15)·0.028·settled)`; spin = rest spin + scroll-velocity kick + transit boost; scroll-velocity z-tilt; mouse parallax. Lighting per handoff (warm key, gold point, rose rim, ambient .55), camera fov 42 z 5.
- **Layering**: canvas fixed ABOVE content (`pointer-events: none`), nav above canvas. Gem interaction (drag/tap/hint — Luis values it) preserved via a **screen-space hit proxy**: useFrame projects the jewel's center to screen; an invisible fixed div (pointer-events auto, sized to jewel screen radius) tracks it and forwards pointer events to the rig handlers. Drag rotates; tap pulses (morph-toggle tap retires — shapes now belong to chapters).
- **Gold dust**: 200-point flattened shell (gold/crimson 50/50) following the group with lag 0.05, per-section target opacity (hero .5, chatbot 0, portfolio 0, cta .75), hidden in reading sections; in-transit attenuation ×(0.3+0.7·settled). REPLACES FieldLayer's band on Home (cursor-parting current retires with it — the dust + dash personality is the interaction story now); FieldAccent (other pages) keeps the CSS-gradient/lite + canvas/full pattern but recolored.
- Perf rules unchanged: pixelRatio ≤2 (perfProfile), reduced-motion = static jewel in hero keyframe, pause on document.hidden, one canvas on Home.
- Engine state lives in refs/rAF (no React re-render per frame) — same as today. `usePerfProfile`, suite, FieldAccentCanvas survive.

## 3. Element treatments across existing pages (architecture untouched)

- All five pages: token + typography sweep (Chakra theme carries most of it); eyebrow kicker pattern with gold line; card variant updated to handoff hover treatment; chips → gold-border pills; stats figures in Bodoni crimson.
- Consulting: services become the **hairline-grid cells** treatment (gap 1px on `rgba(24,20,40,.1)`, numerals Bodoni 38px gold, hover bgCard) — same content, new clothes; process steps → A/B/C gold-bordered circles.
- Contact: page adopts **dark-gradient panel** treatment for the form area (glass panel `rgba(255,255,255,.035)`, gold-focus inputs, validation styles + success state per handoff); email-with-gold-underline element.
- About: stats row over hairline (Bodoni crimson figures); portrait placeholder w/ ink badge (photo pending from Luis).
- Home chatbot section: restyled to the new language (panel = bgCard, gold hairlines, chips as gold pills, Bodoni accents) — content/function unchanged.
- Footer: handoff footer treatment on dark band (Contact page) and light variant elsewhere.

## 4. Out of scope / pending Luis
- Marquee ("confianza") + testimonial sections — NOT added (new sections = architecture change). Offer later.
- Real photos/logos/copy (handoff placeholders note what's needed: project shots 1600×1000, portrait 1000×1250, client logos, testimonial, real email).
- Contact form backend wiring (validation UI yes; POST target later).
- One-page conversion: rejected by Luis.

## 5. Acceptance
- Behavioral battery (drag/tap via hit proxy, touch scroll, hint dismissal) passes.
- 60/30/10 blur test on every page with the NEW tokens.
- TBT ≤ baseline ~7s; suite green (resolver tests rewritten for dash model); overflow sweep zero.
- Screenshot review of all 4 Home beats + 4 other pages, desktop + mobile, before deploy.
