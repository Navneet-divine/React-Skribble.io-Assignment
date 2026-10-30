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
import { VictoryModal } from './components/VictoryModal';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { type RoomInfo } from './types/room';
import { useRoomStore } from './store/roomStore';
import { usePlayerStore } from './store/playerStore';
import { socket, joinMultiplayerRoom, leaveMultiplayerRoom } from './lib/socket';

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

  // Victory by default modal (e.g. when opponent leaves during game)
  const [victoryModalInfo, setVictoryModalInfo] = useState<{
    isOpen: boolean;
    winnerName: string;
    reason: string;
    isNewHost: boolean;
    roomId: string;
  } | null>(null);

  const showNotification = (message: string) => {
    setNotification({ message, type: 'info' });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle invitation link alert (only once when arriving via shared link without an active room)
  const hasAnnouncedInvite = React.useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (roomParam && !hasAnnouncedInvite.current) {
      const savedRoom = useRoomStore.getState().currentRoom;
      if (!savedRoom || savedRoom.id !== roomParam) {
        hasAnnouncedInvite.current = true;
        const timer = setTimeout(() => {
          showNotification(`Invited to room: ${roomParam}! Click "Join with Room Code" or enter your name to join.`);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, []);

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

  // Real-time synchronization for game start and room transitions
  useEffect(() => {
    const handleRoomData = (data: any) => {
      const username = usePlayerStore.getState().username;
      useRoomStore.getState().syncRoomData(data, username);
      if (data.status === 'choosing' || data.status === 'drawing' || data.status === 'round_end' || data.status === 'game_end') {
        setScreen('game');
        setGameStatus('playing');
      } else if (data.status === 'lobby') {
        setScreen('lobby');
        setGameStatus('lobby');
      }
    };

    const handleVictoryDefault = (info: {
      winnerId: string;
      winnerName: string;
      reason: string;
      isNewHost: boolean;
      roomId: string;
    }) => {
      setVictoryModalInfo({
        isOpen: true,
        winnerName: info.winnerName,
        reason: info.reason,
        isNewHost: Boolean(info.isNewHost),
        roomId: info.roomId,
      });
      setScreen('lobby');
      setGameStatus('lobby');
    };

    socket.on('room:data', handleRoomData);
    socket.on('game:victory_default', handleVictoryDefault);

    return () => {
      socket.off('room:data', handleRoomData);
      socket.off('game:victory_default', handleVictoryDefault);
    };
  }, [setGameStatus]);

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
    const currentPlayers = useRoomStore.getState().players;
    if (currentPlayers.length < 2) {
      showNotification("⚠️ At least 2 players are required to start the game!");
      return;
    }
    setGameStatus('playing');
    setScreen('game');
    showNotification("🚀 Game arena started!");
  };

  const handleLeaveGame = () => {
    leaveMultiplayerRoom();
    setGameStatus('lobby');
    clearUrlRoom();
    leaveRoom();
    setScreen('home');
    showNotification("Left the game and returned to homepage.");
  };

  const handleLeaveLobby = () => {
    leaveMultiplayerRoom();
    setGameStatus('lobby');
    clearUrlRoom();
    leaveRoom();
    setScreen('home');
    showNotification("Left the waiting lobby.");
  };

  const handlePlayFromHome = async () => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const { avatar, ensureUsername } = usePlayerStore.getState();
    const effectiveUsername = ensureUsername();

    if (roomParam) {
      showNotification(`Joining room ${roomParam}...`);
      try {
        const res = await joinMultiplayerRoom(roomParam, {
          username: effectiveUsername,
          avatar,
        });

        if (res && res.success && res.room) {
          useRoomStore.getState().syncRoomData(res.room, effectiveUsername);
          handleJoinedLobby(roomParam);
          showNotification(`Joined room ${roomParam}!`);
        } else {
          showNotification(`⚠️ ${res?.error || 'Could not join room.'}`);
        }
      } catch {
        useRoomStore.getState().joinRoom(roomParam, { username: effectiveUsername, avatar }, false);
        handleJoinedLobby(roomParam);
      }
    } else {
      setIsJoinRoomOpen(true);
    }
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
        {/* Navigation / Brand Header (Hidden during active gameplay to maximize mobile screen space) */}
        {screen !== 'game' && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <Header />
          </div>
        )}

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
                  onPlayPublic={handlePlayFromHome}
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

      {/* Victory by Default Modal (Player left / host reassignment) */}
      <VictoryModal
        isOpen={Boolean(victoryModalInfo?.isOpen)}
        winnerName={victoryModalInfo?.winnerName || ''}
        reason={victoryModalInfo?.reason || ''}
        isNewHost={Boolean(victoryModalInfo?.isNewHost)}
        roomId={victoryModalInfo?.roomId || currentRoom?.id || ''}
        onContinue={() => setVictoryModalInfo(null)}
      />
    </div>
  );
};

export default App;

