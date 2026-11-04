export const ASCII_RAMP = " .:-=+*#%@";

export const TEXT_SIZES: readonly number[] = [28, 20, 14, 10, 7, 5];

/** Map a 0–255 luma to a ramp character, darkest to lightest. */
export function lumaToChar(luma: number): string {
  const clamped = Math.min(Math.max(luma, 0), 255);
  const index = Math.round((clamped / 255) * (ASCII_RAMP.length - 1));
  return ASCII_RAMP[index];
}

/**
 * Turn a cols × rows RGBA buffer into ASCII rows, one char per pixel.
 * `rgba` holds `cols * rows * 4` bytes; alpha is ignored. Luma is stretched to
 * the buffer's own range so dark or flat images still use the whole ramp.
 */
export function asciiLines(
  rgba: ArrayLike<number>,
  cols: number,
  rows: number,
): string[] {
  const lumas: number[] = [];
  for (let offset = 0; offset < cols * rows * 4; offset += 4) {
    lumas.push(
      0.299 * rgba[offset] + 0.587 * rgba[offset + 1] + 0.114 * rgba[offset + 2],
    );
  }
  const min = lumas.reduce((a, b) => Math.min(a, b), 255);
  const max = lumas.reduce((a, b) => Math.max(a, b), 0);
  const range = max - min;

  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < cols; col += 1) {
      const luma = lumas[row * cols + col];
      line += lumaToChar(range > 0 ? ((luma - min) / range) * 255 : luma);
    }
    lines.push(line);
  }
  return lines;
}

type CrossBox = {
  cy: number;
  hw: number;
  hh: number;
  hd: number;
  slant: number;
};

type SurfacePoint = {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
};

// Three-bar Byzantine cross with a slanted footrest, in units where the post
// spans y -1..1. `slant` rotates the box about z around its own center.
const CROSS_BOXES: readonly CrossBox[] = [
  { cy: 0, hw: 0.09, hh: 1, hd: 0.09, slant: 0 },
  { cy: 0.62, hw: 0.28, hh: 0.07, hd: 0.09, slant: 0 },
  { cy: 0.32, hw: 0.58, hh: 0.09, hd: 0.09, slant: 0 },
  { cy: -0.62, hw: 0.34, hh: 0.07, hd: 0.09, slant: -0.35 },
];

const SAMPLE_STEP = 0.025;
const CROSS_TILT = 0.15;
const CROSS_DEPTH = 3.2;
const CROSS_LIGHT = (() => {
  const x = -0.4;
  const y = 0.6;
  const z = -0.7;
  const length = Math.hypot(x, y, z);
  return { x: x / length, y: y / length, z: z / length };
})();

let crossSurface: SurfacePoint[] | null = null;

function axisSamples(half: number): number[] {
  const count = Math.max(1, Math.round((half * 2) / SAMPLE_STEP));
  const step = (half * 2) / count;
  const values: number[] = [];
  for (let i = 0; i <= count; i += 1) values.push(-half + i * step);
  return values;
}

function buildCrossSurface(): SurfacePoint[] {
  const points: SurfacePoint[] = [];
  for (const box of CROSS_BOXES) {
    const xs = axisSamples(box.hw);
    const ys = axisSamples(box.hh);
    const zs = axisSamples(box.hd);
    const cos = Math.cos(box.slant);
    const sin = Math.sin(box.slant);

    const push = (
      px: number,
      py: number,
      pz: number,
      nx: number,
      ny: number,
      nz: number,
    ) => {
      points.push({
        x: px * cos - py * sin,
        y: box.cy + px * sin + py * cos,
        z: pz,
        nx: nx * cos - ny * sin,
        ny: nx * sin + ny * cos,
        nz,
      });
    };

    for (const y of ys) {
      for (const z of zs) {
        push(box.hw, y, z, 1, 0, 0);
        push(-box.hw, y, z, -1, 0, 0);
      }
    }
    for (const x of xs) {
      for (const z of zs) {
        push(x, box.hh, z, 0, 1, 0);
        push(x, -box.hh, z, 0, -1, 0);
      }
    }
    for (const x of xs) {
      for (const y of ys) {
        push(x, y, box.hd, 0, 0, 1);
        push(x, y, -box.hd, 0, 0, -1);
      }
    }
  }
  return points;
}

/**
 * Render the spinning Byzantine cross as `rows` ASCII lines of `cols` chars.
 * Points are rotated about y by `angle`, tilted about x, then z-buffered into
 * the character grid. Pure and deterministic.
 */
