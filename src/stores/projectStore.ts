import { create } from 'zustand';
import { Color } from '../data/colors';

export type ToolType = 'brush' | 'eraser' | 'fill' | 'picker';
export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'both';

export interface ProjectState {
  size: number;
  grid: string[][];
  originalImage: string | null;
  selectedColor: Color | null;
  tool: ToolType;
  symmetryMode: SymmetryMode;
  showGrid: boolean;
  showColorCodes: boolean;
  zoom: number;
  maxColors: number;
  removeBackground: boolean;
  useDithering: boolean;
  
  setSize: (size: number) => void;
  setGrid: (grid: string[][]) => void;
  setOriginalImage: (image: string | null) => void;
  setSelectedColor: (color: Color | null) => void;
  setTool: (tool: ToolType) => void;
  setSymmetryMode: (mode: SymmetryMode) => void;
  toggleGrid: () => void;
  toggleColorCodes: () => void;
  setZoom: (zoom: number) => void;
  setMaxColors: (max: number) => void;
  setRemoveBackground: (remove: boolean) => void;
  setUseDithering: (use: boolean) => void;
  updateCell: (row: number, col: number, colorId: string) => void;
  clearGrid: () => void;
  initializeGrid: (size: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  size: 52,
  grid: [],
  originalImage: null,
  selectedColor: null,
  tool: 'brush',
  symmetryMode: 'none',
  showGrid: true,
  showColorCodes: false,
  zoom: 1,
  maxColors: 0,
  removeBackground: false,
  useDithering: false,

  setSize: (size) => set({ size }),
  setGrid: (grid) => set({ grid }),
  setOriginalImage: (image) => set({ originalImage: image }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setTool: (tool) => set({ tool }),
  setSymmetryMode: (mode) => set({ symmetryMode: mode }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleColorCodes: () => set((state) => ({ showColorCodes: !state.showColorCodes })),
  setZoom: (zoom) => set({ zoom }),
  setMaxColors: (max) => set({ maxColors: max }),
  setRemoveBackground: (remove) => set({ removeBackground: remove }),
  setUseDithering: (use) => set({ useDithering: use }),

  updateCell: (row, col, colorId) => set((state) => {
    const newGrid = state.grid.map(r => [...r]);
    
    const applySymmetry = () => {
      const height = state.grid.length;
      const width = state.grid[0]?.length || 0;
      
      newGrid[row][col] = colorId;
      
      if (state.symmetryMode === 'horizontal' || state.symmetryMode === 'both') {
        const mirrorRow = height - 1 - row;
        if (mirrorRow !== row) {
          newGrid[mirrorRow][col] = colorId;
        }
      }
      
      if (state.symmetryMode === 'vertical' || state.symmetryMode === 'both') {
        const mirrorCol = width - 1 - col;
        if (mirrorCol !== col) {
          newGrid[row][mirrorCol] = colorId;
        }
      }
      
      if (state.symmetryMode === 'both') {
        const mirrorRow = height - 1 - row;
        const mirrorCol = width - 1 - col;
        if (mirrorRow !== row && mirrorCol !== col) {
          newGrid[mirrorRow][mirrorCol] = colorId;
        }
      }
    };
    
    applySymmetry();
    return { grid: newGrid };
  }),

  clearGrid: () => set((state) => ({
    grid: Array(state.size).fill(null).map(() => 
      Array(state.size).fill('H1')
    ),
  })),

  initializeGrid: (size) => set({
    size,
    grid: Array(size).fill(null).map(() => 
      Array(size).fill('H1')
    ),
  }),
}));
