import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { resolveAdminSession } from "@/lib/auth/require-user";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveAdminSession(session);

  return NextResponse.json({
    userId: resolved.userId,
    username: resolved.username,
    isAdmin: resolved.isAdmin,
  });
}
