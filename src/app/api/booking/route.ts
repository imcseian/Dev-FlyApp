import { NextResponse } from "next/server";
import type { BookingItem, Booking } from "@/lib/types";
import { bookingsStore, usersStore } from "@/lib/store";
import { generatePNR } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking
 * Body: { items: BookingItem[], userEmail, paymentMethod }
 * Returns { booking } on success with a 6-char PNR.
 *
 * Deliberately fails 1 in 8 attempts so playwright tests can practice
 * retries and error-state assertions.
 */
export async function POST(req: Request) {
  let body: {
    items?: BookingItem[];
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
      { error: "Cannot book an empty itinerary" },
      { status: 400 }
    );
  }

  const total = items.reduce((sum, i) => sum + i.price, 0);

  // Simulate payment processing latency.
  await new Promise((r) => setTimeout(r, 700));

  // Randomly fail 1 in 8 bookings so playwright tests can practice retries.
  if (Math.random() < 0.125) {
    return NextResponse.json(
      { error: "Payment gateway timeout. Please retry." },
      { status: 502 }
    );
  }

  const booking: Booking = {
    id: `bkg_${Math.random().toString(36).slice(2, 12)}`,
    userEmail: body.userEmail ?? "guest@flyram.dev",
    items,
    total: Math.round(total * 100) / 100,
    status: "confirmed",
    pnr: generatePNR(),
    createdAt: new Date().toISOString(),
  };
  bookingsStore.unshift(booking);

  // Award frequent flyer miles (1 mile per $1 spent).
  const user = usersStore.get(booking.userEmail);
  if (user) {
    user.miles = (user.miles ?? 0) + Math.round(total);
  }

  return NextResponse.json({ booking }, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userEmail = url.searchParams.get("userEmail");
  const bookings = userEmail
    ? bookingsStore.filter((b) => b.userEmail === userEmail)
    : bookingsStore;
  return NextResponse.json({ bookings });
}
