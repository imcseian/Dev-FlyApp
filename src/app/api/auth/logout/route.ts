import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 * Clears the `fwr_auth` cookie.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fwr_auth", "", { path: "/", maxAge: 0 });
  return res;
}
