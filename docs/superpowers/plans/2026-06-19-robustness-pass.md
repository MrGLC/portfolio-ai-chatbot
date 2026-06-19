# Robustness Pass (Session 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio *feel* intentional and robust — failures become beautiful and explained, navigation stops flashing blank, motion honors reduced-motion, and the contact form stops lying about sending.

**Architecture:** Add a small set of code-enforced robustness primitives under `frontend/src/components/feedback/` and `frontend/src/theme/motion.ts`, then adopt them in `App.tsx`, the contact form, and the jewel. No visual restyle; reuse existing design tokens (`brand.*`, `textStyles`, `animations.ts`).

**Tech Stack:** React 18 + TypeScript, Vite, Chakra UI v2, framer-motion v11, react-router-dom v7, i18next, Vitest + Testing Library.

## Global Constraints

- Build directly in `frontend/` (NOT `frontend_iterations/`) — these are plumbing, not visual experiments.
- Reuse design tokens only — no new hardcoded hex/rgba unless copied from an existing token. Colors via `brand.*`; type via `textStyles`.
- Every user-facing string is added to BOTH `frontend/src/i18n/locales/en/translation.json` and `frontend/src/i18n/locales/es/translation.json`.
- Contact recipient email is exactly `ingbmluisgomez@gmail.com`.
- Run tests from the `frontend/` directory: `npm test` (Vitest, `vitest run`).
- Commit after every task. Conventional Commits. End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Do not touch deferred (session 2) scope: `<Section>` primitive, spacing/width token unification, removing legacy `royal`/`yellow`/rainbow-gradient, font-metric CLS.

---

### Task 1: Motion policy module (`theme/motion.ts`)

One source of truth for motion that auto-neutralizes under `prefers-reduced-motion`. Builds on the existing variants in `theme/animations.ts`.

**Files:**
- Create: `frontend/src/theme/motion.ts`
- Test: `frontend/src/test/motion.test.ts`

**Interfaces:**
- Consumes: `variants` from `frontend/src/theme/animations.ts`.
- Produces:
  - `type MotionVariant = { initial?: Record<string, unknown>; animate?: Record<string, unknown>; exit?: Record<string, unknown>; transition?: Record<string, unknown> }`
  - `neutralizeVariant(v: MotionVariant): MotionVariant` — collapses to an instant opacity-only cut.
  - `resolveVariant(v: MotionVariant, reduced: boolean): MotionVariant`
  - `useMotion(): { reduced: boolean; variant: (name: keyof typeof variants) => MotionVariant }`

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/test/motion.test.ts
import { describe, it, expect } from 'vitest';
import { neutralizeVariant, resolveVariant } from '../theme/motion';

const sample = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

