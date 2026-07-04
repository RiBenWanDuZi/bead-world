import { Color, mard221Colors } from '../data/colors';
import { findClosestColor, rgbToLab, ciede2000 } from './colorUtils';

export interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isSkinColor(r: number, g: number, b: number): boolean {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;
  
  const sum = normalizedR + normalizedG + normalizedB;
  const rRatio = normalizedR / sum;
  const gRatio = normalizedG / sum;
  
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && g > b &&
    rRatio > 0.38 && rRatio < 0.55 &&
    gRatio > 0.30 && gRatio < 0.45
  );
}

function recoverFeatures(
  grid: string[][],
  rgbGrid: RGB[][],
  originalPixels: Pixel[][],
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number
): { grid: string[][]; rgbGrid: RGB[][] } {
  const newGrid = grid.map(row => [...row]);
  const newRgbGrid = rgbGrid.map(row => row.map(p => ({ ...p })));
  
  const scaleX = originalWidth / targetWidth;
  const scaleY = originalHeight / targetHeight;
  
  const isSmallSize = targetWidth <= 60 || targetHeight <= 60;
  const featureThreshold = isSmallSize ? 0.05 : 0.08;
  const featureMinCount = isSmallSize ? 1 : 2;
  const luminanceDiff = isSmallSize ? 30 : 40;
  
  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      const currentRgb = rgbGrid[ty][tx];
      const currentLum = getLuminance(currentRgb.r, currentRgb.g, currentRgb.b);
      
      const startX = Math.floor(tx * scaleX);
      const endX = Math.min(Math.floor((tx + 1) * scaleX), originalWidth);
      const startY = Math.floor(ty * scaleY);
      const endY = Math.min(Math.floor((ty + 1) * scaleY), originalHeight);
      
      const darkPixels: Pixel[] = [];
      const brightPixels: Pixel[] = [];
      let totalPixels = 0;
      
      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const pixel = originalPixels[py][px];
          if (pixel.a >= 128) {
            totalPixels++;
            const pixelLum = getLuminance(pixel.r, pixel.g, pixel.b);
            
            if (currentLum - pixelLum > luminanceDiff) {
              darkPixels.push(pixel);
            }
            if (pixelLum - currentLum > luminanceDiff) {
              brightPixels.push(pixel);
            }
          }
        }
      }
      
      let shouldRecover = false;
      let recoveredRgb = currentRgb;
      
      if (totalPixels > 0) {
        if (darkPixels.length >= Math.max(featureMinCount, totalPixels * featureThreshold)) {
          const hasSkin = rgbGrid[ty][tx].r > 95 && rgbGrid[ty][tx].g > 40 && rgbGrid[ty][tx].b > 20;
          
          if (hasSkin || currentLum > 50) {
            const sortedDarkPixels = [...darkPixels].sort((a, b) => 
              getLuminance(a.r, a.g, a.b) - getLuminance(b.r, b.g, b.b)
            );
            
            const medianIndex = Math.floor(sortedDarkPixels.length / 2);
            const medianPixel = sortedDarkPixels[medianIndex];
            
            recoveredRgb = { r: medianPixel.r, g: medianPixel.g, b: medianPixel.b };
            shouldRecover = true;
          }
        } else if (brightPixels.length >= Math.max(featureMinCount, totalPixels * featureThreshold)) {
          const hasDark = currentLum < 150;
          
          if (hasDark) {
            const sortedBrightPixels = [...brightPixels].sort((a, b) => 
              getLuminance(b.r, b.g, b.b) - getLuminance(a.r, a.g, a.b)
            );
            
            const medianIndex = Math.floor(sortedBrightPixels.length / 2);
            const medianPixel = sortedBrightPixels[medianIndex];
            
            recoveredRgb = { r: medianPixel.r, g: medianPixel.g, b: medianPixel.b };
            shouldRecover = true;
          }
        }
      }
      
      if (shouldRecover) {
        newRgbGrid[ty][tx] = recoveredRgb;
        
        const closestColor = findClosestColor(recoveredRgb);
        newGrid[ty][tx] = closestColor.id;
      }
    }
  }
  
  return { grid: newGrid, rgbGrid: newRgbGrid };
}

export function pixelateImage(
  img: HTMLImageElement,
  targetSize: number,
  removeBackground: boolean = false
): { grid: string[][]; rgbGrid: RGB[][] } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  const aspectRatio = img.width / img.height;
  let width = targetSize;
  let height = targetSize;

  if (aspectRatio > 1) {
    height = Math.round(targetSize / aspectRatio);
  } else {
    width = Math.round(targetSize * aspectRatio);
  }

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const originalImageData = ctx.getImageData(0, 0, img.width, img.height);
  const originalPixels: Pixel[][] = [];
  
  for (let y = 0; y < img.height; y++) {
    const row: Pixel[] = [];
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      row.push({
        r: originalImageData.data[i],
        g: originalImageData.data[i + 1],
        b: originalImageData.data[i + 2],
        a: originalImageData.data[i + 3],
      });
    }
    originalPixels.push(row);
  }

  if (removeBackground) {
    removeImageBackground(originalPixels);
  }

  const targetCanvas = document.createElement('canvas');
  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) throw new Error('Failed to get canvas context');
  
  targetCanvas.width = width;
  targetCanvas.height = height;
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  
  targetCtx.drawImage(img, 0, 0, width, height);
  
  const targetImageData = targetCtx.getImageData(0, 0, width, height);
  
  const grid: string[][] = [];
  const rgbGrid: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    const rgbRow: RGB[] = [];
    
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = targetImageData.data[i];
      const g = targetImageData.data[i + 1];
      const b = targetImageData.data[i + 2];
      const a = targetImageData.data[i + 3];
      
      if (a < 128) {
        row.push('H1');
        rgbRow.push({ r: 255, g: 255, b: 255 });
        continue;
      }
      
      const rgb = { r, g, b };
      rgbRow.push(rgb);
      
      const closestColor = findClosestColor(rgb);
      row.push(closestColor.id);
    }
    grid.push(row);
    rgbGrid.push(rgbRow);
  }

  const recovered = recoverFeatures(grid, rgbGrid, originalPixels, img.width, img.height, width, height);

  return recovered;
}

