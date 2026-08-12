import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appUrl } from "@/lib/app-url";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/auth/session";

function isAdminSession(session: {
  isAdmin: boolean;
  discordId: string;
}): boolean {
  if (session.isAdmin) return true;
  const adminDiscordId = process.env.ADMIN_DISCORD_ID?.trim();
  return Boolean(adminDiscordId && adminDiscordId === session.discordId);
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const returnTo = encodeURIComponent(pathname);

  if (!token) {
    return NextResponse.redirect(
      appUrl(`/api/auth/discord?returnTo=${returnTo}`),
    );
  }

  const session = await verifySessionTokenEdge(token);
  if (!session || !isAdminSession(session)) {
    return NextResponse.redirect(
      appUrl(`/shop?error=admin_required&returnTo=${returnTo}`),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
