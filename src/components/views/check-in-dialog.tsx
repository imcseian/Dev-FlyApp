"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plane,
  CheckCircle2,
  Download,
  ArrowRight,
  ArrowLeft,
  Utensils,
  Luggage,
  Headphones,
  Wifi,
} from "lucide-react";
import type { Booking, BookingItem } from "@/lib/types";
import { ADDONS, ADDON_CATEGORIES, findAddon } from "@/lib/addons";
import { useToast } from "@/hooks/use-toast";
import { generateBoardingPassPDF } from "@/lib/pdf";

interface CheckInDialogProps {
  booking: Booking;
  ticketIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInComplete: () => void;
}

type Step = "seat" | "addons" | "confirm" | "done";

export function CheckInDialog({
  booking,
  ticketIndex,
  open,
  onOpenChange,
  onCheckInComplete,
}: CheckInDialogProps) {
  const ticket = booking.items[ticketIndex];
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("seat");
  const [selectedSeat, setSelectedSeat] = useState<string | null>(
    ticket?.seat ?? null
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!ticket) return null;

  // === Seat map (deterministic per flight ID) ===
  const rows = 6;
  const cols = ["A", "B", "C", "D"];
  const seatState = (row: number, col: string) => {
    const hash =
      (ticket.flightId.charCodeAt(0) + row * 7 + col.charCodeAt(0)) % 10;
    if (hash < 3) return "taken";
    if (hash < 5) return "premium";
    return "available";
  };

  const addonTotal = selectedAddons
    .map((id) => findAddon(id)?.price ?? 0)
    .reduce((s, p) => s + p, 0);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCheckIn = async () => {
    if (!selectedSeat) {
      toast({
        title: "Seat required",
        description: "Please select a seat to check in.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          ticketIndex,
          seat: selectedSeat,
          addons: selectedAddons,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Check-in failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      // Generate and download the boarding pass PDF
      const updatedBooking = data.booking as Booking;
      const updatedTicket = updatedBooking.items[ticketIndex];
      generateBoardingPassPDF(updatedBooking, updatedTicket);
      setStep("done");
      toast({
        title: "Check-in complete!",
        description: `Seat ${selectedSeat} · Boarding pass PDF downloaded.`,
      });
    } catch (err) {
      toast({
        title: "Check-in failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (step === "done") {
      onCheckInComplete();
      // Reset for next open
      setTimeout(() => {
        setStep("seat");
        setSelectedSeat(ticket?.seat ?? null);
        setSelectedAddons([]);
      }, 200);
    }
  };

  const downloadBoardingPassAgain = () => {
    const updatedTicket = { ...ticket, seat: selectedSeat ?? ticket.seat, addons: selectedAddons };
    generateBoardingPassPDF(booking, updatedTicket);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="checkin-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600" />
            Online check-in
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {ticket.flightNumber} · {ticket.origin} → {ticket.destination} ·{" "}
            {ticket.passengerName}
          </p>
        </DialogHeader>

        {/* Step indicator */}
        <div
          className="flex items-center gap-2 text-xs"
          data-testid="checkin-step-indicator"
        >
          {(["seat", "addons", "confirm", "done"] as Step[]).map((s, i) => {
            const stepIdx = ["seat", "addons", "confirm", "done"].indexOf(step);
            const isActive = i === stepIdx;
            const isComplete = i < stepIdx;
            return (
              <div key={s} className="flex items-center">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-sky-600 text-white"
                      : isComplete
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? "✓" : i + 1}
                </div>
                {i < 3 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            );
          })}
          <span className="ml-2 capitalize font-medium">
            {step === "done" ? "complete" : step}
          </span>
        </div>

        {/* === Step 1: Seat selection === */}
        {step === "seat" && (
          <div className="space-y-4" data-testid="checkin-seat-step">
            <div>
              <Label className="text-sm font-medium">
                Step 1 — Select your seat
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Click an available seat to assign it to {ticket.passengerName}.
              </p>
            </div>

            <div
              className="inline-grid gap-2 p-4 rounded-lg border border-border bg-muted/30 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${cols.length + 1}, minmax(0, 1fr))`,
              }}
              data-testid="checkin-seat-grid"
              role="grid"
              aria-label="Seat map"
            >
              <div />
              {cols.map((c) => (
                <div
                  key={c}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {c}
                </div>
              ))}
              {Array.from({ length: rows }).map((_, rowIdx) => {
                const rowNumber = rowIdx + 1;
                return (
                  <div key={`row-${rowNumber}`} className="contents">
                    <div className="text-center text-xs font-medium text-muted-foreground self-center">
                      {rowNumber}
                    </div>
                    {cols.map((col) => {
                      const seatId = `${rowNumber}${col}`;
                      const state = seatState(rowNumber, col);
                      const isSelected = selectedSeat === seatId;
                      const disabled = state === "taken" && !isSelected;
                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedSeat(seatId)}
                          data-testid={`checkin-seat-${seatId}`}
                          data-seat-state={
                            isSelected ? "selected" : state
                          }
                          aria-label={`Seat ${seatId} — ${
                            isSelected ? "selected" : state
                          }`}
                          className={`h-9 w-9 rounded text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-sky-600 text-white"
                              : state === "taken"
                              ? "bg-muted-foreground/40 text-muted-foreground/60 cursor-not-allowed"
                              : state === "premium"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30"
                              : "bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-500/30"
                          }`}
                        >
                          {seatId}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center"
              data-testid="checkin-seat-legend"
            >
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded bg-sky-600" /> Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded bg-sky-500/15" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded bg-amber-500/15" /> Premium
              </span>
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded bg-muted-foreground/40" /> Taken
              </span>
            </div>

            {selectedSeat && (
              <div
                className="text-sm text-center"
                data-testid="checkin-selected-seat"
              >
                <strong className="text-sky-600 dark:text-sky-400">
                  Seat {selectedSeat}
                </strong>{" "}
                selected for {ticket.passengerName}
              </div>
            )}
          </div>
        )}

        {/* === Step 2: Addons === */}
        {step === "addons" && (
          <div className="space-y-4" data-testid="checkin-addons-step">
            <div>
              <Label className="text-sm font-medium">
                Step 2 — Add extras (optional)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Food, baggage, comfort, and digital add-ons for your flight.
              </p>
            </div>

            {ADDON_CATEGORIES.map((cat) => {
              const catAddons = ADDONS.filter((a) => a.category === cat.key);
              const Icon =
                cat.key === "food"
                  ? Utensils
                  : cat.key === "baggage"
                  ? Luggage
                  : cat.key === "comfort"
                  ? Headphones
                  : Wifi;
              return (
                <div key={cat.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catAddons.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          data-testid={`checkin-addon-${addon.id}`}
                          className={`text-left p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? "border-sky-600 bg-sky-500/10"
                              : "border-border hover:border-sky-500/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {addon.icon} {addon.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {addon.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">
                                ${addon.price}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-sky-600 ml-auto mt-1" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {selectedAddons.length > 0 && (
              <div
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                data-testid="checkin-addons-summary"
              >
                <span className="text-muted-foreground">
                  {selectedAddons.length} addon
                  {selectedAddons.length === 1 ? "" : "s"} selected
                </span>
                <span className="font-bold">+${addonTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* === Step 3: Confirm === */}
        {step === "confirm" && (
          <div className="space-y-4" data-testid="checkin-confirm-step">
            <div>
              <Label className="text-sm font-medium">
                Step 3 — Review &amp; confirm
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Please review your check-in details before confirming.
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passenger</span>
                  <span className="font-medium">{ticket.passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flight</span>
                  <span className="font-medium">{ticket.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">
                    {ticket.origin} → {ticket.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departure</span>
                  <span className="font-medium">
                    {new Date(ticket.departureTime).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seat</span>
                  <Badge variant="default" data-testid="checkin-confirm-seat">
                    {selectedSeat}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cabin</span>
                  <span className="font-medium capitalize">
                    {ticket.cabinClass}
                  </span>
                </div>
                {selectedAddons.length > 0 && (
                  <>
                    <Separator />
                    <div className="text-muted-foreground text-xs">
                      Addons:
                    </div>
                    <ul className="space-y-1">
                      {selectedAddons.map((id) => {
                        const addon = findAddon(id);
                        if (!addon) return null;
                        return (
                          <li
                            key={id}
                            className="flex justify-between text-xs"
                          >
                            <span>
                              {addon.icon} {addon.name}
                            </span>
                            <span>${addon.price.toFixed(2)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex justify-between font-medium">
                      <span>Addon total</span>
                      <span>${addonTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
              On confirm, your boarding pass will be generated as a PDF and
              downloaded automatically.
            </p>
          </div>
        )}

        {/* === Step 4: Done === */}
        {step === "done" && (
          <div
            className="space-y-4 text-center py-4"
            data-testid="checkin-done-step"
          >
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Check-in complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seat <strong>{selectedSeat}</strong> confirmed for{" "}
                {ticket.passengerName}. Your boarding pass PDF has been
                downloaded.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={downloadBoardingPassAgain}
              data-testid="checkin-download-again"
            >
              <Download className="h-4 w-4 mr-2" />
              Download boarding pass again
            </Button>
          </div>
        )}

        {/* === Footer with step navigation === */}
        {step !== "done" && (
          <DialogFooter className="gap-2">
            {step === "seat" && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="checkin-cancel"
              >
                Cancel
              </Button>
            )}
            {step !== "seat" && (
              <Button
                variant="outline"
                onClick={() =>
                  setStep(step === "confirm" ? "addons" : "seat")
                }
                data-testid="checkin-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step === "seat" && (
              <Button
                onClick={() => setStep("addons")}
                disabled={!selectedSeat}
                data-testid="checkin-next-seat"
              >
                Continue to addons
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === "addons" && (
              <Button
                onClick={() => setStep("confirm")}
                data-testid="checkin-next-addons"
              >
                Review &amp; confirm
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === "confirm" && (
              <Button
                onClick={handleCheckIn}
                disabled={submitting || !selectedSeat}
                data-testid="checkin-confirm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm check-in &amp; download pass
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}

        {step === "done" && (
          <DialogFooter>
            <Button onClick={handleClose} data-testid="checkin-close">
              Done
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
