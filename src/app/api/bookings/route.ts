import { NextResponse } from "next/server";
import { bookingsStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings
 * Returns all bookings. Optional `?userEmail=` filter.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userEmail = url.searchParams.get("userEmail");
  const bookings = userEmail
    ? bookingsStore.filter((b) => b.userEmail === userEmail)
    : bookingsStore;
  return NextResponse.json({ bookings });
}
