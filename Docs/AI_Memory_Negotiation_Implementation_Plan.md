# AI Memory Negotiation System — 24-Hour Implementation Plan
### PS06 · Negotiating AI Memory — SIGCHI Hackathon
**Goal:** Ship a deployed, fully working LLM chatbot that utilizes an "Active Context Header" letting users instantly toggle whether the AI can store new memories or use past memories in the current conversation, backed by a live dashboard to view, edit, and revoke stored data.

---

## 1. Scope Lock: What We're Actually Building in 24 Hours

Locking scope now avoids the #1 hackathon failure mode: five half-built subsystems instead of three that work.

| Tier | Feature | Build Hours | Cut Rule |
|---|---|---|---|
| **P0 – Core (never cut)** | Chat interface + LLM responses | ~2h | N/A — nothing works without this |
| **P0 – Core** | Active Context Header (Store Memory & Use Memory Toggles) | ~3h | N/A — this is the PS |
| **P0 – Core** | Conversational renegotiation ("forget that", "only for now") | ~2h | Only cut if P0 chat+header isn't stable by Hour 12 |
| **P0 – Core** | Memory Dashboard (view + edit + delete existing memories) | ~3h | N/A — answers "no way to see what's remembered" |
| **P1 – Should-have** | Memory Expiration (auto-expire session/7-day memories) | ~1.5h | Cut logic, keep schema field — fake it in demo if needed |
| **P1 – Should-have** | Timeline (git-style history of memory actions) | ~2h | Degrade to a simple activity log list if time-boxed |
| **P2 – Stretch** | Sensitivity Meter (Low/Med/High/Critical) | ~1.5h | Cut first — rule-based version is cheap, do it only if ahead of schedule |
| **P2 – Stretch** | Memory Graph (relationship visualization) | ~2–3h | Cut first if behind — highest build risk, lowest PS weight |

**Rule for the team:** By Hour 14 you must have a *deployed URL* where the header toggles + dashboard work end-to-end, even with placeholder styling. Polish and P2 features only happen after that checkpoint.

---

## 2. Finalized Tech Stack (with justification)

| Layer | Choice | Why (not the alternative) |
|---|---|---|
| Frontend | **React (Vite) + Tailwind CSS** | Fast HMR, no Next.js SSR complexity you don't need in 24h |
| Backend | **Node.js + Express** | Same language as frontend; team moves faster when everyone reads every file |
| Database | **MongoDB Atlas (free tier)** | Schema-flexible — memory objects will change shape as you iterate; instant cloud hosting |
| LLM | **Gemini 1.5 Flash or GPT-4o-mini via API** | Cheap + fast enough for real-time chat; keeps response latency low |
| Auth | **Simple JWT + single demo user** | Firebase Auth setup eats 30–45 min you don't have; hardcoded demo login is judge-acceptable |
| Realtime UI | **Plain REST + polling/optimistic UI** | Sockets add reconnection bugs; not needed for a single-user chat demo |
| Hosting | **Frontend: Vercel · Backend: Render (or Railway)** | Zero-config Git-push deploys — critical for "deploy-ready" requirement |

---

## 3. System Architecture (deploy-ready shape)

```
┌─────────────┐      HTTPS       ┌──────────────────┐
│  React SPA  │ ───────────────▶ │  Express API      │
│  (Vercel)   │ ◀─────────────── │  (Render)          │
└─────────────┘      JSON        └────────┬──────────┘
 (Passes Toggle                           │
  States in Payload)                      │
                     ┌─────────────────────┼─────────────────────┐
                     ▼                     ▼                     ▼
             ┌───────────────┐   ┌──────────────────┐   ┌─────────────────┐
             │ LLM API        │   │ MongoDB Atlas     │   │ Memory Rules     │
             │ (Gemini/GPT)   │   │ - users            │   │ Engine (in-proc) │
             │                │   │ - messages          │   │ - sensitivity    │
             │                │   │ - memories          │   │ - expiration cron│
             │                │   │ - memory_events     │   │ - graph linker   │
             └───────────────┘   └──────────────────┘   └─────────────────┘
```

**Request flow per user message:**
1. User toggles "Store Memory" and/or "Use Memory" in the UI header.
2. User sends message → `POST /api/chat` (Payload includes `{ message: "...", allowStorage: true, useContext: false }`).
3. If `useContext: true`, Backend fetches active memories from MongoDB and injects them into the LLM system prompt. If false, it sends a blank slate.
4. Backend calls LLM to generate the reply.
5. If `allowStorage: true`, Backend runs memory extraction in parallel. Detected facts are silently saved to the database, and a `memory_events` row is written.
6. Dashboard reads `GET /api/memories` and updates the Git-style timeline automatically.

---

## 4. Data Models

