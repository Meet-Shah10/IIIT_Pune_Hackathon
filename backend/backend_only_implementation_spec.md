# AI Memory Negotiation — Backend-Only Build Spec (Terminal Testing Phase)

**Purpose of this doc:** Feed this directly to a coding AI (Claude Code, Cursor, etc.) to build the P0/P1 backend only — no frontend, no deploy. Everything must be testable with `curl` or Postman from a terminal. Frontend gets built in a later pass against these same endpoints.

**Scope cut for this phase:** Chat UI, Dashboard UI, Timeline UI, Memory Graph, drag/slider retention UI — all excluded. Their underlying API endpoints and data are still built, since the frontend will just consume them later.

---

## 1. Tech Stack (locked)

| Layer | Choice |
|---|---|
| Runtime | Node.js (v20+) + Express |
| Database | MongoDB Atlas (free tier) via Mongoose — cloud-hosted, no local DB install needed |
| LLM Provider | **NVIDIA NIM API** (OpenAI-compatible) |
| Auth | Skip for now — single hardcoded `userId` constant, no JWT, no login. Add auth later if time allows. |
| Testing | `curl` / Postman / Thunder Client only — no frontend this phase |

### NVIDIA NIM API details

- Base URL: `https://integrate.api.nvidia.com/v1`
- Endpoint: `POST /chat/completions` (OpenAI-compatible schema — same `messages` array shape as OpenAI/Anthropic-via-proxy)
- Auth header: `Authorization: Bearer nvapi-YOUR_KEY`
- Suggested model: `meta/llama-3.1-70b-instruct` (good balance of speed/quality; swap for a smaller model like `meta/llama-3.1-8b-instruct` if latency is a problem in testing — verify exact available model IDs by calling `GET /v1/models` with your key first, since the catalog changes)
- Store the key in `.env` as `NVIDIA_API_KEY` — **never commit it**
- Use the `openai` npm SDK pointed at the NVIDIA base URL (it's fully OpenAI-compatible), rather than hand-rolling fetch calls:

```js
import OpenAI from "openai";

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});
```

---

## 2. Features In Scope for This Phase

| # | Feature | Priority | Terminal-testable? |
|---|---|---|---|
| 1 | Memory extraction from a message (`POST /api/chat`) | P0 | ✅ curl a message, see extraction result in response |
| 2 | Negotiation decision endpoint (`POST /api/memories/:id/decide`) | P0 | ✅ curl the memory id + choice |
| 3 | Conversational renegotiation ("forget that", "only for now") | P0 | ✅ curl a follow-up message, see intent classification fire |
| 4 | Memory CRUD (list / edit retention / forget) | P0 | ✅ curl GET/PATCH/DELETE |
| 5 | Memory expiration (lazy check on read) | P1 | ✅ set a short expiry, wait, re-curl GET, confirm status flips |
| 6 | Timeline / audit log (`GET /api/memories/:id/timeline`) | P1 | ✅ curl after a few actions, confirm event rows |
| 7 | Sensitivity classification (rule-based) | P2 | ✅ included in memory object on read |
| 8 | Memory export (`GET /api/memories/export`) | Extra (high leverage) | ✅ curl, confirm JSON/CSV download |
| 9 | Bulk "forget everything from this session" | Extra | ✅ curl with a sessionId |
| 10 | "Why did you remember this" reasoning field | Extra | ✅ already in memory object, no separate endpoint needed |

**Not built this phase:** any React/HTML, Memory Graph, drag/slider UI, real auth, deploy pipeline.

---

## 3. Data Models (Mongoose schemas)

```js
// Memory
{
  _id,
  userId: String,       // hardcoded constant for now, e.g. "demo-user"
  sessionId: String,    // groups memories by chat session, needed for bulk-forget
  content: String,       // "Preparing for GATE 2027"
  category: String,      // "goal" | "preference" | "fact" | "identity"
  sensitivity: String,   // "low" | "medium" | "high" | "critical"
  retention: String,     // "permanent" | "temporary" | "session" | "declined"
  expiresAt: Date | null,
  status: String,        // "active" | "expired" | "forgotten"
  reason: String,        // LLM's stated reason for flagging this — powers "why did you remember this"
  sourceMessageId: ObjectId,
  createdAt, updatedAt
}

// MemoryEvent — append-only, powers Timeline
{
  _id,
  memoryId, userId,
  action: String,   // "proposed" | "accepted" | "declined" | "updated" | "expired" | "forgotten"
  detail: String,
  createdAt
}

// Message — raw chat log, needed so renegotiation classifier has context
{
  _id, userId, sessionId, role: "user" | "assistant", content, createdAt
}
```

**Rule:** every write to `Memory` happens in the same function as the matching `MemoryEvent` write — never two separate calls. Keeps Timeline from drifting out of sync.

---

## 4. Endpoints to Build

### `POST /api/chat`
Body: `{ userId, sessionId, message }`
1. Save the message to `Message`.
2. Call NVIDIA API with the extraction prompt (below) on the message + last few turns of context.
3. If `hasMemory: true`, do **not** auto-save — return a `negotiation_prompt` in the response payload instead.
4. Also call NVIDIA API with the normal chat-reply prompt (can be a second call, or ask for both in one structured-output call if you want to save a round trip).
5. Response shape:
```json
{
  "reply": "assistant's normal reply text",
  "negotiation_prompt": {
    "content": "Preparing for GATE 2027",
    "category": "goal",
    "reason": "User stated an ongoing exam preparation goal"
  }
}
```

**Extraction system prompt:**
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

### `POST /api/memories/propose`
Body: `{ userId, sessionId, content, category, reason, sourceMessageId }`
Creates a `Memory` with `status: "proposed"`-equivalent (or just create it with `retention: null` until decided) + a `proposed` `MemoryEvent`. This is the persistence step after `/api/chat` returns a `negotiation_prompt`.

### `POST /api/memories/:id/decide`
Body: `{ retention: "permanent" | "temporary" | "session" | "declined" }`
- Sets `retention`, computes `expiresAt` (7 days for `temporary`, session-end for `session`, `null` for `permanent`).
- If `declined`, set `status: "forgotten"` immediately.
- Writes a matching `MemoryEvent` (`accepted` or `declined`).
- Also runs the rule-based sensitivity classifier (Section 5) and stores it on the memory here.

### `POST /api/chat/renegotiate` (or fold into `/api/chat` as a pre-step)
Body: `{ userId, sessionId, message }`
Runs the intent-classification prompt **before** the normal chat reply:
```
Classify this message as one of: FORGET_MEMORY, RESCOPE_MEMORY, NONE.
If FORGET_MEMORY or RESCOPE_MEMORY, extract which stored memory (from this
list: {list of current memory contents}) it refers to, and the new scope if any.
Return JSON: { "intent": string, "targetMemoryId": string|null, "newRetention": string|null }
```
If `intent !== "NONE"`, short-circuit: return a confirmation payload instead of a normal reply, e.g.:
```json
{ "confirmation_needed": true, "intent": "FORGET_MEMORY", "targetMemoryId": "...", "summary": "Forget 'Preparing for GATE 2027'?" }
```
A follow-up `POST /api/memories/:id/decide` with `retention: "declined"` (or a dedicated confirm endpoint) then actually applies it.

### `GET /api/memories?userId=...`
Returns all `active` memories for the user, grouped by category if you want to do the grouping server-side (or return flat and let the future frontend group it).

### `PATCH /api/memories/:id`
Body: `{ retention }` — inline retention change after the fact. Recomputes `expiresAt`. Writes an `updated` `MemoryEvent` with a human-readable `detail` (e.g. `"retention changed permanent → 7 days"`).

### `DELETE /api/memories/:id`
Soft-delete: set `status: "forgotten"`, do not hard-delete the document. Writes a `forgotten` `MemoryEvent`.

### `GET /api/memories/:id/timeline`
Returns all `MemoryEvent` rows for that memory, sorted by `createdAt`.

### `GET /api/memories/export?userId=...&format=json|csv`
Returns all memories (any status) for the user in the requested format. For CSV, flatten the fields; a simple manual join is fine, no need for a CSV library for this scope.

### `POST /api/memories/forget-session`
Body: `{ userId, sessionId }`
Bulk soft-delete: `updateMany` on `Memory` where `sessionId` matches → `status: "forgotten"`, plus one `MemoryEvent` per affected memory for audit continuity.

### Expiration check (not a separate endpoint — a function called at the top of `GET /api/memories`)
```js
async function expireStaleMemories(userId) {
  const stale = await Memory.find({ userId, status: "active", expiresAt: { $ne: null, $lte: new Date() } });
  await Memory.updateMany(
    { userId, status: "active", expiresAt: { $ne: null, $lte: new Date() } },
    { $set: { status: "expired" } }
  );
  for (const m of stale) {
    await MemoryEvent.create({ memoryId: m._id, userId, action: "expired", detail: "Retention period ended" });
  }
}
```
Call this at the top of any `GET /api/memories*` handler before querying.

---

## 5. Sensitivity Classifier (rule-based — build this, not LLM-based)

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
Run this at decision time (in `/api/memories/:id/decide`) and store the result on the `Memory` document.

---

## 6. Terminal Test Script (what "done" looks like)

Run these in order against `http://localhost:PORT` once the server is up:

```bash
# 1. Send a message that should trigger memory detection
curl -X POST localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user","sessionId":"s1","message":"I am allergic to peanuts"}'
# → expect negotiation_prompt in response

# 2. Propose + persist it
curl -X POST localhost:3000/api/memories/propose \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user","sessionId":"s1","content":"Allergic to peanuts","category":"health","reason":"..."}'
# → note the returned _id as MEM_ID

# 3. Decide: keep forever
curl -X POST localhost:3000/api/memories/MEM_ID/decide \
  -H "Content-Type: application/json" \
  -d '{"retention":"permanent"}'

# 4. Confirm it shows up
curl "localhost:3000/api/memories?userId=demo-user"
# → sensitivity should read "critical" (matched the health rule)

# 5. Renegotiate in plain language
curl -X POST localhost:3000/api/chat/renegotiate \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user","sessionId":"s1","message":"actually forget the peanut thing"}'
# → expect confirmation_needed:true, targetMemoryId: MEM_ID

# 6. Confirm the forget
curl -X DELETE localhost:3000/api/memories/MEM_ID

# 7. Check timeline shows the full lifecycle
curl "localhost:3000/api/memories/MEM_ID/timeline"
# → expect rows: proposed → accepted → forgotten

# 8. Export
curl "localhost:3000/api/memories/export?userId=demo-user&format=json"

# 9. Bulk forget session
curl -X POST localhost:3000/api/memories/forget-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user","sessionId":"s1"}'
```

If all nine steps return sane responses, the backend is demo-ready and frontend work can start against a stable API.

---

## 7. Project Setup Checklist

- [ ] `npm init`, install `express`, `mongoose`, `openai`, `dotenv`, `cors`
- [ ] `.env` with `MONGODB_URI` and `NVIDIA_API_KEY` — add `.env` to `.gitignore` immediately
- [ ] MongoDB Atlas free cluster created, connection string tested with a hello-world script before building routes
- [ ] Confirm the NVIDIA key works with a raw curl call to `https://integrate.api.nvidia.com/v1/chat/completions` before wiring it into extraction/renegotiation prompts — isolates "my prompt is wrong" from "my key/network is wrong"
- [ ] All routes above built and manually curl-tested per Section 6 before any frontend work begins
