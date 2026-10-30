import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeCard } from './components/HomeCard';
import { HowToPlay } from './components/HowToPlay';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { WaitingLobby } from './components/WaitingLobby';
import { GameScreen } from './components/GameScreen';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { type RoomInfo } from './types/room';
import { useRoomStore } from './store/roomStore';

// URL query parameter helpers for seamless refresh and shareable links
const updateUrlWithRoom = (roomId: string) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomId);
  window.history.pushState({}, '', url.toString());
};

const clearUrlRoom = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
};

const getInitialScreen = (): 'home' | 'lobby' | 'game' => {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  const savedState = useRoomStore.getState();
  if (roomParam && savedState.currentRoom && savedState.currentRoom.id === roomParam) {
    return savedState.gameStatus === 'playing' ? 'game' : 'lobby';
  }
  return 'home';
};

export const App: React.FC = () => {
  const { currentRoom, leaveRoom, setGameStatus } = useRoomStore();
  const [screen, setScreen] = useState<'home' | 'lobby' | 'game'>(getInitialScreen);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' } | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);

  const showNotification = (message: string) => {
    setNotification({ message, type: 'info' });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle invitation link alerts and session reconnect notices
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (roomParam) {
      if (currentRoom && currentRoom.id === roomParam) {
        const timer = setTimeout(() => {
          const status = useRoomStore.getState().gameStatus;
          if (status === 'playing') {
            showNotification(`Reconnected to active game in ${roomParam}!`);
          } else {
            showNotification(`Reconnected to room ${roomParam}`);
          }
        }, 120);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          showNotification(`Invited to room: ${roomParam}! Click "Join with Room Code" or enter your name to join.`);
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [currentRoom]);

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (!roomParam) {
        setScreen('home');
      } else if (currentRoom && currentRoom.id === roomParam) {
        const status = useRoomStore.getState().gameStatus;
        setScreen(status === 'playing' ? 'game' : 'lobby');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentRoom]);

  const handleEnterLobby = (room: RoomInfo) => {
    setIsCreateRoomOpen(false);
    updateUrlWithRoom(room.id);
    setGameStatus('lobby');
    setScreen('lobby');
    showNotification(`Entered waiting lobby for ${room.id}! Share the link with your team.`);
  };

  const handleJoinedLobby = (roomId: string) => {
    updateUrlWithRoom(roomId);
    setGameStatus('lobby');
    setScreen('lobby');
    showNotification(`Joined lobby for ${roomId}! Waiting for host to start.`);
  };

  const handleStartGame = () => {
    setGameStatus('playing');
    setScreen('game');
    showNotification("🚀 Game arena started! Welcome to Phase 4.");
  };

  const handleLeaveGame = () => {
    setGameStatus('lobby');
    if (currentRoom) {
      setScreen('lobby');
      showNotification("Returned to waiting lobby.");
    } else {
      setScreen('home');
      showNotification("Returned to homepage.");
    }
  };

  const handleLeaveLobby = () => {
    setGameStatus('lobby');
    clearUrlRoom();
    leaveRoom();
    setScreen('home');
    showNotification("Left the waiting lobby.");
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
        {/* Navigation / Brand Header */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <Header />
        </div>

        {/* Screen Routing: Game vs Lobby vs Home */}
        {screen === 'game' ? (
          <section className="w-full my-auto py-2">
            <GameScreen onLeaveGame={handleLeaveGame} />
          </section>
        ) : screen === 'lobby' ? (
          <section className="w-full my-auto py-4">
            <WaitingLobby
              onStartGame={handleStartGame}
              onLeaveLobby={handleLeaveLobby}
            />
          </section>
        ) : (

          <>
            {/* Section 1: Hero & Interactive Card */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
              <section className="w-full mt-3 flex justify-center">
                <HomeCard
                  onPlayPublic={() => {
                    setGameStatus('playing');
                    setScreen('game');
                    showNotification("🎮 Joined public arena demo! Phase 4 Core Gameplay active.");
                  }}
                  onCreatePrivateRoom={() => {
                    setIsCreateRoomOpen(true);
                  }}
                  onOpenJoinRoom={() => {
                    setIsJoinRoomOpen(true);
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
          </>
        )}
      </main>

      {/* Full-width Footer (Hidden during active gameplay) */}
      {screen !== 'game' && <Footer />}

      {/* Phase 2: Create Private Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onEnterLobby={handleEnterLobby}
      />

      {/* Phase 3: Join Private Room Modal */}
      <JoinRoomModal
        isOpen={isJoinRoomOpen}
        onClose={() => setIsJoinRoomOpen(false)}
        onSuccess={handleJoinedLobby}
      />
    </div>
  );
};

export default App;

