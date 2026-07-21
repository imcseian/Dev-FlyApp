"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useBookingStore } from "@/stores/use-cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import type { Passenger } from "@/lib/types";

export function BookingView() {
  const setView = useAppStore((s) => s.setView);
  const selectedFlights = useBookingStore((s) => s.selectedFlights);
  const cabinClass = useBookingStore((s) => s.cabinClass);
  const passengers = useBookingStore((s) => s.passengers);
  const setPassengers = useBookingStore((s) => s.setPassengers);
  const removeFlight = useBookingStore((s) => s.removeFlight);
  const totalPrice = useBookingStore((s) => s.totalPrice());

  if (selectedFlights.length === 0) {
    return (
      <div className="space-y-6">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="booking-title"
        >
          Your booking
        </h1>
        <Card data-testid="booking-empty">
          <CardContent className="p-12 text-center">
            <Plane className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No flights selected yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Search for flights and pick one to start your booking.
            </p>
            <Button
              onClick={() => setView("search", undefined)}
              data-testid="booking-empty-search"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Search flights
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paxCount = passengers.length;
  const taxesAndFees = Math.round(totalPrice * 0.12 * 100) / 100;
  const total = Math.round((totalPrice + taxesAndFees) * 100) / 100;

  const updatePassenger = (idx: number, field: keyof Passenger, value: string) => {
    const next = [...passengers];
    next[idx] = { ...next[idx], [field]: value };
    setPassengers(next);
  };

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([
      ...passengers,
      { type: "adult", firstName: "", lastName: "" },
    ]);
  };

  const removePassenger = (idx: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== idx));
  };

  const allPassengersValid = passengers.every(
    (p) => p.firstName.trim() && p.lastName.trim()
  );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("search", undefined)}
        data-testid="booking-back"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to search
      </Button>

      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="booking-title"
        >
          Your booking
        </h1>
        <p className="text-muted-foreground mt-1">
          {selectedFlights.length} flight{selectedFlights.length === 1 ? "" : "s"} ·{" "}
          {paxCount} passenger{paxCount === 1 ? "" : "s"} ·{" "}
          <span className="capitalize">{cabinClass}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected flights + passengers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flights */}
          <Card data-testid="booking-flights-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedFlights.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border border-border rounded-lg p-3"
                  data-testid={`booking-flight-${f.id}`}
                >
                  <div>
                    <div className="font-medium">
                      {f.airline.logo} {f.flightNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {f.origin.code} → {f.destination.code} ·{" "}
                      {new Date(f.departureTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(f.departureTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      →{" "}
                      {new Date(f.arrivalTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      ${f.price.toFixed(0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFlight(f.id)}
                      data-testid={`booking-remove-flight-${f.id}`}
                      aria-label={`Remove ${f.flightNumber}`}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card data-testid="booking-passengers-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Passengers
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPassenger}
                  disabled={passengers.length >= 6}
                  data-testid="add-passenger"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg p-3 space-y-3"
                  data-testid={`passenger-${idx}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Passenger {idx + 1}</Badge>
                    {passengers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePassenger(idx)}
                        data-testid={`remove-passenger-${idx}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`pax-${idx}-type`} className="text-xs">
                        Type
                      </Label>
                      <Select
                        value={p.type}
                        onValueChange={(v) =>
                          updatePassenger(idx, "type", v)
                        }
                      >
                        <SelectTrigger id={`pax-${idx}-type`} data-testid={`pax-${idx}-type`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="infant">Infant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`pax-${idx}-first`} className="text-xs">
                        First name
                      </Label>
                      <Input
                        id={`pax-${idx}-first`}
                        required
                        value={p.firstName}
                        onChange={(e) =>
                          updatePassenger(idx, "firstName", e.target.value)
                        }
                        placeholder="Jane"
                        data-testid={`pax-${idx}-first`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`pax-${idx}-last`} className="text-xs">
                        Last name
                      </Label>
                      <Input
                        id={`pax-${idx}-last`}
                        required
                        value={p.lastName}
                        onChange={(e) =>
                          updatePassenger(idx, "lastName", e.target.value)
                        }
                        placeholder="Tester"
                        data-testid={`pax-${idx}-last`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card data-testid="booking-summary" className="sticky top-20">
            <CardHeader>
              <CardTitle>Price summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Flights × {paxCount} pax
                </span>
                <span data-testid="booking-subtotal">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes &amp; fees (12%)</span>
                <span data-testid="booking-taxes">
                  ${taxesAndFees.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span data-testid="booking-total">${total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full mt-2"
                size="lg"
                onClick={() => setView("payment", undefined)}
                disabled={!allPassengersValid}
                data-testid="booking-continue"
              >
                Continue to payment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              {!allPassengersValid && (
                <p
                  className="text-xs text-muted-foreground text-center"
                  data-testid="booking-validation"
                >
                  Fill in all passenger names to continue.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setView("search", undefined)}
                data-testid="booking-add-more"
              >
                Add more flights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
