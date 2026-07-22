import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/stock
 * Returns live-ish stock levels for every product. Each call randomizes stock
 * +/- 1 around the catalog baseline so cypress tests can assert that the
 * UI updates on a polling interval (dynamic data chapter).
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
  const stock = CATALOG.map((p) => {
    // Wiggle stock by ±1 around the baseline; never go below 0.
    const wiggle = Math.floor(Math.random() * 3) - 1;
    const value = Math.max(0, p.stock + wiggle);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      stock: value,
      inStock: value > 0,
      updatedAt: now,
    };
  });

  return NextResponse.json({ stock, serverTime: now });
}
