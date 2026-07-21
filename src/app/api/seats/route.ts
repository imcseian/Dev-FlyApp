import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/seats
 * Returns live-ish seat availability for every flight. Each call randomizes
 * seats-left +/- 1 around the catalog baseline so playwright tests can assert
 * that the UI updates on a polling interval (dynamic data chapter).
 *
 * Optional `?delay=<ms>` param adds artificial latency.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const delayParam = url.searchParams.get("delay");
  if (delayParam) {
    const ms = Math.min(parseInt(delayParam, 10) || 0, 3000);
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }

  const now = Date.now();
  const seats = CATALOG.map((f) => {
    // Wiggle seats by ±1 around baseline; never go below 0.
    const wiggle = Math.floor(Math.random() * 3) - 1;
    const value = Math.max(0, f.seatsLeft + wiggle);
    return {
      id: f.id,
      flightNumber: f.flightNumber,
      airline: f.airline.name,
      route: `${f.origin.code}-${f.destination.code}`,
      seatsLeft: value,
      available: value > 0,
      updatedAt: now,
    };
  });

  return NextResponse.json({ seats, serverTime: now });
}
