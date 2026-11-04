import test from "node:test";
import assert from "node:assert/strict";
import {
  ASCII_RAMP,
  TEXT_SIZES,
  asciiLines,
  crossFrame,
  lumaToChar,
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
