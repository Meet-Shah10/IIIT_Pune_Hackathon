# MemCommit

> An intelligent, context-aware AI chat application that gives users full transparency and control over what an AI assistant remembers about them.

MemoryVault bridges the gap between conversational AI and long-term personalization. Unlike standard chatbots that lose context when a session ends, MemoryVault proactively extracts, categorizes, and securely stores facts about the user — while putting the user in complete control of what's remembered, for how long, and why.

Built for **ACM SIGCHI Hackathon for Human-Centered Design** (Problem Statement PS 06).

---

## Table of Contents

- [Overview](#overview)
- [Target Audience](#target-audience)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [UI/UX Design Principles](#uiux-design-principles)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

Most AI assistants extract and store personal data silently — users have no visibility into what's remembered, no control over retention, and no easy way to audit or delete it. MemoryVault treats memory as a **negotiation**, not an extraction. Every stored fact is transparent, editable, time-bound, and explainable.

---

## Target Audience

- **Power Users & Professionals** who want their AI assistant to remember preferences, workflows, and personal context across sessions.
- **Privacy-Conscious Users** who demand full transparency and control over what data is stored, why it's stored, and how long it's retained.

---

## Core Features

###  Smart Chat Interface
- Conversational AI powered by **Llama 3.1 8B Instruct** via the NVIDIA NIM API.
- **Memory Toggle** — a prominent "Save Memory" switch above the chat input to instantly enable/disable memory extraction.
- **Mini Mascot** — an animated SVG robot that reacts to the memory toggle and narrates state changes using the Web Speech API (TTS).

###  Automated Memory Extraction (Backend)
- Real-time parsing of user messages to extract discrete facts, preferences, habits, and personal details.
- Every memory is categorized into one of 6 canonical types: **Health, Preference, Habit, Personal, Education, Miscellaneous**.
- Each memory is assigned a **sensitivity risk score** (Low / Medium / High) that governs its retention policy and visualization.

###  Dashboard Overview & Analytics
- Real-time stats: total memories saved, pending expirations, total data purged.
- **Upcoming Purges** table showing memories scheduled for auto-deletion.
- **Privacy Classification Donut Chart** (pure CSS `conic-gradient`) visualizing sensitivity distribution — Green (Low), Yellow (Medium), Red (High).

###  Memory Relationship Map
- Interactive node graph connecting the central "User" node to the 6 memory categories.
- Click a category to filter the detailed memory list.
- **Memory Management Console** — view extracted context, risk level, and directly **Edit** or **Forget** any memory.

###  Memory Lane (Commit Timeline)
- Git-commit style chronological ledger of every memory event.
- Color-coded action strips:
  - 🟢 Green — Created / Extracted
  - 🔵 Blue — Updated
  - 🔴 Red — Forgotten / Expired
- **Sensitivity Assessment Modal** — click any timeline event to see *why* the AI stored it (reasoning + access scope), with modal theming that adapts to risk level (Emerald / Amber / Rose).

---

## Tech Stack

### Frontend
| Component | Technology |
|---|---|
| Framework | React.js + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Voice | `window.speechSynthesis` (Web Speech API) |

### Backend
| Component | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| AI Engine | NVIDIA NIM API — `meta/llama-3.1-8b-instruct` |

---

## UI/UX Design Principles

- **Modern & Premium Aesthetics** — clean white backgrounds, subtle shadows, rounded corners, smooth transitions.
- **Micro-Interactions** — hover effects, scale transforms on timeline nodes, bouncy mascot animations.
- **Color Psychology** — strict semantic color coding (Green = Safe, Yellow = Warning, Red = Danger) across the entire app for intuitive comprehension.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- NVIDIA NIM API key

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/memoryvault.git
cd memoryvault

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your_mongodb_connection_string
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
PORT=5000
```

### Running Locally

```bash
# Start backend (from /server)
node server.js

# Start frontend (from /client)
npm run dev
```

The app will be available at `http://localhost:5173` (frontend) with the API running on `http://localhost:5000`.

---

## Project Structure

```
memoryvault/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Chat UI, Mascot, Dashboard, Timeline
│   │   ├── pages/
│   │   └── ...
├── server/                  # Node.js + Express backend
│   ├── models/              # Mongoose schemas
│   ├── routes/               # API routes
│   ├── controllers/
│   └── ...
└── README.md
```


## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.

---

## License

This project is submitted as part of the ACM SIGCHI Hackathon for Human-Centered Design and is intended for demonstration purposes.