import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/shop", request.url));
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
