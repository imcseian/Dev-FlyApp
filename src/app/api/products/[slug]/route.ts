import { NextResponse } from "next/server";
import { CATALOG } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/[slug]
 * Returns a single product by slug. The slug is taken from the URL path
 * segment (the [slug] folder). A `slug` query param is also accepted for
 * convenience.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const url = new URL(req.url);
  const { slug: pathSlug } = await params;
  const querySlug = url.searchParams.get("slug");
  const slug = querySlug || pathSlug;

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 }
    );
  }

  const product = CATALOG.find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
