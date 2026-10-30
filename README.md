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
- **🎲 Skribbl.io-Style Meaningful Username Auto-Generation**
  - Empty or unentered names are automatically populated with fun, memorable usernames (e.g., `HappyOtter42`, `DoodleFox78`, `SwiftFalcon91`).
  - Interactive dice button right inside the name input allowing players to quickly shuffle names before joining or creating a room.
  - Automatically syncs to lobby rosters, in-game scoreboards, and chat feeds.
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

---

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
  - **1-Click Direct Join**: Guests opening an invitation link (`/?room=DOODLE-XXXX`) can click "Play" or enter a room code directly to connect to the waiting lobby.

---

### Phase 3: Waiting Lobby, Host Controls & Session Persistence ✅
- **🛋️ Interactive Waiting Lobby**
  - Room code badge (`DOODLE-XXXX`) and quick setting pills (rounds, turn time, language).
  - Live player roster with avatar preview cards, ready status indicators, and open slot placeholders.
  - **Host Controls**: Room creator is highlighted with an exclusive **Crown Badge (`👑 Room Host`)**, controls to kick players, and an emerald **"Start Game"** launch button.
  - **Minimum Player Guard**: Requires at least 2 connected players to start a game, preventing accidental solo starts and informing the host with friendly toast notifications.
  - **Simulated Teammates Generator**: Host can click **`+ Add Test Player`** to simulate coworkers joining the lobby with distinct names and avatars for immediate layout and multi-player testing.
- **🚪 Clean Room Navigation & Invitation Handshake**
  - Arriving via an invite link displays a single, polite invitation notice without spamming reconnection alerts.
  - Room state persists in `sessionStorage`/`localStorage` via Zustand `persist` middleware (`doodlesync-room-storage`).

---

### Phase 4: Core Gameplay UI & Interactive Drawing Arena ✅
- **🎨 High-DPI HTML5 Drawing Canvas & Pointer Events**
  - Smooth Bezier interpolation (`lineCap = 'round'`, `lineJoin = 'round'`) for natural freehand sketching.
  - Unified `PointerEvent` tracking (`onPointerDown`, `onPointerMove`, `onPointerUp`) with `setPointerCapture` for mouse, touch, and stylus input.
  - High-DPI / Retina display scaling via `window.devicePixelRatio` for razor-sharp strokes on any screen.
  - Read-only protection for guessers with a visual watermark badge (*"Watching [Drawer] draw"*).
- **📐 Resolution-Independent Normalized `(0–1)` Coordinates Architecture**
  - Strokes stored as `{ x: number, y: number }` ratio points relative to canvas width/height.
  - Drawings created on a 1440px desktop display with 100% geometric fidelity on any mobile device.
- **🎛️ Stacked 2-Row Drawing Toolbar**
  - **Top Row (Up)**: Mode toggles (`Brush` / `Eraser`), 4 stroke widths (Fine 4px, Medium 8px, Thick 14px, Jumbo 24px), local **Undo** stroke stack, and **Clear Canvas** with inline confirmation popover.
  - **Bottom Row (Down)**: 16 curated color swatches in an `8 × 2` grid, centered with generous padding and zero horizontal scrolling on all displays.
- **⏱️ Game Top HUD & Dynamic Urgency Timer**
  - Accurate round tracker clamped to total rounds (`Round 1 of 3`, never overflowing to `Round 3 of 2`).
  - Countdown timer with 3 urgency states: **Emerald** (> 25s), **Amber** (11–25s), and pulsating **Crimson** (≤ 10s) with thin elapsed time bar.

---

### Phase 5: Real-Time Multiplayer Backend (Socket.IO) ✅
- **⚡ Authoritative Node.js + Express + Socket.IO Server**
  - Real-time room synchronization, player presence, and socket session mapping.
  - **Live Canvas Streaming**: Sub-millisecond stroke broadcasting with delta batching and normalized coordinates.
  - **Authoritative Game Manager**: Server controls game phases (`choosing`, `drawing`, `round_end`, `game_end`) and turn rotations.
  - **Turn Timers**: Server-authoritative timer countdown broadcasts (`timer:tick`) ensuring all connected clients remain in 100% lockstep.
