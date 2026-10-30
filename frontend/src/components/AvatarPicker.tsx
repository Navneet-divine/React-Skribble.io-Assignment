import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dices, Palette } from 'lucide-react';
import { usePlayerStore, getAvatarUrl } from '../store/playerStore';
import { AVATAR_PALETTES, type AvatarConfig } from '../types/game';

const STYLES: { id: AvatarConfig['style']; label: string }[] = [
  { id: 'bottts-neutral', label: 'Robots' },
  { id: 'fun-emoji', label: 'Emoji' },
  { id: 'lorelei', label: 'Anime' },
  { id: 'adventurer', label: 'Adventurer' },
];

export const AvatarPicker: React.FC = () => {
  const { avatar, setAvatar, randomizeAvatar, cycleSeed } = usePlayerStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const handleRandomize = () => {
    setIsSpinning(true);
    randomizeAvatar();
    setTimeout(() => setIsSpinning(false), 500);
  };

  const handleStyleChange = (style: AvatarConfig['style']) => {
    setImgLoading(true);
    setAvatar({
      ...avatar,
      style,
    });
  };

  const handlePaletteSelect = (color: string) => {
    setAvatar({
      ...avatar,
      backgroundColor: color,
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Avatar Style Pills */}
      <div className="flex flex-wrap sm:flex-nowrap justify-center items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-4">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleStyleChange(s.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              avatar.style === s.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Preview with Nav Arrows */}
      <div className="relative flex items-center justify-center gap-3">
        {/* Previous seed button */}
        <button
          type="button"
          aria-label="Previous avatar"
          onClick={() => {
            setImgLoading(true);
            cycleSeed('prev');
          }}
          className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Avatar Display Card */}
        <div className="relative group">
          <div
            className="w-32 h-32 md:w-36 md:h-36 rounded-3xl p-2.5 shadow-2xl border-2 border-slate-700/80 transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/60 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `#${avatar.backgroundColor}` }}
          >
            <img
              src={getAvatarUrl(avatar)}
              alt="Player Avatar"
              onLoad={() => setImgLoading(false)}
              className={`w-full h-full object-contain select-none transition-opacity duration-200 ${
                imgLoading ? 'opacity-40' : 'opacity-100'
              }`}
            />
          </div>

          {/* Randomize Dice Floating Button */}
          <button
            type="button"
            title="Randomize avatar"
            onClick={handleRandomize}
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border-2 border-slate-900 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Dices className={`w-4 h-4 transition-transform ${isSpinning ? 'rotate-180 duration-500' : ''}`} />
          </button>
        </div>

        {/* Next seed button */}
        <button
          type="button"
          aria-label="Next avatar"
          onClick={() => {
            setImgLoading(true);
            cycleSeed('next');
          }}
          className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Palette Color Selector */}
      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/60 w-full justify-center">
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center gap-1.5">
          {AVATAR_PALETTES.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Select color #${color}`}
              onClick={() => handlePaletteSelect(color)}
              className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                avatar.backgroundColor === color
                  ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-110'
                  : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: `#${color}` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
