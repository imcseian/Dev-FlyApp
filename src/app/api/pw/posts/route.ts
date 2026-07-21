import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/pw/posts
 * Returns posts for `cy.intercept()` + `cy.fixture()` patterns.
 *
 * Query params: fail=true, delay=<ms>, empty=true
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = url.searchParams.get("fail") === "true";
  const empty = url.searchParams.get("empty") === "true";
  const delayParam = url.searchParams.get("delay");
  if (delayParam) {
    const ms = Math.min(parseInt(delayParam, 10) || 0, 5000);
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }
  if (fail) {
    return NextResponse.json(
      { error: "Failed to fetch posts", code: "POSTS_FETCH_FAILED" },
      { status: 500 }
    );
  }
  if (empty) {
    return NextResponse.json({ data: [], meta: { count: 0 } });
  }

  const posts = [
    {
      id: "post-1",
      title: "Getting started with cy.intercept()",
      body: "The modern way to mock network requests in Playwright.",
      authorId: "u-1",
    },
    {
      id: "post-2",
      title: "Mastering cy.clock() for time-based tests",
      body: "Stop waiting for setTimeout — control time itself.",
      authorId: "u-1",
    },
    {
      id: "post-3",
      title: "Custom commands that don't suck",
      body: "Playwright.Commands.add() patterns that scale.",
      authorId: "u-2",
    },
  ];
  return NextResponse.json({ data: posts, meta: { count: posts.length } });
}
