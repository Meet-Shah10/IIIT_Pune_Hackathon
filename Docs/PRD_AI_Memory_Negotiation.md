# **Product Requirements Document (PRD)** 

AI Memory Negotiation System 

**Target Event: ACM SIGCHI Hackathon for Human-Centered Design** 

**Problem Statement ID: PS 06** 

**Timeline: 24-Hour Execution Sprint** 

## **1. Executive Summary & Vision** 

As AI assistants become highly personalized, they implicitly extract and store user data. Currently, this process operates as a "black box" where users have zero agency over what the system remembers, how long it retains it, or how sensitive that data is. **This product shifts AI memory from a passive** 

#### **extraction process to an active, transparent negotiation.** 

By integrating Human-Computer Interaction (HCI) principles directly into the chat flow, the system requires explicit, context-aware consent before storing facts, while providing a clear dashboard for postfacto review and modification. The objective is to build a highly transparent, consent-driven LLM wrapper. 

## **2. Core Principles (HCI & SIGCHI Alignment)** 

- **Transparency over Automation:** The system must never silently hoard data. Memory extraction must be visible. 

- **In-Context Agency:** Settings toggles are obsolete. Memory rules are established at the point of conversation. 

- **Explainability:** The user must always be able to see _why_ the AI knows something and _when_ it learned it. 

- **Granular Expiry:** Data retention is treated as a spectrum (Session, 7-Days, Permanent), not a binary switch. 

## **3. System Architecture & Tech Stack** 

The system is designed as a Full-Stack Web Application functioning as a smart wrapper around an LLM API. The stack is optimized for rapid deployment, relational logic handling, and real-time UI updates. 

|**Component**|**Technology Choice**|**Purpose / Rationale**|
|---|---|---|
|**Frontend (UI/**<br>**UX)**|Next.js, React,<br>Tailwind CSS|Provides rapid UI rendering, server-side capabilities,<br>and modular component architecture for the Chat<br>Interface and Timeline Dashboard.|
|**Backend (API/**<br>**Logic)**|Node.js, Express.js|Handles API routing, LLM prompt orchestration<br>(memory extraction vs. conversational reply), and<br>business logic.|
|**Database /**<br>**ORM**|MongoDB Atlas<br>(NoSQL) with Prisma<br>ORM|Flexible document storage for varied memory schemas;<br>Prisma ensures type safety and rapid database<br>querying during the hackathon sprint.|
|**AI / LLM**<br>**Engine**|OpenAI API (GPT-4o-<br>mini) or Gemini API|Powers the conversational engine and the background<br>"Memory Extraction" structured JSON output.|
|**Deployment**|Vercel (Frontend),<br>Railway (Backend)|Zero-friction CI/CD pipelines to ensure a live prototype<br>by the submission deadline.|



#### **Data Flow Architecture** 

[ User Input ] --> [ Next.js Frontend ] --> [ Node.js/Express Backend ] | 

+--> [ Parallel LLM Tasks: 1. Generate Chat Reply & 2. Extract JSON Fact ] 

| +--> [ Frontend renders Reply + "Negotiation Prompt" if Fact detected ] | 

+--> [ User Consent Action ] --> [ MongoDB via Prisma ] --> [ Timeline UI Update ] 

## **4. Detailed Feature Specifications** 

### **4.1 The Memory Negotiation Chat (Must-Have)** 

**Description:** The core interaction mechanic. When the LLM detects a personal fact, the UI interrupts the standard chat flow with an inline negotiation module. 

- **Trigger:** LLM identifies user data (e.g., "I'm travelling to Pune tomorrow"). 

- **UI Element:** An inline card appears immediately below the user's message, before the AI responds. 

- 

- **Interaction Options:** Buttons for: _Remember Permanently_ , _Keep for 1 Week_ , _This Session Only_ , _Nevermind_ . 

- **Conversational Override:** Users can type "Forget what I just said" to trigger a deletion intent. 

### **4.2 Git-Style Memory Timeline (Must-Have)** 

**Description:** A vertical timeline dashboard (accessible via a sidebar toggle) that logs every memory transaction. 

- **Data Displayed:** Event Timestamp, Action Type (Created, Updated, Deleted, Expired), and the Memory Content. 

- **Visual Metaphor:** Similar to a commit history. It makes the invisible visible. 

- 

- **CRUD Actions:** Users can click any active memory in the timeline to edit its contents or change its expiration date. 

### **4.3 Automated Memory Expiration Engine (Must-Have)** 

**Description:** A backend mechanism that enforces data retention policies. 

- **Logic:** When a memory is saved with a "1 Week" constraint, a `expiresAt` timestamp is attached. 

- 

- **Execution:** On initialization of a new session, the backend checks for and purges expired memories. 

- 

- **Feedback:** Purged memories are logged in the Timeline as "System Expired", providing closure to the user. 

### **4.4 Privacy & Sensitivity Meter (Should-Have)** 

**Description:** Automatic classification of extracted facts to raise user awareness regarding the data they are sharing. 

- **Classification logic (via LLM Prompt):** 

   - **Low** (Preferences, Hobbies) 

   - **Medium** (Locations, Goals) 

   - 

   - **High** (Health, Financials, Phone Numbers) 

- **UI Element:** Visual indicators next to negotiated facts, acting as a "nutrition label" for data privacy. 

## **5. User Experience (UX) & Design Thinking** 

### **5.1 Target Persona** 

**Primary User:** Tech-literate professionals or students who heavily utilize AI assistants for productivity but are highly skeptical of large tech companies profiling them. They experience "privacy fatigue" from complex settings menus. 

### **5.2 The User Journey Improvement** 

|**Stage**|**Current Paradigm (Pain Point)**|**Proposed Solution (Our Product)**|
|---|---|---|
|Data|AI silently records facts in the|AI explicitly asks for permission in real-time|
|Extraction|background. User is unaware.|within the chat fow.|
|Data<br>Retention|Data is kept forever by default until<br>manually deleted.|User assigns an expiration date (session,<br>week, forever) upfront.|
|Data Audit|User must dig through nested account<br>settings to fnd a CSV of their data.|User clicks a sidebar toggle to see a<br>chronological, Git-style history of memory<br>events.|



**Design Constraint Check:** No "AI Slop." The interface must be clean, deliberate, and accessible. Avoid unnecessary animations. Use high-contrast text and ensure all buttons are navigable via keyboard for accessibility compliance. 

## **6. Implementation Roadmap (24-Hour Hackathon Strategy)** 

To ensure delivery before the 12:00 PM deadline, follow this strict development sequence: 

1. **Hour 0-2 (Setup):** Initialize Next.js frontend and Node/Express backend. Scaffold MongoDB schemas using Prisma (Memory and Timeline Event models). 

2. **Hour 2-6 (Core LLM & API):** Implement the dual-prompt system. Prompt 1: Conversational AI. Prompt 2: JSON Fact Extractor. Ensure Express successfully routes data between the LLM and the React frontend. 

3. **Hour 6-12 (Frontend Interaction):** Build the Chat UI. Implement the inline Negotiation Component that interrupts the flow when the Fact Extractor returns data. 

4. **Hour 12-16 (Timeline & Persistence):** Build the Sidebar Timeline. Connect the frontend actions (Remember, Forget) to MongoDB CRUD routes. 

5. **Hour 16-20 (Refinement):** Implement the Expiry logic and the Sensitivity Meter badges. Style with Tailwind CSS. 

6. **Hour 20-24 (Documentation & Polish):** Finalize the mandatory SIGCHI UX Case Study document. Record the 3-minute demo video showing the interaction flow. Deploy to Vercel/Railway. 

