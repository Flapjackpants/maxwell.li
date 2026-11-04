import type { Project } from "./projects";

export const HUD_NOISE: readonly string[] = [
  "0x3F7A //:: 0B1E", "7C:0A / 9F::2D", "0xE41B // 3A:7F", "6D::B2 / 0x14",
  "A9:4E //:: 0F", "0x72C1 / DD:0A", "F8::23 // 6B:1C", "0x0C9A / E7::4D",
  "35:AF // 0xB8", "0xD61E :: 4C/2A", "7B::0F / 0xE3", "0xA4D2 // 8F:61",
  "C0:3E / 7A::19", "0xF12B // 0D:AE", "2F::8C / 0xB4", "0x9E03 :: 6A/1D",
  "4A:B7 // 0xC2", "0x71E9 / F0::38", "D5::0A // 2C:9B", "0xB83F / 6E::14",
  "19:DE // 0xA7", "0xC402 :: 8B/5F", "E6::3A / 0x71", "0x2D9C // 4F:80",
  "7F:1B / 0A::E4", "0xD3A8 // 6C:12", "B0::5E / 0xF9", "0x81C7 :: 2A/4D",
  "3C:EA // 0x60", "0xF72D / 9B::01", "A6::4C // 8E:3F", "0x0B95 / D2::7A",
  "5E:C1 // 0x34", "0xA8F0 :: 1D/6B", "C7::2E / 0x49", "0x3BDA // 7F:05",
  "8D:0C / 6A::F1", "0xE25B // 4C:9A", "F3::18 / 0xD6", "0x6C0A :: B7/2E",
];

export function hudProjectLines(projects: readonly Project[]): string[] {
  return projects.map(({ id, tags }) => `${id.toUpperCase()} // ${tags.join(" / ").toUpperCase()}`);
}
