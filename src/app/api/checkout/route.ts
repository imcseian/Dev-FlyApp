import { NextResponse } from "next/server";
import type { CartItem, Order } from "@/lib/types";
import { ordersStore, usersStore } from "@/lib/store";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 * Body: { items, userEmail, paymentMethod }
 * Returns { order } on success.
 *
 * Deliberately fails 1 in 8 attempts so cypress tests can practice
 * retries and error-state assertions.
 */
export async function POST(req: Request) {
  let body: {
    items?: CartItem[];
    userEmail?: string;
    paymentMethod?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = body.items ?? [];
  if (items.length === 0) {
    return NextResponse.json(
      { error: "Cannot checkout an empty cart" },
      { status: 400 }
    );
  }

  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  // Simulate payment processing latency.
  await new Promise((r) => setTimeout(r, 700));

  // Randomly fail 1 in 8 checkouts so cypress tests can practice retries.
  if (Math.random() < 0.125) {
    return NextResponse.json(
      { error: "Payment gateway timeout. Please retry." },
      { status: 502 }
    );
  }

  const order: Order = {
    id: `ord_${Math.random().toString(36).slice(2, 12)}`,
    userEmail: body.userEmail ?? "guest@cyram.dev",
    items,
    total: Math.round(total * 100) / 100,
    status: "paid",
    createdAt: new Date().toISOString(),
  };
  ordersStore.unshift(order);

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userEmail = url.searchParams.get("userEmail");
  const orders = userEmail
    ? ordersStore.filter((o) => o.userEmail === userEmail)
    : ordersStore;
  return NextResponse.json({ orders });
}

// Re-export usersStore mutation helper for /api/auth/login to share state.
// (login route imports this directly to avoid a circular file dependency.)
export function upsertUser(user: User) {
  usersStore.set(user.email, user);
}
