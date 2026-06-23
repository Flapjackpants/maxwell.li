import { NextResponse } from "next/server";
import {
  getCurrency,
  getDeliveryFeePercent,
} from "@/lib/shop/constants";

export async function GET() {
  return NextResponse.json({
    currency: getCurrency(),
    deliveryFeePercent: getDeliveryFeePercent(),
  });
}
