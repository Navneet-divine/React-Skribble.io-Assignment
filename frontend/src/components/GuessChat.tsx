import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage } from '../types/game';
import { Send, Sparkles, Flame, CheckCircle2, MessageSquare, Ban } from 'lucide-react';

interface GuessChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isDrawer: boolean;
  hasGuessed: boolean;
  secretWord?: string;
}

export const GuessChat: React.FC<GuessChatProps> = ({
  messages,
  onSendMessage,
  isDrawer,
  hasGuessed,
  secretWord,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Prevent drawer from spoiling secret word
    if (isDrawer && secretWord && trimmed.toLowerCase().includes(secretWord.toLowerCase())) {
      alert("You are the drawer! You cannot spoil the secret word in chat.");
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
    <div className="w-full h-full flex flex-col bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
            Live Guesses
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[260px] lg:max-h-[500px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-6 h-6 mb-2 text-indigo-500/60" />
            <p className="text-xs">No guesses yet!</p>
            <p className="text-[11px] text-slate-600">Be the first to guess the word.</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Correct Guess Highlight Notification
            if (msg.type === 'correct') {
              return (
                <div
                  key={msg.id}
                  className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-2.5 shadow-sm text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 font-medium">
                    <strong className="text-emerald-300 font-bold">{msg.senderName}</strong> {msg.text}
                  </div>
                </div>
              );
            }

            // Close Guess Alert
            if (msg.type === 'close') {
              return (
                <div
                  key={msg.id}
                  className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-2 text-amber-200 text-xs flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <div className="flex-1">
                    <strong className="text-amber-300 font-bold">{msg.senderName}</strong> {msg.text}
                  </div>
                </div>
              );
            }

            // System Message
            if (msg.type === 'system') {
              return (
                <div
                  key={msg.id}
                  className="text-center py-1 px-2.5 bg-slate-800/40 rounded-lg text-[11px] text-slate-400 font-medium"
                >
                  {msg.text}
                </div>
              );
            }

            // Standard Guess / Chat Message
            return (
              <div
                key={msg.id}
                className="text-xs break-words bg-slate-800/40 hover:bg-slate-800/60 rounded-xl px-2.5 py-1.5 border border-slate-700/30 transition-colors"
              >
                <span className="font-bold text-indigo-300 mr-1.5">{msg.senderName}:</span>
                <span className="text-slate-200">{msg.text}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-slate-800/60 border-t border-slate-700/60 flex items-center gap-2"
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
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all ${
              hasGuessed
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 cursor-not-allowed'
                : 'border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
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
          className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
            inputText.trim() && !isInputDisabled
              ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
          title="Send Guess"
        >
          {isInputDisabled ? <Ban className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
