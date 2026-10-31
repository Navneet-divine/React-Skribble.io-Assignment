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
- **🌍 Streamlined 10-Language Selector with Native Names & Flags**
  - Built with **shadcn/ui** combobox pattern.
  - Tailored to **10 core languages** with flags and native names: English (🇺🇸), Hindi (🇮🇳 हिन्दी), Greek (🇬🇷 Ελληνικά), German (🇩🇪 Deutsch), French (🇫🇷 Français), Spanish (🇪🇸 Español), Italian (🇮🇹 Italiano), Portuguese (🇵🇹 Português), Dutch (🇳🇱 Nederlands), and Polish (🇵🇱 Polski).
  - English is preserved as the default language.
  - **Instant prefix search** across English and native names (e.g., typing `"h"` or `"हि"` finds Hindi).
- **💾 Persistent Player Storage**
  - Seamless state persistence using **Zustand** and browser `localStorage`.
  - Player username, custom avatar configuration, and selected language are saved automatically across reloads and future game screens.
- **📜 Official Game Rules & Interactive Modals**
  - Accessible dialog modals powered by `@radix-ui/react-dialog` (shadcn/ui primitives).
  - Complete 6-step official game guide, About info, Privacy Policy, Terms of Service, and Contact modal.

---

### Phase 2: Private Room Creation & Link Generation ✅
- **🛠️ Extended Room Configuration Modal**
  - **Rounds Selector**: Quick pill buttons (`2`, `3 (Default)`, `4`, `5`, `6`, `7`, `8`, `9`, `10`).
  - **Turn Duration**: Comprehensive draw times (`15s`, `30s`, `45s`, `60s`, `75s`, `80s (Default)`, `90s`, `100s`, `110s`, `120s`, `135s`, `150s`, `165s`, `180s`, `200s`, `240s`).
  - **Max Players Capacity**: Skribbl.io-style button pills supporting from `2` up to `20` players (`2` to `20`).
  - **Game Mode Selector**:
    - **Normal**: Secret word length placeholders (`_ _ _ _`) with progressive letter reveals.
    - **Hidden**: Drawing-only challenge with no length or letter hints (`???`).
    - **Combination**: Two distinct concepts joined as a compound prompt (e.g. `APPLE + TREE`).
  - **Word Count Selector**: Drawer word choices from `1` to `5` (`3` default), with instant drawing start when set to `1`.
  - **Hints Selector**: Configurable hint cap from `0` to `5` (`2` default) distributed across the round duration.
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
  - Room code badge (`DOODLE-XXXX`) and quick setting pills (game mode, word choices, hints, rounds, turn time, language).
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
  - **Top Row (Up)**: Mode toggles (`Brush` / `Fill (Paint Bucket)` / `Eraser`), 4 stroke widths (Fine 4px, Medium 8px, Thick 14px, Jumbo 24px), local **Undo** stroke stack, and **Clear Canvas** with inline confirmation popover.
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

### Phase 9: Skribbl.io Advanced Game Modes, Dynamic Word Choices & Progressive Hints ✅
- **🎮 3 Distinct Game Modes**
  - **Normal Mode**: Classic Skribbl.io guessing experience. Guesser displays reflect secret word character lengths (`_ _ _ _`), progressive letter reveals appear over time, and the active drawer has full visibility.
  - **Hidden Mode**: Stealth visual challenge. Word length indicators and letter hints are disabled for guessers (`🔒 Hidden Mode (??? )`), requiring pure visual deduction from canvas strokes. Secret words and choices are strictly protected on the server.
  - **Combination Mode**: Compound prompt generator combining two distinct concepts from the dictionary (e.g. `APPLE + TREE`) without word duplication. The drawer illustrates both elements on the canvas; guessers must deduce the full combination phrase with intelligent punctuation and spacing normalization (`apple tree`, `apple + tree`, and `appletree` all evaluate accurately).
