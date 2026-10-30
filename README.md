# DoodleSync 🎨⚡

> **Multiplayer Drawing & Guessing Game for Remote Teams & Virtual Socials.**

DoodleSync is a modern, real-time multiplayer drawing and guessing platform inspired by the core mechanics of Skribbl.io, elevated with a fresh design language, team-first room controls, and collaborative icebreaker features.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui Dialogs, Lucide Icons
- **State Management**: Zustand with persistent storage
- **Avatars**: Vector DiceBear cartoon avatars with style & color customizer
- **Backend (Upcoming)**: Node.js, Express, Socket.IO for real-time canvas and chat synchronization

---

## 📁 Project Structure

```
├── frontend/               # React + Vite client application
│   ├── src/
│   │   ├── components/     # Header, AvatarPicker, HomeCard, CountrySelect, HowToPlay, Features, Footer, UI
│   │   ├── data/           # Global country & language catalog
│   │   ├── lib/            # Utilities (cn helper)
│   │   ├── store/          # Zustand playerStore with localStorage persistence
│   │   ├── types/          # TypeScript definitions
│   │   ├── App.tsx         # Root layout
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .gitignore
├── backend/                # (Upcoming: Socket.IO & game room server)
└── README.md
```

---

## 🛠️ Getting Started

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Run Locally
```bash
npm run dev
```

Visit [http://localhost:5174/](http://localhost:5174/) to play!
