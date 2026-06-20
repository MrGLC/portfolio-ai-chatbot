# Home Sections Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the four Home story-section bodies to embody their jewel beats with Luis's vetted real proof (numbers strip, model proof lines, real metrics project cards, crown badges + stack).

**Architecture:** Bilingual proof content lives in i18n under `home.proof.*` (EN+ES), read via react-i18next `t(key, { returnObjects: true })` so both languages stay together. Proper-noun stack tokens live in a tiny constant module. Section bodies are rebuilt with existing components/tokens (`Card` variant `royal`, `Tag` variant `gold`, `textStyle`s, `brand.*`). No new visual system.

**Tech Stack:** React 18 + TS, Chakra UI v2, react-i18next, Vitest.

## Global Constraints

- Build directly in `frontend/` (NOT `frontend_iterations/`).
- **Honesty (binding):** render `~60% cache hit` with the `~`; label Appen `P99 < 500ms` as "(designed for)"; never add "zero critical failures", "99.9% uptime", "10K data points/sec", or anything from Solda.
- Every user-facing string in BOTH `frontend/src/i18n/locales/en/translation.json` and `.../es/translation.json`.
- Reuse existing components/tokens only — no new hardcoded hex (use `brand.*`); cards use the existing `Card` `royal` variant, chips the `Tag` `gold` variant.
- Keep the `View all` button → `/projects` (that route exists).
- Run tests from `frontend/`: `npm test`, `npx tsc --noEmit`. Commit per task (Conventional Commits) ending with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Visual verification on `dev.la-realeza.com` after the build.

---

### Task 1: Proof content (i18n EN+ES) + stack constant

**Files:**
- Modify: `frontend/src/i18n/locales/en/translation.json` (add `home.proof`; remove dead `home.portfolio.branding/webDesign/marketing/project`)
- Modify: `frontend/src/i18n/locales/es/translation.json` (same)
- Create: `frontend/src/pages/home/proofStack.ts`
- Test: `frontend/src/test/proofContent.test.ts`

**Interfaces:**
- Produces: i18n `home.proof.{heroStats,modelLines,projects,synthesis,domains}`; `PROOF_STACK: string[]`.
- Shapes: `heroStats: {figure,caption}[]`, `modelLines: string[]`, `projects: {name,line,stats:string[]}[]`, `domains: string[]`.

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/test/proofContent.test.ts
import { describe, it, expect } from 'vitest';
import en from '../i18n/locales/en/translation.json';
import es from '../i18n/locales/es/translation.json';

