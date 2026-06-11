# Phase 2: Visual Polish + Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the bad patterns found in audit — Three.js performance anti-patterns (Lighthouse mobile perf 0.35, TBT ~34s), theme-bypassing hardcoded styles, and chatbot UX gaps — while keeping the royal cream/red/gold look.

**Architecture:** Royal aesthetic stays; its cost drops. A shared `usePerfProfile` hook gates 3D complexity by device + reduced-motion. Jewel scene loses shadow-casting lights, most transmission materials, and 75% of CPU-updated particles. Per-message WebGL avatars become static CSS gems. Hardcoded colors/styles move into theme tokens + a Card variant. Chatbot gets i18n'd errors, auto-scroll, auto-send chips, demo badge, aria basics.

**Tech Stack:** unchanged (React 18.3.1, Chakra 2.10, fiber 8.18, drei 9.122, three 0.184, Vitest).

**Verified baseline:** 5 smoke tests green; site live at la-realeza.com; Lighthouse mobile perf 0.35 / a11y 0.93 / bp 1.0 / seo 0.91 (TBT 34s, measured via karakeep chrome — inflated but directionally right).

**Audit facts driving this plan (file:line refs):**
- `RedJewelBackground.tsx`: no dpr cap (450), 2000-particle CPU loop + needsUpdate per frame (220-228), 7 lights incl. 2 castShadow spotlights (336-387), 17 MeshPhysicalMaterial with transmission 0.8-0.98 (multiple), per-frame material writes (115, 156), scroll setState re-render (419-428)
- `LightPattern.tsx`: no dpr cap (75-81), 50-mesh forEach + 12 lines (10-45)
- `ThreeJsChatbot.tsx`: Avatar3D = one Canvas PER MESSAGE (333-356, used 367/435/633), 100-particle loop with dead `Math.sqrt` (172-184), dead `MeshTransmissionMaterial` import (3), hardcoded EN error strings (471, 481), "Luis AI Assistant" hardcoded (519), no auto-scroll, no aria, chips don't auto-send (744)
- Pages: 22+ hardcoded hex colors (ConsultingPage worst: 12), repeated inline card styles (ConsultingPage 179-185, AboutPage 313-317/384-388), fixed 500/600px decorative widths (HomePage 119/653/663), IconButton size="sm" social icons <44px (Footer 86-100)

---

### Task 1: Perf profile hook + jewel scene overhaul

**Files:**
- Create: `frontend/src/hooks/usePerfProfile.ts`
- Modify: `frontend/src/components/ThreeBackground/RedJewelBackground.tsx`
- Test: `frontend/src/test/perfProfile.test.ts`

- [ ] **Step 1: Write failing test `frontend/src/test/perfProfile.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getPerfProfile } from '../hooks/usePerfProfile';

describe('getPerfProfile', () => {
  it('full profile on desktop without reduced motion', () => {
    expect(getPerfProfile(1280, false)).toEqual({
      tier: 'full', dpr: [1, 2], particleScale: 1, animate: true,
    });
  });
  it('lite profile on mobile width', () => {
    expect(getPerfProfile(390, false)).toEqual({
      tier: 'lite', dpr: [1, 1.5], particleScale: 0.25, animate: true,
    });
  });
  it('static when prefers-reduced-motion', () => {
    expect(getPerfProfile(1280, true)).toEqual({
      tier: 'lite', dpr: [1, 1.5], particleScale: 0.25, animate: false,
    });
  });
});
```

- [ ] **Step 2: Run, expect FAIL (module not found):** `cd frontend && npx vitest run src/test/perfProfile.test.ts`

- [ ] **Step 3: Create `frontend/src/hooks/usePerfProfile.ts`**