- **🔤 Synchronized Word Selection Modal**
  - Drawer receives 3 curated word choices (Easy, Medium, Hard).
  - Live server-synchronized countdown timer (`15s, 14s, 13s ... 0s`) with a smooth progress bar.
  - Automatically selects the first word and transitions to the drawing phase if the timer runs out.

---

### Phase 6: Game Logic, Hints & Anti-Spoiler Safeguards ✅
- **🛡️ Custom Drawer Spoiler Warning Modal**
  - Replaced disruptive browser alerts with a polished custom dialog modal (`SpoilerWarningModal.tsx`).
  - Prevents the drawer from leaking the secret word or sub-phrases in chat while allowing normal banter.
  - Emits in-game system warnings when a spoiler attempt is intercepted.
- **🔒 Isolated Guesser Hints & Drawer Word Display Safeguard**
  - Word hints (`_ _ _ _ _` with progressive letter reveals) are emitted exclusively to guessers.
  - Active drawer's view is protected with persistent word caching so their word (`OCTOPUS (7L)`) never turns into blank dashes mid-turn.
- **💬 Real-Time Guess Chat & Highlight System**
  - Auto-scrolling guess log with interactive guess submission (Enter key support).
  - High-density chat messages with distinct highlights:
    - **Emerald badges**: Correct guess notifications (`"Emma guessed the word! +320 pts"`).
    - **Amber alerts**: Close guess proximity notifications (`"'octopuss' is so close!"`).
    - **System alerts**: Turn transitions, word selection announcements, and round updates.

---

### Phase 7: Host Migration, Default Victories & Game Over Experience ✅
- **👑 Host Migration & Departure Handling**
  - When the host leaves or closes their tab during an active game, host permissions are automatically reassigned to the next player.
  - Departing players are gracefully redirected back to the clean homepage (`/` without room query).
  - The remaining player is awarded a victory by default via `VictoryModal.tsx` and returned to the waiting lobby with the same room ID preserved to invite others or start again.
- **🎉 End-of-Match Celebration (`GameOverModal.tsx`)**
  - **"Both players are winners!"** banner for 2-player matches.
  - **"Everyone is a winner!"** team celebration for 2+ player matches.
  - Automatic 6-second countdown with smooth redirect back to the waiting lobby to start a new game together.

---

### Phase 8: Mobile UX Overhaul (Skribbl.io-Style Viewport Arena) ✅
- **📱 Simultaneous Drawing & Typing Layout**
  - Pinned drawing canvas at the top (`190px–210px`) so it never scrolls out of view.
  - **Split Bottom Arena**:
    - **Left Column (Scoreboard)**: Compact view showing player ranks (`#1`, `#2`), avatars, usernames, and live points.
    - **Right Column (Guess Chat)**: Sleek, high-density chat message stream with auto-scrolling to newest guesses.
  - **Dedicated Full-Width Guess Input Bar (`GuessChatInput`)**: Positioned directly beneath the split panel.
  - **Zero-Scroll Viewport**: Entire game interface fits within standard mobile screens (e.g., iPhone SE `375 × 667`) allowing players to watch drawings and type guesses simultaneously.
  - Fixed flex container overflow with `min-h-0` and `overflow-hidden` preventing any overlapping elements.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) with `persist` middleware
