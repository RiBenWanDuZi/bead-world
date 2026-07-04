import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { GridCanvas } from '../components/GridCanvas';
import { Toolbar } from '../components/Toolbar';
import { ColorPalette } from '../components/ColorPalette';
import { StatsPanel } from '../components/StatsPanel';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

export const Online: React.FC = () => {
  const navigate = useNavigate();
  const grid = useProjectStore((state) => state.grid);
  const size = useProjectStore((state) => state.size);
  const clearGrid = useProjectStore((state) => state.clearGrid);

  const handleExport = () => {
    navigate('/export');
  };

  const handleClear = () => {
    if (confirm('确定要清空画布吗？')) {
      clearGrid();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">线上拼豆</h1>
              <p className="text-xs text-gray-500">自由创作拼豆作品</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              尺寸: {size}×{size}
            </span>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>导出图纸</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Toolbar />
            <StatsPanel />
          </div>

          <div className="lg:col-span-7">
            <GridCanvas editable={true} />
          </div>

          <div className="lg:col-span-3">
            <ColorPalette compact={true} />
          </div>
        </div>
      </main>
    </div>
  );
};
