import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/newsletter
 * Body: { email }
 * Always returns success unless email is missing/invalid.
 * Used by the Footer newsletter form — playwright can test submission, success
 * toast, and validation error states.
 */
export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  // Artificial delay so playwright can assert loading states.
  await new Promise((r) => setTimeout(r, 400));

  return NextResponse.json({
    ok: true,
    message: `Subscribed ${email}. Welcome aboard!`,
  });
}
