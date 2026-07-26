import { NextResponse } from "next/server";
import { bookingsStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking/cancel
 * Body: { bookingId } or { pnr }
 *
 * Sets booking.status = 'cancelled' AND records a refund record with
 * amount, processing time, and a refund reference number.
 *
 * Returns the updated booking with refund info on the `refund` field.
 *
 * Playwright test:
 *   page.on('dialog', d => d.accept());
 *   await page.getByTestId('booking-cancel-ABC123').click();
 *   await expect(page.getByTestId('booking-status-ABC123'))
 *     .toHaveText('cancelled');
 *   await expect(page.getByTestId('booking-refund-ABC123')).toBeVisible();
 */
export async function POST(req: Request) {
  let body: { bookingId?: string; pnr?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookingId, pnr, reason } = body;
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

  // Generate refund reference (6-char alphanum)
  const refundChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let refundRef = "RFD-";
  for (let i = 0; i < 6; i++) {
    refundRef += refundChars[Math.floor(Math.random() * refundChars.length)];
  }

  // Refund amount = full total (in real life, depends on fare class + timing)
  const refundAmount = booking.total + (booking.addonTotal ?? 0);

  // Update booking
  booking.status = "cancelled";
  booking.cancelledAt = new Date().toISOString();
  booking.cancelReason = reason || "Customer cancelled";
  booking.refund = {
    reference: refundRef,
    amount: refundAmount,
    processingTime: "5-7 business days",
    status: "processing",
    requestedAt: new Date().toISOString(),
    method: "Original payment method",
  };

  return NextResponse.json({ booking });
}
