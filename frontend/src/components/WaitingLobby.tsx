import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Copy,
  Check,
  Crown,
  Users,
  Play,
  LogOut,
  Clock,
  RotateCcw,
  Globe,
  Sparkles,
  UserX,
  FileText,
  Gamepad2,
  Type,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useRoomStore } from '../store/roomStore';
import { usePlayerStore, getAvatarUrl } from '../store/playerStore';
import {
  socket,
  startMultiplayerGame,
  leaveMultiplayerRoom,
  updateRoomSettingsOnServer,
  emitChatMessage,
} from '../lib/socket';
import { type ChatMessage } from '../types/game';
import {
  ROUND_OPTIONS,
  DRAW_TIME_OPTIONS,
  MAX_PLAYERS_OPTIONS,
  GAME_MODE_OPTIONS,
  WORD_COUNT_OPTIONS,
  HINTS_OPTIONS,
  SUPPORTED_LANGUAGES,
  getLanguageMeta,
  type RoomSettings,
  type GameMode,
  type WordCountOption,
  type HintsOption,
} from '../types/room';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

interface WaitingLobbyProps {
  onStartGame?: () => void;
  onLeaveLobby?: () => void;
}

export interface CustomWordsValidationResult {
  uniqueWords: string[];
  duplicateCount: number;
  invalidLengthCount: number;
  exceededMaxCount: number;
  totalChars: number;
  isMinMet: boolean;
  isValid: boolean;
}

