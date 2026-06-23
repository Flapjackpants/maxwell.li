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
  titleImage?: string;
  children: React.ReactNode;
  showAudio?: boolean;
};

export function RetroShell({
  title,
  subtitle,
  titleImage,
  children,
  showAudio = true,
}: RetroShellProps) {
  return (
    <div style={retroPageStyle}>
      {showAudio ? <RetroBackgroundAudio /> : null}
      <center>
        {titleImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={titleImage}
            alt={title}
            style={{
              maxWidth: "min(100%, 420px)",
              height: "auto",
              border: "4px ridge gold",
              marginBottom: 8,
            }}
          />
        ) : (
          <h1 style={retroHeadingStyle}>
            <span className={styles.blink}>{title}</span>
          </h1>
        )}
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
