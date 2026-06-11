# Phase 1: Tech Foundation (Vite Migration + Modernization + Deploy) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the portfolio frontend from create-react-app to Vite, upgrade all dependencies to current stable/secure versions, prune dead Three.js code, add production Docker builds, and deploy to la-realeza.com via Coolify.

**Architecture:** Frontend becomes a static Vite build served by nginx (≥1.30.1, mandatory — CVE-2026-42945) which also proxies `/api` to the FastAPI backend container. Backend + Redis unchanged functionally, but get production Dockerfiles. One `docker-compose.prod.yml` deployed by Coolify with the apex domain bound to the frontend service.

**Tech Stack (researched 2026-06-10, all mutually compatible):** Vite 7.3.5 + @vitejs/plugin-react 5.2.0, React 18.3.1 (NOT 19 — Chakra v2 + fiber 8 constraint), TypeScript 5.9.3, Chakra UI 2.10.10, react-router-dom 7.17.0 (library mode), @tanstack/react-query 5.101.0, framer-motion 11.18.2 (NOT the renamed `motion` pkg — Chakra v2 peer dep), three 0.184.0 + fiber 8.18.0 + drei 9.122.0, i18next 26.3.1 + react-i18next 17.0.8, Vitest 3.x, node:24-alpine, nginx:1.30.1-alpine, python:3.13-slim, FastAPI 0.136.3 + uvicorn 0.49.0, uv for Python deps.

**Version constraints discovered in research — do not "helpfully" bump past these:**
- fiber 9 / drei 10 require React 19 → stay on fiber 8.18.0 / drei 9.122.0 with React 18.
- React 19 + Chakra v2 has known popover/ref bugs → stay on React 18.3.1.
- @vitejs/plugin-react 6.x requires Vite 8 → use 5.2.0 with Vite 7.
- nginx MUST be ≥ 1.30.1 (CVE-2026-42945 heap overflow in rewrite module, critical, May 2026).
- If a drei helper breaks with three 0.184, pin three to ~0.175 instead (drei 9.x is maintenance-mode).

**Repo facts (verified):**
- Frontend: `frontend/`, CRA (`react-scripts 5.0.1`), entry `frontend/src/index.tsx`, HTML at `frontend/public/index.html` (only file in public/).
- `process.env.REACT_APP_*` used ONLY in `frontend/src/services/api.js` (3 occurrences, lines 3, 4, 45).
- i18n: `frontend/src/i18n/config.ts` bundles `./locales/{en,es}/translation.json` inline as `resources` but ALSO registers `i18next-http-backend` (unused — no `/public/locales`). Zero plural keys in translation files.
- Three.js backgrounds in `frontend/src/components/ThreeBackground/`: `Layout/index.tsx:6` imports 6 but renders ONLY `RedJewelBackground`; `pages/HomePage.tsx:33` imports + uses `AnimatedBackground`, `LightPattern`. Dead: `EnhancedAnimatedBackground`, `RoyalAnimatedBackground`, `ModernAnimatedBackground`, `ModernAnimatedBackgroundV2`.
- No test files exist anywhere.
- `frontend/Dockerfile` and `backend/Dockerfile` are dev-mode (npm start / uvicorn --reload).
- Backend deps: `backend/requirements.txt` (no pyproject). User mandate: uv everywhere.
- Chatbot UI calls `chatbotApi` (localhost:5002 — service does not exist); backend exposes `POST /api/chatbot/demo`.

---

### Task 1: Branch + Vite scaffolding

**Files:**
- Create: `frontend/vite.config.ts`, `frontend/index.html`, `frontend/src/vite-env.d.ts`
- Modify: `frontend/package.json`, `frontend/tsconfig.json`
- Delete: `frontend/public/index.html` (public/ becomes empty; keep dir for future favicon)

- [ ] **Step 1: Create branch**

```bash
cd /home/luisgg/projects/personal/portfolio-ai-chatbot
git checkout -b phase1-vite-modernization
```

- [ ] **Step 2: Swap CRA for Vite in package.json**

