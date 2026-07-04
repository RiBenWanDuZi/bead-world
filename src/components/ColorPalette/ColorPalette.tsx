import React, { useState } from 'react';
import { mard221Colors, categories, categoryNames } from '../../data/colors';
import { useProjectStore } from '../../stores/projectStore';
import { Search, X } from 'lucide-react';

interface ColorPaletteProps {
  compact?: boolean;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ compact = false }) => {
  const selectedColor = useProjectStore((state) => state.selectedColor);
  const setSelectedColor = useProjectStore((state) => state.setSelectedColor);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColors = mard221Colors.filter((color) => {
    const matchesCategory = activeCategory === 'all' || color.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      color.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedColors = categories.reduce((acc, cat) => {
    acc[cat] = filteredColors.filter((c) => c.category === cat);
    return acc;
  }, {} as Record<string, typeof mard221Colors>);

  return (
    <div className={`${compact ? 'h-full flex flex-col' : 'bg-white rounded-xl shadow-lg p-4'}`}>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索色号或颜色名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2 py-1 text-xs rounded-full transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              activeCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={`${compact ? 'flex-1 overflow-y-auto' : ''}`}>
        {categories
          .filter((cat) => activeCategory === 'all' || cat === activeCategory)
          .map((cat) => {
            const colors = groupedColors[cat];
            if (colors.length === 0) return null;
            
            return (
              <div key={cat} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0]?.hex }} />
                  {cat}系 - {categoryNames[cat]} ({colors.length}色)
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-md transition-all ${
                        selectedColor?.id === color.id
                          ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.id} - ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {selectedColor && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg shadow-md"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <div>
              <div className="font-semibold text-sm">{selectedColor.id}</div>
              <div className="text-xs text-gray-500">{selectedColor.name}</div>
              <div className="text-xs text-gray-400">{selectedColor.hex}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
