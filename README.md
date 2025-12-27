# Misconception Detection

Monorepo (npm workspaces) with:
- `client` — Vue 3 + TypeScript + Vite
- `server` — Node + TypeScript (Express) that calls GPTs/OpenAI API
- `shared` — shared TypeScript types

Quickstart:
1. Copy `.env.example` to `.env` inside `server` and set `OPENAI_API_KEY`.
2. Run `npm install` at repo root to install workspace dependencies.
3. `npm run dev` to start both client (Vite) and server (ts-node-dev).

Client only:
- cd client
- npm install
- npm run dev

The client includes Tailwind CSS and a theme toggle in the header (top-right) — the theme preference is saved to `localStorage`.

Security: never commit real API keys to git.