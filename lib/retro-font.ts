import { Comic_Neue } from "next/font/google";

/** Web-loaded Comic Sans–style face so mobile does not fall back to generic cursive. */
export const retroFont = Comic_Neue({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-retro",
  display: "swap",
});
