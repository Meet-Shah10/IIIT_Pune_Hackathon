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

### 5.1 Active Context Header (The Global Toggles) (P0 — the core of the whole project)

**Justification:** Replaces the intrusive popup with a persistent, empowering control interface. By keeping it pinned at the top of the chat, the user has continuous, legible agency over the AI's data flow.

**UI Implementation:**

Pinned at the top of the chat window or resting right above the input bar:
- Toggle 1: `[✓] Extract & Store New Memories`
- Toggle 2: `[✓] Use My Saved Profile to Answer`

**Backend Logic:**
- If Toggle 1 is **OFF**: The backend bypasses the JSON memory-extraction LLM call entirely. Nothing is written to the DB.
- If Toggle 2 is **OFF**: The backend does not query the Memories collection. The LLM receives a standard system prompt with no personalization.

**PoC to demonstrate to mentors:**
1. Turn OFF "Use Saved Profile". Ask "What is my favorite language?". AI responds generically.
2. Turn ON "Extract & Store". Type "My favorite language is Python."
3. Open the sidebar dashboard to show it was instantly captured and logged in the timeline.
4. Turn ON "Use Saved Profile". Ask "What should I code in today?" AI responds with a Python suggestion.

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

### 5.3 Memory Dashboard (P0)

**Justification:** The toggles handle future extraction and utilization, but the dashboard handles past transparency. Directly answers the PS's stated problem: *"most users have no meaningful way to see what an AI remembers about them."*

**Required capabilities (all three, not just a read-only list):**
1. List all active memories grouped by category.
2. One-click "Forget this" per memory (writes a `forgotten` MemoryEvent — keeps the audit trail, never hard-deletes).
3. Filter/search bar for navigating stored facts.

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

### 5.5 Memory Timeline (P1)

**Justification:** Answers the need for a "visible, ongoing part of the interaction." Because extraction is now silent (controlled by Toggle 1), the Timeline is the user's audit log to verify the AI isn't over-reaching.

**PoC:** The four-step Toggle PoC above should visibly populate timeline rows (`extracted` → `forgotten`) with no extra work — it's a read view over data you're already writing.

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
