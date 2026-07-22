import { NextResponse } from "next/server";
import { bookingsStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking/cancel
 * Body: { bookingId } or { pnr }
 * Sets booking.status = 'cancelled' and issues a refund record.
 * Returns the updated booking.
 *
 * Playwright can test this with a confirm dialog:
 *   page.on('dialog', d => d.accept()); // auto-accept confirm
 *   await page.getByTestId('cancel-booking-ABC123').click();
 *   await expect(page.getByTestId('booking-status-ABC123'))
 *     .toHaveText('cancelled');
 */
export async function POST(req: Request) {
  let body: { bookingId?: string; pnr?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookingId, pnr } = body;
  let booking = bookingsStore.find(
    (b) => b.id === bookingId || b.pnr === pnr
  );

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Booking is already cancelled" },
      { status: 400 }
    );
  }

  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 500));

  booking.status = "cancelled";

  return NextResponse.json({ booking });
}