- **🔢 Configurable Word Count (1 to 5 Choices)**
  - Configurable drawer word options from `1` up to `5` choices (`3` default).
  - **Instant Drawing Turn Auto-Start**: When configured to `1` choice, turns skip the choosing phase countdown and immediately open the drawing canvas with the word assigned, matching competitive speedrun gameplay.
  - In Combination Mode, all choices feature unique two-word pairings with distinct badges in the selection modal.
  - Server auto-selection fallback guarantees seamless turn progression if the drawer timer reaches `0s`.
- **💡 Server-Authoritative Progressive Hint Engine (0 to 5 Hints)**
  - Configurable hint allowance from `0` to `5` letters revealed (`2` default).
  - **Dynamic Time-Distributed Reveal**: Calculates interval milestones evenly across turn duration (`drawTime`) to progressively uncover unrevealed letter indices.
  - **Zero-Leak Protection**: Server never reveals 100% of the word early, ignores symbols and spaces (`+`), and suppresses hints completely in Hidden Mode regardless of setting.
  - **Late Joiner Security**: Players connecting mid-turn receive the exact current masked state without exposing the raw secret word in `room:data` or `game:state`.
- **🌍 Skribbl.io-Style 10-Language Selection & Curated Word Banks**
  - **10 Fully Supported Languages**:
    | Language | Code | Native Name | Flag | Word Bank & Target Audience |
    |---|---|---|---|---|
    | **English** | `en` | English | 🇺🇸 | International default (~105 drawing terms) |
    | **Hindi** | `hi` | हिन्दी | 🇮🇳 | Curated Devanagari drawing terms (सेब, रॉकेट, हाथी...) |
    | **Greek** | `el` | Ελληνικά | 🇬🇷 | Greece & Cyprus terms (μήλο, πύραυλος, κάστρο...) |
    | **German** | `de` | Deutsch | 🇩🇪 | Germany & Austria terms (Apfel, Rakete, Schloss...) |
    | **French** | `fr` | Français | 🇫🇷 | France & Belgium terms (pomme, fusée, château...) |
    | **Spanish** | `es` | Español | 🇪🇸 | Spain & Latin America terms (manzana, cohete...) |
    | **Italian** | `it` | Italiano | 🇮🇹 | Italy terms (mela, razzo, castello...) |
    | **Portuguese** | `pt` | Português | 🇵🇹 | Portugal & Brazil terms (maçã, foguete, castelo...) |
    | **Dutch** | `nl` | Nederlands | 🇳🇱 | Netherlands & Belgium terms (appel, raket, kasteel...) |
    | **Polish** | `pl` | Polski | 🇵🇱 | Poland terms (jabłko, rakieta, zamek...) |
  - **Comprehensive Unicode & Diacritics Normalization**:
    - Uses Unicode character class matching (`/[^\p{L}\p{M}\p{N}]/gu`) so Greek and Hindi Devanagari letters with matras (`\p{M}`) are fully supported.
    - Strips accents/diacritics for Latin and Greek: Greek `μήλο` matches guess `μηλο`, Spanish `plátano` matches `platano`, Dutch `pinguïn` matches `pinguin`.
    - Handles special characters: Polish `ł` matches `l` (`jabłko` matches `jablko`, `żółw` matches `zolw`), German `ß` matches `ss` (`Fußball` matches `fussball`), Greek final sigma `ς` matches `σ`.
  - **Dynamic Language Resolution (`resolveLanguageKey`)**: Intelligently resolves all 10 language codes (`en`, `hi`, `el`, `de`, `fr`, `es`, `it`, `pt`, `nl`, `pl`), localized native names, and regional country identifiers (`in`, `gr`, `cy`, `de`, `at`, `fr`, `es`, `it`, `pt`, `br`, `nl`, `pl`, `us`, `gb`).
  - **Universal Game Mode Compatibility**: Full support across **Normal**, **Hidden**, and **Combination** modes in every language (e.g. Hindi `दीवार + हाथी`, Greek `ΜΉΛΟ + ΔΈΝΤΡΟ`).
