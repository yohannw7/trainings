export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").trim();
  if (m.length === 3) {
    const r = parseInt(m[0] + m[0], 16);
    const g = parseInt(m[1] + m[1], 16);
    const b = parseInt(m[2] + m[2], 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }
  if (m.length === 6) {
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }
  return null;
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** "r g b" string for CSS variables */
export function rgbToCss({ r, g, b }: RGB): string {
  return `${r} ${g} ${b}`;
}

/** Lighten/darken by mixing toward white/black. amount in [-1..1]. */
export function shade({ r, g, b }: RGB, amount: number): RGB {
  if (amount >= 0) {
    return {
      r: Math.round(r + (255 - r) * amount),
      g: Math.round(g + (255 - g) * amount),
      b: Math.round(b + (255 - b) * amount),
    };
  }
  const k = 1 + amount;
  return {
    r: Math.round(r * k),
    g: Math.round(g * k),
    b: Math.round(b * k),
  };
}

/** Pick a complementary-ish hue by rotating 30-50° in HSL space. */
export function rotateHue({ r, g, b }: RGB, degrees: number): RGB {
  const { h, s, l } = rgbToHsl({ r, g, b });
  const newH = (h + degrees + 360) % 360;
  return hslToRgb({ h: newH, s, l });
}

type HSL = { h: number; s: number; l: number };

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const conv = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: Math.round(conv(h / 360 + 1 / 3) * 255),
    g: Math.round(conv(h / 360) * 255),
    b: Math.round(conv(h / 360 - 1 / 3) * 255),
  };
}
