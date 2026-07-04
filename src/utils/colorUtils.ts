import { Color, mard221Colors } from '../data/colors';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Lab {
  l: number;
  a: number;
  b: number;
}

export function rgbToLab(rgb: RGB): Lab {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
  const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
  const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

  return {
    l: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function ciede2000(lab1: Lab, lab2: Lab): number {
  const L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
  const L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_avg = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(C_avg, 7) / (Math.pow(C_avg, 7) + Math.pow(25, 7))));

  const a1_prime = a1 * (1 + G);
  const a2_prime = a2 * (1 + G);

  const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
  const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);

  let h1_prime = Math.atan2(b1, a1_prime);
  if (h1_prime < 0) h1_prime += 2 * Math.PI;

  let h2_prime = Math.atan2(b2, a2_prime);
  if (h2_prime < 0) h2_prime += 2 * Math.PI;

  const delta_L_prime = L2 - L1;
  const delta_C_prime = C2_prime - C1_prime;

  let delta_h_prime;
  if (C1_prime * C2_prime === 0) {
    delta_h_prime = 0;
  } else if (Math.abs(h2_prime - h1_prime) <= Math.PI) {
    delta_h_prime = h2_prime - h1_prime;
  } else if (h2_prime - h1_prime > Math.PI) {
    delta_h_prime = (h2_prime - h1_prime) - 2 * Math.PI;
  } else {
    delta_h_prime = (h2_prime - h1_prime) + 2 * Math.PI;
  }

  const delta_H_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(delta_h_prime / 2);

  const L_avg_prime = (L1 + L2) / 2;
  const C_avg_prime = (C1_prime + C2_prime) / 2;

  let h_avg_prime;
  if (C1_prime * C2_prime === 0) {
    h_avg_prime = h1_prime + h2_prime;
  } else if (Math.abs(h2_prime - h1_prime) <= Math.PI) {
    h_avg_prime = (h1_prime + h2_prime) / 2;
  } else if (h2_prime - h1_prime > Math.PI) {
    h_avg_prime = (h1_prime + h2_prime + 2 * Math.PI) / 2;
  } else {
    h_avg_prime = (h1_prime + h2_prime - 2 * Math.PI) / 2;
  }

  const T = 1 - 0.17 * Math.cos(h_avg_prime - Math.PI / 6) +
    0.24 * Math.cos(2 * h_avg_prime) +
    0.32 * Math.cos(3 * h_avg_prime + Math.PI / 30) -
    0.20 * Math.cos(4 * h_avg_prime - 63 * Math.PI / 180);

  const SL = 1 + (0.015 * Math.pow(L_avg_prime - 50, 2)) / Math.sqrt(20 + Math.pow(L_avg_prime - 50, 2));
  const SC = 1 + 0.045 * C_avg_prime;
  const SH = 1 + 0.015 * C_avg_prime * T;

  const RT = -2 * Math.sqrt(Math.pow(C_avg_prime, 7) / (Math.pow(C_avg_prime, 7) + Math.pow(25, 7))) *
    Math.sin(60 * Math.PI / 180 * Math.exp(-Math.pow((h_avg_prime * 180 / Math.PI - 275) / 25, 2)));

  const delta_E = Math.sqrt(
    Math.pow(delta_L_prime / SL, 2) +
    Math.pow(delta_C_prime / SC, 2) +
    Math.pow(delta_H_prime / SH, 2) +
    RT * (delta_C_prime / SC) * (delta_H_prime / SH)
  );

  return delta_E;
}

const colorsWithLab = mard221Colors.map(c => ({
  ...c,
  lab: rgbToLab(c.rgb),
}));

export function findClosestColor(rgb: RGB): Color {
  const targetLab = rgbToLab(rgb);
  
  let closestColor = colorsWithLab[0];
  let minDistance = Infinity;

  for (const color of colorsWithLab) {
    const distance = ciede2000(targetLab, color.lab);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

export function findColorById(id: string): Color | undefined {
  return mard221Colors.find(c => c.id === id);
}

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 255, g: 255, b: 255 };
}

export function rgbToHex(rgb: RGB): string {
  return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
