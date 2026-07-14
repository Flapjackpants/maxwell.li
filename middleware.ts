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

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const returnTo = encodeURIComponent(request.nextUrl.pathname);

  if (!token) {
    return NextResponse.redirect(
      appUrl(`/shop?error=admin_required&returnTo=${returnTo}`),
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
  matcher: ["/admin/:path*"],
};