- **📝 Custom Words System: Mix vs. Only Custom Words**
  - **Mix Custom Words**: Seamlessly blends custom words into the active language word bank for higher variety.
  - **Only Custom Words**: Exclusively draws from the host's custom list, disabling the standard dictionary.
  - **Combination Mode Compatibility**: In Combination Mode with Only Custom Words, prompts pair distinct custom words (e.g. `BURGER + FRIES`) without duplicates.
  - **Real-Time Lobby Room Settings (Skribbl.io Style via shadcn/ui DropdownMenu)**:
    - Replaced basic HTML selects with accessible **shadcn/ui `DropdownMenu`** components (`@radix-ui/react-dropdown-menu`) directly in the lobby header navigation badges.
    - While in the waiting lobby, the room host can dynamically adjust:
      - **Players**: 2 to 20 maximum players with standard indicators.
      - **Language**: All 10 supported languages (`en`, `hi`, `el`, `de`, `fr`, `es`, `it`, `pt`, `nl`, `pl`) with flag emojis, English names, and native localized titles.
      - **Drawtime**: 15s to 240s drawing durations.
      - **Rounds**: 2 to 10 rounds per match.
      - **Game Mode**: `Normal`, `Hidden`, and `Combination` modes with descriptive subtitles.
      - **Word Count**: 1 to 5 word choices (1 choice enables Instant Draw).
      - **Hints**: 0 to 5 hint letters revealed (dynamically disabled with "No Hints" badge in Hidden Mode).
    - All updates emit `room:settings:update` with strict host authority validation on the server, broadcasting `room:data` via WebSocket so all connected players see changes live in real-time.
    - Non-host guests view settings in clean, read-only badges that automatically update without reloading.
  - **Skribbl.io-Style Live Lobby Chat & Mobile Split Layout**:
    - **Scoped Chat Scrolling & Fixed Row Height**: Lobby chat messages container is locked to `h-[285px]` matching the Players in Lobby card, preventing the card from stretching down the page on heavy message traffic. Auto-scrolling is strictly scoped to the chat container via `scrollTop`, completely eliminating unwanted webpage window jumping when typing or sending messages.
    - **Full Product Custom Words Validation & Limits**:
      - **Minimum**: 10 custom words required when "Use custom words only" is enabled (with real-time warning and Start Game button lockout until minimum requirement is fulfilled).
      - **Maximum**: 100 unique custom words cap (any excess beyond 100 is automatically flagged and trimmed).
      - **Per-Word Length Limit**: 1 to 32 characters per entry (words exceeding 32 characters are rejected with a badge alert).
      - **Total Input Limit**: Up to 20,000 total characters supported with a real-time character counter.
      - **Flexible Delimiters**: Seamlessly accepts both comma-separated values (`,`) and new lines (`\n`, `\r\n`).
      - **Sanitization & Clean-up**: Automatically removes empty lines/commas and collapses redundant whitespace while preserving valid multi-word phrases (e.g. `hot dog`).
      - **Case-Insensitive Deduplication**: Prevents duplicate words (e.g., `Cat`, `cat`, and `CAT` resolve to one entry) with live feedback showing how many duplicates were omitted.
      - **Multilingual Support**: Supports multilingual words across scripts (Hindi, Spanish, Japanese, Cyrillic, Greek, accented characters, etc.).
    - **Desktop 2x2 Grid Alignment**: Left and right columns share identical row baselines across desktop viewports, with Row 1 (Players & Chat) locked to 285px and Row 2 (Custom Words & Start Game) neatly aligned.
    - **Mobile Side-by-Side Panel Layout**: On mobile viewports (`< lg`), the lobby displays a simultaneous 50-50 side-by-side split row matching the in-game arena layout (compact players roster on the left, live lobby chat feed on the right, with a full-width chat input bar pinned below).
  - **🚪 Leave Room Confirmation Modals**:
    - Clicking "Leave Room" (both in the Waiting Lobby and in the Game Header during an active game) now triggers a confirmation modal dialog (`Dialog` from `@radix-ui/react-dialog`) asking "Are you sure you want to leave?".
    - Provides clear warnings (warning hosts that leaving will transfer host privileges to another player, and warning players that in-game progress/scores will be forfeited) with "Stay in Room" (cancel) and "Yes, Leave Room" (confirm) actions.
