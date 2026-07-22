import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/search?q=<term>
 * Lightweight suggestion endpoint used by the search box.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.toLowerCase().trim();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = CATALOG.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  )
    .slice(0, 5)
    .map((p) => ({ slug: p.slug, name: p.name, category: p.category }));

  return NextResponse.json({ suggestions });
}
