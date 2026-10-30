import React, { useState } from 'react';
import { type DrawingTool, type StrokeSize, PALETTE_COLORS, STROKE_SIZES } from '../types/game';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Trash2,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

interface DrawingToolsProps {
  isDrawer: boolean;
  activeColor: string;
  activeSize: StrokeSize;
  activeTool: DrawingTool;
  canUndo: boolean;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: StrokeSize) => void;
  onSelectTool: (tool: DrawingTool) => void;
  onUndo: () => void;
  onClear: () => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  isDrawer,
  activeColor,
  activeSize,
  activeTool,
  canUndo,
  onSelectColor,
  onSelectSize,
  onSelectTool,
  onUndo,
  onClear,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isDrawer) {
    return null;
  }

  const handleConfirmClear = () => {
    onClear();
    setShowClearConfirm(false);
  };

  return (
    <div className="relative w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl p-2.5 sm:p-3 flex flex-col gap-2">
      {/* TOP ROW (UP): Tools, Stroke Sizes, Undo & Clear */}
      <div className="w-full flex items-center justify-between gap-2">
        {/* Left: Brush & Eraser */}
        <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTool('brush')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTool === 'brush'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Paintbrush"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Brush</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('eraser')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Center: 4 Stroke Sizes */}
        <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 shrink-0">
          {STROKE_SIZES.map(({ size, label, previewPx }) => {
            const isSelected = activeSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/80 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'text-slate-400 hover:bg-slate-700/50'
                }`}
                title={`${label} (${size}px)`}
              >
                <div
                  className={`rounded-full transition-transform ${
                    isSelected ? 'scale-110' : ''
                  }`}
                  style={{
                    width: `${previewPx}px`,
                    height: `${previewPx}px`,
                    backgroundColor:
                      activeTool === 'eraser'
                        ? '#FFFFFF'
                        : isSelected
                        ? '#FFFFFF'
                        : activeColor,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Undo & Clear Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              canUndo
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                : 'bg-slate-800/30 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Undo last stroke"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 hover:border-rose-600/70 text-rose-300 transition-all cursor-pointer"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* BOTTOM ROW (DOWN): All 16 Colors (2 rows of 8 swatches) - Fully Centered & Never Cut Off */}
      <div className="w-full flex items-center justify-center">
        <div className="grid grid-flow-col grid-rows-2 gap-1.5 bg-slate-800/70 p-1.5 rounded-xl border border-slate-700/60 max-w-full">
          {PALETTE_COLORS.map((color) => {
            const isSelected = activeColor.toLowerCase() === color.toLowerCase() && activeTool !== 'eraser';
            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onSelectColor(color);
                  if (activeTool === 'eraser') onSelectTool('brush');
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-all cursor-pointer relative shrink-0 ${
                  isSelected
                    ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-10 shadow-md'
                    : 'hover:scale-110 opacity-90 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {/* Inline Clear Canvas Confirmation Popover */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded-2xl flex items-center justify-center p-3 z-30 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200">
              Clear entire canvas?
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
              >
                <Check className="w-3 h-3" />
                <span>Yes, Clear</span>
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