```js
// User (minimal — single demo user is fine for 24h)
User {
  _id, email, passwordHash, createdAt
}

// Message — raw chat log
Message {
  _id, userId, role: "user"|"assistant", content, createdAt
}

// Memory — current/latest state only
Memory {
  _id, userId,
  content: String,          // "Preparing for GATE 2027"
  category: String,         // "goal" | "preference" | "fact" | "identity"
  sensitivity: String,      // "low"|"medium"|"high"|"critical" (P2)
  expiresAt: Date | null,   // set to +7 days by default on extraction; null = permanent
  status: String,           // "active" | "expired" | "forgotten"
  sourceMessageId: ObjectId,
  createdAt, updatedAt
}

// MemoryEvent — append-only audit log powering the Timeline
MemoryEvent {
  _id, memoryId, userId,
  action: String,   // "extracted" | "forgotten" | "updated"
  detail: String,   // human-readable, e.g. "Auto-extracted from chat"
  createdAt
}
```

**Non-negotiable rule:** every write to `Memory` happens inside the same function that writes a matching `MemoryEvent` — never two separate calls from the frontend. This guarantees the Timeline can never drift out of sync with actual state.

---

## 5. Feature Implementation Detail, PoC, and Justification

### 5.1 App Shell & Navigation Architecture (UX Case Study)

**Design Rationale:** We adopted a "Minimal Gallery" (Perplexity-inspired) layout to resolve the core HCI tension: users need deep control over memory without feeling trapped in a settings menu. 

**Spatial Relationship:**
- **The Archive (Left Sidebar):** A muted, `bg-zinc-50` secondary zone. It anchors the user with a prominent "New Session" button, quick access to Artifacts, and past Sessions. It intentionally recedes visually to let the main canvas shine.
- **The Stage (Main Canvas):** A full-bleed, `bg-white` primary interaction zone. It uses massive whitespace and hides scrollbars to create a distraction-free area where the conversation—and the AI's transparent memory extraction—takes center stage.

### 5.2 Interaction Mechanisms: Active Context Header & Floating Input (P0 — Core)

**UX Rationale (The HCI Solution):** 
Traditional AI memory systems either bury toggles deep in a settings menu (opaque) or interrupt every message with an intrusive "Save this?" popup (friction). We resolved this by introducing two persistent but non-distracting UI elements:

1. **The Active Context Header (Pinned Toggles):**
   - **Justification:** Pinned directly above the conversation, this header acts as a real-time dashboard of the AI's state. It gives users continuous, legible agency over data flow ("Extract & Store Memories" and "Use Saved Profile") without breaking conversational flow.
   - **Micro-interactions:** Toggles use smooth, immediate state changes, conveying absolute responsiveness and trust.

2. **The Floating Input Bar:**
   - **Justification:** Anchored at the bottom of the screen, the input bar uses a pill-shaped, elevated container (subtle drop shadow `shadow-sm`) to cleanly float above the scrolling history. This design, inspired by search-centric interfaces like Perplexity, centralizes all input actions (text, voice, file attachments) into a single, cohesive command center.

**Backend Logic Alignment:**
- If **Extract & Store** is OFF: The backend bypasses the JSON memory-extraction LLM call entirely. Nothing is written to the DB.
- If **Use Profile** is OFF: The backend does not query the Memories collection. The LLM receives a standard blank-slate system prompt.

**User Journey (Demo Flow):**
1. User turns OFF "Use Profile" and asks a personal question. AI responds generically.
2. User turns ON "Extract & Store", types a personal fact. The UI visually indicates extraction inline.
3. User turns ON "Use Profile", asks the question again. AI responds utilizing the newly saved context.

### 5.2 Conversational Renegotiation ("forget that")

**Justification:** Since there are no inline popups for confirming memory retention, users must retain the ability to verbally revoke memory. This proves the system is dynamic, not just a one-time settings toggle.

**Implementation approach (keep it simple):**
- Run a lightweight intent-classification prompt on every user message *before* the normal chat reply:
```
Classify this message as one of: FORGET_MEMORY, NONE.
If FORGET_MEMORY, extract which stored memory (from this list: {list of current memory contents}) it refers to.
Return JSON: { "intent": string, "targetMemoryId": string|null }
```
- If `FORGET_MEMORY`, short-circuit the normal chat flow, delete/archive the targeted memory, and reply: *"I've removed that from my memory."*

### 5.3 Memory Dashboard & Timeline (The Audit Trail) (P0)

**Justification (Solving the Black Box Problem):** 
The core HCI failure of modern AI is the "black box" effect—users don't know what the AI remembers, when it learned it, or how to undo it. 
We solved this by merging the Dashboard and Timeline into a unified, Light Mode "Memory Vault" accessible from the Sidebar.

**Required Capabilities Implemented:**
1. **Active Context Cards:** Current facts are displayed as elevated cards, color-coded strictly by privacy sensitivity (e.g., Critical = Red, Medium = Amber).
2. **Frictionless Revocation:** Every memory card features an explicit, accessible "Forget This" button that immediately strikes the memory from active context (and logs a revocation event), restoring complete user agency.
3. **The Git-Style Timeline:** We introduced a vertical, chronological audit trail on the right-hand column. Every time the AI silently extracts a memory (via the Active Context Header) or a user revokes one, a "commit" is logged here. This proves to the user that extraction is a tracked, auditable process, completely eliminating the opaque black box.

