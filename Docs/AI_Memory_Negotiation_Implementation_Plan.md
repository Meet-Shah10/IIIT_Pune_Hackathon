# AI Memory Negotiation System — 24-Hour Implementation Plan
### PS06 · Negotiating AI Memory — SIGCHI Hackathon
**Goal:** Ship a deployed, fully working LLM chatbot that lets users negotiate what it remembers — long-term, temporary, session-only, or never — with a live dashboard to view, edit, and revoke memories.

---

## 1. Scope Lock: What We're Actually Building in 24 Hours

Your design report already scored this idea 8/10 and flagged the real risks. Locking scope now avoids the #1 hackathon failure mode: five half-built subsystems instead of three that work.

| Tier | Feature | Build Hours | Cut Rule |
|---|---|---|---|
| **P0 – Core (never cut)** | Chat interface + LLM responses | ~2h | N/A — nothing works without this |
| **P0 – Core** | Memory Negotiation Engine (detect → propose → user decides → store) | ~4h | N/A — this *is* the PS |
| **P0 – Core** | Conversational renegotiation ("forget that", "only for now") | ~2h | Only cut if P0 chat+negotiation isn't stable by Hour 12 |
| **P0 – Core** | Memory Dashboard (view + edit + delete existing memories) | ~3h | N/A — answers "no way to see what's remembered" |
| **P1 – Should-have** | Memory Expiration (auto-expire session/7-day memories) | ~1.5h | Cut logic, keep schema field — fake it in demo if needed |
| **P1 – Should-have** | Timeline (git-style history of memory actions) | ~2h | Degrade to a simple activity log list if time-boxed |
| **P2 – Stretch** | Sensitivity Meter (Low/Med/High/Critical) | ~1.5h | Cut first — rule-based version is cheap, do it only if ahead of schedule |
| **P2 – Stretch** | Memory Graph (relationship visualization) | ~2–3h | Cut first if behind — highest build risk, lowest PS weight |

**Rule for the team:** By Hour 14 you must have a *deployed URL* where negotiation + dashboard work end-to-end, even with placeholder styling. Polish and P2 features only happen after that checkpoint. A judge who can't click a live link loses you more points than a missing graph visualization.

---

## 2. Finalized Tech Stack (with justification)

| Layer | Choice | Why (not the alternative) |
|---|---|---|
| Frontend | **React (Vite) + Tailwind CSS** | Fast HMR, no Next.js SSR complexity you don't need in 24h |
| Backend | **Node.js + Express** | Same language as frontend — no context-switching cost vs. FastAPI; team moves faster when everyone reads every file |
| Database | **MongoDB Atlas (free tier)** | Schema-flexible — memory objects will change shape as you iterate; instant cloud hosting, no local DB setup/deploy step |
| LLM | **Gemini 1.5 Flash or GPT-4o-mini via API** | Cheap + fast enough for real-time chat; Flash/mini specifically chosen over larger models to keep negotiation-turn latency low |
| Auth | **Simple JWT + single demo user (skip Firebase)** | Firebase Auth setup + config eats 30–45 min you don't have; a hardcoded demo login is judge-acceptable for a 24h hackathon and removes a whole external dependency |
| Realtime UI | **Plain REST + polling/optimistic UI** (not WebSockets) | Sockets add reconnection/state-sync bugs; not needed for a single-user chat demo |
| Hosting | **Frontend: Vercel · Backend: Render (or Railway)** | Both have zero-config Git-push deploys — critical for "deploy-ready" requirement with no DevOps time budget |

**Justification note for judges:** the stack choice itself should be framed in your write-up as a *design decision*, not an accident — you optimized for demo reliability and iteration speed over architectural purity, which is the correct trade-off for a 24-hour human-centered design hackathon where the judged artifact is the interaction, not the infra.

---

## 3. System Architecture (deploy-ready shape)

