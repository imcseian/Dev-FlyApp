import { NextResponse } from "next/server";
import { bookingsStore } from "@/lib/store";
import { findAddon } from "@/lib/addons";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking/checkin
 * Body: { bookingId, ticketIndex, seat, addons }
 *
 * Marks the ticket as checked in, stores the seat + addons on the BookingItem,
 * updates the booking status to "checked_in", and returns the updated booking.
 *
 * Playwright test pattern:
 *   await page.getByTestId('checkin-open-ABC123-0').click();
 *   // ... select seat + addons in dialog ...
 *   await page.getByTestId('checkin-confirm').click();
 *   await expect(page.getByTestId('booking-status-ABC123'))
 *     .toHaveText('checked in');
 */
export async function POST(req: Request) {
  let body: {
    bookingId?: string;
    ticketIndex?: number;
    seat?: string;
    addons?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookingId, ticketIndex, seat, addons } = body;
  if (!bookingId) {
    return NextResponse.json(
      { error: "Missing bookingId" },
      { status: 400 }
    );
  }

  const booking = bookingsStore.find((b) => b.id === bookingId);
  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Cannot check in a cancelled booking" },
      { status: 400 }
    );
  }

  if (booking.status === "checked_in") {
    return NextResponse.json(
      { error: "Booking is already checked in" },
      { status: 400 }
    );
  }

  const idx = ticketIndex ?? 0;
  const ticket = booking.items[idx];
  if (!ticket) {
    return NextResponse.json(
      { error: "Ticket not found" },
      { status: 404 }
    );
  }

  if (!seat) {
    return NextResponse.json(
      { error: "Please select a seat" },
      { status: 400 }
    );
  }

  // Simulate processing
  await new Promise((r) => setTimeout(r, 600));

  // Update ticket with seat + addons
  ticket.seat = seat;
  ticket.addons = addons ?? [];

  // Update booking status + addon total
  booking.status = "checked_in";
  booking.checkedInAt = new Date().toISOString();
  booking.addonTotal = (addons ?? [])
    .map((id) => findAddon(id)?.price ?? 0)
    .reduce((sum, p) => sum + p, 0);

  return NextResponse.json({ booking });
}
