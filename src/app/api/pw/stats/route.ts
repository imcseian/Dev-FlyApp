import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/pw/stats
 * Returns aggregate stats. Useful for testing `cy.intercept()` with a single
 * object response (vs. arrays).
 *
 * Query params: fail=true, delay=<ms>
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = url.searchParams.get("fail") === "true";
  const delayParam = url.searchParams.get("delay");
  if (delayParam) {
    const ms = Math.min(parseInt(delayParam, 10) || 0, 5000);
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }
  if (fail) {
    return NextResponse.json(
      { error: "Stats unavailable", code: "STATS_FETCH_FAILED" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    data: {
      users: 1248,
      posts: 3921,
      views: 89421,
      conversion: 0.034,
      updatedAt: Date.now(),
    },
  });
}
