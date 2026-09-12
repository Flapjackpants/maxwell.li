import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import {
  getCurrency,
  getDeliveryFeePercent,
} from "@/lib/shop/constants";
import { isStoreOpen, setStoreOpen } from "@/lib/shop/store-settings";

export async function GET() {
  const storeOpen = await isStoreOpen();
  return NextResponse.json({
    currency: getCurrency(),
    deliveryFeePercent: getDeliveryFeePercent(),
    storeOpen,
  });
}

const patchSchema = z.object({
  storeOpen: z.boolean(),
});

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await setStoreOpen(parsed.data.storeOpen);
  return NextResponse.json({ storeOpen: updated });
}
