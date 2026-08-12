import { NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";
import { clearSessionCookieOptions } from "@/lib/auth/session";

function logoutRedirect(path = "/") {
  const response = NextResponse.redirect(appUrl(path));
  response.cookies.set(clearSessionCookieOptions());
  return response;
}

export async function POST() {
  return logoutRedirect("/shop");
}

export async function GET() {
  return logoutRedirect("/");
}

