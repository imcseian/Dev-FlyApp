import { NextResponse } from "next/server";
import { ordersStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders
 * Returns all orders. Optional `?userEmail=` filter.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userEmail = url.searchParams.get("userEmail");
  const orders = userEmail
    ? ordersStore.filter((o) => o.userEmail === userEmail)
    : ordersStore;
  return NextResponse.json({ orders });
}
