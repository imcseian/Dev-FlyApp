import { NextResponse } from "next/server";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Reads the `fwr_auth` cookie (if any) and returns the user object.
 * Returns { user: null } when unauthenticated — never 401 — so client
 * code can use a simple check.
 *
 * NOTE: Next.js's `res.cookies.set()` URL-encodes the value, so a token
 * ending in `==` becomes `...%3D%3D` on the wire. We must URL-decode before
 * base64-parsing.
 */
export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("fwr_auth="));

  if (!match) {
    return NextResponse.json({ user: null });
  }

  // Value is everything after the first `=`.
  const rawValue = match.slice("fwr_auth=".length);
  // URL-decode (e.g. %3D -> =) then base64-decode.
  const token = decodeURIComponent(rawValue);

  try {
    const user = JSON.parse(
      Buffer.from(token, "base64").toString("utf8")
    ) as User;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
