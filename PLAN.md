# Jojo — AI Tutor + C Compiler Web IDE

## Context

I'm building a new app called **Jojo** — a mini AI tutor + online compiler for C,
using [https://ce.judge0.com/](https://ce.judge0.com/) as the compiler backend.

Before doing anything else, scan and review this existing project so you understand
what's already built:

```
/home/dev0root/Projects/Vertex-code-IDE/DevX IDE
```

## Step 1 — Understand the existing features

Identify and understand the implementation of two features in that project, because
I want to port/adapt them into Jojo:

1. **AI SENSEI** — [describe what this feature does: e.g. an in-IDE AI assistant that
   explains errors, answers questions about the code, gives hints without giving away
   the full answer, etc. — fill in the actual behavior, or leave blank and infer it
   from the code]

2. **Visualizer** — [describe what this feature does in DevX: e.g. renders a visual
   representation of code execution/structure — fill in the actual behavior, or leave
   blank and infer it from the code]

Before writing any code, summarize back to me:
- What files/modules implement each feature
- The core architecture/logic of each (how data flows, what APIs they call)
- Any Node-only or environment-specific APIs used that won't run in Cloudflare Workers

## Step 2 — New feature (does not exist in DevX)

**Live Code-to-Diagram** — as the user types C code in the web IDE, generate a
Mermaid.js diagram in real time (e.g. flowchart of control flow / function structure)
that updates live in a side panel, without requiring a manual "compile" or "run" step.

Propose an architecture for this specifically, weighing:
- A local/heuristic parser (fast, free, works for simple control flow patterns)
- An LLM call per update (slower, costs money, handles arbitrary/complex code)
- A hybrid approach (e.g. heuristic first pass + LLM fallback for ambiguous cases)

State a recommendation and the tradeoffs, given it needs to feel "real time" while
the user is typing (debouncing strategy, request volume, latency budget).

## Tech Stack

Confirm this is sound for the above, and flag any issues before implementation begins:

- **TypeScript** across the whole stack (frontend + backend)
- **Cloudflare Workers** for the backend (proxying Judge0 API calls + AI provider calls)
- **NeonDB** (via `@neondatabase/serverless` HTTP driver) for simple user
  management/auth
- **GitHub** for deployment (GitHub Actions or Cloudflare's native GitHub integration)

## Deliverables

### Phase 1 — Plan (do this first, wait for my sign-off before Phase 2)
1. Summary of AI Sensei and Visualizer as found in DevX (files, architecture, key logic)
2. Compatibility flags — anything in DevX's implementation that won't work as-is on
   Cloudflare Workers, and how you'd adapt it
3. Recommended architecture for Live Code-to-Diagram, with tradeoffs
4. Proposed project structure for Jojo (folders, key modules, how the three features
   plus Judge0 integration and auth fit together)
5. Open questions/decisions you need from me before implementing

### Phase 2 — Implementation (only after I approve the plan)
1. Scaffold the project (TypeScript, Cloudflare Workers backend, frontend of your
   choice — recommend one if I haven't specified)
2. Set up NeonDB connection + minimal user auth (signup/login/session)
3. Implement Judge0 integration (submit code, poll for result, return output)
4. Port AI Sensei from DevX, adapted for the Workers runtime
5. Port Visualizer from DevX, adapted for the Workers runtime
6. Build Live Code-to-Diagram per the approved architecture
7. Set up GitHub Actions (or Cloudflare's GitHub integration) for deployment

## Constraints

- Don't start Phase 2 until I've reviewed and approved the Phase 1 plan
- Keep the plan concise — architecture and decisions, not a full spec document
- Flag any Judge0 rate-limit or API-key considerations you notice, since the free
  CE tier has usage limits
