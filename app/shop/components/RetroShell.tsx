import Link from "next/link";
import styles from "@/app/retro/retro.module.css";
import { RetroBackgroundAudio } from "@/app/retro/RetroBackgroundAudio";
import { ShopAuthBar } from "@/app/shop/components/ShopAuthBar";
import {
  retroHeadingStyle,
  retroHrDashed,
  retroLinkStyle,
  retroPageStyle,
  retroTableBorder,
} from "@/lib/retro-theme";

type RetroShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showAudio?: boolean;
};

export function RetroShell({
  title,
  subtitle,
  children,
  showAudio = true,
}: RetroShellProps) {
  return (
    <div style={retroPageStyle}>
      {showAudio ? <RetroBackgroundAudio /> : null}
      <center>
        <h1 style={retroHeadingStyle}>
          <span className={styles.blink}>{title}</span>
        </h1>
        {subtitle ? (
          <div className={styles.marqueeWrap}>
            <div className={styles.marqueeTrack}>{subtitle}</div>
          </div>
        ) : null}
      </center>

      <p style={{ textAlign: "center" }}>
        <Link href="/shop" style={retroLinkStyle}>
          Shop
        </Link>
        {" | "}
        <Link href="/shop/cart" style={retroLinkStyle}>
          Cart
        </Link>
        {" | "}
        <Link href="/retro" style={retroLinkStyle}>
          Home
        </Link>
      </p>

      <ShopAuthBar />

      <hr style={retroHrDashed} />

      <table width="100%" cellPadding={8} style={retroTableBorder}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: "#000044" }}>{children}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
