import { NextResponse } from "next/server";
import type { Comment } from "@/lib/types";
import { commentsStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET  /api/comments?flightId=<route>    -> { comments: Comment[] }
 * POST /api/comments                     -> { comment: Comment }
 *   Body: { flightId, author, body, rating }
 *
 * IMPORTANT — XSS LAB: the body is stored raw and the client renders it via
 * `dangerouslySetInnerHTML` on the Flight detail view. This is a *deliberate*
 * vulnerability for the playwright security/XSS chapter.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flightId = url.searchParams.get("flightId");
  if (!flightId) {
    return NextResponse.json({ error: "Missing flightId" }, { status: 400 });
  }
  const comments = commentsStore
    .filter((c) => c.flightId === flightId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  let body: {
    flightId?: string;
    author?: string;
    body?: string;
    rating?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const flightId = (body.flightId ?? "").trim();
  const author = (body.author ?? "").trim() || "Anonymous";
  const text = (body.body ?? "").trim();
  const rating = Math.max(1, Math.min(5, Number(body.rating ?? 5) || 5));

  if (!flightId) {
    return NextResponse.json({ error: "Missing flightId" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json(
      { error: "Review body cannot be empty" },
      { status: 400 }
    );
  }
  if (text.length > 2000) {
    return NextResponse.json(
      { error: "Review too long (max 2000 chars)" },
      { status: 400 }
    );
  }

  const comment: Comment = {
    id: `c_${Math.random().toString(36).slice(2, 10)}`,
    flightId,
    author,
    // Stored RAW — XSS vuln on the client (deliberate).
    body: text,
    rating,
    createdAt: new Date().toISOString(),
  };
  commentsStore.unshift(comment);

  return NextResponse.json({ comment }, { status: 201 });
}
