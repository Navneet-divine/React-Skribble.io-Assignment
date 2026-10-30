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
### Phase 3: Waiting Lobby, Joining Flow & Session Persistence ✅
- **🛋️ Interactive Waiting Lobby**
  - Room code badge (`DOODLE-XXXX`) and quick setting pills (rounds, turn time, language).
  - Live player roster with avatar preview cards, ready status indicators, and open slot placeholders.
  - **Host Controls**: Room creator is highlighted with an exclusive **Crown Badge (`👑 Room Host`)**, controls to kick players, and an emerald **"Start Game"** launch button.
  - **Simulated Teammates Generator**: Host can click **`+ Add Test Player`** to simulate coworkers joining the lobby with distinct names and avatars for immediate layout and multi-player testing.
  - **Custom Word Bank Preview**: Displays custom words registered during room setup.
- **🚪 Direct Joining Flow & Invite Modal**
  - **"Join with Room Code"** modal supporting short 4-letter codes (e.g. `7K9A`) with automatic prefix formatting to `DOODLE-7K9A`.
  - Input validation with real-time error alerts.
- **🔄 URL Synchronization & Zero-Flicker Refresh Recovery**
  - Active room updates browser address bar query to `/?room=DOODLE-XXXX` without triggering full page reloads.
  - Room state persists in `sessionStorage`/`localStorage` via Zustand `persist` middleware (`doodlesync-room-storage`).
  - Refreshing (`Cmd+R` / `F5`) seamlessly recovers the active game screen or lobby screen instantly with player roster and state intact.
  ### Phase 4: Core Gameplay UI & Interactive Drawing Arena ✅
- **🎨 High-DPI HTML5 Drawing Canvas & Pointer Events**
  - Smooth Bezier interpolation (`lineCap = 'round'`, `lineJoin = 'round'`) for natural freehand sketching.
  - Unified `PointerEvent` tracking (`onPointerDown`, `onPointerMove`, `onPointerUp`) with `setPointerCapture` for flawless mouse, touch, and stylus input.
  - High-DPI / Retina display scaling via `window.devicePixelRatio` for razor-sharp strokes on any screen.
  - Read-only protection for guessers with a visual watermark badge (*"Watching [Drawer] draw"*).
- **📐 Resolution-Independent Normalized `(0–1)` Coordinates Architecture**
  - Strokes stored as `{ x: number, y: number }` ratio points relative to canvas width/height.
  - Future-proof: drawings created on a 1440px desktop will display with 100% geometric fidelity on a 375px mobile device in Phase 5.
- **🎛️ Stacked 2-Row Drawing Toolbar**
  - **Top Row (Up)**: Mode toggles (`Brush` / `Eraser`), 4 stroke widths (Fine 4px, Medium 8px, Thick 14px, Jumbo 24px), local **Undo** stroke stack, and **Clear Canvas** with inline confirmation popover.
  - **Bottom Row (Down)**: 16 curated color swatches in an `8 × 2` grid, centered with generous padding and zero horizontal scrolling on all displays.
- **⏱️ Game Top HUD & Dynamic Urgency Timer**
  - Round tracker (`Round 1 of 3`) and room code indicator.
  - **Dual Word Display**: Drawer sees secret word with letter count tag (`PIZZA 5 letters`); guessers see masked dashes with letter count and revealed hint characters (`_ _ _ _ _`).
  - Countdown timer with 3 urgency states: **Emerald** (> 25s), **Amber** (11–25s), and pulsating **Crimson** (≤ 10s) with thin elapsed time bar.
- **🏆 Live Ranked Scoreboard**
  - Real-time ranked leader list sorted automatically by score.
  - `#1` ranked player crowned with gold **Crown badge (👑)**.
  - Vector avatar previews, player names, drawer indicator (✏️), and guess completion tags (✓ Guessed).
- **💬 Real-Time Guess Chat & Highlight System**
  - Auto-scrolling guess log with interactive guess submission (Enter key support).
  - **Distinct Card Notifications**: Emerald celebratory cards (*"Emma guessed the word! +320 pts"*), Amber close guess alerts (*"David is very close!"*), and muted system alerts.
  - Speed-based points calculation and drawer spoiler protection (blocks drawer from leaking secret word).
