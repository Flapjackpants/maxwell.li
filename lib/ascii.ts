export const ASCII_RAMP = " .:-=+*#%@";

export const TEXT_SIZES: readonly number[] = [22, 16, 12, 9, 7, 5];

/** Map a 0–255 luma to a ramp character, darkest to lightest. */
export function lumaToChar(luma: number): string {
  const clamped = Math.min(Math.max(luma, 0), 255);
  const index = Math.round((clamped / 255) * (ASCII_RAMP.length - 1));
  return ASCII_RAMP[index];
}

/**
 * Turn a cols × rows RGBA buffer into ASCII rows, one char per pixel.
 * `rgba` holds `cols * rows * 4` bytes; alpha is ignored.
 */
export function asciiLines(
  rgba: ArrayLike<number>,
  cols: number,
  rows: number,
): string[] {
  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < cols; col += 1) {
      const offset = (row * cols + col) * 4;
      const luma =
        0.299 * rgba[offset] + 0.587 * rgba[offset + 1] + 0.114 * rgba[offset + 2];
      line += lumaToChar(luma);
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
