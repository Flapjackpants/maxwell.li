import test from "node:test";
import assert from "node:assert/strict";
import {
  ASCII_RAMP,
  TEXT_SIZES,
  asciiLines,
  crossFrame,
  lumaToChar,
  splashCells,
  textSizeForProgress,
} from "../lib/ascii.ts";

test("lumaToChar maps the ramp endpoints and clamps out-of-range luma", () => {
  assert.equal(ASCII_RAMP[0], " ");
  assert.equal(ASCII_RAMP[ASCII_RAMP.length - 1], "@");
  assert.equal(lumaToChar(0), " ");
  assert.equal(lumaToChar(255), "@");
  assert.equal(lumaToChar(-10), " ");
  assert.equal(lumaToChar(999), "@");
});

test("asciiLines returns one string per row with one char per column", () => {
  const twoByOne = asciiLines([0, 0, 0, 255, 255, 255, 255, 255], 2, 1);
  assert.deepEqual(twoByOne, [" @"]);

  const black = new Array(3 * 2 * 4).fill(0);
  const lines = asciiLines(black, 3, 2);
  assert.equal(lines.length, 2);
  for (const line of lines) assert.equal(line.length, 3);
});

test("asciiLines stretches low-contrast images and leaves flat ones alone", () => {
  assert.deepEqual(asciiLines([100, 100, 100, 255, 120, 120, 120, 255], 2, 1), [" @"]);
  assert.deepEqual(asciiLines([255, 255, 255, 255, 255, 255, 255, 255], 2, 1), ["@@"]);
});

test("textSizeForProgress clamps to the first and last size", () => {
  assert.equal(textSizeForProgress(0.1, 0.3, 0.72), TEXT_SIZES[0]);
  assert.equal(
    textSizeForProgress(0.9, 0.3, 0.72),
    TEXT_SIZES[TEXT_SIZES.length - 1],
  );
  assert.equal(
    textSizeForProgress(0.72, 0.3, 0.72),
    TEXT_SIZES[TEXT_SIZES.length - 1],
  );
});

test("textSizeForProgress shrinks monotonically as progress increases", () => {
  let previous = Infinity;
  for (let i = 0; i <= 100; i += 1) {
    const size = textSizeForProgress(i / 100, 0.3, 0.72);
    assert.ok(size <= previous, `size ${size} grew after ${previous}`);
    previous = size;
  }
  assert.equal(previous, TEXT_SIZES[TEXT_SIZES.length - 1]);
});

test("crossFrame returns a full cols × rows frame with visible ink", () => {
  const frame = crossFrame(0.6, 44, 30);
  const lines = frame.split("\n");
  assert.equal(lines.length, 30);
  for (const line of lines) assert.equal(line.length, 44);
  assert.ok(lines.some((line) => line.trim() !== ""));
  assert.equal(frame, crossFrame(0.6, 44, 30));
  assert.notEqual(crossFrame(0, 44, 30), crossFrame(1, 44, 30));
});

test("crossFrame slanted footrest keeps rows asymmetric", () => {
  const lines = crossFrame(0, 44, 30).split("\n");
  assert.ok(
    lines.some((line) => line !== [...line].reverse().join("")),
    "expected at least one non-palindromic row",
  );
});

test("splashCells returns no cells before or after its life", () => {
  assert.deepEqual(splashCells(1, 1), []);
  assert.deepEqual(splashCells(2, 1), []);
  assert.deepEqual(splashCells(-1, 1), splashCells(0, 1));
});

test("splashCells starts as a dot under the click", () => {
  const cells = splashCells(0, 1);
  assert.ok(cells.some((cell) => cell.dx === 0 && cell.dy === 0));
});

test("splashCells keeps cells on the grid with visible glyphs and alpha", () => {
  for (const age of [0, 0.3, 0.6, 0.9]) {
    for (const cell of splashCells(age, 3)) {
      assert.ok(Number.isInteger(cell.dx), `dx ${cell.dx} at ${age}`);
      assert.ok(Number.isInteger(cell.dy), `dy ${cell.dy} at ${age}`);
      assert.ok(cell.char !== " ", `blank char at ${age}`);
      assert.ok(ASCII_RAMP.includes(cell.char), `char ${cell.char}`);
      assert.ok(cell.alpha > 0 && cell.alpha <= 1, `alpha ${cell.alpha}`);
    }
  }
});

test("splashCells rings spread outward as the ripple ages", () => {
  const reach = (age) =>
    Math.max(
      ...splashCells(age, 5).map((cell) => Math.hypot(cell.dx, cell.dy * 2)),
    );
  assert.ok(reach(0.6) > reach(0.1));
});

test("splashCells fades as the ripple ages", () => {
  const peak = (age) =>
    Math.max(...splashCells(age, 5).map((cell) => cell.alpha));
  assert.ok(peak(0.8) < peak(0.2));
});

test("splashCells glyphs thin out as the ripple ages", () => {
  const glyph = (age) =>
    Math.max(
      ...splashCells(age, 5).map((cell) => ASCII_RAMP.indexOf(cell.char)),
    );
  assert.ok(glyph(0.9) < glyph(0.1));
});

test("splashCells fades to nothing at the end of its life", () => {
  for (const cell of splashCells(0.99, 5)) {
    assert.ok(cell.alpha < 0.05, `alpha ${cell.alpha}`);
  }
});

test("splashCells is deterministic and varies with the seed", () => {
  assert.deepEqual(splashCells(0.4, 7), splashCells(0.4, 7));
  assert.notDeepEqual(splashCells(0.4, 1), splashCells(0.4, 2));
});
