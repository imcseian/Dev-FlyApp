import { jsPDF } from "jspdf";
import type { Booking, BookingItem } from "./types";
import { findAddon } from "./addons";

/**
 * Client-side PDF generators using jsPDF.
 *
 * Both invoice and boarding pass are generated entirely in the browser — no
 * server round-trip needed. Playwright tests can capture the download:
 *
 *   const [download] = await Promise.all([
 *     page.waitForEvent('download'),
 *     page.getByTestId('booking-invoice-ABC123').click(),
 *   ]);
 *   expect(download.suggestedFilename()).toBe('invoice-ABC123.pdf');
 */

const SKY = [14, 165, 233] as [number, number, number]; // #0ea5e9
const DARK = [24, 24, 27] as [number, number, number]; // #18181b
const MUTED = [113, 113, 122] as [number, number, number]; // #71717a
const LIGHT = [244, 244, 245] as [number, number, number]; // #f4f4f5

export function generateInvoicePDF(booking: Booking): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 0;

  // === Header band ===
  doc.setFillColor(...SKY);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Fly with Ram", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Tax Invoice", margin, 58);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(booking.pnr, pageWidth - margin, 40, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    new Date(booking.createdAt).toLocaleDateString(),
    pageWidth - margin,
    58,
    { align: "right" }
  );

  y = 110;
  doc.setTextColor(...DARK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Booking details", margin, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const details: [string, string][] = [
    ["PNR", booking.pnr],
    ["Booking ID", booking.id],
    ["Status", booking.status.replace("_", " ")],
    ["Booked on", new Date(booking.createdAt).toLocaleString()],
    ["Customer", booking.userEmail],
  ];
  for (const [label, value] of details) {
    doc.setTextColor(...MUTED);
    doc.text(label, margin, y);
    doc.setTextColor(...DARK);
    doc.text(String(value), margin + 120, y);
    y += 16;
  }

  // === Tickets table ===
  y += 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Tickets", margin, y);
  y += 10;

  // Table header
  doc.setFillColor(...LIGHT);
  doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  const colX = [margin + 8, margin + 60, margin + 180, margin + 300, margin + 380, margin + 440];
  doc.text("#", colX[0], y + 15);
  doc.text("Flight", colX[1], y + 15);
  doc.text("Route", colX[2], y + 15);
  doc.text("Passenger", colX[3], y + 15);
  doc.text("Seat", colX[4], y + 15);
  doc.text("Price", pageWidth - margin - 8, y + 15, { align: "right" });
  y += 22;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  booking.items.forEach((item, i) => {
    if (y > 720) {
      doc.addPage();
      y = 40;
    }
    doc.setTextColor(...DARK);
    doc.text(String(i + 1), colX[0], y + 15);
    doc.text(item.flightNumber, colX[1], y + 15);
    doc.text(`${item.origin} → ${item.destination}`, colX[2], y + 15);
    doc.text(item.passengerName.slice(0, 18), colX[3], y + 15);
    doc.text(item.seat || "—", colX[4], y + 15);
    doc.text(`$${item.price.toFixed(2)}`, pageWidth - margin - 8, y + 15, {
      align: "right",
    });
    y += 20;
    doc.setDrawColor(228, 228, 231);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  });

  // === Addons section (if any) ===
  const allAddons = booking.items.flatMap((i) => i.addons ?? []);
  if (allAddons.length > 0) {
    y += 16;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Addons", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const addonCounts = new Map<string, number>();
    for (const id of allAddons) {
      addonCounts.set(id, (addonCounts.get(id) ?? 0) + 1);
    }
    for (const [id, count] of addonCounts) {
      const addon = findAddon(id);
      if (!addon) continue;
      doc.text(`${addon.icon} ${addon.name}`, margin + 8, y + 12);
      doc.text(`x${count}`, margin + 250, y + 12);
      doc.text(
        `$${(addon.price * count).toFixed(2)}`,
        pageWidth - margin - 8,
        y + 12,
        { align: "right" }
      );
      y += 18;
    }
  }

  // === Totals ===
  y += 20;
  const addonTotal = booking.addonTotal ?? 0;
  const subtotal = booking.total;
  const taxes = Math.round(subtotal * 0.12 * 100) / 100;
  const grandTotal = Math.round((subtotal + taxes + addonTotal) * 100) / 100;

  doc.setDrawColor(228, 228, 231);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Subtotal", margin, y);
  doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 8, y, {
    align: "right",
  });
  y += 14;
  doc.text("Taxes & fees (12%)", margin, y);
  doc.text(`$${taxes.toFixed(2)}`, pageWidth - margin - 8, y, {
    align: "right",
  });
  if (addonTotal > 0) {
    y += 14;
    doc.text("Addons", margin, y);
    doc.text(`$${addonTotal.toFixed(2)}`, pageWidth - margin - 8, y, {
      align: "right",
    });
  }
  y += 24;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Total paid", margin, y);
  doc.text(`$${grandTotal.toFixed(2)}`, pageWidth - margin - 8, y, {
    align: "right",
  });

  // === Footer ===
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    "Fly with Ram · Playwright Mastery Academy · This is a mock invoice for testing purposes.",
    margin,
    footerY
  );
  doc.text(
    `Generated ${new Date().toLocaleString()}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  doc.save(`invoice-${booking.pnr}.pdf`);
}

export function generateBoardingPassPDF(
  booking: Booking,
  ticket: BookingItem
): void {
  // Compact boarding pass — 6" x 4" landscape
  const doc = new jsPDF({
    unit: "pt",
    format: [432, 288], // 6" x 4" at 72 dpi
    orientation: "landscape",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // === Outer border ===
  doc.setDrawColor(...SKY);
  doc.setLineWidth(2);
  doc.rect(4, 4, pageWidth - 8, pageHeight - 8);
  doc.setLineWidth(0.5);

  // === Header band ===
  doc.setFillColor(...SKY);
  doc.rect(margin, margin, pageWidth - margin * 2, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Fly with Ram", margin + 10, margin + 23);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("BOARDING PASS", pageWidth - margin - 10, margin + 23, {
    align: "right",
  });

  // === PNR + status ===
  let y = margin + 56;
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.text("PNR", margin, y);
  doc.text("STATUS", pageWidth / 2, y);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(booking.pnr, margin, y + 14);
  doc.setFontSize(10);
  doc.text(booking.status.replace("_", " ").toUpperCase(), pageWidth / 2, y + 14);

  // === Route ===
  y += 36;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("FROM", margin, y);
  doc.text("TO", pageWidth - margin, y, { align: "right" });

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(ticket.origin, margin, y + 26);
  doc.text(ticket.destination, pageWidth - margin, y + 26, { align: "right" });

  // Plane icon + times in the middle
  doc.setFontSize(16);
  doc.setTextColor(...SKY);
  doc.text("✈", pageWidth / 2, y + 18, { align: "center" });
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const depTime = new Date(ticket.departureTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const arrTime = new Date(ticket.arrivalTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(depTime, pageWidth / 2 - 30, y + 8, { align: "center" });
  doc.text(arrTime, pageWidth / 2 + 30, y + 8, { align: "center" });
  doc.text(
    `${Math.round(
      (new Date(ticket.arrivalTime).getTime() -
        new Date(ticket.departureTime).getTime()) /
        60000 /
        60
    )}h flight`,
    pageWidth / 2,
    y + 32,
    { align: "center" }
  );

  // === Passenger details grid ===
  y += 50;
  const colW = (pageWidth - margin * 2) / 4;
  const fields: [string, string][] = [
    ["PASSENGER", ticket.passengerName],
    ["FLIGHT", ticket.flightNumber],
    ["SEAT", ticket.seat || "—"],
    ["CABIN", ticket.cabinClass.toUpperCase()],
  ];
  doc.setTextColor(...MUTED);
  doc.setFontSize(7);
  fields.forEach(([label], i) => {
    doc.text(label, margin + i * colW + 4, y);
  });
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  fields.forEach(([, value], i) => {
    doc.text(value, margin + i * colW + 4, y + 16);
  });

  // === Date + gate ===
  y += 32;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("DATE", margin, y);
  doc.text("GATE", margin + colW * 1.5, y);
  doc.text("TERMINAL", margin + colW * 2.5, y);
  doc.text("BOARDING", pageWidth - margin, y, { align: "right" });
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    new Date(ticket.departureTime).toLocaleDateString(),
    margin,
    y + 14
  );
  // Deterministic gate from PNR
  const gate = `B${(booking.pnr.charCodeAt(0) % 30) + 1}`;
  const terminal = `${(booking.pnr.charCodeAt(1) % 3) + 1}`;
  const boardingTime = new Date(
    new Date(ticket.departureTime).getTime() - 30 * 60000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  doc.text(gate, margin + colW * 1.5, y + 14);
  doc.text(terminal, margin + colW * 2.5, y + 14);
  doc.text(boardingTime, pageWidth - margin, y + 14, { align: "right" });

  // === Barcode (fake — vertical lines) ===
  y += 28;
  const barcodeY = y;
  const barcodeH = 28;
  const barcodeW = pageWidth - margin * 2;
  doc.setFillColor(...DARK);
  let x = margin;
  // Pseudo-random but deterministic from PNR
  const seed = booking.pnr
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < 80; i++) {
    const bit = (seed + i * 7) % 3;
    const w = bit === 0 ? 1 : bit === 1 ? 2 : 3;
    if ((seed + i) % 2 === 0) {
      doc.rect(x, barcodeY, w, barcodeH, "F");
    }
    x += w + 1;
    if (x > margin + barcodeW) break;
  }

  // Barcode text
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(
    `${booking.pnr} ${ticket.passengerName.toUpperCase().replace(/\s/g, "")}`,
    pageWidth / 2,
    barcodeY + barcodeH + 12,
    { align: "center" }
  );

  doc.save(`boarding-pass-${booking.pnr}.pdf`);
}