- **🏆 True Competitive Ranking & Winner Podium (`GameOverModal.tsx`)**
  - Displays accurate final placements sorted strictly by player score (`👑 1st Place`, `🥈 2nd Place`, `🥉 3rd Place`, `#N`).
  - Distinguishes solitary winners from genuine score ties (`🤝 It's a Tie!`), resolving previous behavior where all participants were labeled winners regardless of points.
- **🔄 Fresh Match Clean-Slate & Score Resets**
  - Player scores, guessed states, and drawing flags are automatically reset to `0` upon returning to the lobby (`game:return_to_lobby`, default victory, or new match launch), preventing previous game points from contaminating new matches.
- **📣 Specific Guesser Attribution on Turn End**
  - Replaced generic turn-ending notices with explicit attribution identifying the exact player(s) who guessed the word (e.g., `SwiftFox66 guessed the word!`, `Alice & Bob guessed the word!`, or `Time is up! Nobody guessed the word.`).
- **💬 Chat Input Ergonomics & Adaptive Mobile Canvas (`GuessChat.tsx`, `GameScreen.tsx`)**
  - **50-50 Split Row for Mobile Arena**: The mobile in-game scores and live chat feed now share an exact 50-50 column width (`grid-cols-2`), matching the waiting lobby layout for visual balance and consistency.
  - **Guess Input Padding**: Integrated `pr-20` padding into the guess chat input when a player has already guessed, eliminating text overlap with the `✓ Guessed` status badge.