```bash
cd frontend
npm uninstall react-scripts @testing-library/jest-dom @testing-library/react @testing-library/user-event web-vitals
npm install -D vite@7.3.5 @vitejs/plugin-react@5.2.0
```

Then in `frontend/package.json` replace the `scripts` block and remove the `eslintConfig` block (CRA-only):

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

(`browserslist` block: delete it too — Vite uses esbuild targets.)

- [ ] **Step 3: Create `frontend/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

- [ ] **Step 4: Move index.html to frontend root, Vite format**

Create `frontend/index.html` (note: no `%PUBLIC_URL%`, script tag added):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#DC143C" />
    <meta
      name="description"
      content="Royal Portfolio - Luxury AI Solutions & Consulting"
    />
    <title>Royal Portfolio - Modern Luxury Enhanced</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

Then: `git rm frontend/public/index.html`

- [ ] **Step 5: Create `frontend/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CHATBOT_API_URL?: string;
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 6: Update `frontend/tsconfig.json`**

Replace contents with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Migrate env vars in `frontend/src/services/api.js`**

Three replacements:

```js
// line 3-4:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5002';
```

```js
// line 45 (inside createWebSocketConnection):
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5002';
```

- [ ] **Step 8: Verify dev server boots and prod build succeeds**

```bash
cd frontend && npm install
npx vite build 2>&1 | tail -20   # expect: "✓ built in Xs", dist/ created
```

If TS errors block the build (`tsc --noEmit` step), fix them — likely candidates: implicit-any in .js files is fine (allowJs), but old `@types/*` may complain; that's handled in Task 3, so for THIS gate run `npx vite build` directly (skips tsc) and accept; full `npm run build` must pass by end of Task 3.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: migrate frontend from create-react-app to Vite 7"
```

### Task 2: Vitest + route smoke tests

**Files:**
- Create: `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `frontend/src/test/routes.test.tsx`
- Modify: `frontend/package.json` (devDeps)

- [ ] **Step 1: Install test deps**

```bash
cd frontend
npm install -D vitest@^3 @testing-library/react@^16 @testing-library/jest-dom@^6 jsdom
```

- [ ] **Step 2: Create `frontend/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

- [ ] **Step 3: Create `frontend/src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// three.js needs WebGL; jsdom has none — stub the canvas context
HTMLCanvasElement.prototype.getContext = vi.fn() as never;

// jsdom lacks matchMedia (Chakra color-mode uses it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom lacks IntersectionObserver/ResizeObserver (framer-motion, Chakra)
class MockObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as never as Record<string, unknown>).IntersectionObserver = MockObserver;
(globalThis as never as Record<string, unknown>).ResizeObserver = MockObserver;
```

- [ ] **Step 4: Write failing smoke test `frontend/src/test/routes.test.tsx`**

NOTE: read `frontend/src/App.tsx` first — if the router is created inside `App`, render `<App />` at a given URL via `window.history.pushState`. The test below assumes `App` includes the router (CRA default). Adjust import if `App.tsx` differs, but keep the five route assertions. Three.js scenes are stubbed (canvas mock) — we assert navigation/text chrome, not 3D.

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// r3f Canvas can't run in jsdom even with a 2d-context stub — replace with a no-op
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return { ...actual, Canvas: () => null };
});

const routes: Array<[path: string, marker: RegExp]> = [
  ['/', /./],
  ['/about', /./],
  ['/projects', /./],
  ['/consulting', /./],
  ['/contact', /./],
];

describe('route smoke tests', () => {
  it.each(routes)('renders %s without crashing', async (path) => {
    window.history.pushState({}, '', path);
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#root, nav, main, [role="navigation"], a')).toBeTruthy());
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0); // nav rendered
  });
});
```

After reading the real pages, replace the `/./` markers with one stable visible string per page from `frontend/src/i18n/locales/en/translation.json` (e.g. nav labels) and assert `screen.getByText(marker)` — a smoke test that can't fail on a blank page is worthless. The assertion on links is the minimum bar; page-specific markers are the real check.

- [ ] **Step 5: Run tests — expect failures or passes, fix until green**

