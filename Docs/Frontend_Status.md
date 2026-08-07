# Frontend Implementation Status: MemoryVault

This document serves as a detailed record of all frontend features, UI components, and UX patterns implemented for the **MemoryVault** (AI Memory Negotiation System) as of Phase 3. 

The frontend relies heavily on a "Minimal Gallery" (Perplexity-inspired) Light Mode aesthetic, prioritizing massive whitespace, legible typography (`Geist` / `Inter`), and subtle drop shadows to create a clean, trustworthy interface.

---

## 1. App Shell & Navigation Architecture
**Files:** `Layout.jsx`, `Sidebar.jsx`, `index.css`

- **Global Theming:** Fully migrated to a Light Mode aesthetic. All dark mode variables and heavy backgrounds have been replaced with a pristine `bg-white` canvas for the main stage and a muted `bg-zinc-50` for secondary elements.
- **Two-Column Layout (`Layout.jsx`):**
  - **The Archive (Left Sidebar):** A muted navigation drawer. It contains:
    - Minimalist MV Logo and toggle.
    - Prominent "New Session" button.
    - Primary Navigation links: **Computer** (Chat Engine) and **Memory Vault** (Dashboard).
    - Chat session history list.
    - User Profile placeholder anchored at the bottom.
  - **The Stage (Main Canvas):** The primary workspace that shifts responsively and hides scrollbars for a distraction-free experience.

---

## 2. Interaction Mechanisms & Chat Engine
**Files:** `ChatPage.jsx`, `ChatWindow.jsx`, `MemoryInterceptCard.jsx`

- **Active Context Header (The Pinned Toggles):**
  - **Location:** Floating at the top center of the Chat Window (`ChatWindow.jsx`).
  - **UX Solution:** Replaces intrusive "Save this memory?" popups. It is a translucent pill containing two sleek, iOS-style toggle switches:
    1. **Extract & Store:** Controls whether the AI is allowed to write new memories to the database.
    2. **Use Profile:** Controls whether the AI reads from the stored memory profile to answer the current prompt.
  - **Micro-interactions:** The toggles feature smooth CSS transitions for a snappy, responsive feel.
- **Floating Input Bar (The Command Center):**
  - **Location:** Anchored at the bottom of the Chat Canvas.
  - **Design:** A pill-shaped, elevated container (`bg-white` with a `shadow-[0_2px_15px_rgba(0,0,0,0.06)]`) mimicking Perplexity's search bar.
  - **Features:** Auto-expanding text area, Plus attachment icon, Voice (Mic) icon, and a prominent solid submit arrow. Focus states seamlessly intensify the drop shadow.
- **Chat Feed Typography & Legibility:**
  - **User Bubbles:** Rendered in a soft `bg-zinc-100` block with delicate borders.
  - **Assistant Bubbles:** Seamlessly integrated directly onto the canvas with a clean left-aligned avatar.
  - **Hover Actions:** Both message types reveal ChatGPT-style quick actions on hover (Copy, Edit, Delete, Regenerate).
- **Inline Intercept Card:**
  - When the AI extracts a memory, a clinical `MemoryInterceptCard` renders beneath the AI's response to provide immediate visual confirmation of what was learned.

---

## 3. Memory Vault Dashboard & Audit Trail
**Files:** `DashboardPage.jsx`

The dashboard completely dismantles the "black box" of AI memory by exposing exactly what is stored and when it was modified.

- **Dashboard Layout:** A responsive CSS grid (`grid-cols-3`). Two columns dedicated to "Active Context" and one column dedicated to the "Audit Trail".
- **Active Context Cards (Stored Memories):**
  - Displays all currently held facts (mocked via `initialMemories`).
  - **Sensitivity Badges:** Each memory is color-coded by Privacy Sensitivity:
    - **High:** Red (`bg-rose-50 text-rose-700`)
    - **Medium:** Amber (`bg-amber-50 text-amber-700`)
    - **Low:** Green (`bg-emerald-50 text-emerald-700`)
  - **Category Tags:** Badges identifying the type of memory (e.g., `goal`, `health`, `preference`).
  - **Frictionless Revocation:** An explicit, immediate "Forget" button (Trash icon) located on the bottom action row of *every single memory card*. Clicking it immediately triggers a state update, instantly removing the memory from the UI to ensure absolute user control.
- **Git-Style Timeline (Activity Log):**
  - **Location:** Sticky column on the right side of the dashboard.
  - **Design:** A vertical, chronological audit trail mimicking a Git commit history (`border-l-2 border-zinc-200`).
  - **Nodes:** Accurately positioned, color-coded dots representing events:
    - **Blue Dot:** Memory Extracted (AI learned something).
    - **Red Dot:** Memory Revoked (User deleted something).
    - **Gray Dot:** Settings Updated / System Events.

---

## What is NOT yet implemented (Pending Backend Wiring)

The frontend is currently fully mocked using local state (`useState`) and static arrays to demonstrate the UI/UX. The following tasks remain for full integration:
1. **Live LLM Integration:** Wiring the chat input to the actual Gemini/GPT API endpoint via `useMutation`.
2. **Toggle Logic Routing:** Sending the state of the Active Context Toggles (`allowStorage`, `useContext`) in the API payload so the backend knows whether to trigger extraction or inject context.
3. **Database Integration (MongoDB):** Replacing the mock `initialMemories` and `auditEvents` with live data fetched via `react-query` from the Express API endpoints (`/api/memories` and `/api/events`).
4. **Conversational Revocation (Intent Classifier):** Wiring up the backend to parse user messages like "Forget what I just said" and subsequently deleting the relevant memory.
5. **Memory Expiration Logic:** Implementing the 7-day auto-expiry CRON jobs on the backend (with UI flags in the dashboard if needed).
