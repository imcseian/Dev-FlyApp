import { NextResponse } from "next/server";
import { bookingsStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/booking/refund
 * Accepts multipart/form-data with:
 *   - bookingId (string)
 *   - reason (string)
 *   - file (optional File — supporting document)
 *
 * Sets booking.status = 'cancelled' and records the refund request.
 *
 * Playwright file upload test:
 *   await page.getByTestId('refund-file-input')
 *     .setInputFiles('fixtures/refund-proof.pdf');
 *   await page.getByTestId('refund-submit').click();
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  try {
    const form = await req.formData();
    const bookingId = (form.get("bookingId") as string)?.trim();
    const reason = (form.get("reason") as string)?.trim();
    const file = form.get("file");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }
    if (!reason) {
      return NextResponse.json(
        { error: "Please provide a reason for your refund request" },
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
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Simulate processing
    await new Promise((r) => setTimeout(r, 800));

    booking.status = "cancelled";

    const fileMeta = file && file instanceof File
      ? {
          name: file.name,
          size: file.size,
          type: file.type,
        }
      : null;

    return NextResponse.json({
      ok: true,
      booking,
      refund: {
        bookingId,
        reason,
        file: fileMeta,
        refundAmount: booking.total,
        processingTime: "5-7 business days",
        requestedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Refund request failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
