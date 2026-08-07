# PROJECT_CONTEXT.md

## Project Name
AI Memory Negotiation System

## Hackathon
SIGCHI Hackathon — Problem Statement 06: "Negotiating AI Memory"
24-hour build window. Submission = working prototype + demo video + design doc.

## What This Project Is
A chatbot that, instead of silently remembering things about the user, **negotiates** memory with them in real time. When the AI detects something worth remembering, it asks: *forever, for a week, for this conversation only, or not at all* — and the user can also say "forget that" or "only remember this for now" in plain language at any point, not just at capture time. Everything the system remembers, forgets, or expires is visible and editable in a dashboard.

## Why This Exists (the actual problem, not just the pitch)
Most AI products today accumulate memory about users invisibly. There is no consent step, no visible record of what's stored, and no easy way to revoke it. This project treats memory as something the user actively controls — an ongoing negotiation, not a background process and not a one-time settings toggle.

## Goal
Build a **fully working, end-to-end, deploy-ready application** — not a frontend mockup, not a UI shell with fake data, not a slide-deck concept. Every screen shown to judges must be backed by a real API call and a real database write.

## Core Philosophy
- **Every feature must work end-to-end.** A negotiation card that isn't wired to a real backend endpoint is worse than not having the feature — it will be caught in the live demo or Q&A.
- **Never fake functionality.** No hardcoded "sample memories" pretending to be live data. No buttons that show a toast but don't persist anything. If something isn't built yet, it should visibly not exist — not pretend to work.
- **Write production-quality code**, scoped to a 24-hour reality. Production-quality does not mean over-engineered — it means correct, readable, and honest about what it does.
- **The chatbot is the entry point, not the product.** The Memory Negotiation Engine — extraction, consent, retention, dashboard, timeline — is the actual thing being judged. Don't over-invest in chat UI polish at the expense of the negotiation logic.

## Priority Order (when time is short, build in this order)
1. **Backend correctness** — the negotiation engine, memory CRUD, and event logging must be right. This is the core mechanic the PS is scored on.
2. **Logic** — extraction quality, renegotiation intent detection, expiration behavior.
3. **UX** — the negotiation flow must be understandable and low-friction; a confusing consent flow defeats the point of the PS.
4. **Styling** — visual polish is last. A plain but functional and legible UI beats a beautiful UI wired to fake data.

## Explicit Non-Goals / What NOT to Do
- Do **not** build a settings-page-only version of this ("Manage Memories" buried in a menu). The PS explicitly rejects that framing — memory control must be visible and ongoing, part of the conversation itself.
- Do **not** add features outside the locked scope (see the implementation plan's tier list) without checking against the 24-hour budget first. No voice input, no multi-agent orchestration, no second LLM persona — none map to the PS and all add deployment risk.
- Do **not** silently hard-delete memories on "forget." Mark them `forgotten` and keep the audit event — the timeline/audit trail is itself a feature the PS is scored on ("legible... system behavior").
- Do **not** use `localStorage`/`sessionStorage` for anything that needs to persist or be demoed as "the AI remembers this" — that's not real memory, it's a browser trick, and it will not survive a fresh device demo.
- Do **not** hardcode API keys, database URIs, or secrets in committed code. Use environment variables from hour 1.
- Do **not** let styling/animation work block backend work. If a teammate is idle waiting on an API, they should be building the next screen's static layout against mock props — not inventing new scope.
- No TODOs, no placeholder text like "Lorem ipsum" or "Coming soon" in anything shown to judges. If a feature isn't finished, it's simply not shown, and it goes in the design doc's "Future Work" section instead.
- No mocked API responses unless explicitly agreed by the team as a deliberate, time-boxed fallback (e.g., "if the LLM extraction prompt isn't reliable by hour 10, fall back to a simpler keyword-based extractor" — that's a real fallback, not a fake one, and should be documented as such).

## Definition of Done for Any Feature
A feature is "done" only when:
1. It has a real API endpoint backing it (see `TECH_SPEC.md` for conventions).
2. The data survives a page refresh (i.e., it's in MongoDB, not component state).
3. It behaves correctly in a fresh incognito window against the deployed URL, not just `localhost`.
4. Errors are handled — a failed LLM call or a failed DB write shows a real error state, not a silent failure or an infinite spinner.

## Reference Documents
- `AI_Memory_Negotiation_Implementation_Plan.md` — full 24-hour roadmap, data models, feature-by-feature build spec, PoC steps.
- `TECH_SPEC.md` — exact stack, folder structure, and conventions. Don't deviate without a reason.
- `UI_GUIDELINES.md` — visual system. Don't invent new colors/components ad hoc.