describe('motion policy', () => {
  it('neutralizeVariant strips transforms and zeroes duration', () => {
    const n = neutralizeVariant(sample);
    expect(n.initial).toEqual({ opacity: 1 });
    expect(n.animate).toEqual({ opacity: 1 });
    expect(n.transition).toEqual({ duration: 0 });
  });

  it('resolveVariant returns the original when not reduced', () => {
    expect(resolveVariant(sample, false)).toBe(sample);
  });

  it('resolveVariant neutralizes when reduced', () => {
    expect(resolveVariant(sample, true).transition).toEqual({ duration: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/motion.test.ts`
Expected: FAIL — `Failed to resolve import '../theme/motion'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// frontend/src/theme/motion.ts
import { useReducedMotion } from 'framer-motion';
import { variants } from './animations';

export type MotionVariant = {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
};

// Collapse any entrance/exit to an instant, transform-free cut so motion-sensitive
// users get no movement — only the final composed layout.
export function neutralizeVariant(_v: MotionVariant): MotionVariant {
  return {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: { duration: 0 },
  };
}

export function resolveVariant(v: MotionVariant, reduced: boolean): MotionVariant {
  return reduced ? neutralizeVariant(v) : v;
}

// Hook for components: returns the reduced flag + a getter that yields a named
// base variant already resolved for the current motion preference.
export function useMotion() {
  const reduced = !!useReducedMotion();
  return {
    reduced,
    variant: (name: keyof typeof variants) =>
      resolveVariant(variants[name] as MotionVariant, reduced),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/motion.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/theme/motion.ts frontend/src/test/motion.test.ts
git commit -m "feat(motion): reduced-motion-aware motion policy module

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `ErrorState` — the beautiful explained failure

A couture-styled failure surface reused by the error boundary (and future data/404 states). Token-only styling.

**Files:**
- Create: `frontend/src/components/feedback/ErrorState.tsx`
- Test: `frontend/src/test/errorState.test.tsx`

**Interfaces:**
- Produces:
  - `interface ErrorStateProps { title?: string; message?: string; detail?: string; onRetry?: () => void; homeHref?: string }`
  - `ErrorState: React.FC<ErrorStateProps>`

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/test/errorState.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import theme from '../theme';
import { ErrorState } from '../components/feedback/ErrorState';

const renderWith = (ui: React.ReactElement) =>
  render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );

describe('ErrorState', () => {
  it('renders default copy', () => {
    renderWith(<ErrorState />);
    expect(screen.getByText(/something broke/i)).toBeInTheDocument();
  });

  it('renders custom message and fires retry', () => {
    const onRetry = vi.fn();
    renderWith(<ErrorState message="The projects feed is unreachable." onRetry={onRetry} />);
    expect(screen.getByText(/projects feed is unreachable/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/errorState.test.tsx`
Expected: FAIL — cannot resolve `../components/feedback/ErrorState`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// frontend/src/components/feedback/ErrorState.tsx
import React from 'react';
import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  detail?: string;            // optional, de-emphasized technical detail (dev only)
  onRetry?: () => void;
  homeHref?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something broke',
  message = 'An unexpected error interrupted this page — not your fault. You can try again or head back.',
  detail,
  onRetry,
  homeHref,
}) => (
  <Box
    as="section"
    minH="60vh"
    display="flex"
    alignItems="center"
    bg="brand.cream"
    py={{ base: 16, md: 24 }}
  >
    <Container maxW="1180px">
      <VStack spacing={5} align="center" textAlign="center">
        <Text textStyle="eyebrow">Error</Text>
        <Heading textStyle="sectionTitle" color="brand.text">{title}</Heading>
        <Text textStyle="lead" color="brand.textSecondary" maxW="46ch">{message}</Text>
        {detail && (
          <Text
            as="pre"
            fontSize="xs"
            color="brand.textMuted"
            whiteSpace="pre-wrap"
            maxW="46ch"
            overflowX="auto"
          >
            {detail}
          </Text>
        )}
        {(onRetry || homeHref) && (
          <VStack spacing={3} pt={2}>
            {onRetry && (
              <Button variant="primary" onClick={onRetry}>
                Try again
              </Button>
            )}
            {homeHref && (
              <Button as={RouterLink} to={homeHref} variant="outline">
                Back home
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  </Box>
);

export default ErrorState;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/errorState.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/feedback/ErrorState.tsx frontend/src/test/errorState.test.tsx
git commit -m "feat(feedback): ErrorState — couture explained-failure surface

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `ErrorBoundary` — catch crashes, render `ErrorState`

**Files:**
- Create: `frontend/src/components/feedback/ErrorBoundary.tsx`
- Test: `frontend/src/test/errorBoundary.test.tsx`

**Interfaces:**
- Consumes: `ErrorState` from Task 2.
- Produces:
  - `interface ErrorBoundaryProps { children: React.ReactNode; homeHref?: string; fallbackTitle?: string; fallbackMessage?: string }`
  - `class ErrorBoundary extends React.Component<ErrorBoundaryProps, { error: Error | null }>` with `handleRetry`.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/test/errorBoundary.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import theme from '../theme';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

// Module-level switch so retry can recover on the second render.
let shouldThrow = true;
const Bomb: React.FC = () => {
  if (shouldThrow) throw new Error('boom');
  return <div>recovered</div>;
};

const renderWith = (ui: React.ReactElement) =>
  render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );

describe('ErrorBoundary', () => {
  it('renders ErrorState when a child throws, and retry recovers', () => {
    shouldThrow = true;
    renderWith(
      <ErrorBoundary homeHref="/">
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something broke/i)).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByText(/recovered/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/errorBoundary.test.tsx`
Expected: FAIL — cannot resolve `../components/feedback/ErrorBoundary`.
(Note: React logs the caught error to stderr during this test — that is expected, the test still asserts recovery.)

- [ ] **Step 3: Write minimal implementation**

```tsx
// frontend/src/components/feedback/ErrorBoundary.tsx
import React from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  homeHref?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
}
interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface for the developer; the visitor never sees a raw stack.
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title={this.props.fallbackTitle}
          message={this.props.fallbackMessage}
          detail={import.meta.env.DEV ? this.state.error.message : undefined}
          onRetry={this.handleRetry}
          homeHref={this.props.homeHref}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/errorBoundary.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/feedback/ErrorBoundary.tsx frontend/src/test/errorBoundary.test.tsx
git commit -m "feat(feedback): ErrorBoundary catches render crashes into ErrorState

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `RouteFallback` + wire boundaries and fallback into `App.tsx`

Replaces `Suspense fallback={null}` (blank flash) and wraps the app + each route in `ErrorBoundary`.

**Files:**
- Create: `frontend/src/components/feedback/RouteFallback.tsx`
- Modify: `frontend/src/App.tsx`
- Test: existing `frontend/src/test/routes.test.tsx` must still pass (no new test file).

**Interfaces:**
- Consumes: `ErrorBoundary` (Task 3).
- Produces: `RouteFallback: React.FC` (a branded, reduced-motion-aware loading skin).

- [ ] **Step 1: Create the fallback component**

```tsx
// frontend/src/components/feedback/RouteFallback.tsx
import React from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { useReducedMotion } from 'framer-motion';

// Quiet branded loading skin sized to the viewport so lazy-route navigation
// never flashes blank. Honors reduced-motion (static dot instead of spinner).
export const RouteFallback: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="brand.cream"
      aria-busy="true"
      aria-live="polite"
    >
      {reduced ? (
        <Box w={2.5} h={2.5} borderRadius="full" bg="brand.secondary" />
      ) : (
        <Spinner
          thickness="2px"
          speed="0.7s"
          size="lg"
          color="brand.secondary"
          emptyColor="rgba(24,20,40,.08)"
        />
      )}
    </Box>
  );
};

export default RouteFallback;
```

- [ ] **Step 2: Wire into `App.tsx`**

Replace the current `App.tsx` body. Add imports and use `RouteFallback` as the Suspense fallback; wrap the whole tree and each route element in `ErrorBoundary`.

```tsx
// frontend/src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import './i18n/config';

import theme from './theme';
import { Layout } from './components/Layout';
import { ScrollRestoration } from './components/Layout/ScrollRestoration';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { RouteFallback } from './components/feedback/RouteFallback';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ConsultingPage = lazy(() => import('./pages/ConsultingPage').then((m) => ({ default: m.ConsultingPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Wrap a lazy page in a per-route boundary so a crash on one page renders the
// explained ErrorState in place instead of blanking the whole shell.
const route = (element: React.ReactNode) => (
  <ErrorBoundary homeHref="/">{element}</ErrorBoundary>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <ErrorBoundary homeHref="/">
          <Router>
            <ScrollRestoration />
            <Layout>
              <Suspense fallback={<RouteFallback />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={route(<HomePage />)} />
                    <Route path="/about" element={route(<AboutPage />)} />
                    <Route path="/projects" element={route(<ProjectsPage />)} />
                    <Route path="/consulting" element={route(<ConsultingPage />)} />
                    <Route path="/contact" element={route(<ContactPage />)} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </Layout>
          </Router>
        </ErrorBoundary>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
```

- [ ] **Step 3: Run the route smoke tests + full suite**

Run: `cd frontend && npm test`
Expected: PASS — all five route smoke tests still render their markers; Tasks 1–3 tests green.

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/feedback/RouteFallback.tsx frontend/src/App.tsx
git commit -m "feat(app): branded route fallback + app/per-route error boundaries

Kills the blank navigation flash (fallback was null) and ensures a render
crash shows the explained ErrorState instead of a white screen.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Honest contact form (mailto handoff)

Stop the fake "✓ sent". On valid submit, hand off to the visitor's mail client and show honest copy plus an always-visible direct-email fallback.

**Files:**
- Create: `frontend/src/lib/buildMailto.ts`
- Create: `frontend/src/test/buildMailto.test.ts`
- Modify: `frontend/src/pages/ContactPage.tsx` (imports; `handleSubmit` at lines 158–169; the post-submit success `VStack` around lines 312–329)
- Modify: `frontend/src/i18n/locales/en/translation.json` (`contact.form`)
- Modify: `frontend/src/i18n/locales/es/translation.json` (`contact.form`)

**Interfaces:**
- Produces:
  - `interface ContactFormData { name: string; email: string; company?: string; service?: string; budget?: string; timeline?: string; message: string }`
  - `buildMailto(data: ContactFormData): string` → `mailto:ingbmluisgomez@gmail.com?subject=...&body=...`

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/test/buildMailto.test.ts
import { describe, it, expect } from 'vitest';
import { buildMailto } from '../lib/buildMailto';

describe('buildMailto', () => {
  it('targets the correct recipient', () => {
    const url = buildMailto({ name: 'Ana', email: 'a@b.com', message: 'Hola' });
    expect(url.startsWith('mailto:ingbmluisgomez@gmail.com?')).toBe(true);
  });

  it('encodes name into the subject and message into the body', () => {
    const url = buildMailto({ name: 'Ana Díaz', email: 'a@b.com', message: 'Necesito ML' });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('Ana Díaz');
    expect(decoded).toContain('Necesito ML');
    expect(decoded).toContain('a@b.com');
  });

  it('omits optional fields that are empty', () => {
    const url = buildMailto({ name: 'Ana', email: 'a@b.com', message: 'Hi', company: '' });
    expect(decodeURIComponent(url)).not.toContain('Company:');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/test/buildMailto.test.ts`
Expected: FAIL — cannot resolve `../lib/buildMailto`.

- [ ] **Step 3: Implement `buildMailto`**

```ts
// frontend/src/lib/buildMailto.ts
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

const RECIPIENT = 'ingbmluisgomez@gmail.com';

// Build a mailto: URL that pre-fills the visitor's mail client with their
// enquiry. Optional fields are only included when non-empty.
export function buildMailto(data: ContactFormData): string {
  const subject = `Portfolio enquiry — ${data.name}`;
  const lines: string[] = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : '',
    data.service ? `Service: ${data.service}` : '',
    data.budget ? `Budget: ${data.budget}` : '',
    data.timeline ? `Timeline: ${data.timeline}` : '',
    '',
    data.message,
  ].filter((line, i) => line !== '' || i === 6); // keep the single blank separator
  const body = lines.join('\n');
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/test/buildMailto.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Add honest i18n copy (EN)**

In `frontend/src/i18n/locales/en/translation.json`, inside `contact.form`, add these keys (alongside the existing `success`/`successSubtext`):

```json
"opening": "Opening your email app…",
"openingSubtext": "Your message is ready to send in your mail client. If nothing opened, email me directly:",
"directEmail": "ingbmluisgomez@gmail.com"
```

- [ ] **Step 6: Add honest i18n copy (ES)**

In `frontend/src/i18n/locales/es/translation.json`, inside `contact.form`, add:

```json
"opening": "Abriendo tu app de correo…",
"openingSubtext": "Tu mensaje está listo para enviarse en tu cliente de correo. Si no se abrió nada, escríbeme directamente:",
"directEmail": "ingbmluisgomez@gmail.com"
```

- [ ] **Step 7: Wire `handleSubmit` in `ContactPage.tsx`**

Add the import near the other imports (after line 28):

```tsx
import { buildMailto } from '../lib/buildMailto';
```

Replace the body of `handleSubmit` (currently lines 158–169) — keep validation, swap the fake success for a real handoff:

```tsx
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!formData.name.trim()) nextErrors.name = t('contact.form.errors.name');
    if (!EMAIL_REGEX.test(formData.email)) nextErrors.email = t('contact.form.errors.email');
    if (!formData.message.trim()) nextErrors.message = t('contact.form.errors.message');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    // Hand off to the visitor's mail client. We cannot confirm delivery, so the
    // post-submit state says "opening your email app", never "sent".
    window.location.href = buildMailto(formData);
    setSent(true);
  };
```

- [ ] **Step 8: Make the post-submit panel honest**

In the post-submit success `VStack` (around lines 312–329), replace the heading/subtext copy and append a direct-email fallback link. Find:

```tsx
                  <Heading fontFamily="heading" fontWeight={600} fontSize="26px" color="brand.creamText">
                    {t('contact.form.success')}
                  </Heading>
                  <Text color="rgba(243,233,216,.7)" fontSize="sm">
                    {t('contact.form.successSubtext')}
                  </Text>
```

Replace with:

```tsx
                  <Heading fontFamily="heading" fontWeight={600} fontSize="26px" color="brand.creamText">
                    {t('contact.form.opening')}
                  </Heading>
                  <Text color="rgba(243,233,216,.7)" fontSize="sm">
                    {t('contact.form.openingSubtext')}
                  </Text>
                  <Link
                    href={`mailto:${t('contact.form.directEmail')}`}
                    color="brand.accent"
                    fontSize="sm"
                    fontWeight={600}
                  >
                    {t('contact.form.directEmail')}
                  </Link>
```

(`Link` is already imported in `ContactPage.tsx`.)

- [ ] **Step 9: Run the full suite + typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS — `buildMailto` tests green, route smoke tests still green, no TS errors.

- [ ] **Step 10: Manual verification (navigation can't be asserted in jsdom)**

Run the dev server: `cd frontend && npm run dev`. Open `/contact`, submit with name+valid email+message empty → field error blocks. Fill all required → the mail client opens with a pre-filled draft to `ingbmluisgomez@gmail.com`, and the panel shows "Opening your email app…" with the clickable direct email. Confirm there is no "sent successfully" text anywhere.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/lib/buildMailto.ts frontend/src/test/buildMailto.test.ts \
        frontend/src/pages/ContactPage.tsx \
        frontend/src/i18n/locales/en/translation.json \
        frontend/src/i18n/locales/es/translation.json
git commit -m "feat(contact): honest mailto handoff instead of fake success

Form no longer claims 'sent' when nothing was sent — submits open the
visitor's mail client (buildMailto) and the panel shows an honest
'opening your email app' state with a direct-email fallback.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Jewel graceful mount (de-chonk the pop-in)

The jewel canvas is a fixed/absolute overlay (no reflow), but it hard-pops when WebGL finishes initializing. Fade it in on first frame so its appearance feels intentional. Visual-verify (not unit-tested — the Canvas is mocked to `null` in jsdom).

**Files:**
- Modify: `frontend/src/components/JewelScene/index.tsx` (the canvas wrapper `Box` at lines 131–141 and the `Canvas` at lines 143–148)

**Interfaces:**
- Consumes: nothing new. Adds local `ready` state in `JewelScene`.

- [ ] **Step 1: Add ready state + fade**

Near the other `useState` calls in `JewelScene` (after line 65), add:

```tsx
  // Fade the canvas in once WebGL has composed its first frame, so the jewel
  // appears intentionally instead of hard-popping into the hero.
  const [ready, setReady] = useState(false);
```

On the wrapper `Box` (lines 131–141), add opacity + transition props (keep all existing props):

```tsx
      <Box
        position={fixed ? 'fixed' : 'absolute'}
        top={0}
        left={0}
        right={0}
        bottom={fixed ? 0 : undefined}
        height={fixed ? undefined : '100vh'}
        zIndex={5}
        pointerEvents="none"
        aria-hidden="true"
        opacity={ready ? 1 : 0}
        transition="opacity 0.6s ease"
      >
```

On the `Canvas` (lines 143–148), add the `onCreated` handler (keep all existing props):

```tsx
          <Canvas
            dpr={profile.dpr}
            frameloop={profile.animate ? 'always' : 'never'}
            gl={{ antialias: profile.tier === 'full', alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
            onCreated={() => setReady(true)}
          >
```

- [ ] **Step 2: Run the suite (regression guard)**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: PASS — JewelScene is stubbed in route tests, so all stay green; no TS errors.

- [ ] **Step 3: Manual verification**

`cd frontend && npm run dev`, open `/`. The jewel should fade in smoothly (~0.6s) rather than snapping. With OS "reduce motion" on, the opacity fade is acceptable (no transform); confirm no layout shift of hero text when it appears.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/JewelScene/index.tsx
git commit -m "feat(jewel): fade canvas in on first frame to remove hard pop-in

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Adopt the motion policy (follow-on, same session if time permits)

Task 1 ships `useMotion()` but adoption across pages is incremental. The highest-impact swap is the Home hero/entrance and any scroll-reveal blocks currently hand-rolling framer-motion `initial/animate/transition`. Replacing those with `useMotion().variant(...)` is what makes "scroll & motion" stop feeling overwrought for reduced-motion users. This is mechanical and low-risk; do it page-by-page with the route smoke tests as the guard. Full adoption may roll into session 2.

## Self-Review

**Spec coverage:**
- No app ErrorBoundary → Tasks 2–4. ✅
- Blank nav flash (`fallback={null}`) → Task 4 `RouteFallback`. ✅
- Lying contact form → Task 5 mailto + honest copy. ✅
- Chonky motion / reduced-motion ignored → Task 1 `motion.ts` + adoption note. ✅
- Jewel pop-in → Task 6 fade-in. ✅
- Beautiful explained failure → Task 2 `ErrorState`. ✅
- Deferred items (Section primitive, token unification, legacy `royal`/`yellow`, font-metric CLS) → explicitly excluded in Global Constraints. ✅

**Placeholder scan:** no TBD/TODO; every code step shows complete code. ✅

**Type consistency:** `MotionVariant`, `ErrorStateProps`, `ErrorBoundaryProps`, `ContactFormData`/`buildMailto` names are consistent across tasks and the `App.tsx` `route()` helper consumes `ErrorBoundary` as defined in Task 3. ✅

**Note on font CLS:** the discovery that headings reflow on Bodoni Moda swap-in (`display=swap`) is real but a robust fix (font-metric override / preload strategy) is session-2 sized; it is intentionally deferred, not silently dropped.
