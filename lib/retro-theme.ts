import type { CSSProperties } from "react";

/** Loaded via next/font in app/layout.tsx; avoid generic `cursive` on mobile. */
export const retroFontFamily =
  'var(--font-retro), "Comic Sans MS", "Comic Sans", sans-serif';

export const retroPageStyle: CSSProperties = {
  minHeight: "100dvh",
  margin: 0,
  padding: "12px",
  fontFamily: retroFontFamily,
  backgroundColor: "#000080",
  backgroundImage:
    "repeating-linear-gradient(180deg, #000060 0px, #000080 2px, #0000a0 4px)",
  color: "#ffff00",
  fontSize: "15px",
};

export const retroLinkStyle: CSSProperties = {
  color: "#00ff00",
  fontWeight: "bold",
};

export const retroTableBorder: CSSProperties = {
  border: "3px ridge #ff00ff",
  backgroundColor: "#000033",
};

/** Card wrapper used for each shop/admin listing row. */
export function listingCardStyle(): CSSProperties {
  return {
    ...retroTableBorder,
    marginBottom: 14,
    padding: 8,
    backgroundColor: "#000033",
  };
}

export const retroTagStyle: CSSProperties = {
  display: "inline-block",
  margin: "2px",
  padding: "2px 6px",
  background: "#222",
  color: "#ff0",
  border: "1px solid #f0f",
  fontSize: "11px",
  fontFamily: "monospace",
};

export const retroBtnStyle: CSSProperties = {
  fontFamily: retroFontFamily,
  fontSize: "12px",
  fontWeight: "bold",
  color: "#000080",
  background: "#ff0",
  border: "3px outset #fff",
  padding: "4px 10px",
  cursor: "pointer",
};

export const retroCtaBtnStyle: CSSProperties = {
  ...retroLinkStyle,
  fontSize: "20px",
  background: "#ff0",
  color: "#000080",
  padding: "6px 12px",
  border: "3px outset #fff",
  display: "inline-block",
  textDecoration: "none",
};

export const retroHrDashed: CSSProperties = {
  border: "none",
  borderTop: "4px dashed #ff0",
  margin: "16px 0",
};

export const retroHeadingStyle: CSSProperties = {
  color: "#ff00ff",
  textShadow: "3px 3px #00ffff",
};

export const retroInputStyle: CSSProperties = {
  fontFamily: retroFontFamily,
  fontSize: "14px",
  padding: "4px 8px",
  border: "2px inset #ccc",
  backgroundColor: "#fff",
  color: "#000",
};

export const retroSelectStyle: CSSProperties = {
  ...retroInputStyle,
};