- **🔤 Word Choice Modal with Countdown**
  - 3 curated word cards of varying difficulty (Easy, Medium, Hard).
  - 15-second animated countdown timer that auto-picks word #1 if time runs out.
- **📱 Fully Responsive Desktop & Mobile Architecture**
  - **Desktop (`≥ lg`)**: Sleek 3-column layout (Scoreboard 3 cols | Canvas & Tools 6 cols | Guess Chat 3 cols).
  - **Mobile (`< lg`)**: Aspect ratio `4:3` pinned canvas at top with 1-tap mobile tabs (`Tools 🎨`, `Guesses 💬`, `Scores 🏆`) fitting cleanly inside a single viewport without clipping or endless vertical scroll.
  - **Interactive Dev Mode**: Instant toggle between **Drawer View** and **Guesser View**, plus a **Simulate Guess** button for end-to-end frontend testing before Phase 5 Socket.IO connection.

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
│   │   │   ├── DrawingCanvas.tsx # High-DPI HTML5 canvas with Pointer Events & undo
│   │   │   ├── DrawingTools.tsx  # 2-row toolbar: tools, sizes, undo, clear & 16 colors
│   │   │   ├── Features.tsx      # "Made for Playing Together" cards
│   │   │   ├── Footer.tsx        # Audio mute, credits & shadcn modals
│   │   │   ├── GameHeader.tsx    # Round tracker, word mask/reveal & urgency timer
│   │   │   ├── GameScreen.tsx    # Main game arena container & mobile tab switcher
│   │   │   ├── GuessChat.tsx     # Real-time guess feed & correct guess highlight cards
│   │   │   ├── Header.tsx        # Custom DoodleSync brand & SVG logo
│   │   │   ├── HomeCard.tsx      # Player entry card & game triggers
│   │   │   ├── HowToPlay.tsx     # 3-step quick guide
│   │   │   ├── JoinRoomModal.tsx # Join room code input dialog
│   │   │   ├── Scoreboard.tsx    # Ranked player roster, crown & drawer badges
│   │   │   ├── WaitingLobby.tsx  # Lobby screen with player roster & host controls
│   │   │   └── WordChoiceModal.tsx # 3 word cards with 15s selection timer
│   │   ├── data/                 # Static datasets (50+ global countries)
│   │   ├── lib/                  # Utility functions (cn tailwind merge)
│   │   ├── store/                # Zustand stores
│   │   │   ├── playerStore.ts    # Player identity & local storage sync
│   │   │   └── roomStore.ts      # Room state, players & persistence
│   │   ├── types/                # TypeScript interface definitions
│   │   │   ├── game.ts           # Drawing stroke, chat, player & word choice types
│   │   │   └── room.ts           # Room settings, player & info types
│   │   ├── App.tsx               # App routing (Home, Lobby, Game) & URL sync
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
- [x] **Phase 3 – Waiting Lobby & Joining Flow**
  - Interactive waiting lobby screen, real-time player roster with host crown badge, simulated teammates generator for testing, host kick player controls, custom word bank preview, room code copy widget, and modal for joining via room code or invite link.
- [x] **Phase 4 – Core Gameplay UI**
  - High-DPI HTML5 Drawing Canvas with Pointer Events and sub-pixel stroke smoothing; resolution-independent normalized (0–1) coordinates for strokes; 16-color palette, brush sizes, eraser, undo stack, and clear canvas; dynamic countdown timer with urgency transitions; word selection modal with 15s timer; real-time scoreboard with ranks, avatars, and drawer badges; guess chat feed with celebratory correct guess banners; responsive desktop 3-column arena and mobile tabbed view.
- [ ] **Phase 5 – Multiplayer Backend (Socket.IO)**
  - Room synchronization, real-time drawing stream, guess validation, and turn rotation.
- [ ] **Phase 6 – Game Logic & Scoring**
  - Server-authoritative secret word selection, hint reveals, and speed-based score calculation.
- [ ] **Phase 7 – Final Results & Polish**
  - Podium leaderboard, confetti effects, and "Play Again" flows.

---

## 📄 License
This project is developed as part of an assignment for remote team building and collaborative multiplayer games.
