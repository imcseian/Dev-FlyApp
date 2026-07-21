import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";
import type { CabinClass } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/flights
 * Query params (all optional):
 *   - origin:    airport code (JFK, LAX, etc.)
 *   - destination: airport code
 *   - maxStops:  filter by max stops (0 = nonstop only)
 *   - airline:   airline code (SKY, FWR, etc.)
 *   - cabinClass: economy | premium | business | first
 *   - minPrice, maxPrice: number
 *   - sort:      "price-asc" | "price-desc" | "duration-asc" | "departure-asc"
 *   - q:         full-text search across airline name, route, aircraft
 *   - delay:     artificial latency in ms (Playwright auto-waiting tests)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin")?.toUpperCase();
  const destination = url.searchParams.get("destination")?.toUpperCase();
  const maxStops = url.searchParams.get("maxStops");
  const airline = url.searchParams.get("airline")?.toUpperCase();
  const cabinClass = url.searchParams.get("cabinClass") as CabinClass | null;
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const sort = url.searchParams.get("sort");
  const q = url.searchParams.get("q")?.toLowerCase().trim();
  const delayParam = url.searchParams.get("delay");

  if (delayParam) {
    const ms = Math.min(parseInt(delayParam, 10) || 0, 5000);
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }

  let result = [...CATALOG];

  if (origin) result = result.filter((f) => f.origin.code === origin);
  if (destination)
    result = result.filter((f) => f.destination.code === destination);
  if (maxStops !== null && maxStops !== undefined) {
    const max = parseInt(maxStops, 10);
    if (!Number.isNaN(max)) result = result.filter((f) => f.stops <= max);
  }
  if (airline) result = result.filter((f) => f.airline.code === airline);
  if (cabinClass)
    result = result.filter((f) => f.cabinClasses.includes(cabinClass));
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!Number.isNaN(min)) result = result.filter((f) => f.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(max)) result = result.filter((f) => f.price <= max);
  }
  if (q) {
    result = result.filter(
      (f) =>
        f.airline.name.toLowerCase().includes(q) ||
        f.flightNumber.toLowerCase().includes(q) ||
        f.origin.city.toLowerCase().includes(q) ||
        f.destination.city.toLowerCase().includes(q) ||
        f.aircraft.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "duration-asc":
      result.sort((a, b) => a.durationMins - b.durationMins);
      break;
    case "departure-asc":
      result.sort(
        (a, b) =>
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime()
      );
      break;
  }

  return NextResponse.json({
    count: result.length,
    flights: result,
  });
}
