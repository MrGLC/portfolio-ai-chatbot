# Portfolio Improvements Design — la-realeza.com Relaunch

**Date:** 2026-06-10
**Repo:** portfolio-ai-chatbot (github.com/MrGLC/portfolio-ai-chatbot)
**Goal:** Modernize, polish, and refresh the portfolio site, then redeploy to la-realeza.com via Coolify on the la-realeza VPS.

## Context

- Site has been down: la-realeza.com DNS points to the Coolify VPS, but the portfolio was never deployed there. Apex domain serves 404/503 with no TLS cert.
- Frontend: React 18 + TypeScript 4.9 on create-react-app (deprecated), Chakra UI v2, React Router v6, React Query v5, framer-motion, Three.js (7 background components), i18n ES/EN (701 keys each).
- Backend: FastAPI scaffold with hardcoded demo data; chatbot endpoint echoes canned responses. `CHATBOT_ENDPOINT`/`CHATBOT_API_KEY` env vars exist but are unused.
- docker-compose only runs dev servers — no production build path exists.
- Last commit July 2025; working tree clean.

## Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Scope | Tech modernization + visual polish + content refresh. No real LLM integration now. |
| Visual direction | Keep royal cream/red/gold theme; polish it. |
| Positioning | Both: consulting services front and center, portfolio depth behind it. |
| Projects featured | Trading AI (Primero), AI interviewing system, homelab/self-hosted AI, biomedical/CV. |
| Chatbot | Improve scripted demo; real connection later via clean seam. |
| Content authorship | Luis provides text; Claude integrates and translates ES/EN. |
| Execution | Approach A: incremental, 3 phases, deploy after Phase 1. |

## Phase 1 — Tech Foundation

1. **CRA → Vite migration**
   - Remove `react-scripts`; add `vite`, `@vitejs/plugin-react`.
   - Move `index.html` to project root, adjust entry script tag.
   - Rename env vars `REACT_APP_*` → `VITE_*`; update all `process.env.REACT_APP_*` reads to `import.meta.env.VITE_*`.
2. **Dependency upgrades**
   - TypeScript 4.9 → 5.x.
   - React Router, React Query, framer-motion → latest compatible versions.
   - Chakra UI stays on v2 (v3 is a breaking rewrite; out of scope).
3. **Three.js pruning + lazy loading**
   - Audit which of the 7 background components (`AnimatedBackground`, `EnhancedAnimatedBackground`, `RoyalAnimatedBackground`, `ModernAnimatedBackground`, `ModernAnimatedBackgroundV2`, `RedJewelBackground`, `LightPattern`) are actually rendered; delete the rest.
   - Lazy-load survivors with `React.lazy` + `Suspense` so first paint does not wait on Three.js.
4. **Code splitting** per route (5 pages).
5. **Lighthouse audit** at end of phase; fix worst offenders. Target: Performance ≥ 90 mobile.
6. **Production Dockerfile**: multi-stage — Node build stage → static files served by nginx. Compose/dev setup remains for local work.
7. **Backend untouched** this phase.
8. **Deploy to Coolify**: create app from GitHub repo, bind `la-realeza.com` + `www.la-realeza.com`, Let's Encrypt cert auto-issues. Site back online.

**Phase 1 gate (before deploy):** production build succeeds; all 5 routes render; ES/EN switch works; chatbot demo responds; Lighthouse run recorded. Verified in a real browser against the production build, not the dev server.

## Phase 2 — Visual Polish + Chatbot Demo

1. **Theme polish** (royal palette unchanged: cream #F5E6D3 / royal red #DC143C / gold #FFD700):
   - Consistent spacing tokens (8px scale) across all pages.
   - Typographic rhythm pass: Playfair Display headings / Inter body, modular scale, consistent line heights.
   - Refine micro-interactions: hover/press states, transitions ~200ms, transforms/opacity only.
   - Mobile audit: every page flawless on phone-width viewports; touch targets ≥ 44px.
2. **Chatbot demo upgrade** (no real LLM):
   - Predefined Q&A conversation flows about services and projects, in ES and EN.
   - Suggested question chips; typing indicator; clearly labeled as demo.
   - Clean seam for later: response provider behind a single interface so swapping in `CHATBOT_ENDPOINT` later touches one module.
3. **Projects page restructure**: layout and card structure for the 4 real project categories, with placeholder text awaiting Phase 3 content.

## Phase 3 — Content Integration

1. Luis sends: bio, project blurbs (4 categories), consulting offer/pricing updates, contact info corrections.
2. Claude integrates into `frontend/src/i18n/locales/{en,es}/translation.json`; translates whichever direction is missing; Luis reviews translations.
3. Pure text drop-in — structure already built in Phase 2. No layout work expected.

## Error Handling / Testing

- Each phase on its own branch; merge to main only after its gate passes.
- Phase gates verified by running the production build and checking behavior in browser.
- Lighthouse before/after numbers reported for Phase 1.
- Deployment verified end-to-end: `https://la-realeza.com` loads with valid cert after Phase 1 deploy.

## Out of Scope

- Real LLM chatbot integration (future project; seam prepared).
- Chakra UI v3 migration.
- Backend rework beyond what deployment requires.
- timewasteregisterr app on the VPS (brother's; untouched).

## Open Items

- Domain la-realeza.com expires 2026-07-02 — Luis must renew at Namecheap (outside this project, blocking everything if missed).
- Phase 3 blocked on Luis providing content text.
