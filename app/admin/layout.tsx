import Link from "next/link";
import { RetroShell } from "@/app/shop/components/RetroShell";
import { retroLinkStyle } from "@/lib/retro-theme";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RetroShell title="~*~ ADMIN ZONE ~*~" subtitle="Staff only!!!" showAudio={false}>
      <p style={{ textAlign: "center" }}>
        <Link href="/admin/orders" style={retroLinkStyle}>
          Orders
        </Link>
        {" | "}
        <Link href="/admin/listings" style={retroLinkStyle}>
          Listings
        </Link>
        {" | "}
        <form action="/api/auth/logout" method="POST" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              color: "#00ff00",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Logout
          </button>
        </form>
      </p>
      <hr style={{ borderTop: "2px dashed #ff0", margin: "12px 0" }} />
      {children}
    </RetroShell>
  );
}
