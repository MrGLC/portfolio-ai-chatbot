# VPS deploy checklist (la-realeza.com)

Validated 2026-10-29: `docker compose -f docker-compose.prod.yml -f docker-compose.vps.yml config` passes with no errors.

## What the config does
- frontend (nginx, port 80) joins `default` + `proxy` (external network `coolify`); Traefik labels route `la-realeza.com` and `www.` to it, http redirects to https.
- No host ports are published in prod/vps, so nothing collides with the proxy.
- Frontend reaches the backend through nginx `location /api/` -> `http://backend:8000` (internal `default` network). Backend routes live under `/api/*`.
- Backend and redis are only on `default`.

## Before starting
- [ ] DNS: A/AAAA records for `la-realeza.com` and `www.la-realeza.com` point to the VPS.
- [ ] Network `coolify` exists: `docker network inspect coolify`.
- [ ] Traefik (coolify-proxy) has entrypoints `http` and `https` and certresolver `letsencrypt`.
- [ ] Branch decided: `jewel-narrative-session-2` is not in `main` yet. Deploy that branch or merge first.
- [ ] Chatbot variables (GAP): `docker-compose.prod.yml` only passes `REDIS_HOST`/`REDIS_PORT` to the backend. `CHATBOT_ENDPOINT` and `CHATBOT_API_KEY` (read in `backend/app/core/config.py`) are NOT passed, so the chatbot stays unconfigured on the VPS. Add `env_file: .env` (or `environment:` entries) to the backend service and create `.env` on the server (see `.env.example`; never commit it).
- [ ] Builds: not run here (no image builds). The first `--build` on the VPS confirms `frontend/Dockerfile.prod` (`npm ci` + `npm run build`) and `backend/Dockerfile.prod` (`uv sync --frozen`).

## Start (on the VPS)
Run the same two `-f` files as in the validation command, with `up -d --build` instead of `config`.

## Verify
- Same command with `ps`.
- `curl -I https://la-realeza.com` and a `/api/...` call through the domain.