```bash
npx vitest run
```

Expected: 5 tests. If a page throws (missing provider, router mismatch), the test caught a real migration bug — fix the bug, not the test.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add Vitest route smoke tests"
```

### Task 3: Dependency upgrades — TypeScript, React patch, core libs

**Files:**
- Modify: `frontend/package.json`, `frontend/package-lock.json`

- [ ] **Step 1: Upgrade TS + React + types**

```bash
cd frontend
npm install react@18.3.1 react-dom@18.3.1
npm install -D typescript@5.9.3 @types/react@^18 @types/react-dom@^18 @types/node@^24
```

- [ ] **Step 2: Upgrade Chakra + motion + query + utils**

```bash
npm install @chakra-ui/react@2.10.10 @chakra-ui/icons@^2.2 framer-motion@11.18.2 @tanstack/react-query@5.101.0 axios@^1 react-icons@^5 recharts@^2
```

- [ ] **Step 3: Full type-check + build + tests**

```bash
npx tsc --noEmit        # expect: clean (fix any TS5/types fallout: likely ReactNode strictness, defaultProps warnings)
npm run build           # expect: "✓ built"
npx vitest run          # expect: 5 passing
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "build: upgrade TypeScript 5.9, React 18.3.1, Chakra 2.10, framer-motion 11, react-query 5.101"
```

### Task 4: react-router-dom 6 → 7 (library mode)

**Files:**
- Modify: `frontend/package.json`, any file importing `react-router-dom`

- [ ] **Step 1: Find all router imports**

```bash
grep -rln "react-router-dom" frontend/src/
```

- [ ] **Step 2: Upgrade**

```bash
cd frontend && npm install react-router-dom@7.17.0
```

v7 in library mode keeps the same API (`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useNavigate`). Imports from `react-router-dom` still work (it re-exports `react-router`). No code change expected; if TS flags a removed API (e.g. `json()`/`defer()` helpers — unlikely here), check the v7 upgrade guide.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run build && npx vitest run
```

Expected: all green. Also `npm run dev`, click through all 5 nav links manually if executing interactively.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "build: upgrade react-router-dom to v7 (library mode)"
```

### Task 5: i18next 23 → 26 + drop dead http-backend

**Files:**
- Modify: `frontend/package.json`, `frontend/src/i18n/config.ts`

- [ ] **Step 1: Upgrade pair, remove unused backend plugin**

```bash
cd frontend
npm uninstall i18next-http-backend
npm install i18next@26.3.1 react-i18next@17.0.8 i18next-browser-languagedetector@^8
```

- [ ] **Step 2: Update `frontend/src/i18n/config.ts`** — remove Backend import/use (resources are bundled inline; the http-backend was registered but never used since no `/public/locales` exists):

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

Note: also drop the hardcoded `lng: 'en'` line (it defeated the LanguageDetector — with it set, detection never ran; Spanish visitors got English).

(No plural-key migration needed — translation files contain zero `_plural`/`_one`/`_other` keys, verified.)

- [ ] **Step 3: Verify build + manual language switch**

```bash
npx tsc --noEmit && npm run build && npx vitest run
```

Then `npm run dev` → toggle LanguageSwitcher → text flips EN/ES, persists on reload (localStorage).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "build: upgrade i18next to v26, remove unused http-backend, enable real language detection"
```

### Task 6: three.js upgrade + prune dead backgrounds + lazy-load

**Files:**
- Modify: `frontend/package.json`, `frontend/src/components/Layout/index.tsx`, `frontend/src/pages/HomePage.tsx`, `frontend/src/components/ThreeBackground/index.ts` (or wherever the barrel export lives)
- Delete: the 4 dead background component files in `frontend/src/components/ThreeBackground/` (exact filenames: check the barrel — components `EnhancedAnimatedBackground`, `RoyalAnimatedBackground`, `ModernAnimatedBackground`, `ModernAnimatedBackgroundV2`)

- [ ] **Step 1: Upgrade three stack**

