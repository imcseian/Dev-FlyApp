"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckInDialog } from "./check-in-dialog";
import { generateInvoicePDF, generateBoardingPassPDF } from "@/lib/pdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plane,
  ArrowRight,
  Search,
  Download,
  FileText,
  Ticket,
  XCircle,
  RefreshCw,
  ExternalLink,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { Booking } from "@/lib/types";

export function MyBookingsView() {
  const setView = useAppStore((s) => s.setView);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel state
  const [cancelling, setCancelling] = useState(false);

  // Check-in dialog state (declared up here so hooks order is stable)
  const [checkInTarget, setCheckInTarget] = useState<{
    booking: Booking;
    ticketIndex: number;
  } | null>(null);

  // Refund details dialog state (view-only — refund is automatic on cancel)
  const [refundTarget, setRefundTarget] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) {
      setView("login", undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(
        `/api/bookings?userEmail=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();
      if (cancelled) return;
      setBookings(data.bookings as Booking[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, setView]);

  if (!user) return null;

  const refreshBookings = async () => {
    if (!user) return;
    const res = await fetch(
      `/api/bookings?userEmail=${encodeURIComponent(user.email)}`
    );
    const data = await res.json();
    setBookings(data.bookings as Booking[]);
  };

  // === Cancel booking (uses window.confirm — Playwright page.on('dialog')) ===
  const handleCancel = async (booking: Booking, reason?: string) => {
    // Use window.confirm — Playwright intercepts via page.on('dialog')
    const ok = window.confirm(
      `Cancel booking ${booking.pnr}? This action cannot be undone. ` +
      `A refund of $${(booking.total + (booking.addonTotal ?? 0)).toFixed(2)} will be processed in 5-7 business days.`
    );
    if (!ok) return;

    setCancelling(true);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Cancel failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Booking cancelled",
        description: `PNR ${booking.pnr} — refund of $${data.booking.refund.amount.toFixed(2)} processing. Reference: ${data.booking.refund.reference}`,
      });
      await refreshBookings();
    } finally {
      setCancelling(false);
    }
  };

  // === View refund details (after cancellation) ===
  const handleRefund = (booking: Booking) => {
    setRefundTarget(booking);
  };

  // === Download invoice as PDF (Playwright waitForEvent('download')) ===
  const downloadInvoice = (booking: Booking) => {
    generateInvoicePDF(booking);
    toast({ title: "Invoice downloaded", description: `invoice-${booking.pnr}.pdf` });
  };

  // === Download boarding pass as PDF (after check-in) ===
  const downloadBoardingPass = (booking: Booking, ticketIdx: number) => {
    const ticket = booking.items[ticketIdx];
    if (!ticket) return;
    generateBoardingPassPDF(booking, ticket);
    toast({ title: "Boarding pass downloaded", description: `boarding-pass-${booking.pnr}.pdf` });
  };

  // === Online check-in — opens multi-step dialog (seat → addons → confirm → PDF) ===
  const openCheckIn = (booking: Booking, ticketIdx: number) => {
    setCheckInTarget({ booking, ticketIndex: ticketIdx });
  };

  // === View flight status (opens new tab — Playwright waitForEvent('popup')) ===
  const viewFlightStatus = (booking: Booking) => {
    const firstFlight = booking.items[0];
    if (!firstFlight) return;
    const html = generateFlightStatusHTML(booking);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "width=700,height=600");
    toast({ title: "Flight status opened in new tab" });
  };

  return (
    <div className="space-y-6" data-testid="my-bookings-view">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="my-bookings-title"
          >
            My bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}. You have {bookings.length} booking
            {bookings.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Button onClick={() => setView("search", undefined)} data-testid="my-bookings-search">
          <Plane className="h-4 w-4 mr-2" />
          Book a new flight
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card data-testid="my-bookings-empty">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bookings yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Your booked flights will appear here with PNR, status, ticket details, and actions.
            </p>
            <Button onClick={() => setView("search", undefined)} data-testid="my-bookings-empty-search">
              Search flights
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" data-testid="my-bookings-list">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card data-testid={`booking-card-${b.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <span
                        className="font-mono text-sky-600 dark:text-sky-400"
                        data-testid={`booking-pnr-${b.id}`}
                      >
                        {b.pnr}
                      </span>
                      <Badge
                        variant={
                          b.status === "confirmed"
                            ? "default"
                            : b.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                        data-testid={`booking-status-${b.id}`}
                      >
                        {b.status.replace("_", " ")}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewFlightStatus(b)}
                        data-testid={`booking-status-link-${b.id}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Flight status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(b)}
                        data-testid={`booking-invoice-${b.id}`}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {b.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 border border-border rounded-lg p-3"
                        data-testid={`booking-ticket-${b.id}-${i}`}
                      >
                        <div className="flex items-center gap-3">
                          <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                          <div>
                            <div className="font-medium">
                              {item.flightNumber} · {item.origin} → {item.destination}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.departureTime).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {item.passengerName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="capitalize">{item.cabinClass}</span>
                              {item.seat ? ` · Seat ${item.seat}` : " · No seat"}
                            </div>
                          </div>
                          {b.status === "confirmed" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCheckIn(b, i)}
                                data-testid={`booking-checkin-${b.id}-${i}`}
                                className="h-8"
                              >
                                <Ticket className="h-3.5 w-3.5 mr-1" />
                                Check in
                              </Button>
                            </div>
                          )}
                          {b.status === "checked_in" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadBoardingPass(b, i)}
                                data-testid={`booking-boarding-pass-${b.id}-${i}`}
                                className="h-8"
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Boarding pass
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">
                      {b.items.length} ticket{b.items.length === 1 ? "" : "s"} ·
                      Booked {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-lg"
                        data-testid={`booking-total-${b.id}`}
                      >
                        ${b.total.toFixed(2)}
                      </span>
                      {b.status === "confirmed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(b)}
                            disabled={cancelling}
                            data-testid={`booking-cancel-${b.id}`}
                            className="text-destructive"
                          >
                            {cancelling ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                            )}
                            Cancel booking
                          </Button>
                        </>
                      )}
                      {b.status === "checked_in" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(b)}
                            disabled={cancelling}
                            data-testid={`booking-cancel-${b.id}`}
                            className="text-destructive"
                          >
                            {cancelling ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                            )}
                            Cancel &amp; refund
                          </Button>
                        </>
                      )}
                      {b.status === "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRefund(b)}
                          data-testid={`booking-refund-${b.id}`}
                          className="text-amber-600"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          View refund
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* === Refund Details Dialog (view-only, after cancellation) === */}
      <Dialog
        open={refundTarget !== null}
        onOpenChange={(open) => !open && setRefundTarget(null)}
      >
        <DialogContent data-testid="refund-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-600" />
              Refund details — {refundTarget?.pnr}
            </DialogTitle>
          </DialogHeader>
          {refundTarget?.refund ? (
            <div className="space-y-3" data-testid="refund-details">
              <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  variant="outline"
                  className="bg-amber-500/15 text-amber-700 dark:text-amber-400 capitalize"
                  data-testid="refund-status"
                >
                  {refundTarget.refund.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Reference</div>
                  <div
                    className="font-mono font-bold"
                    data-testid="refund-reference"
                  >
                    {refundTarget.refund.reference}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div
                    className="font-bold text-lg"
                    data-testid="refund-amount"
                  >
                    ${refundTarget.refund.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Method</div>
                  <div data-testid="refund-method">
                    {refundTarget.refund.method}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Processing time</div>
                  <div data-testid="refund-processing-time">
                    {refundTarget.refund.processingTime}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Requested at</div>
                  <div data-testid="refund-requested-at">
                    {new Date(refundTarget.refund.requestedAt).toLocaleString()}
                  </div>
                </div>
                {refundTarget.cancelReason && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Reason</div>
                    <div data-testid="refund-reason">
                      {refundTarget.cancelReason}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground"
                data-testid="refund-note"
              >
                Your refund has been initiated and will be credited to your
                original payment method within {refundTarget.refund.processingTime}.
                Keep the reference number for your records.
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No refund information available.
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" data-testid="refund-close">
                Close
              </Button>
            </DialogClose>
            {refundTarget?.refund && (
              <Button
                onClick={() => downloadInvoice(refundTarget)}
                data-testid="refund-download-invoice"
              >
                <Download className="h-4 w-4 mr-2" />
                Download cancelled invoice
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Check-in dialog (multi-step: seat → addons → confirm → PDF) === */}
      {checkInTarget && (
        <CheckInDialog
          booking={checkInTarget.booking}
          ticketIndex={checkInTarget.ticketIndex}
          open={checkInTarget !== null}
          onOpenChange={(open) => !open && setCheckInTarget(null)}
          onCheckInComplete={refreshBookings}
        />
      )}
    </div>
  );
}

// === HTML generator for the flight-status popup (new tab) ===


function generateFlightStatusHTML(booking: Booking): string {
  const firstTicket = booking.items[0];
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flight Status — ${firstTicket?.flightNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    h1 { color: #0ea5e9; }
    .status-card { border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin: 16px 0; }
    .status { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 6px; font-weight: bold; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
    .label { color: #71717a; }
  </style>
</head>
<body>
  <h1>Flight Status</h1>
  <div class="status-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h2 style="margin: 0;">${firstTicket?.flightNumber}</h2>
        <p style="margin: 4px 0 0; color: #71717a;">${firstTicket?.origin} → ${firstTicket?.destination}</p>
      </div>
      <div class="status">On Time</div>
    </div>
    <div class="row"><span class="label">Departure</span><span>${new Date(firstTicket?.departureTime).toLocaleString()}</span></div>
    <div class="row"><span class="label">Arrival</span><span>${new Date(firstTicket?.arrivalTime).toLocaleString()}</span></div>
    <div class="row"><span class="label">Gate</span><span>B22</span></div>
    <div class="row"><span class="label">Terminal</span><span>2</span></div>
    <div class="row"><span class="label">PNR</span><span style="font-family: monospace;">${booking.pnr}</span></div>
  </div>
  <p style="color: #71717a; font-size: 12px;">Fly with Ram · Mock flight status for testing</p>
</body>
</html>`;
}