### 5.4 Memory Expiration (P1)

**Justification:** Directly addresses the "Data Retention" keyword.

**Note:** Since the inline "1 week/Forever" popup is removed, default all auto-extracted memories to a **7-day expiry**. Let users make them "Permanent" inside the Dashboard if they wish.

```js
// Runs on server start + checked lazily on every /api/memories call
async function expireStaleMemories(userId) {
  await Memory.updateMany(
    { userId, status: "active", expiresAt: { $ne: null, $lte: new Date() } },
    { $set: { status: "expired" } }
  );
  // + write a MemoryEvent per expired memory for Timeline continuity
}
```

### 5.5 Memory Timeline (Integrated into Dashboard)

**Justification:** Integrated directly into the Dashboard view as the primary mechanism for auditability. It visually populates with `extracted` and `forgotten` events, providing ongoing transparency.

### 5.6 Sensitivity Meter (P2)

**Justification:** Adds a Privacy dimension the PS implies but doesn't explicitly require — build only if P0/P1 are done and deployed.

**Fastest viable version — rule-based, not LLM-based:**
```js
const RULES = [
  { pattern: /allerg|medical|diagnos|health|disease/i, level: "critical" },
  { pattern: /phone|address|passport|bank|salary/i,     level: "high" },
  { pattern: /city|location|school|company/i,           level: "medium" },
];
function classify(content) {
  for (const r of RULES) if (r.pattern.test(content)) return r.level;
  return "low";
}
```
Dashboard summary: `🟢 Low · 🟡 Medium · 🔴 High · ⚫ Critical` counts — high visual payoff.

### 5.7 Memory Graph (P2 — stretch, cut first)

**Justification:** Highest build risk, lowest PS weight. Only attempt after everything above is deployed and stable.

**Cheapest viable version:** simple shared-category or shared-keyword edges, rendered with `react-flow` using auto-layout. If Hour 20 arrives and this isn't started, **cut it** and mention it in "Future Work."

---

## 6. 24-Hour Hour-by-Hour Roadmap

*(Adjust start time to your actual kickoff — this assumes a 4-person team, roles: Backend, Frontend, LLM/Prompt+Data, Design/Docs.)*

| Hours | Backend | Frontend | LLM/Prompts + DB | Design/Docs |
|---|---|---|---|---|
| 0–1 | Repo scaffold, Express + MongoDB Atlas connect, deploy to Render | Vite+Tailwind scaffold, deploy to Vercel | Finalize schemas, get API key working | Finalize wireframes for Chat Header + Dashboard |
| 1–4 | `/api/chat` route handling the Toggle booleans | Chat UI & Active Context Header toggles | Extraction prompt, test against sample messages | User persona + journey map |
| 4–8 | Extraction logic triggered by boolean, MemoryEvent writes | Sidebar Dashboard UI component | Tune extraction prompt precision | Draft Design Document sections 1–4 |
| 8–10 | **Checkpoint: deploy chat with working global toggles** | Wire toggles to live API payload | Renegotiation intent classifier (5.2) | — |
| 10–14 | Dashboard API (`GET/PATCH/DELETE /memories`) | Dashboard UI: list, forget button, filters | — | Start Interface Design section (screenshots) |
| 14 | **HARD CHECKPOINT — full P0 stack must be live on the deployed URL** |||| 
| 14–17 | Timeline API | Timeline UI (simple vertical list is fine) | Sensitivity rules (5.6) if ahead of schedule | Technical architecture diagram |
| 17–19 | Buffer / bug fixes | Buffer / bug fixes / mobile responsiveness | Memory Graph (5.7) *only if ahead* | Finalize Design Doc, Future Work |
| 19–21 | Polish + error handling | Polish + empty states | Final prompt tuning against demo script | Slides (8–10) built from screenshots |
| 21–22 | Record demo video (2–3 min) covering the Toggle PoC | — | — | AI Usage Declaration |
| 22–23 | Final deploy check from a clean browser/incognito | Final deploy check | — | Proofread design doc, export as .docx |
| 23–24 | **Submit**: prototype link, video, design doc, AI usage declaration | | | |

Build the deploy pipeline in **Hour 0–1**, not at the end.

---

## 7. Deployment Checklist ("deploy-ready" requirement)

- [ ] Backend on Render/Railway with env vars set (`MONGODB_URI`, `LLM_API_KEY`, `JWT_SECRET`) — never hardcode keys in committed code
- [ ] Frontend on Vercel with `VITE_API_URL` pointing at the deployed backend, not `localhost`
- [ ] CORS configured on Express to allow the Vercel domain
- [ ] MongoDB Atlas network access set to allow all IPs (0.0.0.0/0) for the demo
- [ ] One seeded demo account so judges/mentors can log in without registering
- [ ] Smoke-test the **toggle functionality** in an incognito window right before submission — verify Store OFF means nothing writes to DB, Use OFF means LLM gets no memory context