```
┌─────────────┐      HTTPS       ┌──────────────────┐
│  React SPA  │ ───────────────▶ │  Express API      │
│  (Vercel)   │ ◀─────────────── │  (Render)          │
└─────────────┘      JSON        └────────┬──────────┘
                                           │
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
1. User sends message → `POST /api/chat`
2. Backend calls LLM twice in parallel (or one call with structured output): (a) generate the assistant's reply, (b) run **memory extraction** on the message.
3. If extraction returns a candidate memory → backend attaches a `negotiation_prompt` payload to the response instead of auto-saving.
4. Frontend renders the assistant reply **and** an inline negotiation card ("Remember this — Forever / 1 Week / This chat only / No").
5. User's choice → `POST /api/memories/:id/decide` → memory + `memory_events` row written in one transaction.
6. Dashboard reads `GET /api/memories` (current state) and `GET /api/memories/:id/timeline` (event history) independently, so the chat flow is never blocked by dashboard logic.

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
  retention: String,        // "permanent" | "temporary" | "session" | "declined"
  expiresAt: Date | null,   // null = never expires
  status: String,           // "active" | "expired" | "forgotten"
  sourceMessageId: ObjectId,
  createdAt, updatedAt
}

// MemoryEvent — append-only audit log powering the Timeline
MemoryEvent {
  _id, memoryId, userId,
  action: String,   // "proposed" | "accepted" | "declined" | "updated" | "expired" | "forgotten"
  detail: String,   // human-readable, e.g. "retention changed permanent → 7 days"
  createdAt
}

// MemoryEdge — relationship graph (P2 stretch)
MemoryEdge {
  _id, userId, memoryIdA, memoryIdB, relation: String, weight: Number
}
```

**Non-negotiable rule:** every write to `Memory` happens inside the same function that writes a matching `MemoryEvent` — never two separate calls from the frontend. This guarantees the Timeline can never drift out of sync with actual state, which is exactly the kind of "legible, trustworthy system behavior" the PS is judging.

---

## 5. Feature Implementation Detail, PoC, and Justification

### 5.1 Memory Negotiation Engine (P0 — the core of the whole project)

**Justification:** This is a near word-for-word match to the PS ("long-term, discarded, or scoped to a single session") — per your own design report this is the single strongest-scoring design decision. It must be flawless.

**Extraction prompt (system prompt for the LLM, run alongside the normal chat reply):**
```
You are a memory-detection module. Given the latest user message and short
conversation context, decide if it contains a durable, personal fact worth
remembering (preferences, goals, identity, ongoing plans). Ignore small talk,
questions, and anything already known.

Return strict JSON only:
{ "hasMemory": boolean, "content": string|null, "category": string|null,
  "reason": string }

Be conservative: only flag facts a thoughtful assistant would actually want
to recall next week. Do not flag every sentence.
```

