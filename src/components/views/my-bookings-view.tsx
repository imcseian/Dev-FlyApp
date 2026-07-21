"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  ArrowRight,
  Calendar,
  Clock,
  Search,
} from "lucide-react";
import type { Booking } from "@/lib/types";

export function MyBookingsView() {
  const setView = useAppStore((s) => s.setView);
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
              Your booked flights will appear here with PNR, status, and ticket details.
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
                    <span className="text-xs text-muted-foreground">
                      Booked {new Date(b.createdAt).toLocaleDateString()}
                    </span>
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
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {item.passengerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="capitalize">{item.cabinClass}</span>
                            {item.seat ? ` · Seat ${item.seat}` : ""}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {b.items.length} ticket{b.items.length === 1 ? "" : "s"}
                    </span>
                    <span
                      className="font-bold text-lg"
                      data-testid={`booking-total-${b.id}`}
                    >
                      ${b.total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
