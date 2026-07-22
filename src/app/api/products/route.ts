import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Query params (all optional):
 *   - category: filter by category
 *   - q:        full-text search across name, description, tags
 *   - sort:     "price-asc" | "price-desc" | "rating" | "name"
 *   - minPrice, maxPrice: number
 *   - delay:    artificial latency in ms (cypress auto-waiting tests)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q")?.toLowerCase().trim();
  const sort = url.searchParams.get("sort");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const delayParam = url.searchParams.get("delay");

  // Deliberate artificial delay so cypress tests can practice auto-waiting
  // and network-idle assertions.
  if (delayParam) {
    const ms = Math.min(parseInt(delayParam, 10) || 0, 5000);
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }

  let result = [...CATALOG];

  if (category && category !== "All") {
    result = result.filter((p) => p.category === (category as Category));
  }
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!Number.isNaN(min)) result = result.filter((p) => p.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(max)) result = result.filter((p) => p.price <= max);
  }

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return NextResponse.json({
    count: result.length,
    products: result,
  });
}