- **⚡ Seamless In-Game Reconnection & Live Clock Persistence (`socketHandler.ts`, `App.tsx`, `playerStore.ts`, `roomStore.ts`, `GameScreen.tsx`)**
  - **Uninterrupted Match Continuity**: When a player refreshes their browser (F5 / Cmd+R) or experiences a temporary network drop during an active game, the match is **never terminated** or reset.
  - **Zero Initial Flicker (Eliminated 80s Default Flash)**: Reconnecting or refreshing directly rehydrates the exact live ticking time from the persisted store state (`useRoomStore.getState().timeLeft` adjusted with elapsed seconds) and authoritative WebSocket payload (`res.room.timeLeft`), eliminating the initial `80s` / chosen draw time fallback flash so the countdown displays seamlessly without jumping.
  - **Live Authoritative Server Clock**: The server countdown timer keeps running uninterrupted. For example, if an 80-second round has 15 seconds remaining when Player A refreshes, Player B's screen smoothly continues ticking down (`15s` ➔ `14s` ➔ `13s` ➔ `12s` ➔ `11s` ➔ `10s`). When Player A re-establishes connection 5 seconds later, Player A immediately receives the live room clock at `10s` in 100% synchronization with Player B.
  - **Persistent Session Handshake**: Each client preserves a stable `playerId` in persisted local storage (`doodlesync-player-storage`). On page load / refresh, `App.tsx` automatically reconnects to the active room using the persistent session identity.
  - **Full Game State Recovery**: Upon rejoining, the server immediately restores:
    - Current canvas drawing strokes history (`draw:history`).
    - Active secret word for the drawer (`word:secret`) or masked blanks/revealed hints for guessers (`word:hint`).
    - Real-time countdown timer (`timer:tick`) and current player score standings (`room:data`).
  - **Grace Period vs. Deliberate Leave**: Disconnections trigger a 20-second grace window (holding the player's slot open while the match clock continues). Only if a player fails to reconnect within 20 seconds does the server award default victory or advance the turn. Deliberately clicking "Leave Room" or "Leave Game" via the confirmation modal still exits immediately.

---

### Phase 10: Paint Bucket (Flood Fill), Mobile Arena Polish & Dynamic Cursors ✅
- **🪣 Skribbl.io Paint Bucket Tool (Flood Fill Engine)**
  - **Scanline Flood Fill Algorithm**: High-performance contiguous area fill executing in sub-5ms across canvas resolutions.
  - **Antialiased Boundary Dilation & Zero White Halos**: Uses Euclidean color distance (`tolerance = 90`) and 2–3px boundary dilation into antialiased edge pixels, completely eliminating white seams or gap artifacts.
  - **Crisp Vector Re-Layering**: Any prior enclosing vector strokes are cleanly re-rendered on top of the dilated fill, keeping drawn line borders razor-sharp.
  - **WebSocket Synchronization & Undo Support**: Recorded as a discrete `{ tool: 'fill', points: [{x, y}] }` stroke, syncing in real-time over Socket.IO to all room clients and fully supporting canvas **Undo** (`draw:undo`).
- **🎯 Dynamic Offscreen PNG Paint Bucket Cursor**
  - **Universal Offscreen PNG Generator**: Renders a clean 32×32 Base64 PNG cursor via an offscreen canvas, completely avoiding WebKit/Chromium SVG data-URI decoding bugs.
  - **Dynamic Fluid Color**: The bucket liquid and pouring paint droplet dynamically match the active selected palette color.
  - **High-Contrast Dual Outline**: Dual-layer white and dark borders guarantee 100% visibility over pure white canvas, dark drawings, and colored regions.
  - **Exact Hotspot**: Click hotspot accurately mapped to `(4, 27)` at the tip of the pouring droplet.
- **📱 Mobile Game Arena & Header Refinements**
  - **Non-Colliding Full-Width Word Blanks**: On mobile viewports, the game header separates top HUD controls (round, combination badge, timer, exit) from secret word blanks, providing full card width so long words and compound phrases never collide with buttons.
  - **Compound Word Center Alignment**: Combination mode words display horizontally on a single line (`Word 1 + Word 2`) with centered `+` separator icon and duplicate badge removal.
  - **Accurate Zero-Hint Handling**: Fixed `0 Hints (None)` lobby option so turning off hints correctly sets 0 hints without falling back to default values.
  - **Skribbl.io-Style Equal Winner Celebrations**: Tied matches celebrate participants with *"Both Are Winners!"* (2 players) and *"Everyone is a Winner!"* (3+ players) podium banners.

---

### Phase 11: Skribbl.io-Style Public Play Matchmaking & Drop-In Multiplayer ✅
- **🌐 1-Click Instant "Play!" Matchmaking Engine**
  - **Identical to Skribbl.io Flow**: Clicking the green **"Play!"** button no longer prompts for a room code; it immediately matches players into an open public room filtered by their selected language.
  - **High-Density Player Congregation**: Prioritizes rooms with more connected players over empty rooms (`b.players.size - a.players.size`), preventing fragmented 1-player rooms and maximizing lobby vibrancy.
  - **Automatic Public Room Spawning**: If no open public room exists for the chosen language, a fresh public room is instantly spun up with standardized rules (3 rounds, 80s draw time, 2 hints, max 8 players, normal mode).
- **⚡ Mid-Game Drop-In with Zero Interruption**
  - **Live Game Joining**: Players matched into an active drawing round seamlessly connect as active guessers without disrupting the ongoing drawer.
  - **Full Canvas History Synchronization**: Complete vector drawing history (`draw:history`) is dispatched to late joiners, rendering the current canvas state in real-time.
  - **Live Clock & Hint Alignment**: Late joiners receive exact server clock countdown ticks (`timer:tick`) and role-appropriate masked word placeholders (`word:hint`).
  - **Dynamic Drawer Rotation**: Newly joined players are cleanly integrated into `drawerOrder`, ensuring they receive their turn to draw in future rounds.
- **🚀 Automatic Public Lobby Game Start**
  - **2+ Players Auto-Start**: Public matchmaking rooms waiting in the lobby automatically launch the match as soon as 2 or more players connect—no manual host click required.
  - **Live Matchmaking Status Banner**: Displays a real-time animated indicator: *"Waiting for players to join... The game starts automatically as soon as 2 players connect!"* with a live player counter (`X/8`).
  - **Distinct Badges**: Public games are highlighted with a `🌐 Public Match` emerald badge, while private custom games are designated with `🔒 Private Room`.
- **🔒 Standardized Fair-Play Settings & Custom Word Exclusion**
  - **Locked Gameplay Defaults**: In public matchmaking, standard settings (8 players, 80s draw duration, 3 rounds, normal game mode, 3 word choices, 2 hints) are fixed and rendered as static badges to ensure an even playing field for all participants.
  - **Host Language Selector Active**: The host retains the ability to switch the game dictionary language in public rooms.
  - **Democratic Player Status**: In public matchmaking, all participants appear with equal status ("Ready") without crown or "Room Host" badges, and player kick authority is disabled. Host crowns and kick privileges are reserved exclusively for Private Rooms.
  - **Complete Custom Word Exclusion**: The custom words configuration card is completely omitted in public games on both mobile and desktop viewports, and the backend rejects custom words on public rooms, eliminating spoiler risks or unfair advantages. Private rooms retain the full custom words suite.
- **🔒 Dedicated Private Room Separation**
  - **Isolated Pools**: Private rooms created via **"Create Private Room"** (`isPublic: false`) are strictly excluded from public matchmaking, preserving private invite links and custom configurations (custom words, game modes, rounds) for team events.
  - **Direct Room Code Entry**: Dedicated **"Join with Room Code"** button remains available on the homepage for players joining private matches manually.

---

### Phase 12: Real-Time Web Audio API Sound Engine & Urgent Timer Ticking ✅
- **🔊 Zero-Latency Synthesized Web Audio API Engine (`soundManager.ts`)**
  - **100% Asset-Free Audio Synthesis**: Employs browser-native `AudioContext`, `OscillatorNode`, and `GainNode` with exponential volume decays. Requires zero external audio files (`.mp3`/`.ogg`), generates zero HTTP asset traffic, avoids 404s or CDN failures, and works flawlessly offline.
  - **Autoplay Compliance**: Automatically resumes suspended audio contexts on initial user interaction to comply with modern browser autoplay safety policies.
- **⏱️ Skribbl.io Mechanical Watch Timer Ticking (`playTimerTick`)**
  - **Urgent Countdown Atmosphere**: Automatically triggers when a turn has **10 seconds or fewer remaining** (`timeLeft <= 10`).
  - **Realistic Mechanical Tick-Tock**: Alternates between high-frequency tick (1200 Hz) and low-frequency tock (900 Hz) for authentic grandfather / wristwatch clock acoustic modeling.
  - **Double-Time Final Panic**: When **3 seconds or fewer remain** (`timeLeft <= 3`), tick cadence doubles in urgency to elevate final-second tension.
  - **Deduplication Guard**: Incorporates a timestamp and second guard to guarantee exactly one crisp tick per elapsed second without audio overlapping.
- **🎉 Rich Skribbl.io In-Game Sound Effects Suite**
  - **🚀 Game Launch Fanfare (`playGameStart`)**: Bright ascending 4-note major arpeggio ($C_5 \to E_5 \to G_5 \to C_6$) played when the room transitions from lobby to game or when entering the match podium.
  - **🔔 Drawer Turn Alert (`playYourTurn`)**: Friendly two-tone bell chime ($F_5 \to A_5$) alerting the designated drawer when the word selection modal opens.
  - **✨ Correct Guess Sparkle Chime (`playCorrectGuess`)**: Uplifting celestial arpeggio ($G_5 \to B_5 \to D_6 \to G_6$) broadcast when any player successfully cracks the secret word.
  - **📉 Turn End Resolution (`playTurnEnd`)**: Descending 3-note melodic resolution ($G_5 \to E_5 \to C_5$) sounding when the drawing time expires or all players guess the word.
  - **🚪 Player Departure Cue (`playPlayerLeave`)**: Gentle descending two-tone pop ($E_4 \to C_4$) alerting participants when a player leaves the room, gets kicked, or disconnects.
  - **👋 Player Arrival Cue (`playPlayerJoin`)**: Cheerful ascending pop ($G_4 \to C_5$) welcoming newly connected teammates into the waiting lobby or live game.
- **🎚️ Global Sound State & Dual In-Game Mute Toggles (`soundStore.ts`)**
  - **Persistent Audio Settings**: Managed through Zustand with `persist` middleware (`doodlesync-sound-settings`), saving user volume preferences across refreshes and matches.
  - **Global & HUD Controls**: Accessible from both the application footer and a dedicated audio toggle button built right into the in-game header HUD next to the timer.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Audio Engine**: Native Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`)
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
│   │   │   ├── ui/                   # shadcn/ui Radix primitives (dialog.tsx, dropdown-menu.tsx)
│   │   │   ├── AvatarPicker.tsx      # DiceBear customizer & color palette
│   │   │   ├── CountrySelect.tsx     # Searchable country/language combobox
│   │   │   ├── CreateRoomModal.tsx   # Room settings & invite link modal
│   │   │   ├── DrawingCanvas.tsx     # High-DPI HTML5 canvas with flood fill, dynamic bucket cursor & undo
│   │   │   ├── DrawingTools.tsx      # 2-row toolbar: brush/fill/eraser, sizes, undo, clear & 16 colors
│   │   │   ├── Features.tsx          # "Made for Playing Together" cards
│   │   │   ├── Footer.tsx            # Audio mute, credits & shadcn modals
│   │   │   ├── GameHeader.tsx        # Clamped round tracker, word mask & urgency timer with tick audio
│   │   │   ├── GameOverModal.tsx     # Match completion podium with true rankings & winner crown
│   │   │   ├── GameScreen.tsx        # Main game arena (Desktop 3-col & Mobile split)
│   │   │   ├── GuessChat.tsx         # Live chat feed with deduplication & Guessed badge
│   │   │   ├── Header.tsx            # Custom DoodleSync brand & SVG logo
│   │   │   ├── HomeCard.tsx          # Player entry card, auto-username & dice shuffle
│   │   │   ├── HowToPlay.tsx         # 3-step quick guide
│   │   │   ├── JoinRoomModal.tsx     # Join room code input dialog
│   │   │   ├── Scoreboard.tsx        # Ranked player roster (Desktop & Compact mobile)
│   │   │   ├── SpoilerWarningModal.tsx # Drawer anti-spoiler alert dialog
│   │   │   ├── VictoryModal.tsx      # Host departure / default victory modal
│   │   │   ├── WaitingLobby.tsx      # Lobby screen with live shadcn header settings & roster
│   │   │   └── WordChoiceModal.tsx   # 3 word cards with live 15s server countdown
│   │   ├── data/                     # 50+ worldwide countries catalog
│   │   ├── lib/                      # Utility functions, soundManager & singleton Socket.IO client
│   │   ├── store/                    # Zustand stores (playerStore, roomStore & soundStore)
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

### 4. Running Verification & Typechecks

Validate TypeScript compilation across both frontend and backend services:

```bash
# Typecheck backend
cd backend
npx tsc --noEmit

# Typecheck and build frontend
cd ../frontend
npm run build
```

---

## 📄 License
This project is developed as part of an assignment for remote team building and collaborative multiplayer games.
