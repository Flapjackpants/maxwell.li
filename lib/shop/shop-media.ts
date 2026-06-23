/** Background playlist for /shop (filenames in `public/`) */
export const SHOP_PLAYLIST = [
  "Classic Lobby Theme - Pixel Gun 3D Soundtrack [IZziHDrbEwg].m4a",
  "＂？？？＂ ⧸ Inside the Code - Pixel Gun 3D Soundtrack [JBhTB_8jPuc].m4a",
  "Heaven Garden - Pixel Gun 3D Soundtrack [XWAOss4d-II].m4a",
  "Honolulu Honey [AJSpPsXhfH4].m4a",
] as const;

export const SHOP_TITLE_IMAGE = "/umazingLogo.png";

export function publicAssetUrl(filename: string): string {
  return `/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
}

export const SHOP_PLAYLIST_URLS = SHOP_PLAYLIST.map(publicAssetUrl);
