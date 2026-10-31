import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage } from '../types/game';
import { Send, Sparkles, Flame, CheckCircle2, MessageSquare, Ban } from 'lucide-react';
import { SpoilerWarningModal } from './SpoilerWarningModal';

export interface GuessChatInputProps {
  onSendMessage: (text: string) => void;
  isDrawer: boolean;
  hasGuessed: boolean;
  secretWord?: string;
  onTriggerSpoiler?: () => void;
  className?: string;
}

export const GuessChatInput: React.FC<GuessChatInputProps> = ({
  onSendMessage,
  isDrawer,
  hasGuessed,
  secretWord,
  onTriggerSpoiler,
  className = '',
}) => {
  const [inputText, setInputText] = useState('');
  const [localSpoilerOpen, setLocalSpoilerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Prevent drawer from spoiling secret word
    if (isDrawer && secretWord && trimmed.toLowerCase().includes(secretWord.toLowerCase())) {
      if (onTriggerSpoiler) {
        onTriggerSpoiler();
      } else {
        setLocalSpoilerOpen(true);
      }
      return;
    }

    onSendMessage(trimmed);
    setInputText('');
  };

  const getInputPlaceholder = () => {
    if (isDrawer) return "You are drawing! Chat with teammates...";
    if (hasGuessed) return "You guessed the word! Enjoy the show 🎉";
    return "Type your guess here...";
  };

  const isInputDisabled = hasGuessed;

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-2 bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl flex items-center gap-2 ${className}`}
    >
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isInputDisabled}
          placeholder={getInputPlaceholder()}
          maxLength={60}
          className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-950/80 border text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all ${
            hasGuessed
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 cursor-not-allowed pr-20'
              : 'border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          }`}
        />
        {hasGuessed && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Guessed
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={!inputText.trim() || isInputDisabled}
        className={`p-2 rounded-xl text-white transition-all cursor-pointer shrink-0 ${
          inputText.trim() && !isInputDisabled
            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
        title="Send Guess"
      >
        {isInputDisabled ? <Ban className="w-4 h-4" /> : <Send className="w-4 h-4" />}
      </button>

      <SpoilerWarningModal
        isOpen={localSpoilerOpen}
        onClose={() => setLocalSpoilerOpen(false)}
      />
    </form>
  );
};

interface GuessChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isDrawer: boolean;
  hasGuessed: boolean;
  secretWord?: string;
  showSpoilerModal?: boolean;
  onCloseSpoilerModal?: () => void;
  onTriggerSpoiler?: () => void;
  hideInput?: boolean;
  compact?: boolean;
}

export const GuessChat: React.FC<GuessChatProps> = ({
  messages,
  onSendMessage,
  isDrawer,
  hasGuessed,
  secretWord,
  showSpoilerModal = false,
  onCloseSpoilerModal,
  onTriggerSpoiler,
  hideInput = false,
  compact = false,
}) => {
  const [localSpoilerOpen, setLocalSpoilerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWarningOpen = localSpoilerOpen || showSpoilerModal;

  const handleCloseSpoilerModal = () => {
    setLocalSpoilerOpen(false);
    if (onCloseSpoilerModal) {
      onCloseSpoilerModal();
    }
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className={`${compact ? 'px-2.5 py-1.5' : 'px-4 py-3'} bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-1.5">
          <MessageSquare className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-indigo-400`} />
          <h2 className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-300 font-heading`}>
            {compact ? 'Chat' : 'Live Guesses'}
          </h2>
        </div>
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-medium text-slate-400`}>
          {compact ? `${messages.length} msgs` : `${messages.length} messages`}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${compact ? 'p-1.5 space-y-1' : 'p-3 space-y-2.5'} max-h-[260px] lg:max-h-[500px]`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-500">
            <Sparkles className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} mb-1 text-indigo-500/60`} />
            <p className="text-[11px]">No guesses yet!</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Correct Guess Highlight Notification
            if (msg.type === 'correct') {
              return (
                <div
                  key={msg.id}
                  className={`flex items-center gap-1.5 ${
                    compact ? 'p-1 text-[10px] leading-tight rounded-md' : 'p-2 text-xs rounded-xl'
                  } bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-bold`}
                >
                  <CheckCircle2 className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-400 shrink-0`} />
                  <span className="truncate">{msg.senderName} guessed!</span>
                </div>
              );
            }

            // Close Guess Notification
            if (msg.type === 'close') {
              return (
                <div
                  key={msg.id}
                  className={`flex items-center gap-1.5 ${
                    compact ? 'p-1 text-[10px] leading-tight rounded-md' : 'p-2 text-xs rounded-xl'
                  } bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium`}
                >
                  <Flame className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-amber-400 shrink-0`} />
                  <span className="truncate">'{msg.text}' is close!</span>
                </div>
              );
            }

            // System Message
            if (msg.type === 'system') {
              return (
                <div
                  key={msg.id}
                  className={`text-center ${compact ? 'py-0.5 px-1 text-[10px] leading-tight' : 'py-1 px-2.5 text-[11px] bg-slate-800/40 rounded-lg font-medium'} text-slate-400`}
                >
                  {msg.text}
                </div>
              );
            }

            // Standard Guess / Chat Message
            return (
              <div
                key={msg.id}
                className={`${compact ? 'text-[11px] leading-snug px-1 py-0.5' : 'text-xs px-2.5 py-1.5 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-slate-700/30'} break-words transition-colors`}
              >
                <span className="font-bold text-indigo-300 mr-1">{msg.senderName}:</span>
                <span className="text-slate-200">{msg.text}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form (Rendered inside on desktop, omitted when hideInput is true on mobile) */}
      {!hideInput && (
        <div className="p-2.5 bg-slate-800/60 border-t border-slate-700/60">
          <GuessChatInput
            onSendMessage={onSendMessage}
            isDrawer={isDrawer}
            hasGuessed={hasGuessed}
            secretWord={secretWord}
            onTriggerSpoiler={onTriggerSpoiler}
            className="!p-0 !bg-transparent !border-none !shadow-none"
          />
        </div>
      )}

      {/* Drawer Spoiler Warning Modal */}
      <SpoilerWarningModal
        isOpen={isWarningOpen}
        onClose={handleCloseSpoilerModal}
      />
    </div>
  );
};
