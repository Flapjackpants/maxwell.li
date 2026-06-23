"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { retroBtnStyle, retroLinkStyle } from "@/lib/retro-theme";

type SessionInfo = {
  username: string;
  isAdmin: boolean;
} | null;

export function DiscordLoginButton({
  returnTo,
  label = "[ CONTINUE WITH DISCORD ]",
}: {
  returnTo: string;
  label?: string;
}) {
  const href = `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <a href={href} style={{ ...retroLinkStyle, fontSize: 18 }}>
      {label}
    </a>
  );
}

export function ShopAuthBar() {
  const [session, setSession] = useState<SessionInfo | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SessionInfo | null) =>
        setSession(
          data
            ? { username: data.username, isAdmin: data.isAdmin === true }
            : null,
        ),
      )
      .catch(() => setSession(null));
  }, []);

  if (session === undefined) {
    return (
      <p style={{ textAlign: "center", fontSize: 13, color: "#aaa" }}>
        Checking login...
      </p>
    );
  }

  if (!session) {
    return (
      <p style={{ textAlign: "center" }}>
        <DiscordLoginButton returnTo="/shop" label="[ LOG IN WITH DISCORD ]" />
      </p>
    );
  }

  return (
    <p style={{ textAlign: "center" }}>
      Logged in as <b style={{ color: "#0ff" }}>{session.username}</b>
      {session.isAdmin === true ? (
        <>
          {" | "}
          <Link href="/admin/orders" style={retroLinkStyle}>
            Admin
          </Link>
        </>
      ) : null}
      {" | "}
      <form action="/api/auth/logout" method="POST" style={{ display: "inline" }}>
        <button type="submit" style={{ ...retroBtnStyle, fontSize: 11 }}>
          [ LOGOUT ]
        </button>
      </form>
    </p>
  );
}

export function AdminLoginPrompt({ returnTo }: { returnTo: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        background: "#440044",
        border: "3px ridge #ff0",
        padding: 12,
        marginBottom: 12,
      }}
    >
      <p style={{ color: "#ffccff", fontWeight: "bold" }}>
        Admin area requires Discord login!
      </p>
      <p style={{ fontSize: 13 }}>
        Log in with the Discord account set as{" "}
        <code style={{ color: "#0ff" }}>ADMIN_DISCORD_ID</code> in your env.
      </p>
      <DiscordLoginButton returnTo={returnTo} />
    </div>
  );
}
