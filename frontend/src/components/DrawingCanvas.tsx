import React, { useRef, useEffect, useCallback } from 'react';
import { type DrawingStroke, type DrawingTool, type StrokeSize, type NormalizedPoint } from '../types/game';
import { Pencil, Eye } from 'lucide-react';

interface DrawingCanvasProps {
  isDrawer: boolean;
  drawerName?: string;
  activeColor: string;
  activeSize: StrokeSize;
  activeTool: DrawingTool;
  strokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  onStrokeComplete?: (stroke: DrawingStroke) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isDrawer,
  drawerName = 'Drawer',
  activeColor,
  activeSize,
  activeTool,
  strokes,
  onStrokesChange,
  onStrokeComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<NormalizedPoint[]>([]);

  // Redraw all strokes onto canvas with high-DPI scaling
  const redrawCanvas = useCallback(
    (strokesToDraw: DrawingStroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // Clear the canvas with solid crisp white background
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Render each stroke using quadratic mid-point smoothing
      strokesToDraw.forEach((stroke) => {
        if (!stroke.points || stroke.points.length === 0) return;

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.size;

        if (stroke.tool === 'eraser') {
          ctx.strokeStyle = '#FFFFFF';
        } else {
          ctx.strokeStyle = stroke.color;
        }

        const pts = stroke.points;
        const startX = pts[0].x * width;
        const startY = pts[0].y * height;

        if (pts.length === 1) {
          // Draw a dot for single tap
          ctx.arc(startX, startY, stroke.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
          ctx.fill();
        } else {
          ctx.moveTo(startX, startY);

          for (let i = 1; i < pts.length - 1; i++) {
            const p1x = pts[i].x * width;
            const p1y = pts[i].y * height;
            const p2x = pts[i + 1].x * width;
            const p2y = pts[i + 1].y * height;

            const midX = (p1x + p2x) / 2;
            const midY = (p1y + p2y) / 2;
            ctx.quadraticCurveTo(p1x, p1y, midX, midY);
          }

          // Draw line to the last point
          const lastPt = pts[pts.length - 1];
          ctx.lineTo(lastPt.x * width, lastPt.y * height);
          ctx.stroke();
        }
      });

      ctx.restore();
    },
    []
  );

  // Resize canvas to match container with proper DPR
  // Resize canvas to match container with proper DPR without triggering loop
  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const displayWidth = Math.max(200, Math.floor(rect.width));
    const displayHeight = Math.max(150, Math.floor(rect.height));

    const targetWidth = Math.floor(displayWidth * dpr);
    const targetHeight = Math.floor(displayHeight * dpr);

    // Only update and re-scale if dimensions actually changed
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      redrawCanvas(strokes);
    }
  }, [redrawCanvas, strokes]);

  // Handle ResizeObserver for responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    resizeCanvas();
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [resizeCanvas]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  // Pointer event helpers: convert pointer event to normalized (0 - 1) coordinate
  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>): NormalizedPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    // Capture pointer so moving off-canvas still tracks
    const canvas = e.currentTarget;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if not supported
    }

    isDrawingRef.current = true;
    const pt = getNormalizedPoint(e);
    currentPointsRef.current = [pt];

    // Create current in-progress stroke
    const newStroke: DrawingStroke = {
      color: activeColor,
      size: activeSize,
      tool: activeTool,
      points: [pt],
    };

    redrawCanvas([...strokes, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawingRef.current) return;

    const pt = getNormalizedPoint(e);
    currentPointsRef.current.push(pt);

    const activeStroke: DrawingStroke = {
      color: activeColor,
      size: activeSize,
      tool: activeTool,
      points: currentPointsRef.current,
    };

    redrawCanvas([...strokes, activeStroke]);
  };

  const finishStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawingRef.current) return;

    isDrawingRef.current = false;
    const canvas = e.currentTarget;
    try {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (currentPointsRef.current.length > 0) {
      const finalStroke: DrawingStroke = {
        color: activeColor,
        size: activeSize,
        tool: activeTool,
        points: [...currentPointsRef.current],
      };

      const updatedStrokes = [...strokes, finalStroke];
      onStrokesChange(updatedStrokes);
      if (onStrokeComplete) {
        onStrokeComplete(finalStroke);
      }
    }

    currentPointsRef.current = [];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] bg-white rounded-2xl shadow-xl overflow-hidden select-none border-2 border-slate-700/80 cursor-crosshair touch-none"
    >
      {/* HTML5 Canvas - Absolutely positioned so it never causes container expansion */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        className={`absolute inset-0 w-full h-full block touch-none ${
          !isDrawer ? 'cursor-default pointer-events-none' : 'cursor-crosshair'
        }`}
      />

      {/* Guesser Read-Only Watermark Banner */}
      {!isDrawer && (
        <div className="pointer-events-none absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold">
          <Eye className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>
            Watching <strong className="text-white">{drawerName}</strong> draw
          </span>
        </div>
      )}

      {/* Drawer active tool watermark tag */}
      {isDrawer && (
        <div className="pointer-events-none absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-sm text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 opacity-80">
          <Pencil className="w-3 h-3 text-amber-400" />
          <span>{activeTool === 'eraser' ? 'Eraser' : 'Brush'}</span>
          <span>•</span>
          <span>{activeSize}px</span>
        </div>
      )}
    </div>
  );
};