export function crossFrame(angle: number, cols: number, rows: number): string {
  if (cols <= 0 || rows <= 0) return "";
  if (!crossSurface) crossSurface = buildCrossSurface();
  const points = crossSurface;

  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const ct = Math.cos(CROSS_TILT);
  const st = Math.sin(CROSS_TILT);

  const cells = new Array<string>(cols * rows).fill(" ");
  const depth = new Float64Array(cols * rows);

  const scaleX = rows * 0.45 * 2.2 * CROSS_DEPTH;
  const scaleY = rows * 0.45 * CROSS_DEPTH;
  const topChar = ASCII_RAMP.length - 2;

  for (const p of points) {
    const x1 = p.x * ca + p.z * sa;
    const z1 = -p.x * sa + p.z * ca;
    const y2 = p.y * ct - z1 * st;
    const z2 = p.y * st + z1 * ct;

    const nx1 = p.nx * ca + p.nz * sa;
    const nz1 = -p.nx * sa + p.nz * ca;
    const ny2 = p.ny * ct - nz1 * st;
    const nz2 = p.ny * st + nz1 * ct;

    const divisor = z2 + CROSS_DEPTH;
    if (divisor <= 0) continue;

    const ooz = 1 / divisor;
    const xp = Math.round(cols / 2 + scaleX * ooz * x1);
    const yp = Math.round(rows / 2 - scaleY * ooz * y2);
    if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

    const index = yp * cols + xp;
    if (ooz <= depth[index]) continue;
    depth[index] = ooz;

    const lum = Math.max(
      0,
      nx1 * CROSS_LIGHT.x + ny2 * CROSS_LIGHT.y + nz2 * CROSS_LIGHT.z,
    );
    cells[index] = ASCII_RAMP[1 + Math.floor(lum * topChar)];
  }

  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    lines.push(cells.slice(row * cols, (row + 1) * cols).join(""));
  }
  return lines.join("\n");
}

/** Step through the text sizes as progress moves from start to end. */
export function textSizeForProgress(
  progress: number,
  start: number,
  end: number,
): number {
  const span = end - start;
  const raw = span === 0 ? 1 : (progress - start) / span;
  const t = Math.min(Math.max(raw, 0), 1);
  const index = Math.min(
    Math.floor(t * TEXT_SIZES.length),
    TEXT_SIZES.length - 1,
  );
  return TEXT_SIZES[index];
}

export type SplashCell = { dx: number; dy: number; char: string; alpha: number };

const SPLASH_RADIUS = 16;
const SPLASH_TRAIL = 5;
const SPLASH_RING_WIDTH = 1.5;

/** Stable noise in [0.75, 1] for one grid cell, so a splash keeps its grain. */
function splashJitter(dx: number, dy: number, seed: number): number {
  let hash =
    Math.imul(dx, 374761393) ^
    Math.imul(dy, 668265263) ^
    Math.imul(seed, 1274126177);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  hash ^= hash >>> 16;
  return 0.75 + ((hash >>> 0) / 4294967295) * 0.25;
}

/**
 * Cells of an ASCII ripple `age` (0–1) into its life, centred on a click.
 * Two rings spread out and thin through the ramp as the splash fades. Pure and
 * deterministic; rows are twice as tall as columns, so dy is measured doubled.
 */
export function splashCells(age: number, seed: number): SplashCell[] {
  const progress = Math.max(age, 0);
  if (progress >= 1) return [];

  const eased = 1 - (1 - progress) ** 2;
  const leading = SPLASH_RADIUS * eased;
  const trailing = leading - SPLASH_TRAIL;
  const rings = trailing >= 0 ? [leading, trailing] : [leading];
  const fade = 1 - progress;
  const span = SPLASH_RADIUS + 2;
  const halfRows = Math.floor(span / 2);

  const cells: SplashCell[] = [];
  for (let dy = -halfRows; dy <= halfRows; dy += 1) {
    for (let dx = -span; dx <= span; dx += 1) {
      const distance = Math.hypot(dx, dy * 2);
      let intensity = 0;
      for (const ring of rings) {
        intensity = Math.max(
          intensity,
          Math.max(0, 1 - Math.abs(distance - ring) / SPLASH_RING_WIDTH),
        );
      }
      if (intensity <= 0) continue;

      const brightness = intensity * fade * splashJitter(dx, dy, seed);
      const char = lumaToChar(brightness * 255);
      if (char === " ") continue;
      cells.push({ dx, dy, char, alpha: intensity * fade });
    }
  }
  return cells;
}
