import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { findColorById } from '../../utils/colorUtils';

interface GridCanvasProps {
  editable?: boolean;
  showPreview?: boolean;
  customZoom?: number;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({ editable = true, showPreview = false, customZoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const grid = useProjectStore((state) => state.grid);
  const selectedColor = useProjectStore((state) => state.selectedColor);
  const tool = useProjectStore((state) => state.tool);
  const showGrid = useProjectStore((state) => state.showGrid);
  const showColorCodes = useProjectStore((state) => state.showColorCodes);
  const zoom = useProjectStore((state) => state.zoom);
  const updateCell = useProjectStore((state) => state.updateCell);
  const setSelectedColor = useProjectStore((state) => state.setSelectedColor);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const effectiveZoom = customZoom ?? zoom;
    const cellSize = 20 * effectiveZoom;
    const height = grid.length;
    const width = grid[0]?.length || 0;

    canvas.width = width * cellSize + 1;
    canvas.height = height * cellSize + 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const colorId = grid[y]?.[x];
        const color = findColorById(colorId);
        
        if (color) {
          ctx.fillStyle = color.hex;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        if (showGrid) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        if (showColorCodes) {
          ctx.fillStyle = getContrastColor(color?.hex || '#FFFFFF');
          ctx.font = `${Math.max(6, Math.floor(cellSize / 3))}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(colorId, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
        }

        if ((x + 1) % 29 === 0 && x < width - 1) {
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x * cellSize + cellSize, 0);
          ctx.lineTo(x * cellSize + cellSize, height * cellSize);
          ctx.stroke();
        }

        if ((y + 1) % 29 === 0 && y < height - 1) {
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y * cellSize + cellSize);
          ctx.lineTo(width * cellSize, y * cellSize + cellSize);
          ctx.stroke();
        }
      }
    }
  }, [grid, showGrid, showColorCodes, zoom]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const getContrastColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const getCellPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: -1, y: -1 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const effectiveZoom = customZoom ?? zoom;
    const x = Math.floor((clientX - rect.left) / (20 * effectiveZoom));
    const y = Math.floor((clientY - rect.top) / (20 * effectiveZoom));

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    
    if (e.button === 0) {
      setIsDrawing(true);
      handleDraw(e);
    } else if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setLastPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;

    if (isPanning) {
      setPan((prev) => ({
        x: prev.x + e.clientX - lastPan.x,
        y: prev.y + e.clientY - lastPan.y,
      }));
      setLastPan({ x: e.clientX, y: e.clientY });
    } else if (isDrawing) {
      handleDraw(e);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCellPosition(e);
    
    if (x < 0 || y < 0 || y >= grid.length || x >= grid[0]?.length) return;

    if (tool === 'picker') {
      const colorId = grid[y][x];
      const color = findColorById(colorId);
      if (color) {
        setSelectedColor(color);
      }
      return;
    }

    if (!selectedColor) return;

    let colorId = selectedColor.id;
    if (tool === 'eraser') {
      colorId = 'H1';
    }

    if (tool === 'fill') {
      handleFill(x, y, colorId);
    } else {
      updateCell(y, x, colorId);
    }
  };

  const handleFill = (startX: number, startY: number, targetColor: string) => {
    const height = grid.length;
    const width = grid[0]?.length || 0;
    const originalColor = grid[startY]?.[startX];
    
    if (originalColor === targetColor) return;

    const visited = new Set<string>();
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (grid[y][x] !== originalColor) continue;

      visited.add(key);
      updateCell(y, x, targetColor);

      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    useProjectStore.getState().setZoom(newZoom);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!editable || e.touches.length !== 1) return;
    setIsDrawing(true);
    handleDraw(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!editable || !isDrawing || e.touches.length !== 1) return;
    e.preventDefault();
    handleDraw(e);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const handleDoubleClick = () => {
    useProjectStore.getState().setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gray-100 rounded-xl"
      style={{ cursor: isPanning ? 'grabbing' : editable ? 'crosshair' : 'default' }}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          cursor: isPanning ? 'grabbing' : editable ? 'crosshair' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {showPreview && (
        <div className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
          预览模式
        </div>
      )}
      
      {editable && (
        <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
          滚轮缩放 | Shift+拖拽平移
        </div>
      )}
    </div>
  );
};
