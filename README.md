# DoodleSync 🎨⚡

> **Multiplayer Drawing & Guessing Game for Remote Teams & Virtual Socials.**

DoodleSync is a modern, real-time multiplayer drawing and guessing platform inspired by the timeless gameplay mechanics of Skribbl.io, elevated with an original brand identity, a sleek modern UI, and collaborative features designed for distributed teams, company icebreakers, and virtual game nights.

---

## 🌟 Key Features

### Phase 1: Homepage & Player Studio ✅
- **🎨 Interactive Avatar Studio**
  - Powered by vector [DiceBear](https://www.dicebear.com/) cartoon avatars.
  - 4 distinct styles: **Robots**, **Emoji**, **Anime**, and **Adventurer**.
  - Left/right character cycling and an instant **Randomize Dice** button with smooth 3D rotation.
  - 8-color background badge palette selector.
- **🌍 Searchable Global Country & Language Selector**
  - Built with **shadcn/ui** combobox pattern.
  - Complete catalog of **50+ worldwide countries and locales**, sorted **A to Z**.
  - **Instant prefix search** (e.g., typing `"i"` immediately lists countries starting with "I" such as *Iceland, India, Indonesia, Ireland, Israel, Italy*).
- **💾 Persistent Player Storage**
  - Seamless state persistence using **Zustand** and browser `localStorage`.
  - Player username, custom avatar configuration, and selected language are saved automatically across reloads and future game screens.
- **📜 Official Game Rules & Interactive Modals**
  - Accessible dialog modals powered by `@radix-ui/react-dialog` (shadcn/ui primitives).
  - Complete 6-step official game guide, About info, Privacy Policy, Terms of Service, and Contact modal.
- **📱 Fully Responsive Across All Devices**
  - **Mobile (< 640px)**: Floating modals with 16px safe margins, touch-optimized controls, wrapping avatar tabs, and comfortable edge margins.
  - **Tablet (640px – 1024px)**: 2-column feature cards and spacious walk-through guides.
  - **Desktop & Large Displays (1024px+)**: Centered ergonomic play card with fluid `max-w-5xl` feature grids and ambient gradient glows.

### Phase 2: Private Room Creation & Link Generation ✅
- **🛠️ Room Configuration Modal**
  - **Rounds Selector**: Quick pill buttons (`2`, `3 (Default)`, `4`, `5`, `6`, `8`, `10`).
  - **Turn Duration**: Draw time selection (`30s`, `45s`, `60s`, `75s`, `80s (Default)`, `90s`, `100s`, `120s`).
  - **Max Players Stepper**: Team capacity (`4`, `6`, `8 (Standard)`, `10`, `12`, `16`).
  - **Word Dictionary Language**: Integrated country dropdown for word language selection.
- **🏢 Team Custom Words System**
  - Custom words input textarea with real-time word counter badge (*"X words added"*).
  - **"Only Custom Words"** toggle to exclusively draw and guess internal company terms, project names, and inside jokes.
- **🔗 Unique Room Code & Shareable Invitation Link**
  - Human-friendly room code generator (e.g. `DOODLE-7K9A`, filtering out ambiguous characters `0`, `O`, `1`, `I`).
  - Full invitation link generator with a 1-click **Copy to Clipboard** button and tactile confirmation feedback.
  - **URL Parameter Listener**: Automatically detects invite links (`/?room=DOODLE-XXXX`) and prompts joining players.
  - **Host Permission Tracking**: Creator is automatically flagged with host privileges.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) with `persist` middleware
- **Avatars**: [DiceBear API](https://api.dicebear.com/) (SVG vector graphics)
- **Linter**: [Oxlint](https://oxc.rs/) (High-performance linter, 0 errors / 0 warnings)

### Backend (Upcoming – Phase 5)
- **Runtime**: Node.js
- **Server**: Express.js
- **Multiplayer**: Socket.IO for real-time canvas stroke sync, chat rooms, and authoritative timer logic

---

## 📁 Repository Structure

```
React-Skribble.io-assignment/
├── frontend/                     # Independent React + Vite client
│   ├── src/
│   │   ├── components/           # Modular UI components
│   │   │   ├── ui/               # shadcn/ui Dialog primitives
│   │   │   ├── AvatarPicker.tsx  # DiceBear customizer & color palette
│   │   │   ├── CountrySelect.tsx # Searchable country/language combobox
│   │   │   ├── CreateRoomModal.tsx # Room settings & invite link modal
│   │   │   ├── Features.tsx      # "Made for Playing Together" cards
│   │   │   ├── Footer.tsx        # Audio mute, credits & shadcn modals
│   │   │   ├── Header.tsx        # Custom DoodleSync brand & SVG logo
│   │   │   ├── HomeCard.tsx      # Player entry card & game triggers
│   │   │   └── HowToPlay.tsx     # 3-step quick guide
│   │   ├── data/                 # Static datasets (50+ global countries)
│   │   ├── lib/                  # Utility functions (cn tailwind merge)
│   │   ├── store/                # Zustand stores
│   │   │   ├── playerStore.ts    # Player identity & local storage sync
│   │   │   └── roomStore.ts      # Room settings, code & invite link
│   │   ├── types/                # TypeScript interface definitions
│   │   │   ├── game.ts           # Avatar & profile types
│   │   │   └── room.ts           # Room settings & info types
│   │   ├── App.tsx               # Root page layout & invite listener
│   │   ├── index.css             # Tailwind v4 theme & Google Fonts
│   │   └── main.tsx
│   ├── index.html                # App entry with custom SVG favicon
│   ├── package.json
│   ├── vite.config.ts
│   └── .gitignore
├── backend/                      # (Reserved for Phase 5 Socket.IO server)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/Navneet-divine/React-Skribble.io-Assignment.git
cd React-Skribble.io-Assignment
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:5174/](http://localhost:5174/) in your browser to experience DoodleSync live.

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```

To run the linter:
```bash
npm run lint
```

---

## 🗺️ Roadmap & Development Plan

- [x] **Phase 1 – Homepage & Design System**
  - Brand identity, custom logo, avatar studio, searchable country picker, responsive layout, and shadcn dialogs.
- [x] **Phase 2 – Room Creation & Configuration**
  - Private room settings (rounds, turn time, language, custom word lists), unique code generator, and shareable invitation links.
- [ ] **Phase 3 – Waiting Lobby & Joining Flow**
  - Player list, room code copy, host indicators, kick player capability, and readiness states.
- [ ] **Phase 4 – Core Gameplay UI**
  - HTML Canvas API drawing tools (pencil, brush, eraser, palette, stroke width), real-time guess chat, timer, and scoreboard.
- [ ] **Phase 5 – Multiplayer Backend (Socket.IO)**
  - Room synchronization, real-time drawing stream, guess validation, and turn rotation.
- [ ] **Phase 6 – Game Logic & Scoring**
  - Server-authoritative secret word selection, hint reveals, and speed-based score calculation.
- [ ] **Phase 7 – Final Results & Polish**
  - Podium leaderboard, confetti effects, and "Play Again" flows.

---

## 📄 License
This project is developed as part of an assignment for remote team building and collaborative multiplayer games.
