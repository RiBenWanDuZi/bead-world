import React from 'react';
import { useProjectStore, ToolType, SymmetryMode } from '../../stores/projectStore';
import { Brush, Eraser, PaintBucket, Pipette, Grid3X3, Hash, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical } from 'lucide-react';

export const Toolbar: React.FC = () => {
  const tool = useProjectStore((state) => state.tool);
  const symmetryMode = useProjectStore((state) => state.symmetryMode);
  const showGrid = useProjectStore((state) => state.showGrid);
  const showColorCodes = useProjectStore((state) => state.showColorCodes);
  const zoom = useProjectStore((state) => state.zoom);
  const selectedColor = useProjectStore((state) => state.selectedColor);
  
  const setTool = useProjectStore((state) => state.setTool);
  const setSymmetryMode = useProjectStore((state) => state.setSymmetryMode);
  const toggleGrid = useProjectStore((state) => state.toggleGrid);
  const toggleColorCodes = useProjectStore((state) => state.toggleColorCodes);
  const setZoom = useProjectStore((state) => state.setZoom);

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'brush', icon: <Brush className="w-5 h-5" />, label: '画笔' },
    { id: 'eraser', icon: <Eraser className="w-5 h-5" />, label: '橡皮擦' },
    { id: 'fill', icon: <PaintBucket className="w-5 h-5" />, label: '填充' },
    { id: 'picker', icon: <Pipette className="w-5 h-5" />, label: '吸管' },
  ];

  const symmetryOptions: { id: SymmetryMode; icon: React.ReactNode; label: string }[] = [
    { id: 'none', icon: <></>, label: '无' },
    { id: 'horizontal', icon: <FlipHorizontal className="w-4 h-4" />, label: '水平' },
    { id: 'vertical', icon: <FlipVertical className="w-4 h-4" />, label: '垂直' },
    { id: 'both', icon: <><FlipHorizontal className="w-3 h-3 mr-1" /><FlipVertical className="w-3 h-3" /></>, label: '双向' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">工具</h3>
          <div className="flex gap-2">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  tool === t.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={t.label}
              >
                {t.icon}
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">对称模式</h3>
          <div className="flex gap-2">
            {symmetryOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSymmetryMode(s.id)}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  symmetryMode === s.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={s.label}
              >
                {s.icon}
                <span className="text-xs">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">显示设置</h3>
          <div className="flex gap-2">
            <button
              onClick={toggleGrid}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                showGrid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-xs">网格</span>
            </button>
            <button
              onClick={toggleColorCodes}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                showColorCodes
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="text-xs">色号</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">缩放</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="flex-1 text-center text-sm font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedColor && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">当前颜色</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg shadow-md border-2 border-gray-200"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div>
                <div className="font-semibold text-sm">{selectedColor.id}</div>
                <div className="text-xs text-gray-500">{selectedColor.name}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
