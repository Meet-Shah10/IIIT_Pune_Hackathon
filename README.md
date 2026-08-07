# AI Memory Negotiation System
**SIGCHI Hackathon — PS06: Negotiating AI Memory**

> A chatbot that negotiates what it remembers with you — in real time, in plain language, with a full audit dashboard.

## Stack
| Layer | Tech |
|---|---|
| Frontend | React (Vite) + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Mongoose) |
| LLM | Gemini Flash |
| Hosting | Vercel (FE) + Render (BE) |

## Project Structure
```
/frontend    — React SPA (Vite + Tailwind v4)
/backend     — Express REST API
/Docs        — PRD, Tech Spec, UI Guidelines, Implementation Plan
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm run dev
```

## Reference Docs
- [`Docs/AI_Memory_Negotiation_Implementation_Plan.md`](Docs/AI_Memory_Negotiation_Implementation_Plan.md) — master implementation plan (bible)
- [`Docs/TECH_SPEC.md`](Docs/TECH_SPEC.md) — authoritative stack + conventions
- [`Docs/UI_GUIDELINES.md`](Docs/UI_GUIDELINES.md) — design system
- [`Docs/PRD_AI_Memory_Negotiation.md`](Docs/PRD_AI_Memory_Negotiation.md) — product requirements
