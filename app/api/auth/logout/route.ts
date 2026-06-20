import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set(clearSessionCookieOptions());
  return NextResponse.redirect(new URL("/shop", request.url));
}
