<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/assets/logos/jojo-lockup-dark.png">
    <img src="src/assets/logos/jojo-lockup-light.png" alt="JoJo" width="280">
  </picture>
</p>

<p align="center"><strong>A browser-based C learning IDE for absolute beginners.</strong></p>

---

JoJo has three core surfaces:

- C editor and Judge0-backed run output
- AI Sensei tutor endpoints adapted for Cloudflare Workers
- Live Code-to-Diagram panel powered by a local C heuristic parser and Mermaid

## DevX Feature Scan

AI Sensei in DevX is implemented mainly by:

- `backend/src/services/aiService.ts`
- `backend/src/index.ts` AI routes under `/api/v1/ai/*`
- `frontend/src/renderer/components/SenseiChat.tsx`
- `frontend/src/renderer/components/SenseiMentor.tsx`
- `frontend/src/renderer/components/MonacoEditor.tsx` for inline feedback hooks

The core behavior is level-aware mentoring. Beginner responses are simple and may provide small code snippets, intermediate responses favor steps and hints, and pro responses focus on architecture, edge cases, and testing. DevX uses OpenRouter through axios, stores/reads learner level from a backend profile service, and exposes chat, explain, hover, stuck help, next-step, guidance, and motivational routes.

Visualizer in DevX is implemented mainly by:

- `frontend/src/renderer/components/Visualizer.tsx`
- `backend/src/services/parserService.ts`
- `backend/src/index.ts` route `/api/v1/parse`

The visible React visualizer maps definitions to later usages and draws SVG curves between them. The backend parser detects functions/classes/imports/complexity for several languages and can emit a DOT call graph.

## Worker Compatibility Notes

DevX uses Node-specific runtime pieces that do not run as-is in Cloudflare Workers:

- `process.env`, Fastify, Prisma, bcrypt, axios timeouts, Docker execution, Socket.IO, Redis, and Node server lifecycle APIs
- Electron/Monaco local desktop assumptions in the frontend

Jojo adapts this by using native Worker `fetch`, Web Crypto PBKDF2 for password hashing, Neon’s HTTP driver, and plain Request/Response routing.

## Live Diagram Architecture

Jojo uses a hybrid-ready architecture:

- Current: local heuristic C parser on every edit, debounced Mermaid render at 250 ms
- Tradeoff: fast, free, and real-time for simple functions/control flow, but imperfect for complex C syntax and macros
- Future fallback: send ambiguous snippets to Sensei only after idle time or explicit request, not per keystroke

This keeps typing latency low and avoids turning normal editing into a stream of paid LLM calls.

## Local Development

```bash
npm install
npm run dev
```

To run the Worker API locally:

```bash
npm run worker:dev
```

Configure Worker secrets:

```bash
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
wrangler secret put OPENROUTER_API_KEY
```

Apply `worker/migrations/001_init.sql` to Neon before using signup/login.

## Current Status

- Frontend scaffold: complete
- C analysis and Mermaid live diagram: complete
- DevX-style relationship visualizer: complete
- Worker auth/Judge0/Sensei routes: complete
- GitHub Actions build/deploy skeleton: complete
- Production deployment wiring and real Neon migration automation: pending
