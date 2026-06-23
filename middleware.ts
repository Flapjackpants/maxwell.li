import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appUrl } from "@/lib/app-url";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/auth/session";

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
  if (!session?.isAdmin) {
    return NextResponse.redirect(
      appUrl(`/shop?error=admin_required&returnTo=${returnTo}`),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
