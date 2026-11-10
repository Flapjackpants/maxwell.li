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