- **Real-time Client**: [Socket.IO Client](https://socket.io/)
- **Avatars**: [DiceBear API](https://api.dicebear.com/) (SVG vector graphics)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (TypeScript)
- **Server Framework**: [Express](https://expressjs.com/)
- **Real-time Engine**: [Socket.IO](https://socket.io/) (bidirectional event-driven communication)
- **State Management**: In-memory room and player session store with timer intervals

---

## 📁 Repository Structure

```
React-Skribble.io-Assignment/
├── frontend/                         # React + Vite client
│   ├── src/
│   │   ├── components/               # Modular UI components
│   │   │   ├── ui/                   # shadcn/ui Dialog primitives
│   │   │   ├── AvatarPicker.tsx      # DiceBear customizer & color palette
│   │   │   ├── CountrySelect.tsx     # Searchable country/language combobox
│   │   │   ├── CreateRoomModal.tsx   # Room settings & invite link modal
│   │   │   ├── DrawingCanvas.tsx     # High-DPI HTML5 canvas with Pointer Events & undo
│   │   │   ├── DrawingTools.tsx      # 2-row toolbar: tools, sizes, undo, clear & 16 colors
│   │   │   ├── Features.tsx          # "Made for Playing Together" cards
│   │   │   ├── Footer.tsx            # Audio mute, credits & shadcn modals
│   │   │   ├── GameHeader.tsx        # Clamped round tracker, word mask & urgency timer
│   │   │   ├── GameOverModal.tsx     # Match completion modal ("Everyone is a winner!")
│   │   │   ├── GameScreen.tsx        # Main game arena (Desktop 3-col & Mobile split)
│   │   │   ├── GuessChat.tsx         # Live chat feed & exported GuessChatInput
│   │   │   ├── Header.tsx            # Custom DoodleSync brand & SVG logo
│   │   │   ├── HomeCard.tsx          # Player entry card, auto-username & dice shuffle
│   │   │   ├── HowToPlay.tsx         # 3-step quick guide
│   │   │   ├── JoinRoomModal.tsx     # Join room code input dialog
│   │   │   ├── Scoreboard.tsx        # Ranked player roster (Desktop & Compact mobile)
│   │   │   ├── SpoilerWarningModal.tsx # Drawer anti-spoiler alert dialog
│   │   │   ├── VictoryModal.tsx      # Host departure / default victory modal
│   │   │   ├── WaitingLobby.tsx      # Lobby screen with player roster & host controls
│   │   │   └── WordChoiceModal.tsx   # 3 word cards with live 15s server countdown
│   │   ├── data/                     # 50+ worldwide countries catalog
│   │   ├── lib/                      # Utility functions & singleton Socket.IO client
│   │   ├── store/                    # Zustand stores (playerStore & roomStore)
│   │   ├── types/                    # TypeScript interfaces (game.ts & room.ts)
│   │   ├── App.tsx                   # App routing, one-time invite alerts & URL sync
│   │   ├── index.css                 # Tailwind v4 theme & Google Fonts
│   │   └── main.tsx
│   ├── index.html                    # App entry with custom SVG favicon
│   ├── package.json
│   └── vite.config.ts
├── backend/                          # Node.js + Express + Socket.IO server
│   ├── src/
│   │   ├── constants/                # Built-in multi-language word banks
│   │   ├── handlers/
│   │   │   └── socketHandler.ts      # Socket event listeners & room event triggers
│   │   ├── store/
│   │   │   └── roomStore.ts          # In-memory room mappings & state helpers
│   │   ├── types/                    # Backend types & event payloads
│   │   ├── utils/
│   │   │   ├── gameManager.ts        # Turn timers, word selection & scoring logic
│   │   │   └── roomUtils.ts          # Room serialization & code generator
│   │   ├── index.ts                  # Server initialization & Socket.IO server setup
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

---

### 1. Setup Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend server starts on **`http://localhost:5001`**.

---

### 2. Setup Frontend Client

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend client starts on **`http://localhost:5173`** (or next available port).

---

### 3. Build for Production

To validate TypeScript compilation and build both projects for production:

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

---

## 📄 License
This project is developed as part of an assignment for remote team building and collaborative multiplayer games.
