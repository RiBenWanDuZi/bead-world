import React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { findColorById } from '../../utils/colorUtils';
import { mard221Colors, categories, categoryNames } from '../../data/colors';
import { Palette, TrendingUp, Package } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const grid = useProjectStore((state) => state.grid);

  const colorCounts: Record<string, number> = {};
  
  for (const row of grid) {
    for (const colorId of row) {
      colorCounts[colorId] = (colorCounts[colorId] || 0) + 1;
    }
  }

  const sortedColors = Object.entries(colorCounts)
    .filter(([id]) => id !== 'H1' || colorCounts[id] > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalBeads = sortedColors.reduce((sum, [, count]) => sum + count, 0);
  const uniqueColors = sortedColors.length;

  const categorizedStats = categories.map((cat) => {
    const catColors = sortedColors.filter(([id]) => id.startsWith(cat));
    const count = catColors.reduce((sum, [, c]) => sum + c, 0);
    return {
      category: cat,
      name: categoryNames[cat],
      count,
      colors: catColors.length,
    };
  }).filter((c) => c.count > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <Palette className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-600">{uniqueColors}</div>
          <div className="text-xs text-blue-500">颜色种类</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-green-600">{totalBeads}</div>
          <div className="text-xs text-green-500">豆子总数</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <Package className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-purple-600">
            {Math.ceil(totalBeads / 1000)}
          </div>
          <div className="text-xs text-purple-500">包数(1000颗/包)</div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-2">色系统计</h3>
        <div className="space-y-2">
          {categorizedStats.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{cat.name}</span>
                <span className="text-xs text-gray-400">({cat.colors}色)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(cat.count / totalBeads) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 mb-2">详细清单</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {sortedColors.map(([colorId, count]) => {
            const color = findColorById(colorId);
            if (!color) return null;
            
            return (
              <div
                key={colorId}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-md border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{color.id}</div>
                  <div className="text-xs text-gray-500 truncate">{color.name}</div>
                </div>
                <div className="text-sm font-semibold text-gray-700">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