```bash
cd frontend
npm install three@0.184.0 @react-three/fiber@8.18.0 @react-three/drei@9.122.0
npm install -D @types/three@0.184.0
```

If drei components in the surviving backgrounds (`Float`, `OrbitControls`, `MeshTransmissionMaterial`, `Environment`) throw at runtime with three 0.184: `npm install three@~0.175.0 @types/three@~0.175.0` and note it in the commit message.

- [ ] **Step 2: Delete the 4 dead background components + their barrel exports**

Keep: `RedJewelBackground` (Layout), `AnimatedBackground` + `LightPattern` (HomePage). Delete the other 4 component files and remove their export lines from the ThreeBackground barrel.

- [ ] **Step 3: Fix `frontend/src/components/Layout/index.tsx:6`** — it imports 6 backgrounds, uses 1:

```tsx
import { RedJewelBackground } from '../ThreeBackground';
```

- [ ] **Step 4: Lazy-load backgrounds**

In `frontend/src/components/Layout/index.tsx`:

```tsx
import React, { Suspense, lazy } from 'react';

const RedJewelBackground = lazy(() =>
  import('../ThreeBackground/RedJewelBackground').then((m) => ({ default: m.RedJewelBackground }))
);
```

(adjust the import path to the real filename found in Step 2)

and wrap the usage:

```tsx
<Suspense fallback={null}>
  <RedJewelBackground intensity={1} />
</Suspense>
```

Same pattern in `frontend/src/pages/HomePage.tsx` for `AnimatedBackground` and `LightPattern`. `fallback={null}` is correct — backgrounds are decorative; the cream page bg shows until the chunk lands.

- [ ] **Step 5: Verify three.js chunks split out**

```bash
npm run build 2>&1 | grep -E "dist/assets.*(three|Background|chunk)" 
```

Expected: separate chunk(s) containing three.js, NOT in the entry bundle. Entry JS should drop dramatically (three is ~600KB min). Record entry bundle size before/after in the commit message.

- [ ] **Step 6: Visual check + tests**

