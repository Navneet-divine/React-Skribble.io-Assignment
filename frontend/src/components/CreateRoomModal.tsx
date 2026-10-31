import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Clock,
  RotateCcw,
  Users,
  FileText,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
  Gamepad2,
  EyeOff,
  HelpCircle,
  Type,
  Layers,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { CountrySelect } from './CountrySelect';
import { usePlayerStore } from '../store/playerStore';
import { useRoomStore } from '../store/roomStore';
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
  type RoomInfo,
  type GameMode,
  type WordCountOption,
  type HintsOption,
} from '../types/room';
import { createMultiplayerRoom } from '../lib/socket';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterLobby?: (room: RoomInfo) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onEnterLobby,
}) => {
  const { language, setLanguage, username, avatar } = usePlayerStore();
  const { createRoom } = useRoomStore();

  // Settings State
  const [rounds, setRounds] = useState<number>(3);
  const [drawTime, setDrawTime] = useState<number>(80);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [wordCount, setWordCount] = useState<WordCountOption>(3);
  const [hints, setHints] = useState<HintsOption>(2);
  const [roomLanguage, setRoomLanguage] = useState<string>(language || 'en');
  const [customWordsInput, setCustomWordsInput] = useState<string>('');
  const [onlyCustomWords, setOnlyCustomWords] = useState<boolean>(false);

  // Sync roomLanguage whenever store language updates (e.g. from CountrySelect)
  useEffect(() => {
    if (language) {
      setRoomLanguage(language);
    }
  }, [language]);

  // Created Room State (Step 2)
  const [createdRoom, setCreatedRoom] = useState<RoomInfo | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Whenever modal opens, always reset createdRoom so it opens directly on Step 1 (Room Creation Settings Form)
  useEffect(() => {
    if (isOpen) {
      setCreatedRoom(null);
      setHasCopied(false);
    }
  }, [isOpen]);

  // Parse, deduplicate, and validate custom words (comma & newline, max 100 words, max 32 chars, max 20k chars)
  const parsedWords = (() => {
    const clamped = customWordsInput.slice(0, 20000);
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const raw of clamped.split(/[\n,\r]+/)) {
      const trimmed = raw.trim().replace(/\s+/g, ' ');
      if (trimmed.length >= 1 && trimmed.length <= 32) {
        const lower = trimmed.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          unique.push(trimmed);
          if (unique.length >= 100) break;
        }
      }
    }
    return unique;
  })();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const settings: RoomSettings = {
      rounds,
      drawTime,
      maxPlayers,
      language: roomLanguage,
      customWords: parsedWords,
      onlyCustomWords,
      gameMode,
      wordCount,
      hints,
    };

    const effectiveUsername = username.trim() || usePlayerStore.getState().ensureUsername();
    const playerId = usePlayerStore.getState().ensurePlayerId();

    const hostData = {
      id: playerId,
      username: effectiveUsername,
      avatar,
    };

    try {
      const res = await createMultiplayerRoom(settings, hostData);
      if (res && res.success && res.room) {
        useRoomStore.getState().syncRoomData(res.room, hostData.username);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const roomInfo: RoomInfo = {
          id: res.roomId || res.room.id,
          inviteLink: `${baseUrl}/?room=${res.roomId || res.room.id}`,
          isHost: true,
          settings,
          createdAt: Date.now(),
        };
        setCreatedRoom(roomInfo);
      } else {
        const newRoom = createRoom(settings, hostData);
        setCreatedRoom(newRoom);
      }
    } catch {
      const newRoom = createRoom(settings, hostData);
      setCreatedRoom(newRoom);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdRoom) return;
    try {
      await navigator.clipboard.writeText(createdRoom.inviteLink);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      // Fallback
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setCreatedRoom(null);
    setHasCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {!createdRoom ? (
          /* STEP 1: Room Settings Form */
          <div>
            <DialogHeader className="text-left mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl md:text-2xl font-bold font-heading">
                    Create Private Room
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-0.5">
                    Customize game rules for your team and invite colleagues.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* 1. Rounds Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Number of Rounds</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROUND_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRounds(r)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${rounds === r
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                        }`}
                    >
                      {r} {r === 3 && <span className="text-[10px] font-normal opacity-80">(Default)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Drawing Turn Time Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Draw Time (Seconds)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DRAW_TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setDrawTime(t.value)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${drawTime === t.value
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400/60'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Max Players Selection (Buttons from 2 to 20) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Max Players</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MAX_PLAYERS_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMaxPlayers(p)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${maxPlayers === p
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                        }`}
                    >
                      {p} {p === 8 && <span className="text-[10px] font-normal opacity-80">(Standard)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Game Mode Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <Gamepad2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Game Mode</span>
                  </label>
                  <span className="text-xs text-fuchsia-400 font-bold bg-fuchsia-500/10 px-2.5 py-0.5 rounded-full border border-fuchsia-500/20 capitalize whitespace-nowrap shrink-0">
                    {gameMode} Mode
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {GAME_MODE_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setGameMode(m.value)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${gameMode === m.value
                          ? 'bg-fuchsia-600/15 border-fuchsia-500 ring-2 ring-fuchsia-500/40 shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {m.value === 'normal' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                          {m.value === 'hidden' && <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                          {m.value === 'combination' && <Layers className="w-3.5 h-3.5 text-emerald-400" />}
                          {m.label}
                        </span>
                        {gameMode === m.value && (
                          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {m.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Word Count Selection (Drawer Choices) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 min-w-0">
                    <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Word Choices</span>
                  </label>
                  <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 whitespace-nowrap shrink-0">
                    {wordCount === 1 ? '1 Choice (Instant)' : `${wordCount} Choices`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {WORD_COUNT_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWordCount(c)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center leading-none ${wordCount === c
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-2 ring-cyan-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                        }`}
                    >
                      <span>{c}</span>
                      {c === 3 && <span className="text-[9px] font-normal opacity-80 mt-0.5">Default</span>}
                      {c === 1 && <span className="text-[9px] font-normal opacity-80 mt-0.5">Instant</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {wordCount === 1
                    ? '⚡ Turn starts drawing immediately with 1 word choice (no picker dialog).'
                    : `Drawer receives ${wordCount} word choices to pick from each turn.`}
                </p>
              </div>

              {/* 6. Letter Hints Selection */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 min-w-0">
                    <HelpCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>Hints</span>
                  </label>
                  <span className="text-xs text-violet-400 font-bold bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20 whitespace-nowrap shrink-0">
                    {gameMode === 'hidden'
                      ? 'Disabled in Hidden'
                      : hints === 0
                        ? 'No Hints'
                        : `${hints} Letters Max`}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1 sm:gap-2">
                  {HINTS_OPTIONS.map((h) => {
                    const isDisabled = gameMode === 'hidden';
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setHints(h)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center leading-none ${isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-slate-800/40 text-slate-500 border border-slate-800'
                            : hints === h
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-400/50'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                          }`}
                      >
                        <span>{h}</span>
                        {h === 2 && !isDisabled && <span className="text-[9px] font-normal opacity-80 mt-0.5">Default</span>}
                        {h === 0 && <span className="text-[9px] font-normal opacity-80 mt-0.5">None</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {gameMode === 'hidden'
                    ? '🔒 Letter hints are disabled in Hidden Mode. Guessers must deduce solely from drawing.'
                    : hints === 0
                      ? 'No letter hints will be revealed to guessers.'
                      : `Progressively reveals up to ${hints} letter${hints > 1 ? 's' : ''} during the turn timer.`}
                </p>
              </div>

              {/* 4. Word Language / Dictionary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>Game Language</span>
                  </label>
                  <span className="text-[11px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                    {getLanguageMeta(roomLanguage).flag} {getLanguageMeta(roomLanguage).name}
                  </span>
                </div>

                {/* Primary Skribbl Language Buttons (All 10 Supported Languages) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = getLanguageMeta(roomLanguage).code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setRoomLanguage(lang.code);
                          setLanguage(lang.code);
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${isSelected
                            ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/25 ring-1 ring-sky-300'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                          }`}
                      >
                        <span className="text-lg leading-none">{lang.flag}</span>
                        <span className="truncate text-[11px] font-bold">{lang.name}</span>
                        <span
                          className={`text-[10px] truncate ${isSelected ? 'text-sky-100 font-medium' : 'text-slate-400'
                            }`}
                        >
                          {lang.nativeName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Optional full country selector */}
                <div className="pt-1">
                  <CountrySelect />
                </div>
              </div>

              {/* 5. Custom Words Input (Skribbl style) */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Custom Words</span>
                  </label>
                  {parsedWords.length > 0 ? (
                    <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {parsedWords.length} words added
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Optional</span>
                  )}
                </div>

                <textarea
                  value={customWordsInput}
                  onChange={(e) => setCustomWordsInput(e.target.value)}
                  maxLength={20000}
                  placeholder="Enter custom words separated by commas or new lines (min. 10 words, max. 100 words, 1-32 chars each)..."
                  rows={2}
                  className="w-full p-3 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                />
                {parsedWords.length > 0 && parsedWords.length < 10 && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    ⚠️ At least 10 custom words recommended ({parsedWords.length}/10 entered).
                  </p>
                )}

                {/* Mix vs Only Custom Words Mode */}
                <div className="space-y-2 pt-1 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Custom Words Mode
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={parsedWords.length === 0}
                      onClick={() => setOnlyCustomWords(false)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${parsedWords.length === 0
                          ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800'
                          : !onlyCustomWords
                            ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          Mix Custom Words
                        </span>
                        {!onlyCustomWords && parsedWords.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">
                        Combine custom words with the standard {getLanguageMeta(roomLanguage).name} dictionary.
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={parsedWords.length === 0}
                      onClick={() => setOnlyCustomWords(true)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${parsedWords.length === 0
                          ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800'
                          : onlyCustomWords
                            ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 cursor-pointer'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-indigo-400" />
                          Only Custom Words
                        </span>
                        {onlyCustomWords && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">
                        Use exclusively host custom words (disables standard dictionary).
                      </span>
                    </button>
                  </div>
                </div>

                {parsedWords.length > 0 && gameMode === 'combination' && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                    💡 In Combination Mode, dual prompts will be created from your custom words (e.g. {parsedWords[0] || 'WORD1'} + {parsedWords[1] || 'WORD2'}).
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-[0.99] text-white font-heading font-semibold text-base flex items-center justify-center gap-2 border border-indigo-400/30 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  <span>Generate Room & Invite Link</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Room Created & Shareable Link */
          <div className="py-2 text-center animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Success icon badge */}
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Check className="w-7 h-7" />
            </div>

            <DialogTitle className="text-2xl font-bold font-heading text-white">
              Private Room Ready!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Share the invitation link with your team members so they can join your lobby.
            </DialogDescription>

            {/* Room Code Badge */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Room Code
              </div>
              <div className="font-mono text-3xl font-black text-amber-400 tracking-wider">
                {createdRoom.id}
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="mt-4 text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Shareable Invitation Link
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={createdRoom.inviteLink}
                  className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${hasCopied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                    }`}
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Settings Quick Recap */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Rounds</div>
                <div className="font-bold text-slate-200 mt-0.5">{createdRoom.settings.rounds}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Turn Time</div>
                <div className="font-bold text-slate-200 mt-0.5">{createdRoom.settings.drawTime}s</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Max Players</div>
                <div className="font-bold text-slate-200 mt-0.5">{createdRoom.settings.maxPlayers}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Language</div>
                <div className="font-bold text-sky-300 mt-0.5 truncate">
                  {getLanguageMeta(createdRoom.settings.language).flag} {getLanguageMeta(createdRoom.settings.language).name}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Game Mode</div>
                <div className="font-bold text-fuchsia-300 mt-0.5 capitalize">{createdRoom.settings.gameMode || 'normal'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Word Choices</div>
                <div className="font-bold text-cyan-300 mt-0.5">{createdRoom.settings.wordCount || 3}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Hints</div>
                <div className="font-bold text-violet-300 mt-0.5">
                  {createdRoom.settings.gameMode === 'hidden' ? 'None (Hidden)' : `${createdRoom.settings.hints ?? 2} max`}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Custom Words</div>
                <div className="font-bold text-indigo-300 mt-0.5 truncate">
                  {createdRoom.settings.customWords && createdRoom.settings.customWords.length > 0
                    ? createdRoom.settings.onlyCustomWords
                      ? `Only (${createdRoom.settings.customWords.length})`
                      : `Mix (${createdRoom.settings.customWords.length})`
                    : 'None'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCreatedRoom(null)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconfigure</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onEnterLobby) {
                    const roomToEnter = createdRoom;
                    setCreatedRoom(null);
                    onEnterLobby(roomToEnter);
                  } else {
                    alert(`Entering waiting lobby for ${createdRoom.id} as host: ${username || 'Host'}! (Phase 3 Lobby Ready)`);
                    handleResetAndClose();
                  }
                }}
                className="w-full flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <span>Enter Waiting Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