```ts
import { useEffect, useState } from 'react';

export interface PerfProfile {
  tier: 'full' | 'lite';
  dpr: [number, number];
  particleScale: number;
  animate: boolean;
}

export function getPerfProfile(width: number, reducedMotion: boolean): PerfProfile {
  const lite = width < 768 || reducedMotion;
  return {
    tier: lite ? 'lite' : 'full',
    dpr: lite ? [1, 1.5] : [1, 2],
    particleScale: lite ? 0.25 : 1,
    animate: !reducedMotion,
  };
}

export function usePerfProfile(): PerfProfile {
  const [profile, setProfile] = useState<PerfProfile>(() =>
    getPerfProfile(window.innerWidth, window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setProfile(getPerfProfile(window.innerWidth, mq.matches));
    window.addEventListener('resize', update);
    mq.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      mq.removeEventListener('change', update);
    };
  }, []);
  return profile;
}
```

- [ ] **Step 4: Tests pass:** `npx vitest run src/test/perfProfile.test.ts` → 3 passing

- [ ] **Step 5: Overhaul `RedJewelBackground.tsx`** (read the file first; apply ALL of these, keeping the visual composition):

1. Canvas (line ~450): add `dpr={profile.dpr}` (use `usePerfProfile()` in the component), set `gl={{ antialias: profile.tier === 'full', alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 2.0 }}`, and when `!profile.animate` pass `frameloop="never"` (static frame still renders once).
2. Lights (`JewelLighting`): remove `castShadow` from both spotlights; delete one of the three animated spotlights and one static pointLight (keep: 2 animated spotlights, 1 pointLight, 1 directionalLight, ambient). Stop per-frame `intensity` writes — animate position only.
3. `SparkleField`: particle count `Math.round(2000 * profile.particleScale)` (500 on mobile). Replace the per-vertex Y-wobble loop with whole-cloud motion ONLY (keep `rotation.y`; add `mesh.current.position.y = Math.sin(time*0.2)*0.3`). DELETE the 2000-iteration loop and the `needsUpdate = true` line entirely.
4. Materials: keep `meshPhysicalMaterial` with transmission ONLY on the CrownJewel center mesh. Convert RedDiamond (5), RubyCluster (30), CrystalSpike (6), FacetedGem (6), CrownJewel satellites (6) to `meshStandardMaterial` keeping color/metalness/roughness/emissive/envMapIntensity props (drop transmission/thickness/ior/clearcoat props — they're physical-only).
5. Per-frame material writes (CrystalSpike emissiveIntensity, FacetedGem envMapIntensity): delete the per-frame mutation lines; set static mid-range values in JSX (`emissiveIntensity={0.4}`, `envMapIntensity={5}`).
6. Scroll re-render: replace `const [scrollY, setScrollY] = useState(0)` with `const scrollRef = useRef(0)`; the scroll listener writes `scrollRef.current = window.scrollY` (no setState, no rAF wrapper); pass `scrollRef` to `CameraController` and read `scrollRef.current` inside its `useFrame`. Keep `mounted` state as-is.
7. Pass `profile` down where needed via props (components live in the same file).

- [ ] **Step 6: Verify:** `npx tsc --noEmit && npx vitest run && npm run build 2>&1 | tail -3` all green. Then `npm run dev` and confirm the jewel background still shows diamonds/rubies/sparkles (visually similar, less glassy on satellites).

- [ ] **Step 7: Commit:** `git add -A && git commit -m "perf: jewel scene — no shadows, 1 transmission material, static sparkle cloud, scroll via ref, dpr cap"`

### Task 2: LightPattern + chatbot scene perf

**Files:**
- Modify: `frontend/src/components/ThreeBackground/LightPattern.tsx`, `frontend/src/components/Chatbot/ThreeJsChatbot.tsx`

- [ ] **Step 1: `LightPattern.tsx`:** add `usePerfProfile()`; Canvas gets `dpr={profile.dpr}`, `gl={{ antialias: false, alpha: true }}` (thin lines + small dots don't need AA at 1.5dpr); `frameloop="never"` when `!profile.animate`. FloatingDots: count `Math.round(50 * profile.particleScale)` (12 on mobile); replace the per-child forEach with group-level motion only: `groupRef.current.rotation.z = state.clock.elapsedTime * 0.02` (delete the per-child position writes). Reduce sphereGeometry segments 16→8.

- [ ] **Step 2: `ThreeJsChatbot.tsx` main scene:** add `dpr` from `usePerfProfile()` to the main Canvas (line ~504). In `AssistantOrb` useFrame particle loop: delete the unused `distance = Math.sqrt(...)` line. Reduce particle count 100 → `Math.round(100 * profile.particleScale)`. Delete the dead `MeshTransmissionMaterial` import (line 3).

- [ ] **Step 3: Verify:** `npx tsc --noEmit && npx vitest run && npm run build 2>&1 | tail -3` green; dev-server visual check both scenes render.

- [ ] **Step 4: Commit:** `git add -A && git commit -m "perf: cap dpr + cut particle counts in LightPattern and chatbot scene"`

### Task 3: Kill per-message WebGL avatars

**Files:**
- Modify: `frontend/src/components/Chatbot/ThreeJsChatbot.tsx` (Avatar3D lines ~333-356, MessageBubble ~359-439, typing indicator ~625-675)

- [ ] **Step 1: Replace `Avatar3D` (a full Canvas per message bubble) with a static CSS gem.** Same visual language (red octahedron for assistant, gold gem for user) via rotated square with gradient:

```tsx
const StaticAvatar: React.FC<{ isUser: boolean }> = ({ isUser }) => (
  <Box
    w="24px"
    h="24px"
    flexShrink={0}
    transform="rotate(45deg)"
    borderRadius="4px"
    bgGradient={isUser
      ? 'linear(135deg, #FFD700, #B8860B)'
      : 'linear(135deg, #DC143C, #8B0000)'}
    boxShadow={isUser
      ? '0 0 8px rgba(255, 215, 0, 0.5)'
      : '0 0 8px rgba(220, 20, 60, 0.5)'}
    aria-hidden="true"
  />
);
```

Replace every `<Avatar3D isUser={...} />` usage (message bubbles + typing indicator) with `<StaticAvatar isUser={...} />`. Delete the `Avatar3D`, `MiniAssistantOrb`, and `UserGem` components entirely (they exist only for per-message canvases; the main left-panel orb scene stays).

- [ ] **Step 2: Verify:** `npx tsc --noEmit && npx vitest run` green (routes test mocks the whole module's Canvas via fiber mock — unaffected). Dev check: avatars show as small gems, chat works.

- [ ] **Step 3: Commit:** `git add -A && git commit -m "perf: static CSS avatars — was one WebGL canvas per chat message"`

### Task 4: Theme tokens + Card variant + kill hardcoded colors

**Files:**
- Modify: `frontend/src/theme/index.ts`, then `frontend/src/pages/ConsultingPage.tsx`, `frontend/src/pages/ProjectsPage.tsx`, `frontend/src/pages/HomePage.tsx`, `frontend/src/pages/AboutPage.tsx`, `frontend/src/components/Layout/Footer.tsx`

- [ ] **Step 1: Read `frontend/src/theme/index.ts`** to learn the existing token structure (it has `brand.*` colors). ADD missing tokens (names may need adapting to existing structure — keep its conventions):

```ts
// inside the colors object
brand: {
  // ...existing entries stay...
  redDark: '#C41E3A',
  redDeep: '#8B0000',
  creamSoft: '#FAF0E6',
  creamWarm: '#FFF8E7',
  inkSoft: '#1A1A1A',
  textMuted: '#666666',
},
```

And a Card component variant capturing the repeated inline style (ConsultingPage 179-185, AboutPage 313-317):

```ts
components: {
  // ...existing...
  Card: {
    variants: {
      royal: {
        container: {
          bg: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          _hover: { boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)', transform: 'translateY(-4px)' },
        },
      },
    },
  },
},
```

- [ ] **Step 2: Mechanical color replacement across the 5 files.** Find every occurrence: `grep -rn "#C41E3A\|#FAF0E6\|#FFF8E7\|#1A1A1A\|#666666\|#8B0000\|#FFD700\|#DC143C" frontend/src/pages/ frontend/src/components/Layout/Footer.tsx`. Replace per this mapping (inside Chakra props only — string-built CSS gradients keep hex but switch to token-derived constants where a `colors.*` import already exists in the file):

| Literal | Replace with |
|---|---|
| `#C41E3A` | `brand.redDark` |
| `#DC143C` | `brand.secondary` (check theme — if the red token has another name, use it) |
| `#8B0000` | `brand.redDeep` |
| `#FFD700` | `brand.accent` (check actual token name for gold) |
| `#FAF0E6` | `brand.creamSoft` |
| `#FFF8E7` | `brand.creamWarm` |
| `#1A1A1A` | `brand.inkSoft` |
| `#666666` | `brand.textMuted` |

Footer social brand colors (#0A66C2 LinkedIn etc.) STAY — they're third-party brand colors, not theme leaks. ProjectsPage data-array gradients (#667eea, #764ba2, #f093fb…) are placeholder project art replaced in Phase 3 — leave but add `// TODO Phase 3: real project images` comment if not present.

- [ ] **Step 3: Apply Card variant** where the audit found the copy-pasted style: ConsultingPage service cards (~179-185) and AboutPage MotionCard `style={{}}` blocks (~313-317, 384-388) → `<Card variant="royal">` / `motion.create(Card)` with `variant="royal"`, deleting the inline `style={{}}` objects.

- [ ] **Step 4: Verify:** `npx tsc --noEmit && npx vitest run && npm run build 2>&1 | tail -3` green. Re-run the grep from Step 2 — remaining hits must be only: Footer social colors, ProjectsPage placeholder gradients, ThreeBackground/Chatbot 3D files (3D material colors are scene constants, fine).

- [ ] **Step 5: Commit:** `git add -A && git commit -m "style: theme tokens for all brand colors, royal Card variant, delete inline style blocks"`

### Task 5: Responsive + touch-target fixes

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`, `frontend/src/components/Layout/Footer.tsx`, `frontend/src/pages/ProjectsPage.tsx`, `frontend/src/pages/ConsultingPage.tsx`

- [ ] **Step 1: Fixed decorative widths** (HomePage 119, 653, 663): `width="500px"` → `width={{ base: '280px', md: '500px' }}`; `width="600px"` → `width={{ base: '320px', md: '600px' }}`. These are blurred gradient circles — also confirm each has `pointerEvents="none"`.

- [ ] **Step 2: Touch targets:** Footer social `IconButton size="sm"` (86-100) → `size="md"` (Chakra md = 40px) plus `minW="44px" minH="44px"`. ProjectsPage tech Tags (321, 335): keep `size="sm"` visual but they're non-interactive labels — verify they have no onClick; if any do, bump padding.

- [ ] **Step 3: Mobile spacing:** ProjectsPage SimpleGrid (250-252) `spacing={8}` → `spacing={{ base: 4, md: 8 }}`. ConsultingPage hero heading `size="4xl"` (115) → add `fontSize={{ base: '3xl', md: '5xl' }}` so it doesn't overflow at 320px (then remove the `size` prop — mixing both is the audit's anti-pattern #3).

- [ ] **Step 4: HomePage heading double-spec** (394-402): where both `size=` and `fontSize={{...}}` exist on a Heading, remove the `size` prop (fontSize wins anyway; one source of truth).

- [ ] **Step 5: Verify:** gates green; dev server at 360px-wide viewport (devtools) — no horizontal scrollbar on any of the 5 pages (`document.documentElement.scrollWidth <= window.innerWidth` in console on each route).

- [ ] **Step 6: Commit:** `git add -A && git commit -m "style: responsive decorative widths, 44px touch targets, mobile spacing"`

### Task 6: Chatbot UX pass

**Files:**
- Modify: `frontend/src/components/Chatbot/ThreeJsChatbot.tsx`, `frontend/src/i18n/locales/en/translation.json`, `frontend/src/i18n/locales/es/translation.json`

- [ ] **Step 1: i18n the hardcoded strings.** Add keys to BOTH locale files under `home.chatbot`:

```json
"assistantName": "Luis AI Assistant",
"demoBadge": "Demo",
"demoNotice": "Demo mode — scripted responses. The real assistant arrives soon.",
"errorFallback": "Sorry, I could not process your request.",
"errorGeneric": "Sorry, something went wrong. Please try again."
```

ES versions:

```json
"assistantName": "Asistente IA de Luis",
"demoBadge": "Demo",
"demoNotice": "Modo demo — respuestas predefinidas. El asistente real llega pronto.",
"errorFallback": "Lo siento, no pude procesar tu solicitud.",
"errorGeneric": "Lo siento, algo salió mal. Inténtalo de nuevo."
```

Replace in component: line ~519 `"Luis AI Assistant"` → `{t('home.chatbot.assistantName')}`; line ~471 fallback → `t('home.chatbot.errorFallback')`; line ~481 catch → `t('home.chatbot.errorGeneric')`.

- [ ] **Step 2: Demo badge.** In the chat header next to the title (~577): `<Badge colorScheme="yellow" fontSize="xs" title={t('home.chatbot.demoNotice')}>{t('home.chatbot.demoBadge')}</Badge>`. Honest labeling — spec requires "clearly labeled as demo".

- [ ] **Step 3: Auto-scroll.** Add after the messages map container:

```tsx
const messagesEndRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}, [messages, isTyping]);
```

and `<div ref={messagesEndRef} />` as last child of the scrollable messages Box.

- [ ] **Step 4: Chips auto-send.** Suggested-question chips (~744) currently `onClick={() => setInput(question)}`. Change to send immediately: extract the send logic so it takes a string — `handleSend(text?: string)` using `const message = text ?? input;` — chip onClick becomes `onClick={() => handleSend(question)}`. Keep chips visible only at `messages.length === 1` (current behavior).

- [ ] **Step 5: Aria basics:** messages Box gets `role="log"` + `aria-live="polite"` + `aria-label={t('home.chatbot.chatTitle')}`; Input gets `aria-label={t('home.chatbot.placeholder')}`; send IconButton/Button gets `aria-label="Send"` → use existing key `home.chatbot.enterToSend` if it reads as a label, else add `"send": "Send message"` / `"send": "Enviar mensaje"` key pair; typing indicator Box gets `aria-label="..."` via new key `"typing": "Assistant is typing"` / `"typing": "El asistente está escribiendo"`.

- [ ] **Step 6: Scripted Q&A flows (spec: "predefined Q&A conversation flows about services and projects, in ES and EN").** The 4 chips map to canned, language-aware answers; anything else falls through to the backend demo echo. Add to BOTH locale files under `home.chatbot.cannedAnswers` (EN shown; write natural ES equivalents):

```json
"cannedAnswers": {
  "skills": "Luis is a Biomedical Engineer working in AI: machine-learning models for finance, AI interviewing systems, computer vision, and self-hosted LLM infrastructure. Stack: Python, PyTorch, FastAPI, React, Docker.",
  "projects": "Highlights: AI trading models for finance, an AI interviewing system for a labor-lending company, biomedical computer-vision work, and a self-hosted AI homelab (messaging hub, personal assistant, RAG over his notes). Ask about any of them!",
  "experience": "Luis combines biomedical engineering with production AI work — currently building AI for finance at Primero Trader and AI interviewing systems. He also runs a full self-hosted AI lab.",
  "availability": "Luis takes consulting projects in AI/ML — model development, LLM integrations, and end-to-end product builds. Use the Contact page and he'll get back to you quickly."
}
```

In the component, before calling the API in `handleSend`:

```tsx
const CANNED_KEYS = ['skills', 'projects', 'experience', 'availability'] as const;
// sampleQuestions array already maps these keys to t() strings — build a lookup:
const cannedFor = (msg: string): string | null => {
  const hit = CANNED_KEYS.find((k) => t(`home.chatbot.sampleQuestions.${k}`) === msg);
  return hit ? t(`home.chatbot.cannedAnswers.${hit}`) : null;
};
```

In `handleSend`, after appending the user message: if `cannedFor(message)` returns text, show typing indicator for ~800ms (setTimeout) then append that answer and skip the API call; otherwise proceed with `chatbotAPI.sendMessage` as today. This keeps the provider seam: real LLM later replaces both paths in one place.

- [ ] **Step 7: Verify:** gates green. Dev check: chip click sends immediately and answers in the active language; free-text still hits backend demo; new message scrolls into view; badge shows; switch to ES — all new strings translate.

- [ ] **Step 8: Commit:** `git add -A && git commit -m "feat: chatbot UX — scripted ES/EN Q&A flows, demo badge, auto-scroll, auto-send chips, i18n errors, aria"`

### Task 7: Deploy + re-measure

**Files:** none (VPS + measurement)

- [ ] **Step 1: Full gate locally:** `cd frontend && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npx vitest run 2>&1 | tail -3` — all green.

- [ ] **Step 2: Merge + push** (note GitHub SSH from this host needs port 443):

```bash
cd /home/luisgg/projects/personal/portfolio-ai-chatbot
git checkout main && git merge --no-ff phase2-visual-polish -m "Phase 2: visual polish + perf fixes"
GIT_SSH_COMMAND="ssh -o HostName=ssh.github.com -p 443" git push origin main
```

- [ ] **Step 3: Redeploy on VPS:**

```bash
ssh la-realeza 'cd /opt/la-realeza/app && git pull -q && docker compose -f docker-compose.prod.yml -f docker-compose.vps.yml up -d --build 2>&1 | tail -3'
```

- [ ] **Step 4: Live verify:** `curl -s -o /dev/null -w '%{http_code}' https://la-realeza.com` → 200; spot-check `/api/home`, chatbot demo POST.

- [ ] **Step 5: Lighthouse re-measure** (PSI quota may be reset; else karakeep chrome):

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://la-realeza.com&strategy=mobile" | python3 -c "import json,sys; d=json.load(sys.stdin); c=d['lighthouseResult']['categories']; print({k: v['score'] for k,v in c.items()})"
# fallback:
docker run --rm --network container:karakeep-chrome-1 node:24-alpine sh -c "npx -y lighthouse@12 https://la-realeza.com --port=9222 --output=json --output-path=/tmp/lh.json --only-categories=performance --form-factor=mobile --quiet >/dev/null 2>&1; node -e \"const d=require('/tmp/lh.json'); console.log('perf', d.categories.performance.score); ['total-blocking-time','largest-contentful-paint'].forEach(m=>console.log(m, d.audits[m].displayValue))\""
```

Record before (0.35 / TBT 34s) → after. Target: perf ≥ 0.7 on the karakeep-chrome rig (its CPU contention makes 0.9 unrealistic there; PSI numbers are authoritative if quota allows). If TBT still dominated by the jewel scene after these cuts, note remaining levers (frameloop=demand at 30fps tick, full mobile 3D disable) as a follow-up decision for Luis — don't implement unilaterally.

- [ ] **Step 6: Tag:** `git tag phase2-deployed && GIT_SSH_COMMAND="ssh -o HostName=ssh.github.com -p 443" git push origin phase2-deployed`

---

## Out of scope
- Projects page restructure for the 4 real categories → folded into Phase 3 when content arrives (structure without text = churn).
- Heading hierarchy normalization beyond the double-spec fixes (Task 5 Step 4) — full typographic rescale risks visual regressions with no design reference; revisit with Luis's eyes on Phase 3.
- Real LLM integration; Chakra v3; React 19.

## Risks
- Material conversion (physical→standard) changes jewel look — keep CrownJewel transmission as the centerpiece; if satellites look flat, raise `envMapIntensity` before reconsidering transmission.
- `frameloop="never"` under reduced-motion renders one frame; if scene appears black on some GPUs, fall back to rendering 2 frames via `invalidate()` — only if observed.
