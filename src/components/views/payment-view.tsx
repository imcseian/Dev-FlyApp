"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useBookingStore } from "@/stores/use-cart-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Plane,
} from "lucide-react";
import type { Booking } from "@/lib/types";

type Phase = "form" | "processing" | "success" | "error";

export function PaymentView() {
  const setView = useAppStore((s) => s.setView);
  const { selectedFlights, cabinClass, passengers, seats, toBookingItems, totalPrice, reset } =
    useBookingStore();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("form");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const taxesAndFees = Math.round(totalPrice() * 0.12 * 100) / 100;
  const total = Math.round((totalPrice() + taxesAndFees) * 100) / 100;

  if (selectedFlights.length === 0 && phase !== "success") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payment</h1>
        <Card data-testid="payment-empty">
          <CardContent className="p-12 text-center">
            <Plane className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No flights to pay for.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              You need to select at least one flight before paying.
            </p>
            <Button
              onClick={() => setView("search", undefined)}
              data-testid="payment-empty-search"
            >
              Search flights
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("processing");
    setErrorMsg("");

    try {
      const items = toBookingItems();
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          userEmail: email || "guest@flyram.dev",
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("error");
        setErrorMsg(data.error ?? "Payment failed");
        toast({
          title: "Payment failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setBooking(data.booking as Booking);
      setPhase("success");
      reset();
      toast({
        title: "Booking confirmed!",
        description: `PNR ${data.booking.pnr}`,
      });
    } catch (err) {
      setPhase("error");
      setErrorMsg((err as Error).message);
    }
  };

  if (phase === "success" && booking) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto" data-testid="payment-success">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">
              Booking confirmed!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your flights are booked. Save your PNR — you&apos;ll need it to check in.
            </p>

            <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PNR</span>
                <span
                  className="font-mono font-bold text-lg"
                  data-testid="booking-pnr"
                >
                  {booking.pnr}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID</span>
                <span className="font-mono text-sm">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-medium">${booking.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-green-600 capitalize">
                  {booking.status}
                </Badge>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground pt-1">
                {booking.items.length} ticket{booking.items.length === 1 ? "" : "s"}:
              </div>
              <ul className="text-sm space-y-1">
                {booking.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between"
                    data-testid={`booking-ticket-${i}`}
                  >
                    <span>
                      {item.flightNumber} · {item.origin}→{item.destination} ·{" "}
                      {item.passengerName}
                      {item.seat ? ` · Seat ${item.seat}` : ""}
                    </span>
                    <span>${item.price.toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setView("search", undefined)}
                data-testid="success-book-another"
              >
                Book another flight
              </Button>
              <Button
                onClick={() => setView("my-bookings", undefined)}
                data-testid="success-view-bookings"
              >
                View my bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto" data-testid="payment-error">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Payment failed</h1>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <Button
              onClick={() => setPhase("form")}
              data-testid="payment-retry"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const processing = phase === "processing";

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("booking", undefined)}
        data-testid="payment-back"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to booking
      </Button>

      <h1
        className="text-3xl font-bold tracking-tight"
        data-testid="payment-title"
      >
        Payment
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <Card data-testid="payment-contact-card">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="pay-email">Email</Label>
                <Input
                  id="pay-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  data-testid="payment-email"
                  disabled={processing}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pay-name">Full name</Label>
                <Input
                  id="pay-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Tester"
                  data-testid="payment-name"
                  disabled={processing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card data-testid="payment-method-card">
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                disabled={processing}
                data-testid="payment-method"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="pm-card" />
                  <Label htmlFor="pm-card" className="cursor-pointer">
                    Credit / debit card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="miles" id="pm-miles" />
                  <Label htmlFor="pm-miles" className="cursor-pointer">
                    Pay with miles ({user?.miles ?? 0} miles available)
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="space-y-3 pt-2" data-testid="card-fields">
                  <div className="space-y-1">
                    <Label htmlFor="pay-card">Card number</Label>
                    <Input
                      id="pay-card"
                      required
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      data-testid="payment-card"
                      disabled={processing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="pay-expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="pay-expiry"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="12/29"
                        data-testid="payment-expiry"
                        disabled={processing}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pay-cvc">CVC</Label>
                      <Input
                        id="pay-cvc"
                        required
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        inputMode="numeric"
                        data-testid="payment-cvc"
                        disabled={processing}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card data-testid="payment-summary" className="sticky top-20">
            <CardHeader>
              <CardTitle>Booking summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul
                className="space-y-2 max-h-48 overflow-y-auto"
                data-testid="payment-items"
              >
                {selectedFlights.map((f) => (
                  <li
                    key={f.id}
                    className="flex justify-between gap-2"
                    data-testid={`payment-flight-${f.id}`}
                  >
                    <span className="truncate">
                      {f.flightNumber} · {f.origin.code}→{f.destination.code}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      ${(f.price * (cabinClass === "economy" ? 1 : cabinClass === "premium" ? 1.5 : cabinClass === "business" ? 2.5 : 4)).toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({passengers.length} pax)
                </span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes &amp; fees</span>
                <span>${taxesAndFees.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span data-testid="payment-total">${total.toFixed(2)}</span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={processing}
                data-testid="payment-submit"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Mock payment — no real card will be charged.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
