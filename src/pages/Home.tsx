import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { ColorPalette } from '../components/ColorPalette';
import { Sparkles, Palette, Grid3X3, ArrowRight, CircleDot } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const size = useProjectStore((state) => state.size);
  const setSize = useProjectStore((state) => state.setSize);
  const initializeGrid = useProjectStore((state) => state.initializeGrid);

  const sizes = [
    { value: 52, label: '小号', desc: '52×52 格', suitable: '钥匙扣、小挂件' },
    { value: 78, label: '中号', desc: '78×78 格', suitable: '手机壳、冰箱贴' },
    { value: 104, label: '大号', desc: '104×104 格', suitable: '挂画、大幅图案' },
  ];

  const handleGeneratorClick = () => {
    navigate('/generator');
  };

  const handleOnlineClick = () => {
    initializeGrid(size);
    navigate('/online');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YDT的拼豆小世界
              </h1>
              <p className="text-xs text-gray-500">MARD 221 标准色卡</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            支持 52×52、78×78、104×104 三种尺寸
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>全新上线</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            YDT你好!!!
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            这是专属于你的拼豆小天地!!!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div
            onClick={handleGeneratorClick}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">图纸生成器</h3>
            <p className="text-gray-500 mb-6">
              上传任意图片，自动像素化并映射到拼豆色卡，快速生成专业施工图纸。
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
              <span>开始使用</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={handleOnlineClick}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Grid3X3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">线上拼豆</h3>
            <p className="text-gray-500 mb-6">
              在空白画布上自由创作，支持画笔、填充、对称模式，打造专属拼豆作品。
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
              <span>开始创作</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">选择底板尺寸</h3>
            <div className="space-y-3">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    size === s.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-sm text-gray-500">{s.desc}</span>
                  </div>
                  <p className="text-xs text-gray-400">{s.suitable}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            MARD 221 色卡预览
          </h3>
          <ColorPalette />
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-10 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>YDT的拼豆小世界 - 使用 MARD 221 标准版色卡</p>
          <p className="mt-1">支持 52×52、78×78、104×104 三种标准底板尺寸</p>
        </div>
      </footer>
    </div>
  );
};