`npm run dev` → Home shows jewel background + animated hero bg after a beat; other pages show jewel bg. `npx vitest run` green (Canvas is mocked, lazy import resolves under Suspense — if tests hang, add `await waitFor` already present).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "perf: upgrade three stack, delete 4 unused backgrounds, lazy-load 3D chunks"
```

### Task 7: Route-level code splitting

**Files:**
- Modify: `frontend/src/App.tsx` (or wherever `<Routes>` lives — find with `grep -rn "<Routes" frontend/src/`)

- [ ] **Step 1: Convert page imports to React.lazy**

```tsx
import React, { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ConsultingPage = lazy(() => import('./pages/ConsultingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
```

If pages use named exports (`export const HomePage`), use the `.then((m) => ({ default: m.HomePage }))` form shown in Task 6 Step 4.

Wrap the `<Routes>` block:

```tsx
<Suspense fallback={null}>
  <Routes>
    {/* existing Route elements unchanged */}
  </Routes>
</Suspense>
```

- [ ] **Step 2: Verify per-page chunks**

```bash
npm run build 2>&1 | tail -25
```

Expected: one chunk per page in output. `npx vitest run` still green.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "perf: route-level code splitting for all 5 pages"
```

### Task 8: Chatbot demo wired to existing backend endpoint

(Phase 1 gate requires "chatbot demo responds"; UI currently posts to a nonexistent localhost:5002 service. Minimal seam fix now; the full demo UX redesign is Phase 2.)

**Files:**
- Modify: `frontend/src/services/api.js`
- Read first: the component using `chatbotAPI.sendMessage` (find with `grep -rn "chatbotAPI" frontend/src/`)

- [ ] **Step 1: Point sendMessage at the backend demo endpoint when no chatbot service is configured**

In `frontend/src/services/api.js`, replace the `sendMessage` entry:

```js
sendMessage: (message, userId = 'user123', sessionId = null, options = {}) => {
  // Real chatbot service not deployed yet — fall back to the backend demo endpoint.
  // Phase 2 swaps this for the configurable provider seam.
  if (!import.meta.env.VITE_CHATBOT_API_URL) {
    return api.post('/api/chatbot/demo', { message });
  }
  return chatbotApi.post('/api/chat', {
    message,
    user_id: userId,
    session_id: sessionId,
    processing_mode: options.processingMode || 'immediate',
    stream: options.stream || false,
    force_new_session: options.forceNewSession || false,
  });
},
```

Also change the `CHATBOT_API_URL` default (line 4) so the absence is detectable:

```js
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || '';
```

- [ ] **Step 2: Check the consuming component handles the demo response shape**

Read `backend/app/pages/chatbot/router.py` for the demo response JSON shape, then read the component using `chatbotAPI.sendMessage` and make sure it renders that shape (adapt the response-unwrapping line in the component if needed — show actual response key, e.g. `response.data.response` vs `response.data.message`).

- [ ] **Step 3: Verify against running backend**

```bash
cd /home/luisgg/projects/personal/portfolio-ai-chatbot && docker compose up -d redis backend
cd frontend && npm run dev
```

Send a message in the chatbot UI → demo reply appears (vite proxy forwards `/api` to :8000). 

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: chatbot demo falls back to backend endpoint when no chat service configured"
```

### Task 9: Production Dockerfiles + nginx + backend uv migration

**Files:**
- Create: `frontend/Dockerfile.prod`, `frontend/nginx.conf`, `backend/Dockerfile.prod`, `backend/pyproject.toml` (+ `backend/uv.lock`), `docker-compose.prod.yml`
- Modify: `backend/Dockerfile` stays as dev; do not touch

- [ ] **Step 1: Create `frontend/nginx.conf`**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

(No `rewrite` directives anywhere — CVE-2026-42945 lives in the rewrite module; we don't give it inputs, and 1.30.1+ is patched regardless.)

- [ ] **Step 2: Create `frontend/Dockerfile.prod`**

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.30.1-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 3: Backend to uv — create `backend/pyproject.toml`**

Read `backend/requirements.txt` and port each pin, upgrading fastapi/uvicorn/redis/pydantic to:

```toml
[project]
name = "portfolio-backend"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.136.3",
    "uvicorn[standard]>=0.49.0",
    "redis>=5",
    "pydantic>=2.5",
    "pydantic-settings>=2",
    "python-dotenv>=1",
]
```

(If `requirements.txt` contains packages not listed here, carry them over too — port, don't drop.) Then:

```bash
cd backend && uv lock
```

- [ ] **Step 4: Verify backend still runs with upgraded deps**

```bash
cd backend && uv sync && uv run uvicorn app.main:app --port 8001 &
sleep 3 && curl -s http://localhost:8001/ && curl -s http://localhost:8001/api/home | head -c 200
kill %1
```

Expected: health JSON + home JSON. FastAPI 0.109→0.136 is non-breaking for this scaffold (already Pydantic v2); if a Starlette import errors, fix per its changelog.

- [ ] **Step 5: Create `backend/Dockerfile.prod`**

```dockerfile
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY . .
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 6: Create `docker-compose.prod.yml`** (repo root)

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

(No `ports:` — Coolify's Traefik routes to the frontend container port 80 via labels it injects. No `version:` key — obsolete.)

- [ ] **Step 7: Full prod stack smoke test locally (on Sputnik)**

```bash
cd /home/luisgg/projects/personal/portfolio-ai-chatbot
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps   # all 3 Up
# hit frontend through its container (no published port):
FRONTEND_ID=$(docker compose -f docker-compose.prod.yml ps -q frontend)
docker exec $FRONTEND_ID wget -qO- http://localhost/ | head -c 200          # expect index.html
docker exec $FRONTEND_ID wget -qO- http://localhost/api/home | head -c 200  # expect JSON via nginx→backend proxy
docker compose -f docker-compose.prod.yml down
```

- [ ] **Step 8: Update CORS for production**

`backend/app/main.py` CORS allows only `http://localhost:3000`. With nginx proxying same-origin `/api`, browser requests come from `https://la-realeza.com` — same origin as far as the API path is concerned, so CORS never triggers; but `npm run dev` against the deployed API would need it. Set:

```python
allow_origins=[
    "http://localhost:3000",
    "https://la-realeza.com",
    "https://www.la-realeza.com",
],
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: production Dockerfiles (nginx 1.30.1 static + uv backend), prod compose for Coolify"
```

### Task 10: Merge + deploy to Coolify + bind domain

**Files:** none in repo (Coolify config + git push)

- [ ] **Step 1: Push branch, merge to main, push**

```bash
git push -u origin phase1-vite-modernization
git checkout main && git merge --no-ff phase1-vite-modernization -m "Phase 1: Vite migration, dep modernization, production builds"
git push origin main
```

(Repo `github.com/MrGLC/portfolio-ai-chatbot` — if it's private, Coolify needs a deploy key or GitHub App; check with `curl -s https://api.github.com/repos/MrGLC/portfolio-ai-chatbot | grep -c "Not Found"` → `1` means private.)

- [ ] **Step 2: Create Coolify app**

In Coolify panel (https://coolify.la-realeza.com) — or via its API if a token is available:
- Project: "My first project" (or new project "la-realeza-portfolio")
- New Resource → Docker Compose → source: the GitHub repo (use the existing "Public GitHub" source if repo is public; otherwise create deploy key under the repo settings), branch `main`, compose file `docker-compose.prod.yml`
- On the **frontend** service: set domain `https://la-realeza.com`, port 80; add `https://www.la-realeza.com` as additional domain
- Deploy

- [ ] **Step 3: Verify deployment end-to-end from Sputnik**

```bash
curl -sI https://la-realeza.com | head -5          # expect HTTP/2 200, no cert error
curl -s https://la-realeza.com | grep -o "<title>[^<]*</title>"
curl -s https://la-realeza.com/api/home | head -c 200   # JSON through nginx proxy
curl -sI https://www.la-realeza.com | head -3      # expect 200 or redirect to apex
echo | openssl s_client -connect la-realeza.com:443 -servername la-realeza.com 2>/dev/null | openssl x509 -noout -subject -dates
```

Expected: valid Let's Encrypt cert with subject `CN=la-realeza.com`, site HTML served. If ACME fails: check `docker logs coolify-proxy | grep -i acme` on the VPS — port 80 must reach Traefik (it does; verified earlier).

- [ ] **Step 4: Record Lighthouse baseline (live site, mobile)**

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://la-realeza.com&strategy=mobile" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); c=d['lighthouseResult']['categories']; print({k: v['score'] for k,v in c.items()})"
```

Record scores. If performance < 0.90: biggest hammers in order — check entry bundle size (`npm run build` output), ensure three.js chunks lazy-loaded (Task 6), add `<link rel="preconnect">` for any external font hosts in `frontend/index.html`, and convert any large images in `frontend/src/assets` to WebP. Fix, redeploy, re-measure. Stop at ≥0.90 or after those four levers — deeper perf work is Phase 2 territory.

- [ ] **Step 5: Phase 1 gate checklist (manual, on phone is fine)**

- [ ] https://la-realeza.com loads with padlock (valid cert)
- [ ] All 5 pages navigate
- [ ] Language switch EN↔ES works and persists
- [ ] Chatbot demo answers a message
- [ ] Jewel background renders
- [ ] Lighthouse mobile performance ≥ 0.90 recorded

- [ ] **Step 6: Tag**

```bash
git tag phase1-deployed && git push origin phase1-deployed
```

---

## Out of scope for this plan
- Visual polish, chatbot UX redesign, Projects restructure → Phase 2 plan (write after Phase 1 ships).
- Content integration → Phase 3 plan (blocked on Luis's text).
- Real LLM integration — explicitly excluded by spec.

## Risks
- **drei 9.x vs three 0.184**: fallback pin three@~0.175 (Task 6 Step 1).
- **Private repo**: Coolify needs deploy key (Task 10 Step 2 covers both paths).
- **Domain expiry 2026-07-02**: outside this plan; Luis renews at Namecheap. Deployment is pointless if missed.
