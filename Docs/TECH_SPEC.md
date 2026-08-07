# TECH_SPEC.md

This is the authoritative stack and convention document. Do not substitute libraries, add new abstractions, or restructure folders without a documented reason — consistency matters more than personal preference in a 24-hour build with multiple people touching the same code.

## Stack

### Frontend
- **React** (function components + hooks only, no class components)
- **Vite** (not Next.js — no SSR, no file-based routing, no server components; this is a client-rendered SPA)
- **Tailwind CSS** for all styling — no separate `.css` files except `index.css` for Tailwind imports and CSS variables
- **React Router (v6+)** for routing
- **TanStack Query (React Query)** for all server-state (fetching/caching memories, messages, timeline) — do not hand-roll `useEffect` + `fetch` + `useState` for data fetching
- **React Hook Form** for all forms (edit-memory form, login form)
- **Zod** for schema validation — shared validation shapes between frontend form validation and backend request validation where practical
- **Framer Motion** for the negotiation card entrance, toast transitions, and modal open/close — keep animation usage restrained (see `UI_GUIDELINES.md`)

### Backend
- **Node.js + Express**
- Plain REST — no GraphQL, no tRPC. Keep the surface area small and debuggable under time pressure.

### Database
- **MongoDB Atlas** (cloud, free tier)
- **Mongoose** for schema definition and queries — no raw driver calls except for one-off scripts

### Authentication
- **JWT** (access token only, no refresh-token rotation — out of scope for 24h)
- **bcrypt** for password hashing
- Single seeded demo account is acceptable and expected; a full registration flow is optional polish, not core scope

### File/Image Storage
- **Cloudinary** — only if the project ends up needing avatar/image upload; not required for core memory-negotiation functionality. Don't build this unless a feature actually needs it.

### LLM
- **Gemini** (primary) — chosen for cost/speed on a free-tier-friendly model for the high call volume of a demo (every message triggers at least one extraction call plus the reply)
- Keep the LLM client behind a single wrapper module (`services/llmClient.js`) so switching models/providers is a one-line change, not a refactor

### Deployment
- **Frontend → Vercel**
- **Backend → Render**
- Both connected to Git for push-to-deploy. Set this up in Hour 0–1, not at the end.

## Folder Structure

```
/frontend
  /src
    /api            # one file per resource: chatApi.js, memoryApi.js, authApi.js — all fetch calls live here, nowhere else
    /components
      /chat          # ChatWindow, MessageBubble, NegotiationCard
      /dashboard     # MemoryList, MemoryCard, TimelineView, SensitivityBadge
      /ui            # generic reusable primitives: Button, Modal, Toast, Input, Card
    /hooks           # useMemories, useChat, useTimeline (wrap TanStack Query)
    /pages           # ChatPage, DashboardPage, LoginPage — one per route
    /lib             # zod schemas, constants, formatters (e.g. formatDate)
    /context         # AuthContext only — avoid adding more global context, prefer TanStack Query cache
    App.jsx
    main.jsx
    index.css

/backend
  /src
    /routes          # chat.routes.js, memory.routes.js, auth.routes.js — routing only, no business logic here
    /controllers      # chat.controller.js, memory.controller.js — request/response handling, calls services
    /services         # memoryService.js, extractionService.js, llmClient.js — actual business logic lives here
    /models           # User.js, Message.js, Memory.js, MemoryEvent.js, MemoryEdge.js (Mongoose schemas)
    /middleware       # authMiddleware.js, errorHandler.js
    /utils            # logger.js, asyncHandler.js
    server.js
    app.js
  .env.example
```

**Rule:** routes never contain logic beyond calling a controller. Controllers never talk to the database directly — they call a service. Services own all Mongoose queries and all LLM calls. This isn't over-engineering for its own sake — it's the minimum separation that lets two people work on the same feature (e.g., one on the extraction prompt, one on the API contract) without merge conflicts in the same file.

## Naming Conventions
- Files: `camelCase.js` for logic files, `PascalCase.jsx` for React components
- Mongoose models: singular, PascalCase (`Memory`, not `Memories`)
- API routes: plural, kebab/lowercase (`/api/memories`, `/api/memories/:id/decide`, `/api/memories/:id/timeline`)
- Booleans: `isX` / `hasX` (`isExpired`, `hasMemory`)
- Env vars: `SCREAMING_SNAKE_CASE`

## API Conventions
- All responses: `{ success: boolean, data?: any, error?: string }` — consistent shape, no ad hoc response formats per route
- All list endpoints support no pagination for v1 (data volume is small in a 24h demo) — don't build pagination unless a list realistically exceeds ~50 items
- Status codes used meaningfully: `400` validation, `401` auth, `404` not found, `500` unhandled — don't return `200` with an error message buried in the body

## Error Handling
- Every async route handler wrapped in a shared `asyncHandler` util — no repeated try/catch boilerplate per route
- One centralized Express error-handling middleware (`errorHandler.js`) — formats all errors into the standard response shape above
- Frontend: TanStack Query's built-in `error` state drives UI — every data-fetching component must render a real error state (not just a loading spinner that never resolves)
- LLM calls specifically: wrap in try/catch with a graceful fallback (e.g., extraction failure → treat as "no memory detected" rather than crashing the chat turn) — a flaky LLM call should never break the chat itself

## Logging
- Backend: a single `logger.js` wrapping `console.log`/`console.error` with a timestamp + level prefix (`[INFO]`, `[ERROR]`) — no need for Winston/Pino in a 24h project, but funnel everything through one function so it's easy to silence or redirect later
- Log every memory state transition (`proposed`, `accepted`, `declined`, `forgotten`, `expired`) server-side in addition to writing the `MemoryEvent` — this is your fastest debugging tool when a demo misbehaves live

## State Management
- **Server state** (memories, messages, timeline, auth user): TanStack Query only. Do not duplicate this into `useState`/Context.
- **Client-only UI state** (modal open/closed, active tab, form input before submit): local `useState` in the component, no global store needed
- **Auth token**: stored in memory + `httpOnly`-style handling is ideal, but for a 24h demo, storing the JWT in a single `AuthContext` (not localStorage, to avoid the browser-storage trap on shared demo devices) is an acceptable simplification — document it as a known simplification, not a silent shortcut
- Do not introduce Redux/Zustand — there is no state complexity in this project that justifies it

## Environment Variables (backend `.env`)
```
MONGODB_URI=
JWT_SECRET=
LLM_API_KEY=
LLM_PROVIDER=gemini
PORT=5000
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Environment Variables (frontend `.env`)
```
VITE_API_URL=https://your-backend.onrender.com
```