**Negotiation UI copy pattern (reuse everywhere, don't reinvent per-feature):**
> "I noticed: **{content}**. Remember this — **Forever**, **1 Week**, **This chat only**, or **No thanks**?"

**PoC to demonstrate to mentors during the Mentor Evaluation Round:**
1. Type "I'm allergic to peanuts" → negotiation card appears within ~2s.
2. Click "Forever" → toast confirms, dashboard shows the memory instantly.
3. Type "Actually, forget the peanut thing" in plain language → system detects intent, shows a confirm chip, memory moves to `forgotten` status, Timeline logs it.
4. Open a **new session** → ask something depending on step 3's memory → assistant correctly does *not* reference it.

This four-step PoC alone demonstrates consent, control, session-scoping, and revocation — the entire PS in under a minute, which is exactly what you want ready for the judging Q&A.

### 5.2 Conversational Renegotiation ("forget that", "only for now")

**Justification:** Your own design report flags this as the *cheapest, highest-leverage gap* — "the difference between a consent form and an actual negotiation." Do not skip this even under time pressure; it's worth more per build-hour than the Memory Graph.

**Implementation approach (keep it simple — don't build a full NLU pipeline):**
- Run a lightweight intent-classification prompt on every user message *before* the normal chat reply:
```
Classify this message as one of: FORGET_MEMORY, RESCOPE_MEMORY, NONE.
If FORGET_MEMORY or RESCOPE_MEMORY, extract which stored memory (from this
list: {list of current memory contents}) it refers to, and the new scope if any.
Return JSON: { "intent": string, "targetMemoryId": string|null, "newRetention": string|null }
```
- If intent ≠ NONE, short-circuit the normal chat flow and show a confirmation chip instead of a generic reply. This keeps the feature demo-able without a dedicated NLU model.

### 5.3 Memory Dashboard (P0)

**Justification:** Directly answers the PS's stated problem: *"most users have no meaningful way to see what an AI remembers about them."* This is not a nice-to-have settings page — it's half the grading rubric.

**Required capabilities (all four, not just a read-only list):**
1. List all active memories grouped by category.
2. Inline edit of retention (permanent ↔ 7 days ↔ session) *after the fact* — closes the gap your report explicitly flagged ("no place to change a memory's retention after the fact").
3. One-click "Forget this" per memory (writes a `forgotten` MemoryEvent, doesn't hard-delete — keep the audit trail, that's more trustworthy for judges than silent deletion).
4. Filter/search bar — trivial to build, disproportionately improves perceived polish.

### 5.4 Memory Expiration (P1)

**Justification:** Directly the "Data Retention" keyword. Simple to build, don't overthink it.

```js
// Runs on server start (cron alternative) + checked lazily on every /api/memories call
async function expireStaleMemories(userId) {
  await Memory.updateMany(
    { userId, status: "active", expiresAt: { $ne: null, $lte: new Date() } },
    { $set: { status: "expired" } }
  );
  // + write a MemoryEvent per expired memory for Timeline continuity
}
```
Checking lazily on read (instead of a real cron job) removes an entire infra concern — perfectly fine for a 24h demo, and honestly a valid production pattern too.

### 5.5 Memory Timeline (P1)

**Justification:** Answers "legible... ongoing, visible part of the interaction," and it's cheap because `MemoryEvent` writes are already happening as a side effect of 5.1–5.4.

**PoC:** the four-step negotiation demo above should visibly populate three timeline rows (`proposed` → `accepted` → `forgotten`) with no extra work — it's a read view over data you're already writing.

### 5.6 Sensitivity Meter (P2)

**Justification:** Adds a dimension the PS implies (Privacy keyword) but doesn't explicitly require — build only if P0/P1 are done and deployed.

**Fastest viable version — rule-based, not LLM-based** (your own report recommends this for hackathon speed):
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
Dashboard summary: `🟢 Low · 🟡 Medium · 🔴 High · ⚫ Critical` counts — a one-line component, high visual payoff.

### 5.7 Memory Graph (P2 — stretch, cut first)

**Justification:** Your report correctly flags this as highest build risk, lowest PS weight. Only attempt after everything above is deployed and stable.

**Cheapest viable version (skip embeddings, skip React Flow if short on time):** simple shared-category or shared-keyword edges (`if two memories share a category or an overlapping noun, draw an edge`), rendered with `react-flow` using auto-layout. If Hour 20 arrives and this isn't started, **cut it** and mention it in "Future Work" instead — a documented, well-reasoned cut is worth more to judges than a broken graph on screen.

---

## 6. 24-Hour Hour-by-Hour Roadmap

*(Adjust start time to your actual kickoff — this assumes a 4-person team, roles: Backend, Frontend, LLM/Prompt+Data, Design/Docs.)*

| Hours | Backend | Frontend | LLM/Prompts + DB | Design/Docs |
|---|---|---|---|---|
| 0–1 | Repo scaffold, Express + MongoDB Atlas connect, deploy skeleton to Render *immediately* | Vite+Tailwind scaffold, deploy skeleton to Vercel *immediately* | Finalize schemas (Sec. 4), get LLM API key working with a hello-world call | Finalize wireframes for Chat + Negotiation card + Dashboard |
| 1–4 | `/api/chat` route, message persistence | Chat UI (message list, input box, streaming/typed reply) | Extraction prompt (5.1), test against 15 sample messages | User persona + journey map for design doc |
| 4–8 | Negotiation endpoints (`propose`, `decide`), MemoryEvent writes | Negotiation card component + toast confirmations | Tune extraction prompt precision (avoid over-flagging) | Draft Design Document sections 1–4 (problem, lit review skeleton, solution) |
| 8–10 | **Checkpoint: deploy full negotiation loop end-to-end** | Wire negotiation card to live API | Renegotiation intent classifier (5.2) | — |
| 10–14 | Dashboard API (`GET/PATCH/DELETE /memories`), expiration check | Dashboard UI: list, inline edit, forget button, filters | — | Start Interface Design section (screenshots as you go) |
| 14 | **HARD CHECKPOINT — full P0 stack must be live on the deployed URL** ||| |
| 14–17 | Timeline API | Timeline UI (simple vertical list is fine) | Sensitivity rules (5.6) if ahead of schedule | Technical architecture diagram, Results/Discussion draft |
| 17–19 | Buffer / bug fixes | Buffer / bug fixes / mobile responsiveness pass | Memory Graph (5.7) *only if ahead* | Finalize Design Doc, Future Work |
| 19–21 | Polish + error handling (empty states, API failures) | Polish + empty states + loading skeletons | Final prompt tuning against demo script | Slides (8–10) built from finished screenshots |
| 21–22 | Record demo video (2–3 min) covering the 5.1 four-step PoC | — | — | AI Usage Declaration filled honestly |
| 22–23 | Final deploy check from a clean browser/incognito | Final deploy check | — | Proofread design doc, export as .docx |
| 23–24 | **Submit**: prototype link, video, design doc, AI usage declaration | | | |

Build the deploy pipeline in **Hour 0–1**, not at the end — a project that has been live on a real URL since hour 1 never has a "does it even deploy" crisis at hour 23.

---

## 7. Deployment Checklist ("deploy-ready" requirement)

- [ ] Backend on Render/Railway with env vars set (`MONGODB_URI`, `LLM_API_KEY`, `JWT_SECRET`) — never hardcode keys in committed code
- [ ] Frontend on Vercel with `VITE_API_URL` pointing at the deployed backend, not `localhost`
- [ ] CORS configured on Express to allow the Vercel domain
- [ ] MongoDB Atlas network access set to allow all IPs (0.0.0.0/0) for the demo — fine for a hackathon, note it as a known simplification in Future Work
- [ ] One seeded demo account so judges/mentors can log in without registering
- [ ] Smoke-test the full negotiation loop in an incognito window right before submission — the most common last-hour failure is a stale env var or a CORS block that only shows up on a fresh browser

---

## 8. If You're Ahead of Schedule — Extra Ideas Worth the Time

These are ranked by leverage (PS-alignment gained ÷ hours spent), not by novelty:

1. **Memory export / "download what you know about me"** (~1h) — a `GET /api/memories/export` returning JSON/CSV. Directly reinforces "Consent" and "Data Retention" and is nearly free given your schema already exists. High leverage, very cheap.
2. **"Why did you remember this?" explainability chip** (~1h) — clicking a memory in the dashboard shows the original source message and the extraction reasoning your LLM already returns in `reason`. Reinforces "Transparent and explainable," one of the hackathon's explicit guideline values, and needs zero new data — you already generate the string.
3. **Bulk "forget everything from this session"** (~30 min) — one button, one query (`updateMany` on messages/memories tagged with a `sessionId`). Strong, visible demonstration of user agency for very little build cost.
4. **Retention change via drag or slider instead of buttons** (~1–2h) — nice interaction polish, but purely cosmetic; only do this after items 1–3 and only if the core is rock solid. Lower leverage than it looks.

Do **not** add: voice input, multi-agent orchestration, or a second LLM persona — none map to PS keywords and all add deployment risk in the final hours.

---

## 9. Mapping This Plan to the SIGCHI Design Document Template

So the docs team isn't guessing which content goes where when filling the submission template:

| Design Doc Section | Pull content from |
|---|---|
| 1.1–1.2 Problem Statement/Description | Section 1 of your existing design report, verbatim mostly |
| 2. Literature Review | Not covered here — assign to Design/Docs role early (Hour 4–8 slot), needs 5 HCI/privacy papers (search ACM CHI proceedings on memory, personalization, consent UX) |
| 3. Proposed Solution | Section 3–4 of your design report + this plan's Section 5 |
| 4. Target Users / 5. Persona | New — write during Hour 1–4 alongside wireframes |
| 5. User Journey | This plan's Section 5.1 PoC steps, reframed as current-vs-proposed table |
| 5. Design Process | Reference the scoring/critique your team already did in the design report — judges respond well to seeing iteration reasoning, not just a final answer |
| 7. Interface Design | Screenshots taken during Hour 10–17 as features come online |
| 11. Technical Architecture | Section 3 of this plan (the diagram) |
| 14. Results and Discussion | Fill after build — be honest about what shipped vs. what's Future Work |
| 15. Future Work | Anything cut per Section 1's cut rules, plus Section 8 ideas not attempted |

---

## 10. Judging Alignment Recap

Every feature above ties back to a PS keyword the guide and your own design report both emphasize:

**AI Memory** → Memory model · **Personalization** → extraction engine · **User Control** → Dashboard edit/forget · **Consent** → Negotiation Chat · **Privacy** → Sensitivity Meter · **Memory Visualization** → Dashboard + Timeline (+ Graph if built) · **Context-Awareness** → session-scoped memory respected across new sessions · **Data Retention** → Expiration engine.

The single highest-leverage thing to get right, per your own report's harshest critique: make negotiation feel **ongoing**, not a one-time popup. If the Hour 4–8 renegotiation feature (5.2) works cleanly, that's the moment in the demo where judges will feel the system actually *negotiates* rather than just asks permission once — lead your live demo and pitch with that moment.
