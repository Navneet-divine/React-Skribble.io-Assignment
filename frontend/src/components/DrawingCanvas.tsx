import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { type DrawingStroke, type DrawingTool, type StrokeSize, type NormalizedPoint } from '../types/game';
import { Paintbrush, Eraser, Eye, PaintBucket, Sparkles } from 'lucide-react';

function hexToRgba(hex: string): [number, number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [0, 0, 0, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
}

/**
 * Scanline flood fill with boundary dilation.
 * Seamlessly expands into antialiased edge pixels so no white lines or halos remain.
 */
function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  canvasWidth: number,
  canvasHeight: number,
  tolerance = 90,
  expandPx = 2
) {
  if (startX < 0 || startX >= canvasWidth || startY < 0 || startY >= canvasHeight) return;

  const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imgData.data;

  const [fillR, fillG, fillB, fillA] = hexToRgba(fillColorHex);

  const startIdx = (startY * canvasWidth + startX) * 4;
  const targetR = data[startIdx];
  const targetG = data[startIdx + 1];
  const targetB = data[startIdx + 2];
  const targetA = data[startIdx + 3];

  const colorMatch = (idx: number) => {
    const dr = data[idx] - targetR;
    const dg = data[idx + 1] - targetG;
    const db = data[idx + 2] - targetB;
    const da = data[idx + 3] - targetA;
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da) <= tolerance;
  };

  // If clicked pixel already matches fill color within tolerance, no work needed
  const initDr = targetR - fillR;
  const initDg = targetG - fillG;
  const initDb = targetB - fillB;
  const initDa = targetA - fillA;
  if (Math.sqrt(initDr * initDr + initDg * initDg + initDb * initDb + initDa * initDa) <= tolerance) {
    return;
  }

  const visited = new Uint8Array(canvasWidth * canvasHeight);
  const stack: number[] = [startX, startY];
  visited[startY * canvasWidth + startX] = 1;

  const filledSpans: { y: number; left: number; right: number }[] = [];

  while (stack.length > 0) {
    const curY = stack.pop()!;
    const curX = stack.pop()!;

    let left = curX;
    while (
      left > 0 &&
      !visited[curY * canvasWidth + (left - 1)] &&
      colorMatch((curY * canvasWidth + (left - 1)) * 4)
    ) {
      left--;
      visited[curY * canvasWidth + left] = 1;
    }

    let right = curX;
    while (
      right < canvasWidth - 1 &&
      !visited[curY * canvasWidth + (right + 1)] &&
      colorMatch((curY * canvasWidth + (right + 1)) * 4)
    ) {
      right++;
      visited[curY * canvasWidth + right] = 1;
    }

    filledSpans.push({ y: curY, left, right });

    let scanUp = false;
    let scanDown = false;

    for (let x = left; x <= right; x++) {
      if (curY > 0) {
        const upOffset = (curY - 1) * canvasWidth + x;
        const match = !visited[upOffset] && colorMatch(upOffset * 4);
        if (match && !scanUp) {
          visited[upOffset] = 1;
          stack.push(x, curY - 1);
          scanUp = true;
        } else if (!match && scanUp) {
          scanUp = false;
        }
      }

      if (curY < canvasHeight - 1) {
        const downOffset = (curY + 1) * canvasWidth + x;
        const match = !visited[downOffset] && colorMatch(downOffset * 4);
        if (match && !scanDown) {
          visited[downOffset] = 1;
          stack.push(x, curY + 1);
          scanDown = true;
        } else if (!match && scanDown) {
          scanDown = false;
        }
      }
    }
  }

  // Paint filled spans
  for (let i = 0; i < filledSpans.length; i++) {
    const { y, left, right } = filledSpans[i];
    const rowOffset = y * canvasWidth;
    for (let x = left; x <= right; x++) {
      const idx = (rowOffset + x) * 4;
      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = fillA;
    }
  }

  // Boundary Dilation: expand filled region into antialiasing transition pixels
  if (expandPx > 0) {
    const boundaryTolerance = tolerance * 1.8;
    for (let step = 0; step < expandPx; step++) {
      const toFill: number[] = [];
      for (let i = 0; i < filledSpans.length; i++) {
        const { y, left, right } = filledSpans[i];
        // Check left edge
        if (left > 0 && !visited[y * canvasWidth + (left - 1)]) {
          const idx = (y * canvasWidth + (left - 1)) * 4;
          const dist = Math.hypot(data[idx] - targetR, data[idx + 1] - targetG, data[idx + 2] - targetB);
          if (dist <= boundaryTolerance) {
            visited[y * canvasWidth + (left - 1)] = 1;
            toFill.push(y * canvasWidth + (left - 1));
          }
        }
        // Check right edge
        if (right < canvasWidth - 1 && !visited[y * canvasWidth + (right + 1)]) {
          const idx = (y * canvasWidth + (right + 1)) * 4;
          const dist = Math.hypot(data[idx] - targetR, data[idx + 1] - targetG, data[idx + 2] - targetB);
          if (dist <= boundaryTolerance) {
            visited[y * canvasWidth + (right + 1)] = 1;
            toFill.push(y * canvasWidth + (right + 1));
          }
        }
        // Check top edge
        if (y > 0) {
          for (let x = left; x <= right; x++) {
            const p = (y - 1) * canvasWidth + x;
            if (!visited[p]) {
              const idx = p * 4;
              const dist = Math.hypot(data[idx] - targetR, data[idx + 1] - targetG, data[idx + 2] - targetB);
              if (dist <= boundaryTolerance) {
                visited[p] = 1;
                toFill.push(p);
              }
            }
          }
        }
        // Check bottom edge
        if (y < canvasHeight - 1) {
          for (let x = left; x <= right; x++) {
            const p = (y + 1) * canvasWidth + x;
            if (!visited[p]) {
              const idx = p * 4;
              const dist = Math.hypot(data[idx] - targetR, data[idx + 1] - targetG, data[idx + 2] - targetB);
              if (dist <= boundaryTolerance) {
                visited[p] = 1;
                toFill.push(p);
              }
            }
          }
        }
      }

      for (let k = 0; k < toFill.length; k++) {
        const idx = toFill[k] * 4;
        data[idx] = fillR;
        data[idx + 1] = fillG;
        data[idx + 2] = fillB;
        data[idx + 3] = fillA;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function drawVectorStroke(
  ctx: CanvasRenderingContext2D,
  stroke: DrawingStroke,
  width: number,
  height: number
) {
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

    const lastPt = pts[pts.length - 1];
    ctx.lineTo(lastPt.x * width, lastPt.y * height);
    ctx.stroke();
  }
}

interface DrawingCanvasProps {
  isDrawer: boolean;
  drawerName?: string;
  isChoosingWord?: boolean;
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
  isChoosingWord = false,
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Render each stroke in sequence
      strokesToDraw.forEach((stroke, strokeIndex) => {
        if (!stroke.points || stroke.points.length === 0) return;

        // Flood fill tool execution
        if (stroke.tool === 'fill') {
          const pt = stroke.points[0];
          const startX = Math.min(canvas.width - 1, Math.max(0, Math.floor(pt.x * canvas.width)));
          const startY = Math.min(canvas.height - 1, Math.max(0, Math.floor(pt.y * canvas.height)));
          const expandPx = Math.max(2, Math.round(dpr * 1.5));
          floodFill(ctx, startX, startY, stroke.color, canvas.width, canvas.height, 90, expandPx);

          // Re-draw any prior brush strokes that were drawn before this fill
          // so the stroke boundaries sit razor-sharp over the fill with zero white halo!
          for (let p = 0; p < strokeIndex; p++) {
            const prior = strokesToDraw[p];
            if (prior.tool !== 'fill') {
              drawVectorStroke(ctx, prior, width, height);
            }
          }
          return;
        }

        drawVectorStroke(ctx, stroke, width, height);
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

    // Direct click execution for Paint Bucket tool
    if (activeTool === 'fill') {
      const pt = getNormalizedPoint(e);
      const fillStroke: DrawingStroke = {
        color: activeColor,
        size: 0,
        tool: 'fill',
        points: [pt],
      };
      const updatedStrokes = [...strokes, fillStroke];
      onStrokesChange(updatedStrokes);
      if (onStrokeComplete) {
        onStrokeComplete(fillStroke);
      }
      return;
    }

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

/**
 * Generates a clean 32x32 PNG cursor using an offscreen canvas.
 * PNG data URIs are 100% universally supported across Chrome, Safari, and Firefox
 * and completely avoid SVG data URI decoding bugs in WebKit/Blink that hide the cursor.
 */
function getBucketCursorPng(color: string): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext('2d');
  if (!ctx) return '';

  ctx.save();

  // 1. Paint droplet at hotspot (4, 27)
  ctx.beginPath();
  ctx.arc(4, 27, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#0F172A';
  ctx.stroke();

  // 2. Bucket Body tilted
  ctx.beginPath();
  ctx.moveTo(25, 11);
  ctx.lineTo(13, 1);
  ctx.lineTo(4, 10);
  ctx.quadraticCurveTo(2, 12, 4, 14);
  ctx.lineTo(11, 21);
  ctx.quadraticCurveTo(13, 23, 15, 21);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#0F172A';
  ctx.stroke();

  // 3. Spout opening line
  ctx.beginPath();
  ctx.moveTo(4, 13);
  ctx.lineTo(19, 13);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#0F172A';
  ctx.stroke();

  // 4. Handle
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(14, 10);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#0F172A';
  ctx.stroke();

  ctx.restore();
  return c.toDataURL('image/png');
}

  // Dynamic custom cursor: High-resolution PNG generated on offscreen canvas
  // Guarantees the cursor is always 100% visible on canvas with crosshair fallback
  const bucketCursorUrl = useMemo(() => {
    return getBucketCursorPng(activeColor);
  }, [activeColor]);

  const cursorStyle = useMemo<React.CSSProperties>(() => {
    if (!isDrawer) return { cursor: 'default' };
    if (activeTool === 'fill' && bucketCursorUrl) {
      return {
        cursor: `url('${bucketCursorUrl}') 4 27, crosshair`,
      };
    }
    return { cursor: 'crosshair' };
  }, [isDrawer, activeTool, bucketCursorUrl]);

  return (
    <div
      ref={containerRef}
      style={cursorStyle}
      className="relative w-full h-full min-h-[300px] bg-white rounded-2xl shadow-xl overflow-hidden select-none border-2 border-slate-700/80 touch-none"
    >
      {/* HTML5 Canvas - Absolutely positioned so it never causes container expansion */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        style={cursorStyle}
        className={`absolute inset-0 w-full h-full block touch-none ${
          !isDrawer ? 'cursor-default pointer-events-none' : ''
        }`}
      />

      {/* Guesser Read-Only Watermark Banner */}
      {!isDrawer && (
        <div className="pointer-events-none absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold">
          {isChoosingWord ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                <strong className="text-white">{drawerName || 'Player'}</strong> is choosing a word...
              </span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>
                Watching <strong className="text-white">{drawerName || 'Player'}</strong> draw
              </span>
            </>
          )}
        </div>
      )}

      {/* Drawer active tool watermark tag */}
      {isDrawer && (
        <div className="pointer-events-none absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-sm text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 opacity-80">
          {activeTool === 'eraser' ? (
            <Eraser className="w-3 h-3 text-indigo-400" />
          ) : activeTool === 'fill' ? (
            <PaintBucket className="w-3 h-3 text-indigo-400" />
          ) : (
            <Paintbrush className="w-3 h-3 text-amber-400" />
          )}
          <span>
            {activeTool === 'eraser'
              ? 'Eraser'
              : activeTool === 'fill'
              ? 'Fill Bucket'
              : 'Brush'}
          </span>
          {activeTool !== 'fill' && (
            <>
              <span>•</span>
              <span>{activeSize}px</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