function removeImageBackground(pixels: Pixel[][]): void {
  const width = pixels[0]?.length || 0;
  const height = pixels.length;
  
  if (width === 0 || height === 0) return;

  const edgePixels: Pixel[] = [];
  
  for (let x = 0; x < width; x++) {
    edgePixels.push(pixels[0][x]);
    edgePixels.push(pixels[height - 1][x]);
  }
  
  for (let y = 1; y < height - 1; y++) {
    edgePixels.push(pixels[y][0]);
    edgePixels.push(pixels[y][width - 1]);
  }

  const avgR = edgePixels.reduce((sum, p) => sum + p.r, 0) / edgePixels.length;
  const avgG = edgePixels.reduce((sum, p) => sum + p.g, 0) / edgePixels.length;
  const avgB = edgePixels.reduce((sum, p) => sum + p.b, 0) / edgePixels.length;

  const tolerance = 50;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y][x];
      const diffR = Math.abs(pixel.r - avgR);
      const diffG = Math.abs(pixel.g - avgG);
      const diffB = Math.abs(pixel.b - avgB);

      if (diffR < tolerance && diffG < tolerance && diffB < tolerance) {
        pixel.a = 0;
      }
    }
  }
}

export function applyDithering(grid: string[][], rgbGrid: RGB[][]): string[][] {
  const width = grid[0]?.length || 0;
  const height = grid.length;
  
  if (width === 0 || height === 0) return grid;

  const floatGrid: { r: number; g: number; b: number }[][] = rgbGrid.map(row =>
    row.map(p => ({ ...p }))
  );

  const newGrid = grid.map(row => [...row]);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const original = floatGrid[y][x];
      
      const clampedR = Math.max(0, Math.min(255, Math.round(original.r)));
      const clampedG = Math.max(0, Math.min(255, Math.round(original.g)));
      const clampedB = Math.max(0, Math.min(255, Math.round(original.b)));

      const closestColor = findClosestColor({ r: clampedR, g: clampedG, b: clampedB });
      newGrid[y][x] = closestColor.id;

      const errorR = original.r - closestColor.rgb.r;
      const errorG = original.g - closestColor.rgb.g;
      const errorB = original.b - closestColor.rgb.b;

      if (x < width - 1) {
        floatGrid[y][x + 1].r += errorR * 7 / 16;
        floatGrid[y][x + 1].g += errorG * 7 / 16;
        floatGrid[y][x + 1].b += errorB * 7 / 16;
      }
      if (y < height - 1) {
        floatGrid[y + 1][x].r += errorR * 5 / 16;
        floatGrid[y + 1][x].g += errorG * 5 / 16;
        floatGrid[y + 1][x].b += errorB * 5 / 16;
        
        if (x > 0) {
          floatGrid[y + 1][x - 1].r += errorR * 3 / 16;
          floatGrid[y + 1][x - 1].g += errorG * 3 / 16;
          floatGrid[y + 1][x - 1].b += errorB * 3 / 16;
        }
        if (x < width - 1) {
          floatGrid[y + 1][x + 1].r += errorR * 1 / 16;
          floatGrid[y + 1][x + 1].g += errorG * 1 / 16;
          floatGrid[y + 1][x + 1].b += errorB * 1 / 16;
        }
      }
    }
  }

  return newGrid;
}

export function compressColors(grid: string[][], maxColors: number): string[][] {
  if (maxColors <= 0) return grid;

  const colorCounts: Record<string, number> = {};
  
  for (const row of grid) {
    for (const colorId of row) {
      colorCounts[colorId] = (colorCounts[colorId] || 0) + 1;
    }
  }

  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1]);

  const topColors = sortedColors.slice(0, maxColors).map(([id]) => id);

  if (topColors.length === 0) return grid;

  const newGrid = grid.map(row => 
    row.map(colorId => {
      if (topColors.includes(colorId)) {
        return colorId;
      }

      const originalColor = mard221Colors.find(c => c.id === colorId);
      if (!originalColor) return topColors[0];

      let closestColor = topColors[0];
      let minDistance = Infinity;

      for (const topId of topColors) {
        const topColor = mard221Colors.find(c => c.id === topId);
        if (!topColor) continue;

        const distance = Math.sqrt(
          Math.pow(originalColor.rgb.r - topColor.rgb.r, 2) +
          Math.pow(originalColor.rgb.g - topColor.rgb.g, 2) +
          Math.pow(originalColor.rgb.b - topColor.rgb.b, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestColor = topId;
        }
      }

      return closestColor;
    })
  );

  return newGrid;
}
