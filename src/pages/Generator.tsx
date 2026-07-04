import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { UploadArea } from '../components/UploadArea';
import { GridCanvas } from '../components/GridCanvas';
import { StatsPanel } from '../components/StatsPanel';
import { ColorPalette } from '../components/ColorPalette';
import { pixelateImage, loadImage, applyDithering, compressColors } from '../utils/imageUtils';
import { ArrowLeft, ArrowRight, Zap, Check, RefreshCw, ZoomIn, ZoomOut, Hash, Grid3X3, Maximize2, X, Expand } from 'lucide-react';

export const Generator: React.FC = () => {
  const navigate = useNavigate();
  const size = useProjectStore((state) => state.size);
  const maxColors = useProjectStore((state) => state.maxColors);
  const removeBackground = useProjectStore((state) => state.removeBackground);
  const useDithering = useProjectStore((state) => state.useDithering);
  const zoom = useProjectStore((state) => state.zoom);
  const showColorCodes = useProjectStore((state) => state.showColorCodes);
  const showGrid = useProjectStore((state) => state.showGrid);
  
  const setGrid = useProjectStore((state) => state.setGrid);
  const setOriginalImage = useProjectStore((state) => state.setOriginalImage);
  const setMaxColors = useProjectStore((state) => state.setMaxColors);
  const setRemoveBackground = useProjectStore((state) => state.setRemoveBackground);
  const setUseDithering = useProjectStore((state) => state.setUseDithering);
  const setZoom = useProjectStore((state) => state.setZoom);
  const toggleColorCodes = useProjectStore((state) => state.toggleColorCodes);
  const toggleGrid = useProjectStore((state) => state.toggleGrid);

  const [imageData, setImageData] = useState<string | null>(null);
  const [grid, setGridState] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalZoom, setModalZoom] = useState(1);

  const handleImageUpload = async (imageDataUrl: string) => {
    setImageData(imageDataUrl);
    setGridState([]);
  };

  const handleGenerate = async () => {
    if (!imageData) {
      alert('请先上传图片');
      return;
    }

    setIsProcessing(true);

    try {
      const img = await loadImage(imageData);
      const { grid: pixelatedGrid, rgbGrid } = pixelateImage(img, size, removeBackground);
      let newGrid = pixelatedGrid;

      if (useDithering) {
        newGrid = applyDithering(newGrid, rgbGrid);
      }

      if (maxColors > 0) {
        newGrid = compressColors(newGrid, maxColors);
      }

      setGridState(newGrid);
      setGrid(newGrid);
      setOriginalImage(imageData);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    navigate('/editor');
  };

  const handleExport = () => {
    navigate('/export');
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setTimeout(() => {
      const container = document.getElementById('modal-canvas-container');
      if (container && grid.length > 0) {
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 100;
        const gridWidth = grid[0]?.length || 0;
        const gridHeight = grid.length;
        
        const zoomX = containerWidth / (gridWidth * 20);
        const zoomY = containerHeight / (gridHeight * 20);
        setModalZoom(Math.min(zoomX, zoomY, 2));
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (grid.length > 0) {
      const container = document.querySelector('.preview-container');
      if (container) {
        const containerWidth = container.clientWidth - 32;
        const containerHeight = container.clientHeight - 80;
        const gridWidth = grid[0]?.length || 0;
        const gridHeight = grid.length;
        
        const zoomX = containerWidth / (gridWidth * 20);
        const zoomY = containerHeight / (gridHeight * 20);
        setZoom(Math.min(zoomX, zoomY, 1));
      }
    }
  }, [grid, setZoom]);

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
              <h1 className="text-xl font-bold text-gray-800">图纸生成器</h1>
              <p className="text-xs text-gray-500">上传图片生成拼豆图纸</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleEdit}
              disabled={grid.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              <span>进入编辑</span>
            </button>
            <button
              onClick={handleExport}
              disabled={grid.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>导出图纸</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <UploadArea onImageUpload={handleImageUpload} currentImage={imageData} />

            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">参数设置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">颜色限制数量</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={maxColors}
                    onChange={(e) => setMaxColors(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>不限制</span>
                    <span>{maxColors}色</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">去除背景</span>
                  <button
                    onClick={() => setRemoveBackground(!removeBackground)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      removeBackground ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        removeBackground ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">抖动算法</span>
                  <button
                    onClick={() => setUseDithering(!useDithering)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      useDithering ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        useDithering ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!imageData || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>生成图纸</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {grid.length > 0 && <StatsPanel />}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">预览</h3>
                {grid.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleGrid}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                        showGrid
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="显示网格"
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                      <span>网格</span>
                    </button>
                    <button
                      onClick={toggleColorCodes}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                        showColorCodes
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="显示色号"
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span>色号</span>
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
                        className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="缩小"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-medium w-10 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="放大"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setZoom(1)}
                        className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="重置缩放"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleOpenModal}
                        className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-1"
                        title="全屏预览"
                      >
                        <Expand className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="preview-container relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer" onClick={handleOpenModal}>
                {grid.length > 0 ? (
                  <GridCanvas editable={false} showPreview={true} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p>上传图片并点击"生成图纸"</p>
                      <p className="text-sm mt-1">查看拼豆效果预览</p>
                    </div>
                  </div>
                )}
                {grid.length > 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                    点击查看大图
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ColorPalette />
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="relative bg-white rounded-xl shadow-2xl p-4 max-w-[90vw] max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">图纸预览</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalZoom(Math.max(0.2, modalZoom - 0.1))}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium w-12 text-center">
                  {Math.round(modalZoom * 100)}%
                </span>
                <button
                  onClick={() => setModalZoom(Math.min(4, modalZoom + 0.1))}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('modal-canvas-container');
                    if (container && grid.length > 0) {
                      const containerWidth = container.clientWidth - 40;
                      const containerHeight = container.clientHeight - 40;
                      const gridWidth = grid[0]?.length || 0;
                      const gridHeight = grid.length;
                      
                      const zoomX = containerWidth / (gridWidth * 20);
                      const zoomY = containerHeight / (gridHeight * 20);
                      setModalZoom(Math.min(zoomX, zoomY, 2));
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="适应窗口"
                >
                  <Expand className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div 
              id="modal-canvas-container" 
              className="w-full h-[calc(90vh-120px)] bg-gray-100 rounded-xl overflow-auto"
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setModalZoom(Math.max(0.2, Math.min(4, modalZoom + delta)));
              }}
            >
              <div className="p-5 flex justify-center items-center">
                <GridCanvas editable={false} showPreview={true} customZoom={modalZoom} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
