import { NextResponse } from "next/server";
import type { User } from "@/lib/types";
import { usersStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Mock auth: any non-empty email + password >= 4 chars succeeds.
 * Special: any email ending in "@admin.flyram.dev" becomes admin role.
 *
 * On success, sets a cookie `fwr_auth` (NOT httpOnly on purpose — playwright
 * storageState exercises both cookies and localStorage) containing a base64
 * JSON token. The client also mirrors the user object into localStorage
 * `fwr_user` for client-side hydration.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  }

  // Reuse or create user
  let user = usersStore.get(email);
  if (!user) {
    const isAdmin = email.endsWith("@admin.flyram.dev");
    const namePart = email.split("@")[0];
    user = {
      id: `u_${Math.random().toString(36).slice(2, 10)}`,
      email,
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      role: isAdmin ? "admin" : "user",
      createdAt: new Date().toISOString(),
      // Start new users with 500 welcome miles.
      miles: 500,
    };
    usersStore.set(email, user);
  }

  // Token is intentionally a transparent base64 JSON for playground clarity.
  const token = Buffer.from(JSON.stringify(user)).toString("base64");
  const res = NextResponse.json({ user });
  res.cookies.set("fwr_auth", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    // httpOnly: false  — deliberately off so storageState captures it cleanly
  });
  return res;
}
