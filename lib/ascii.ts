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
