import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeCard } from './components/HomeCard';
import { HowToPlay } from './components/HowToPlay';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { CreateRoomModal } from './components/CreateRoomModal';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { type RoomInfo } from './types/room';

export const App: React.FC = () => {
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' } | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const showNotification = (message: string) => {
    setNotification({ message, type: 'info' });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Detect invite link on page load (?room=DOODLE-XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const timer = setTimeout(() => {
        showNotification(`Invited to room: ${roomParam}! Enter your name and click Play to join.`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnterLobby = (room: RoomInfo) => {
    showNotification(`Entering waiting lobby for ${room.id} as host! (Phase 3 Lobby Ready)`);
    setIsCreateRoomOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden bg-grid-pattern">
      {/* Ambient background glows - scalable across screens */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[450px] h-[450px] bg-amber-500/10 blur-[150px] rounded-full" />
      <div className="pointer-events-none absolute bottom-1/4 -right-40 w-[550px] h-[400px] bg-teal-500/10 blur-[140px] rounded-full" />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-[90vw]">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/40 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Full-width Main Wrapper */}
      <main className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* Section 1: Hero & Interactive Card */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <Header />

          {/* Central interactive card */}
          <section className="w-full mt-3 flex justify-center">
            <HomeCard
              onPlayPublic={() => {
                showNotification("Quick matchmaking queued! Real-time rooms connect in Phase 5.");
              }}
              onCreatePrivateRoom={() => {
                setIsCreateRoomOpen(true);
              }}
            />
          </section>
        </div>

        {/* Section 2: How to Play */}
        <section id="rules" className="w-full">
          <HowToPlay />
        </section>

        {/* Section 3: Game Features */}
        <div className="w-full">
          <Features />
        </div>

        {/* Remote Team Mini-games teaser pill */}
        <div className="mt-2 mb-8 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-full shadow-sm">
          <Gamepad2 className="w-4 h-4 text-indigo-400" />
          <span>More team mini-games coming soon to the platform</span>
        </div>
      </main>

      {/* Full-width Footer */}
      <Footer />

      {/* Phase 2: Create Private Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onEnterLobby={handleEnterLobby}
      />
    </div>
  );
};

export default App;