describe('proof content', () => {
  it('EN has 4 real projects with honesty markers and no fake agency labels', () => {
    const p = (en as any).home.proof.projects;
    expect(p).toHaveLength(4);
    const names = p.map((x: any) => x.name);
    expect(names).toEqual(['Primero Trader', 'Appen', 'Clinical CV', 'Interaction AI']);
    const flat = JSON.stringify(p);
    expect(flat).toContain('~60% cache hit');
    expect(flat).toContain('(designed for)');
    expect(flat).not.toContain('99.9%');
    expect((en as any).home.portfolio.branding).toBeUndefined();
  });
  it('ES mirrors the structure (4 projects, 5 hero stats)', () => {
    expect((es as any).home.proof.projects).toHaveLength(4);
    expect((es as any).home.proof.heroStats).toHaveLength(5);
    expect((es as any).home.portfolio.webDesign).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/proofContent.test.ts`
Expected: FAIL — `home.proof` undefined; the fake keys still present.

- [ ] **Step 3: Add `home.proof` (EN) + remove dead keys**

In `en/translation.json`, inside `home`, add:

```json
"proof": {
  "heroStats": [
    { "figure": "3+", "caption": "years of AI in production" },
    { "figure": "5", "caption": "AI roles — fintech, health, data" },
    { "figure": "100+", "caption": "concurrent users in production" },
    { "figure": "250K+", "caption": "contributors/month served" },
    { "figure": "9.01", "caption": "GPA — Biomedical Engineering" }
  ],
  "modelLines": [
    "Primero Trader — transformer fine-tuning on SageMaker, drift retraining, a live MCP ecosystem.",
    "Appen — a two-agent voice interviewer (AWS Strands + Bedrock), RAG-grounded scorecards."
  ],
  "projects": [
    { "name": "Primero Trader", "line": "\"TradingView of MCPs\" — real-time market intelligence",
      "stats": ["Monolith → event-driven microservices", "Redis → Valkey, zero-downtime", "~60% cache hit · 300+ fields/ticker"] },
    { "name": "Appen", "line": "AI that interviews the global workforce",
      "stats": ["250K+ contributors/month", "Two-agent voice (Strands + Bedrock)", "P99 < 500ms (designed for)"] },
    { "name": "Clinical CV", "line": "Hemorrhage detection from medical imaging",
      "stats": ["87% precision / 83% recall", "10,000+ medical images", "Springer publication"] },
    { "name": "Interaction AI", "line": "Multimodal intent on the edge",
      "stats": ["78% accuracy", "YOLOv5 + speech-to-text", "Deployed on Raspberry Pi"] }
  ],
  "synthesis": "From the human body to financial markets — the same systems brain.",
  "domains": ["Finance", "Health", "Workforce eval", "Voice AI", "Computer Vision", "Edge"]
}
```

Remove the keys `branding`, `webDesign`, `marketing`, `project` from `home.portfolio` (keep `subtitle`, `title`, `viewAll`).

- [ ] **Step 4: Add `home.proof` (ES) + remove dead keys**

In `es/translation.json`, inside `home`, add:

```json
"proof": {
  "heroStats": [
    { "figure": "3+", "caption": "años de IA en producción" },
    { "figure": "5", "caption": "roles de IA — fintech, salud, datos" },
    { "figure": "100+", "caption": "usuarios concurrentes en producción" },
    { "figure": "250K+", "caption": "contribuidores/mes atendidos" },
    { "figure": "9.01", "caption": "promedio — Ingeniería Biomédica" }
  ],
  "modelLines": [
    "Primero Trader — fine-tuning de transformers en SageMaker, reentrenamiento por drift, ecosistema MCP en vivo.",
    "Appen — entrevistador de voz de dos agentes (AWS Strands + Bedrock), scorecards con RAG."
  ],
  "projects": [
    { "name": "Primero Trader", "line": "\"TradingView de MCPs\" — inteligencia de mercado en tiempo real",
      "stats": ["Monolito → microservicios event-driven", "Redis → Valkey, sin downtime", "~60% cache hit · 300+ campos/ticker"] },
    { "name": "Appen", "line": "IA que entrevista a la fuerza laboral global",
      "stats": ["250K+ contribuidores/mes", "Voz de dos agentes (Strands + Bedrock)", "P99 < 500ms (designed for)"] },
    { "name": "Clinical CV", "line": "Detección de hemorragias en imagen médica",
      "stats": ["87% precisión / 83% recall", "10,000+ imágenes médicas", "Publicación Springer"] },
    { "name": "Interaction AI", "line": "Intención multimodal en el edge",
      "stats": ["78% accuracy", "YOLOv5 + speech-to-text", "Desplegado en Raspberry Pi"] }
  ],
  "synthesis": "Del cuerpo humano a los mercados financieros — el mismo cerebro de sistemas.",
  "domains": ["Finanzas", "Salud", "Evaluación de fuerza laboral", "Voice AI", "Computer Vision", "Edge"]
}
```

Remove `branding`, `webDesign`, `marketing`, `project` from `home.portfolio`.

- [ ] **Step 5: Add the stack constant**

```ts
// frontend/src/pages/home/proofStack.ts
// Proper-noun tech tokens — not translated.
export const PROOF_STACK: string[] = [
  'Python', 'FastAPI', 'LangChain', 'AWS Bedrock', 'AgentCore', 'SageMaker', 'OpenSearch',
  'AWS Strands', 'Docker', 'MongoDB', 'Valkey/Redis', 'WebSocket', 'Hugging Face',
  'RAG', 'MCP', 'Multi-agent', 'SQL', 'C++',
];
```

- [ ] **Step 6: Run test + full suite + tsc**

Run: `cd frontend && npx vitest run src/test/proofContent.test.ts && npm test && npx tsc --noEmit`
Expected: PASS — proof tests green; route tests still green (they use other keys); tsc clean.

Note: if any code still references the removed `home.portfolio.branding/webDesign/marketing/project` keys, Task 2 removes those usages — but this task's `tsc`/tests stay green because those are `t()` string calls (not typed), and the fake grid is still rendering them until Task 2. To keep the suite green now, Task 2 must run before deploying; the keys' removal only affects runtime text (the fake grid would show raw key strings briefly if deployed between tasks — do not deploy mid-sequence).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/i18n/locales/en/translation.json frontend/src/i18n/locales/es/translation.json frontend/src/pages/home/proofStack.ts frontend/src/test/proofContent.test.ts
git commit -m "feat(home): vetted proof content (i18n EN+ES) + stack constant

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Metrics section — real project cards (replace the fake grid)

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx` (the `story-portfolio` body: the generic lead `Text` ~line 433-440, the fake `SimpleGrid` ~line 444-551; keep the `View all` button)
- Test: `frontend/src/test/metricsSection.test.tsx` (new)

**Interfaces:**
- Consumes: i18n `home.proof.projects` (Task 1) via `t('home.proof.projects', { returnObjects: true })`.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/test/metricsSection.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n/config';
import theme from '../theme';
import { HomePage } from '../pages/HomePage';

// JewelScene + chatbot are canvas — stub like the route tests do.
import { vi } from 'vitest';
vi.mock('../components/JewelScene', () => ({ default: () => null, JewelScene: () => null }));
vi.mock('../components/Chatbot/ThreeJsChatbot', () => ({ ThreeJsChatbot: () => null }));

const renderHome = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <ChakraProvider theme={theme}>
        <MemoryRouter><HomePage /></MemoryRouter>
      </ChakraProvider>
    </I18nextProvider>
  );

describe('metrics section', () => {
  it('shows real project cards with hard stats, not the fake agency grid', async () => {
    renderHome();
    expect(await screen.findByText('Primero Trader')).toBeInTheDocument();
    expect(screen.getByText('Appen')).toBeInTheDocument();
    expect(screen.getByText(/87% precision/i)).toBeInTheDocument();
    expect(screen.getByText(/250K\+ contributors/i)).toBeInTheDocument();
    expect(screen.queryByText(/Web Design/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Project 1$/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/metricsSection.test.tsx`
Expected: FAIL — fake grid still renders "Web Design"/"Project 1"; no "Primero Trader".

- [ ] **Step 3: Replace the lead text + fake grid**

In `HomePage.tsx` `story-portfolio` section: delete the generic `Text` block (the one containing `Discover our latest projects and creative solutions`, ~lines 433-440). Replace the entire fake `SimpleGrid` (the `{[1,2,3,4,5,6].map(...)}` block, ~lines 444-551) with a real card grid:

```tsx
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                {(t('home.proof.projects', { returnObjects: true }) as Array<{ name: string; line: string; stats: string[] }>).map((proj) => (
                  <Card key={proj.name} variant="royal">
                    <CardBody>
                      <Heading as="h3" textStyle="cardTitle" color="brand.text" mb={1}>
                        {proj.name}
                      </Heading>
                      <Text color="brand.textSecondary" fontSize="sm" mb={4}>
                        {proj.line}
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        {proj.stats.map((s) => (
                          <HStack key={s} spacing={2} align="start">
                            <Box mt="7px" w="5px" h="5px" borderRadius="full" bg="brand.accent" flexShrink={0} />
                            <Text fontSize="sm" color="brand.text">{s}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
```

Ensure `Card`, `CardBody`, `HStack`, `Box`, `VStack` are imported in `HomePage.tsx` (add any missing to the `@chakra-ui/react` import). Keep the existing header `VStack` (Kicker subtitle + title) and the `View all` button below.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/metricsSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Full suite + tsc + commit**

Run: `cd frontend && npm test && npx tsc --noEmit` (expected: clean; route smoke test for `/projects` marker unaffected — that's ProjectsPage, not this grid)

```bash
git add frontend/src/pages/HomePage.tsx frontend/src/test/metricsSection.test.tsx
git commit -m "feat(home): real project metric cards replace the fake agency grid

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Hero credibility numbers strip

**Files:**
- Create: `frontend/src/pages/home/StatStrip.tsx`
- Modify: `frontend/src/pages/HomePage.tsx` (render `<StatStrip />` in the hero text `VStack`, after the CTA buttons block ~line 234)
- Test: `frontend/src/test/statStrip.test.tsx` (new)

**Interfaces:**
- Consumes: i18n `home.proof.heroStats`.
- Produces: `StatStrip: React.FC` (no props).

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/test/statStrip.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import theme from '../theme';
import { StatStrip } from '../pages/home/StatStrip';

describe('StatStrip', () => {
  it('renders all five credibility figures', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider theme={theme}><StatStrip /></ChakraProvider>
      </I18nextProvider>
    );
    for (const f of ['3+', '5', '100+', '250K+', '9.01']) {
      expect(screen.getByText(f)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd frontend && npx vitest run src/test/statStrip.test.tsx`
Expected: FAIL — cannot resolve `../pages/home/StatStrip`.

- [ ] **Step 3: Implement `StatStrip`**

```tsx
// frontend/src/pages/home/StatStrip.tsx
import React from 'react';
import { Wrap, WrapItem, Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const StatStrip: React.FC = () => {
  const { t } = useTranslation();
  const stats = t('home.proof.heroStats', { returnObjects: true }) as Array<{ figure: string; caption: string }>;
  return (
    <Wrap spacing={{ base: 6, md: 10 }} pt={4} role="list">
      {stats.map((s) => (
        <WrapItem key={s.caption} role="listitem">
          <Box>
            <Text fontFamily="heading" fontWeight={600} fontSize={{ base: '24px', md: '30px' }} color="brand.secondary" lineHeight={1}>
              {s.figure}
            </Text>
            <Text fontSize="11px" color="brand.textMuted" maxW="150px" mt={1}>
              {s.caption}
            </Text>
          </Box>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default StatStrip;
```

- [ ] **Step 4: Render it in the hero**

In `HomePage.tsx`, import `StatStrip` (`import { StatStrip } from './home/StatStrip';`) and add `<StatStrip />` as the last child of the hero text `VStack`, right after the CTA buttons `MotionBox` (≈ line 234, before the `VStack` closes). Wrap in a `MotionBox variants={staggerAnimation.child}` for entrance consistency if the surrounding children use it.

- [ ] **Step 5: Run test to verify it passes + suite + tsc + commit**

Run: `cd frontend && npx vitest run src/test/statStrip.test.tsx && npm test && npx tsc --noEmit`
Expected: PASS, clean. (Hero route marker `/earns its place/i` still present.)

```bash
git add frontend/src/pages/home/StatStrip.tsx frontend/src/pages/HomePage.tsx frontend/src/test/statStrip.test.tsx
git commit -m "feat(home): hero credibility numbers strip

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Model proof lines (story-chatbot)

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx` (story-chatbot section, after the `home.chatbot.description` `Text` ~line 350)
- Test: covered by route suite; add an assertion to `metricsSection.test.tsx` is not appropriate — instead a tiny inline check below.

**Interfaces:**
- Consumes: i18n `home.proof.modelLines`.

- [ ] **Step 1: Add the proof lines under the chatbot heading**

In `HomePage.tsx`, after the chatbot `description` `Text` (the `{t('home.chatbot.description')}` block ~line 350), add:

```tsx
                <VStack align={{ base: 'center', md: 'start' }} spacing={2} pt={2}>
                  {(t('home.proof.modelLines', { returnObjects: true }) as string[]).map((line) => (
                    <Text key={line} fontSize="sm" color="brand.textSecondary" textAlign={{ base: 'center', md: 'left' }}>
                      {line}
                    </Text>
                  ))}
                </VStack>
```

(Ensure `VStack`/`Text` are imported — they are.)

- [ ] **Step 2: Run suite + tsc**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS, clean (chatbot route marker unaffected).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "feat(home): real-systems proof lines on the model beat

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Crown beat — synthesis + domain badges + stack cloud

**Files:**
- Create: `frontend/src/pages/home/BadgeCloud.tsx`
- Modify: `frontend/src/pages/HomePage.tsx` (story-cta section, above the CTA button ~line 630-671)
- Test: `frontend/src/test/badgeCloud.test.tsx` (new)

**Interfaces:**
- Consumes: i18n `home.proof.domains`, `home.proof.synthesis`; `PROOF_STACK` (Task 1).
- Produces: `BadgeCloud: React.FC` rendering the synthesis line, domain `Tag` chips, and the muted stack cloud.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/test/badgeCloud.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import theme from '../theme';
import { BadgeCloud } from '../pages/home/BadgeCloud';

describe('BadgeCloud', () => {
  it('renders the synthesis line, a domain badge, and a stack token', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider theme={theme}><BadgeCloud /></ChakraProvider>
      </I18nextProvider>
    );
    expect(screen.getByText(/same systems brain/i)).toBeInTheDocument();
    expect(screen.getByText('Computer Vision')).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd frontend && npx vitest run src/test/badgeCloud.test.tsx`
Expected: FAIL — cannot resolve `../pages/home/BadgeCloud`.

- [ ] **Step 3: Implement `BadgeCloud`**

```tsx
// frontend/src/pages/home/BadgeCloud.tsx
import React from 'react';
import { VStack, Text, Wrap, WrapItem, Tag } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PROOF_STACK } from './proofStack';

export const BadgeCloud: React.FC = () => {
  const { t } = useTranslation();
  const domains = t('home.proof.domains', { returnObjects: true }) as string[];
  return (
    <VStack spacing={6} w="full" maxW="760px" mx="auto">
      <Text textStyle="cardTitle" color="brand.text" textAlign="center">
        {t('home.proof.synthesis')}
      </Text>
      <Wrap justify="center" spacing={3}>
        {domains.map((d) => (
          <WrapItem key={d}><Tag variant="gold">{d}</Tag></WrapItem>
        ))}
      </Wrap>
      <Wrap justify="center" spacing={2}>
        {PROOF_STACK.map((s) => (
          <WrapItem key={s}>
            <Text fontSize="11px" color="brand.textMuted" letterSpacing="0.02em">{s}</Text>
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
};

export default BadgeCloud;
```

- [ ] **Step 4: Render it in the CTA section**

In `HomePage.tsx` story-cta, add `import { BadgeCloud } from './home/BadgeCloud';` and render `<BadgeCloud />` above the CTA button (after the `home.cta.description` Text, before the button). Ensure `Tag` is imported where used (it's inside BadgeCloud, self-contained).

- [ ] **Step 5: Run test + suite + tsc + commit**

Run: `cd frontend && npx vitest run src/test/badgeCloud.test.tsx && npm test && npx tsc --noEmit`
Expected: PASS, clean (CTA route marker unaffected).

```bash
git add frontend/src/pages/home/BadgeCloud.tsx frontend/src/pages/HomePage.tsx frontend/src/test/badgeCloud.test.tsx
git commit -m "feat(home): crown beat — synthesis line, domain badges, stack cloud

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Manual verification (redeploy branch to dev.la-realeza.com)

Scroll Home on dev:
- Hero: the five credibility figures sit under the CTA, gold, readable.
- Model beat: two real-systems lines under the heading; chatbot demo intact.
- Metrics beat: four real project cards (Primero Trader / Appen / Clinical CV / Interaction AI) with hard stats — no "Branding/Web Design/Marketing/Project N" anywhere. `~60% cache hit` shows the `~`; Appen shows "(designed for)".
- Crown beat: synthesis line + domain badges + muted stack cloud above the CTA.
- Both languages render (toggle ES).

## Self-Review

**Spec coverage:** hero numbers strip → Task 3; model proof lines → Task 4; real metrics cards (kill fake grid) → Task 2; crown badges+stack+synthesis → Task 5; bilingual content + honesty markers + dead-key removal → Task 1. ✅

**Placeholder scan:** all i18n content (EN+ES) and component code are complete; no TBD. ✅

**Type consistency:** `home.proof.projects` shape `{name,line,stats[]}` consumed identically in Task 2; `heroStats` `{figure,caption}` in Task 3; `modelLines: string[]` in Task 4; `domains: string[]` + `PROOF_STACK` in Task 5. The `returnObjects` casts match the JSON authored in Task 1. ✅

**Honesty:** `~60% cache hit`, `P99 < 500ms (designed for)` present; the test asserts no `99.9%`; do-not-use items never introduced. ✅

**Sequencing note:** Task 1 removes the fake i18n keys but the fake grid that reads them is removed in Task 2 — do not deploy between Task 1 and Task 2 (the grid would render raw key strings). Deploy only after Task 2+.
