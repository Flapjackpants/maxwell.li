import { NextRequest, NextResponse } from "next/server";
import { getRetroVisitorCount, incrementRetroVisitorCount } from "@/lib/retro-visitors";

export async function POST(request: NextRequest) {
  try {
    if (request.cookies.has("retro_visited")) {
      return NextResponse.json({ count: await getRetroVisitorCount() });
    }

    const count = await incrementRetroVisitorCount();
    const response = NextResponse.json({ count });
    response.cookies.set({
      name: "retro_visited",
      value: "1",
      maxAge: 31536000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Visitor count unavailable" }, { status: 503 });
  }
}
