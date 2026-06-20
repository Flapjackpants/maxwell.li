import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(
      new URL("/shop?error=admin_required", request.url),
    );
  }

  const session = await verifySessionTokenEdge(token);
  if (!session?.isAdmin) {
    return NextResponse.redirect(
      new URL("/shop?error=admin_required", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
