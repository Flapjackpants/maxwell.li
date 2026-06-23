import type { CSSProperties } from "react";
import { retroTableBorder } from "@/lib/retro-theme";

type ListingImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

function resolveImageSrc(url: string): string {
  if (!url) return "";
  try {
    const { hostname } = new URL(url);
    const needsProxy =
      hostname.includes("wikia.nocookie.net") ||
      hostname.includes("fandom.com") ||
      hostname === "minecraft.wiki" ||
      hostname.endsWith(".minecraft.wiki");
    if (needsProxy) {
      return `/api/shop/image?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return url;
  }
  return url;
}

export function ListingImage({
  src,
  alt,
  width = 100,
  height = 100,
}: ListingImageProps) {
  const resolved = resolveImageSrc(src);

  if (!resolved) {
    return (
      <div
        style={{
          width,
          height,
          background: "#222",
          border: "2px solid lime",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
        }}
      >
        NO IMG
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      referrerPolicy="no-referrer"
      style={{ border: "2px solid lime", objectFit: "contain", background: "#111" }}
    />
  );
}

export function listingCardStyle(): CSSProperties {
  return {
    ...retroTableBorder,
    marginBottom: 14,
    padding: 8,
    backgroundColor: "#000033",
  };
}
