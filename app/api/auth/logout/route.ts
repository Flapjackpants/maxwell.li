import { NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";
import { clearSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.redirect(appUrl("/shop"));
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