// Helper: Parse, deduplicate, and validate custom words (case-insensitive, 1-32 chars, max 100 words, max 20,000 chars, comma & newlines)
export const validateAndDeduplicateWords = (
  input: string | string[]
): CustomWordsValidationResult => {
  const rawString = Array.isArray(input) ? input.join(', ') : (input || '');
  // Clamp total input to 20,000 characters
  const clamped = rawString.slice(0, 20000);
  // Accept comma-separated entries and new lines
  const list = clamped.split(/[\n,\r]+/);
  const seen = new Set<string>();
  const collectedWords: string[] = [];
  let duplicateCount = 0;
  let invalidLengthCount = 0;

  for (const item of list) {
    // Remove empty entries, trim outer whitespace, collapse multiple spaces
    const trimmed = String(item).trim().replace(/\s+/g, ' ');
    if (!trimmed) continue;
    // Maximum length: 32 characters per entry
    if (trimmed.length > 32) {
      invalidLengthCount++;
      continue;
    }
    // Prevent duplicate entries (case-insensitive) while allowing spaces and multilingual characters
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) {
      duplicateCount++;
    } else {
      seen.add(lower);
      collectedWords.push(trimmed);
    }
  }

  // Maximum: 100 custom words
  const exceededMaxCount = Math.max(0, collectedWords.length - 100);
  const uniqueWords = collectedWords.slice(0, 100);
  // Minimum: 10 custom words
  const isMinMet = uniqueWords.length >= 10;
  const isValid = isMinMet && uniqueWords.length <= 100;

  return {
    uniqueWords,
    duplicateCount,
    invalidLengthCount,
    exceededMaxCount,
    totalChars: clamped.length,
    isMinMet,
    isValid,
  };
};

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({
  onStartGame,
  onLeaveLobby,
}) => {
  const { currentRoom, isHost, players, kickPlayer, leaveRoom, syncRoomData } = useRoomStore();
  const { username } = usePlayerStore();
  const [hasCopied, setHasCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Lobby Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const desktopChatFeedRef = useRef<HTMLDivElement>(null);
  const mobileChatFeedRef = useRef<HTMLDivElement>(null);

  // Custom words editor state (Open as default)
  const [customWordsText, setCustomWordsText] = useState('');
  const [isSavingWords, setIsSavingWords] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time custom words validation info
  const wordValidation = useMemo(() => {
    return validateAndDeduplicateWords(customWordsText);
  }, [customWordsText]);

  // Sync custom words from room settings into local textarea
  useEffect(() => {
    if (currentRoom?.settings?.customWords) {
      setCustomWordsText(currentRoom.settings.customWords.join(', '));
    }
  }, [currentRoom?.settings?.customWords]);

  // Sync real-time updates from server (player joins, quits, settings updates, game start, chat)
  useEffect(() => {
    const handleRoomData = (data: any) => {
      syncRoomData(data, username);
      if (data.status === 'choosing' || data.status === 'drawing') {
        onStartGame?.();
      }
    };

    const handleChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('room:data', handleRoomData);
    socket.on('chat:message', handleChatMessage);

    return () => {
      socket.off('room:data', handleRoomData);
      socket.off('chat:message', handleChatMessage);
    };
  }, [syncRoomData, username, onStartGame]);

  // Auto-scroll chat to latest message (scoped to chat container ONLY, NEVER scrolls the page window!)
  useEffect(() => {
    if (desktopChatFeedRef.current) {
      desktopChatFeedRef.current.scrollTop = desktopChatFeedRef.current.scrollHeight;
    }
    if (mobileChatFeedRef.current) {
      mobileChatFeedRef.current.scrollTop = mobileChatFeedRef.current.scrollHeight;
    }
  }, [messages]);

  if (!currentRoom) {
    return (
      <div className="w-full max-w-md mx-auto my-12 text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl">
        <p className="text-slate-400 mb-4">No active room found.</p>
        <button
          type="button"
          onClick={onLeaveLobby}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const hasEnoughCustomWords =
    !currentRoom.settings.onlyCustomWords ||
    Boolean(currentRoom.settings.customWords && currentRoom.settings.customWords.length >= 10);
  const canStartGame = players.length >= 2 && hasEnoughCustomWords;
  const hostPlayer = players.find((p) => p.isHost) || players[0];
  const maxPlayers = currentRoom.settings.maxPlayers;
  const remainingSlots = Math.max(0, maxPlayers - players.length);

  // Host setting updater (syncs real-time over WebSocket to all participants)
  const handleSettingChange = async (updates: Partial<RoomSettings>) => {
    if (!currentRoom || !isHost) return;
    try {
      await updateRoomSettingsOnServer(currentRoom.id, updates);
    } catch (err) {
      console.error('Failed to update room settings:', err);
    }
  };

  // Custom words change handler with auto-save debounce (strictly deduplicated and sanitized)
  const handleWordsInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCustomWordsText(text);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const { uniqueWords } = validateAndDeduplicateWords(text);
      handleSettingChange({ customWords: uniqueWords });
    }, 1000);
  };

  // Manual save words button (cleans up duplicates and updates textarea and server)
  const handleManualSaveWords = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsSavingWords(true);
    const { uniqueWords } = validateAndDeduplicateWords(customWordsText);
    setCustomWordsText(uniqueWords.join(', '));
    await handleSettingChange({ customWords: uniqueWords });
    setIsSavingWords(false);
  };

  // Send lobby chat message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInputText.trim();
    if (!trimmed) return;
    emitChatMessage(trimmed);
    setChatInputText('');
  };

  const handleStart = () => {
    if (!canStartGame) return;
    startMultiplayerGame();
    if (onStartGame) onStartGame();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentRoom.inviteLink);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const handleLeave = () => {
    leaveMultiplayerRoom();
    leaveRoom();
    if (onLeaveLobby) onLeaveLobby();
  };

  const currentLang = getLanguageMeta(currentRoom.settings.language);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Lobby Navigation Header with Real-Time Interactive Settings Inputs */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl">
        {/* Room Code Badge & Copy Link placed right side of Private Room */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Private Room
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700/80 transition-colors cursor-pointer shrink-0"
                title="Copy room invite link"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xl md:text-2xl font-black text-amber-400 tracking-wider">
              {currentRoom.id}
            </div>
          </div>
        </div>

        {/* Real-Time Settings Inputs in Header (shadcn DropdownMenu for Host, Live-Updating for Guests) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 1. Players Dropdown */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                    title="Change max players"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium">
                      {currentRoom.settings.maxPlayers} Players
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Max Players</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={String(currentRoom.settings.maxPlayers)}
                    onValueChange={(val) => handleSettingChange({ maxPlayers: Number(val) })}
                  >
                    {MAX_PLAYERS_OPTIONS.map((p) => (
                      <DropdownMenuRadioItem key={p} value={String(p)}>
                        {p} Players {p === 8 ? '(Standard)' : ''}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentRoom.settings.maxPlayers} Players</span>
              </div>
            )}
          </div>

          {/* 2. Language Dropdown (10 Supported Languages) */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                    title="Change game language"
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-medium">
                      {currentLang.flag} {currentLang.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Game Language (10 Available)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentLang.code}
                    onValueChange={(val) => handleSettingChange({ language: val })}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                        <span className="mr-1.5">{lang.flag}</span>
                        <span>{lang.name}</span>
                        <span className="text-slate-400 text-[11px] ml-1">({lang.nativeName})</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  {currentLang.flag} {currentLang.name}
                </span>
              </div>
            )}
          </div>

          {/* 3. Drawtime Dropdown */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                    title="Change draw duration"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium">
                      {currentRoom.settings.drawTime}s Draw
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Draw Duration</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={String(currentRoom.settings.drawTime)}
                    onValueChange={(val) => handleSettingChange({ drawTime: Number(val) })}
                  >
                    {DRAW_TIME_OPTIONS.map((t) => (
                      <DropdownMenuRadioItem key={t.value} value={String(t.value)}>
                        {t.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{currentRoom.settings.drawTime}s Draw</span>
              </div>
            )}
          </div>

          {/* 4. Rounds Dropdown */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                    title="Change number of rounds"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="font-medium">
                      {currentRoom.settings.rounds} Rounds
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Rounds per Game</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={String(currentRoom.settings.rounds)}
                    onValueChange={(val) => handleSettingChange({ rounds: Number(val) })}
                  >
                    {ROUND_OPTIONS.map((r) => (
                      <DropdownMenuRadioItem key={r} value={String(r)}>
                        {r} Rounds {r === 3 ? '(Default)' : ''}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{currentRoom.settings.rounds} Rounds</span>
              </div>
            )}
          </div>

          {/* 5. Game Mode Dropdown */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                    title="Change game mode"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span className="font-medium capitalize">
                      {currentRoom.settings.gameMode || 'normal'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Game Mode</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentRoom.settings.gameMode || 'normal'}
                    onValueChange={(val) => handleSettingChange({ gameMode: val as GameMode })}
                  >
                    {GAME_MODE_OPTIONS.map((gm) => (
                      <DropdownMenuRadioItem key={gm.value} value={gm.value}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{gm.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {gm.value === 'normal'
                              ? 'Classic word blanks & hints'
                              : gm.value === 'hidden'
                              ? 'No blanks, guess by drawing'
                              : 'Guess 2-word combo prompts'}
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <Gamepad2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                <span className="capitalize">{currentRoom.settings.gameMode || 'normal'}</span>
              </div>
            )}
          </div>

          {/* 6. Word Count Dropdown */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                    title="Change word choices count"
                  >
                    <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium">
                      {currentRoom.settings.wordCount || 3} Choices
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuLabel>Word Choices Offered</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={String(currentRoom.settings.wordCount || 3)}
                    onValueChange={(val) =>
                      handleSettingChange({ wordCount: Number(val) as WordCountOption })
                    }
                  >
                    {WORD_COUNT_OPTIONS.map((wc) => (
                      <DropdownMenuRadioItem key={wc} value={String(wc)}>
                        {wc} {wc === 1 ? 'Choice (Instant Draw)' : wc === 3 ? 'Choices (Default)' : 'Choices'}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{currentRoom.settings.wordCount || 3} Choices</span>
              </div>
            )}
          </div>

          {/* 7. Hints Dropdown */}
          <div className="relative inline-flex items-center">
            {isHost ? (
              currentRoom.settings.gameMode === 'hidden' ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-500 opacity-60 shadow-xs cursor-not-allowed select-none"
                  title="Hints are disabled in Hidden Mode"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-medium">No Hints</span>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-slate-200 transition-all shadow-xs cursor-pointer select-none focus:outline-none"
                      title="Change hint letters count"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="font-medium">
                        {`${currentRoom.settings.hints ?? 2} Hints`}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Hints per Turn</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={String(currentRoom.settings.hints ?? 2)}
                      onValueChange={(val) =>
                        handleSettingChange({ hints: Number(val) as HintsOption })
                      }
                    >
                      {HINTS_OPTIONS.map((h) => (
                        <DropdownMenuRadioItem key={h} value={String(h)}>
                          {h === 0 ? '0 Hints (None)' : h === 2 ? '2 Hints (Default)' : `${h} Hints`}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-xs">
                <HelpCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>
                  {currentRoom.settings.gameMode === 'hidden'
                    ? 'No Hints'
                    : `${currentRoom.settings.hints ?? 2} Hints`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Leave Room Button */}
        <button
          type="button"
          onClick={() => setShowLeaveConfirm(true)}
          className="w-full xl:w-auto px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET LAYOUT (< lg): Skribbl-Style 50-50 Side-by-Side Panel & Chat */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden flex-col gap-4">
        {/* 50-50 Side-by-Side Split Row: Players Panel (50%) + Lobby Chat Feed (50%) */}
        <div className="grid grid-cols-2 gap-2 h-[220px] xs:h-[240px] sm:h-[260px] w-full min-h-0 overflow-hidden">
          {/* Left Column (50%): Compact Players Roster */}
          <div className="h-full min-h-0 overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 p-2.5 flex flex-col shadow-lg">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 shrink-0">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1 font-heading truncate">
                <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Players ({players.length}/{maxPlayers})</span>
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pt-1.5 scrollbar-thin">
              {players.map((player) => {
                const isCurrentUser = player.username === username;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all ${
                      player.isHost
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isCurrentUser
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-slate-800/50 border-slate-700/40'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-slate-700/60 p-0.5"
                      style={{ backgroundColor: `#${player.avatar.backgroundColor}` }}
                    >
                      <img
                        src={getAvatarUrl(player.avatar)}
                        alt={player.username}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-200 truncate">
                          {player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[8px] font-bold text-indigo-300 bg-indigo-500/25 px-1 py-0.2 rounded shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      {player.isHost ? (
                        <div className="text-[9px] text-amber-400 flex items-center gap-0.5 font-semibold">
                          <Crown className="w-2.5 h-2.5 fill-amber-400" /> Host
                        </div>
                      ) : (
                        <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready
                        </div>
                      )}
                    </div>

                    {isHost && !player.isHost && (
                      <button
                        type="button"
                        onClick={() => kickPlayer(player.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                        title="Kick"
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (50%): Live Lobby Chat Feed */}
          <div className="h-full min-h-0 overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 p-2.5 flex flex-col shadow-lg">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 shrink-0">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1 font-heading">
                <MessageSquare className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Lobby Chat</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {messages.length} msgs
              </span>
            </div>

            <div ref={mobileChatFeedRef} className="flex-1 min-h-0 overflow-y-auto space-y-1 pt-1.5 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-2 text-slate-500">
                  <Sparkles className="w-4 h-4 text-indigo-500/60 mb-1" />
                  <p className="text-[10px]">Chat while waiting!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.type === 'system') {
                    return (
                      <div
                        key={msg.id}
                        className="text-center text-[10px] leading-tight py-0.5 px-1 text-slate-400 bg-slate-800/40 rounded-md"
                      >
                        {msg.text}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={msg.id}
                      className="text-[11px] leading-snug px-1.5 py-0.5 bg-slate-800/30 rounded-lg break-words"
                    >
                      <span className="font-bold text-indigo-300 mr-1">{msg.senderName}:</span>
                      <span className="text-slate-200">{msg.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Mobile Full-Width Chat Input Bar */}
        <form
          onSubmit={handleSendChatMessage}
          className="p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-2 shadow-lg"
        >
          <input
            type="text"
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            placeholder="Type your message here..."
            maxLength={100}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!chatInputText.trim()}
            className={`p-2 rounded-xl text-white transition-all shrink-0 cursor-pointer ${
              chatInputText.trim()
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Mobile Custom Words Card (Open as Default) */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <h3 className="text-sm font-bold font-heading text-white whitespace-nowrap">Custom Words</h3>
              {currentRoom.settings.customWords && currentRoom.settings.customWords.length > 0 && (
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 whitespace-nowrap">
                  {currentRoom.settings.customWords.length}/100 words
                </span>
              )}
              {wordValidation.duplicateCount > 0 && (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                  ⚠️ {wordValidation.duplicateCount} duplicate{wordValidation.duplicateCount > 1 ? 's' : ''} removed
                </span>
              )}
              {wordValidation.invalidLengthCount > 0 && (
                <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap">
                  ⚠️ {wordValidation.invalidLengthCount} &gt;32 chars
                </span>
              )}
              {wordValidation.exceededMaxCount > 0 && (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                  ⚠️ Max 100
                </span>
              )}
            </div>

            <label
              className={`flex items-center gap-1.5 select-none text-xs font-semibold shrink-0 whitespace-nowrap ${
                isHost ? 'text-slate-300 hover:text-white cursor-pointer' : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                disabled={!isHost}
                checked={Boolean(currentRoom.settings.onlyCustomWords)}
                onChange={(e) => handleSettingChange({ onlyCustomWords: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-[11px] whitespace-nowrap">Use custom words only</span>
            </label>
          </div>

          {isHost ? (
            <div className="space-y-2">
              <textarea
                value={customWordsText}
                onChange={handleWordsInputChange}
                maxLength={20000}
                onBlur={() => {
                  if (
                    wordValidation.duplicateCount > 0 ||
                    wordValidation.invalidLengthCount > 0 ||
                    wordValidation.exceededMaxCount > 0
                  ) {
                    setCustomWordsText(wordValidation.uniqueWords.join(', '));
                  }
                }}
                placeholder="Minimum 10 words. 1-32 chars each. Max 100 words & 20,000 chars total. Comma or new line separated."
                rows={3}
                className="w-full p-2.5 bg-slate-950 text-xs text-slate-200 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none font-mono resize-none transition-all placeholder-slate-500"
              />
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 whitespace-nowrap">
                <span className="text-[10px] text-slate-400 truncate">
                  {wordValidation.uniqueWords.length < 10 ? (
                    <span className="text-amber-400 font-medium">
                      ⚠️ {wordValidation.uniqueWords.length}/10 words (min. 10 required)
                    </span>
                  ) : (
                    <span>
                      {wordValidation.uniqueWords.length}/100 words ({wordValidation.totalChars.toLocaleString()}/20k chars)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  disabled={isSavingWords}
                  onClick={handleManualSaveWords}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer transition-all shrink-0 whitespace-nowrap"
                >
                  {isSavingWords ? 'Saving...' : 'Save Words'}
                </button>
              </div>
            </div>
          ) : currentRoom.settings.customWords && currentRoom.settings.customWords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
              {currentRoom.settings.customWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/60"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No custom words added by host.</p>
          )}
        </div>

        {/* Mobile Start Game Button Controls */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
          {isHost ? (
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={!canStartGame}
                onClick={handleStart}
                className={`w-full py-4 px-6 rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  canStartGame
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-white shadow-xl shadow-emerald-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-80'
                }`}
              >
                <Play className={`w-5 h-5 ${canStartGame ? 'fill-white' : 'fill-slate-500'}`} />
                <span>
                  {players.length < 2
                    ? 'Need 2+ Players to Start'
                    : !hasEnoughCustomWords
                    ? 'Need 10+ Custom Words'
                    : `Start Game (${players.length} Players)`}
                </span>
              </button>

              {!canStartGame && (
                <p className="text-[11px] text-amber-300 text-center font-medium leading-relaxed bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                  {players.length < 2
                    ? '⚠️ At least 2 players are required to start (1 drawer & 1 guesser).'
                    : `⚠️ At least 10 custom words are required when 'Use custom words only' is active (currently ${currentRoom.settings.customWords?.length || 0}/10).`}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="text-xs font-semibold text-amber-300">
                  Waiting for Host to start...
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The host (<strong className="text-slate-200">{hostPlayer?.username}</strong>) will launch Round 1 shortly!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (lg:grid 2x2): Row 1 (Players | Chat) & Row 2 (Custom Words | Start) */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-stretch">
        {/* ROW 1 LEFT (7 cols): Players Roster Card */}
        <div className="lg:col-span-7 h-[285px] p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold font-heading text-white">
                Players in Lobby ({players.length} / {maxPlayers})
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
              {players.length >= 2 ? 'Ready to Start' : 'Needs 2+'}
            </span>
          </div>

          {/* Players Roster Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0 content-start overflow-y-auto pr-1 scrollbar-thin">
            {players.map((player) => {
              const isCurrentUser = player.username === username;
              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    player.isHost
                      ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-sm'
                      : isCurrentUser
                      ? 'bg-indigo-500/10 border-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-2xl p-1 shrink-0 border border-slate-700/60 overflow-hidden flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `#${player.avatar.backgroundColor}` }}
                    >
                      <img
                        src={getAvatarUrl(player.avatar)}
                        alt={player.username}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Name & Badges */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded-md shrink-0">
                            You
                          </span>
                        )}
                      </div>

                      {player.isHost ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mt-0.5">
                          <Crown className="w-3 h-3 fill-amber-400" />
                          <span>Room Host</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Ready</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Host Authority: Kick player option */}
                  {isHost && !player.isHost && (
                    <button
                      type="button"
                      onClick={() => kickPlayer(player.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Kick player"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Empty slots placeholders */}
            {Array.from({ length: Math.min(2, remainingSlots) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="p-3.5 rounded-2xl border border-dashed border-slate-800 flex items-center gap-3 opacity-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  +
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Waiting for teammate to join...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 1 RIGHT (5 cols): Skribbl.io-Style Lobby Chat (Locked Height & Scrollable) */}
        <div className="lg:col-span-5 h-[285px] rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col overflow-hidden">
          {/* Chat Card Header */}
          <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-200">
                Lobby Chat
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {messages.length} messages
            </span>
          </div>

          {/* Chat Messages Scroll Feed (Scrolls internally when message count grows) */}
          <div ref={desktopChatFeedRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Sparkles className="w-6 h-6 mb-1.5 text-indigo-500/60" />
                <p className="text-xs font-medium">Say hello to other players!</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Messages are shared in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div
                      key={msg.id}
                      className="text-center py-1 px-2.5 text-[11px] bg-slate-800/40 text-slate-400 rounded-lg font-medium"
                    >
                      {msg.text}
                    </div>
                  );
                }
                return (
                  <div
                    key={msg.id}
                    className="text-xs px-2.5 py-1.5 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-slate-700/30 break-words transition-colors"
                  >
                    <span className="font-bold text-indigo-300 mr-1.5">
                      {msg.senderName}:
                    </span>
                    <span className="text-slate-200">{msg.text}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendChatMessage}
            className="p-2.5 bg-slate-800/60 border-t border-slate-700/60 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder="Type your message here..."
              maxLength={100}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!chatInputText.trim()}
              className={`p-2 rounded-xl text-white transition-all shrink-0 cursor-pointer ${
                chatInputText.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ROW 2 LEFT (7 cols): Custom Words Card (Always Open by Default) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <h3 className="text-sm font-bold font-heading text-white whitespace-nowrap">Custom Words</h3>
                {currentRoom.settings.customWords && currentRoom.settings.customWords.length > 0 && (
                  <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 whitespace-nowrap">
                    {currentRoom.settings.customWords.length}/100 words
                  </span>
                )}
                {wordValidation.duplicateCount > 0 && (
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                    ⚠️ {wordValidation.duplicateCount} duplicate{wordValidation.duplicateCount > 1 ? 's' : ''} removed
                  </span>
                )}
                {wordValidation.invalidLengthCount > 0 && (
                  <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap">
                    ⚠️ {wordValidation.invalidLengthCount} word(s) &gt;32 chars
                  </span>
                )}
                {wordValidation.exceededMaxCount > 0 && (
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                    ⚠️ Max 100 words reached ({wordValidation.exceededMaxCount} extra omitted)
                  </span>
                )}
              </div>

              {/* Checkbox: Use custom words only */}
              <label
                className={`flex items-center gap-1.5 select-none text-xs font-semibold shrink-0 whitespace-nowrap ${
                  isHost ? 'text-slate-300 hover:text-white cursor-pointer' : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={Boolean(currentRoom.settings.onlyCustomWords)}
                  onChange={(e) => handleSettingChange({ onlyCustomWords: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-[11px] whitespace-nowrap">Use custom words only</span>
              </label>
            </div>

            {isHost ? (
              /* Host View: Open Textarea by Default */
              <div className="space-y-2">
                <textarea
                  value={customWordsText}
                  onChange={handleWordsInputChange}
                  maxLength={20000}
                  onBlur={() => {
                    if (
                      wordValidation.duplicateCount > 0 ||
                      wordValidation.invalidLengthCount > 0 ||
                      wordValidation.exceededMaxCount > 0
                    ) {
                      setCustomWordsText(wordValidation.uniqueWords.join(', '));
                    }
                  }}
                  placeholder="Minimum 10 words. 1-32 characters per word. Max 100 words & 20,000 characters total. Separated by commas or new lines."
                  rows={4}
                  className="w-full p-3 bg-slate-950 text-xs text-slate-200 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none font-mono resize-none transition-all placeholder-slate-500"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {wordValidation.uniqueWords.length < 10 ? (
                      <span className="text-amber-400/90 font-medium">
                        ⚠️ {wordValidation.uniqueWords.length}/10 words (min. 10 required for 'Custom words only').
                      </span>
                    ) : (
                      <span>
                        {wordValidation.uniqueWords.length}/100 unique words ({wordValidation.totalChars.toLocaleString()}/20,000 chars) • Auto-syncs
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={isSavingWords}
                    onClick={handleManualSaveWords}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all shrink-0"
                  >
                    {isSavingWords ? 'Saving...' : 'Save Words'}
                  </button>
                </div>
              </div>
            ) : currentRoom.settings.customWords && currentRoom.settings.customWords.length > 0 ? (
              /* Guest View: Tags */
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {currentRoom.settings.customWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700/60"
                  >
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No custom words added by host yet.</p>
            )}
          </div>
        </div>

        {/* ROW 2 RIGHT (5 cols): Lobby Controls: Start Game Button Area */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-center">
          {isHost ? (
            <div className="space-y-3">
              <button
                type="button"
                disabled={!canStartGame}
                onClick={handleStart}
                className={`w-full py-4 px-6 rounded-2xl font-heading font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                  canStartGame
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-white shadow-xl shadow-emerald-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-80'
                }`}
              >
                <Play className={`w-5 h-5 ${canStartGame ? 'fill-white' : 'fill-slate-500'}`} />
                <span>
                  {players.length < 2
                    ? 'Need 2+ Players to Start'
                    : !hasEnoughCustomWords
                    ? 'Need 10+ Custom Words'
                    : `Start Game (${players.length} Players)`}
                </span>
              </button>

              {!canStartGame ? (
                <p className="text-[11px] text-amber-300 text-center font-medium leading-relaxed bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                  {players.length < 2
                    ? '⚠️ At least 2 players are required to start (1 drawer & 1 guesser).'
                    : `⚠️ At least 10 custom words are required when 'Use custom words only' is active (currently ${currentRoom.settings.customWords?.length || 0}/10).`}
                </p>
              ) : (
                <p className="text-[11px] text-emerald-400/90 text-center leading-relaxed font-medium">
                  ✓ Ready to launch! Click Start Game to begin Round 1.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="text-xs font-semibold text-amber-300">
                  Waiting for Host to start...
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The host (<strong className="text-slate-200">{hostPlayer?.username}</strong>) can change settings and will launch the game shortly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Room Confirmation Modal Dialog */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto sm:mx-0">
              <LogOut className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl">Leave Room?</DialogTitle>
            <DialogDescription>
              {isHost ? (
                <>
                  Are you sure you want to leave the room? Since you are the{' '}
                  <span className="text-amber-400 font-semibold">Host</span>, room ownership and
                  host privileges will automatically be transferred to another player in the lobby.
                </>
              ) : (
                'Are you sure you want to leave the room? You will be disconnected and returned to the main menu.'
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors cursor-pointer"
            >
              Stay in Room
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLeaveConfirm(false);
                handleLeave();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Yes, Leave Room</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
