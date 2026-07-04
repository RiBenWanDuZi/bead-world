import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { GridCanvas } from '../components/GridCanvas';
import { StatsPanel } from '../components/StatsPanel';
import { findColorById } from '../utils/colorUtils';
import { ArrowLeft, Download, FileImage, FileText, Printer, Settings } from 'lucide-react';
import jsPDF from 'jspdf';

export const Export: React.FC = () => {
  const navigate = useNavigate();
  const grid = useProjectStore((state) => state.grid);
  const showGrid = useProjectStore((state) => state.showGrid);
  const showColorCodes = useProjectStore((state) => state.showColorCodes);
  const size = useProjectStore((state) => state.size);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportOptions, setExportOptions] = useState({
    includeGrid: true,
    includeCodes: false,
    includeStats: true,
    paperSize: 'A4',
    orientation: 'portrait',
  });

  const colorCounts: Record<string, number> = {};
  for (const row of grid) {
    for (const colorId of row) {
      colorCounts[colorId] = (colorCounts[colorId] || 0) + 1;
    }
  }

  const sortedColors = Object.entries(colorCounts)
    .filter(([id]) => id !== 'H1' || colorCounts[id] > 0)
    .sort((a, b) => b[1] - a[1]);

  const generateCanvas = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cellSize = 20;
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
        }

        if (exportOptions.includeGrid) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        if (exportOptions.includeCodes && cellSize > 25) {
          ctx.fillStyle = color?.hex === '#FFFFFF' ? '#000000' : '#FFFFFF';
          ctx.font = `${Math.max(8, cellSize / 3)}px Arial`;
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

    return canvas;
  };

  const exportPNG = () => {
    const canvas = generateCanvas();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `拼豆图纸_${size}x${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportPDF = () => {
    const canvas = generateCanvas();
    if (!canvas) return;

    const { paperSize, orientation } = exportOptions;
    const isPortrait = orientation === 'portrait';
    
    let pdf;
    if (paperSize === 'A4') {
      pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });
    } else {
      pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'letter',
      });
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const scale = Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight);
    const finalWidth = canvasWidth * scale;
    const finalHeight = canvasHeight * scale;

    const x = (pageWidth - finalWidth) / 2;
    const y = margin;

    pdf.addImage(canvas, 'PNG', x, y, finalWidth, finalHeight);

    if (exportOptions.includeStats) {
      let statY = y + finalHeight + 15;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('材料清单', margin, statY);
      
      statY += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const cols = [30, 80, 40, 40];
      pdf.text('色号', margin, statY);
      pdf.text('颜色', margin + cols[0], statY);
      pdf.text('数量', margin + cols[0] + cols[1], statY);
      pdf.text('包数', margin + cols[0] + cols[1] + cols[2], statY);
      
      statY += 5;
      pdf.setLineWidth(0.5);
      pdf.line(margin, statY, pageWidth - margin, statY);
      
      statY += 8;
      
      sortedColors.forEach(([colorId, count]) => {
        if (statY > pageHeight - 20) {
          pdf.addPage();
          statY = margin;
        }
        
        const color = findColorById(colorId);
        if (!color) return;
        
        pdf.setFillColor(color.rgb.r, color.rgb.g, color.rgb.b);
        pdf.rect(margin, statY - 3, 6, 6, 'F');
        
        pdf.text(colorId, margin + 10, statY + 2);
        pdf.text(color.name, margin + cols[0], statY + 2);
        pdf.text(String(count), margin + cols[0] + cols[1], statY + 2);
        pdf.text(String(Math.ceil(count / 1000)), margin + cols[0] + cols[1] + cols[2], statY + 2);
        
        statY += 8;
      });
    }

    pdf.save(`拼豆图纸_${size}x${size}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">导出图纸</h1>
              <p className="text-xs text-gray-500">下载或打印拼豆图纸</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              尺寸: {size}×{size}
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>打印</span>
            </button>
            <button
              onClick={exportPNG}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FileImage className="w-4 h-4" />
              <span>导出 PNG</span>
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>导出 PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                导出设置
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">显示网格线</span>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, includeGrid: !exportOptions.includeGrid })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      exportOptions.includeGrid ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        exportOptions.includeGrid ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">显示色号</span>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, includeCodes: !exportOptions.includeCodes })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      exportOptions.includeCodes ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        exportOptions.includeCodes ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">包含材料清单</span>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, includeStats: !exportOptions.includeStats })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      exportOptions.includeStats ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        exportOptions.includeStats ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">纸张大小</label>
                  <select
                    value={exportOptions.paperSize}
                    onChange={(e) => setExportOptions({ ...exportOptions, paperSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">纸张方向</label>
                  <select
                    value={exportOptions.orientation}
                    onChange={(e) => setExportOptions({ ...exportOptions, orientation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="portrait">纵向</option>
                    <option value="landscape">横向</option>
                  </select>
                </div>
              </div>
            </div>

            <StatsPanel />
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">预览</h3>
              <GridCanvas editable={false} showPreview={true} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
