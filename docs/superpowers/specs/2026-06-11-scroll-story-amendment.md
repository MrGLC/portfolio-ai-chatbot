# Scroll Story — Amendment to the Living Jewel Design

**Date:** 2026-06-11 (amends `2026-06-11-living-jewel-hero-design.md`; approved by Luis: "Yes, build it")
**Driver:** Live feedback — interactions undiscoverable, effects disconnected from content, layout conventional. The deferred "later phase" (scroll choreography) is now in scope, plus affordances and editorial content positioning.

## 1. The journey (Home only)

The JewelScene canvas becomes **fixed full-viewport with `alpha: true`** behind the whole Home page (was: opaque, hero-only). The page paints its own backgrounds (hero section keeps the dark `#140306` block via CSS; sections below stay cream). The jewel travels and transforms with scroll:

| Scroll region (Home section) | Jewel target | Position/behavior |
|---|---|---|
| Hero | `gem` | Current placement (right desktop / lower-third mobile); drag+tap as today |
| Chatbot section ("Ask Me Anything") | `neural` (organic noise blob) | Drifts to the LEFT lane beside the chat panel, scale 0.7, slow pulse |
| Portfolio/projects section | `lattice` (gem shattered toward a crystalline cluster) | RIGHT lane, scale 0.8, slow rotation |
| CTA section | `gem` (reassembled) | Center-right, scale 1.1, pulses once on arrival |

- Morph + position are driven by a **pure resolver** `resolveStoryFrame(scrollY, sectionRanges, viewportH)` → `{ from, to, progress, position: [x,y,z], scale }` (unit-tested); a thin hook measures section DOM offsets (ids: `story-hero`, `story-chatbot`, `story-portfolio`, `story-cta`) on mount/resize and feeds a scrollRef read in useFrame — zero React re-renders during scroll.
- Transitions happen across the gaps between sections (blend zones = 40% of viewport height around each boundary).
- The field current stays a HERO feature: its opacity fades out as the hero leaves the viewport (uniform-driven), so cream sections aren't polluted by additive particles. The backdrop gradient plane is hero-only the same way.
- Mobile: identical choreography — scroll is the primary interaction on touch; lanes become center-offset (±0.8 world units) instead of full left/right.

## 2. Affordances

- **Drag hint:** small pill near the gem, i18n ES/EN ("Drag me / Arrástrame" + tap hint on touch), shown until first pointer-down on the gem (then never again — localStorage flag `jewelHintDismissed`).
- **Magnetic lean:** gem leans up to ~8° toward the cursor when within its half of the viewport (lerped in useFrame; desktop full tier only).
- **Field parting strength ×2** so the cursor reaction is felt, radius unchanged.

## 3. Editorial content positioning (Home)

- Hero: asymmetric grid — text block widens to ~52% with tighter leading; gem owns the right 48% as true negative space (desktop). Eyebrow/title/lead left-aligned to a hard left edge; CTAs inline-start.
- Sections get alternating lanes matching the jewel's path: chatbot content shifts RIGHT (jewel left), portfolio header shifts LEFT (jewel right), CTA centered. Implementation: per-section `maxW` + asymmetric margins, not new components.
- Section ids added for the scroll resolver double as scroll-margin anchors.

## 4. Unchanged constraints

One canvas on Home; all motion via uniforms/lerped refs; perf profile gates; TBT ≤ baseline; overflow sweep zero; 20-test suite grows (resolver + new targets tested); FieldAccent/non-Home pages untouched.

## Out of scope
- New pages choreography (Home only).
- Sound, haptics.
- Real chatbot.
