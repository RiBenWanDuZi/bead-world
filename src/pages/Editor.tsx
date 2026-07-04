import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { GridCanvas } from '../components/GridCanvas';
import { Toolbar } from '../components/Toolbar';
import { ColorPalette } from '../components/ColorPalette';
import { StatsPanel } from '../components/StatsPanel';
import { ArrowLeft, ArrowRight, Image, Eye, EyeOff } from 'lucide-react';

export const Editor: React.FC = () => {
  const navigate = useNavigate();
  const grid = useProjectStore((state) => state.grid);
  const originalImage = useProjectStore((state) => state.originalImage);
  const size = useProjectStore((state) => state.size);
  
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0.5);

  const handleExport = () => {
    navigate('/export');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/generator')}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">编辑器</h1>
              <p className="text-xs text-gray-500">精修拼豆图纸</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              尺寸: {size}×{size}
            </span>
            {originalImage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOriginalImage(!showOriginalImage)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showOriginalImage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showOriginalImage ? (
                    <><Eye className="w-4 h-4" /><span>隐藏原图</span></>
                  ) : (
                    <><EyeOff className="w-4 h-4" /><span>显示原图</span></>
                  )}
                </button>
                {showOriginalImage && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">透明度:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      value={imageOpacity}
                      onChange={(e) => setImageOpacity(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-xs text-gray-500">{Math.round(imageOpacity * 100)}%</span>
                  </div>
                )}
              </div>
            )}
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
            <div className="relative">
              <GridCanvas editable={true} />
              {showOriginalImage && originalImage && (
                <div
                  className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none rounded-xl overflow-hidden"
                  style={{ zIndex: 10 }}
                >
                  <img
                    src={originalImage}
                    alt="原图"
                    className="w-full h-full object-contain"
                    style={{ opacity: imageOpacity }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <ColorPalette compact={true} />
          </div>
        </div>
      </main>
    </div>
  );
};
