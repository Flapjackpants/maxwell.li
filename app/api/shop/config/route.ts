import { NextResponse } from "next/server";
import { getDeliveryFee, getPickupLocation } from "@/lib/shop/constants";

export async function GET() {
  return NextResponse.json({
    pickupLocation: getPickupLocation(),
    deliveryFee: getDeliveryFee(),
  });
}
