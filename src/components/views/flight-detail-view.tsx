"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useBookingStore } from "@/stores/use-cart-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Plane,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Star,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import type { Comment, Flight, CabinClass } from "@/lib/types";

interface FlightDetailViewProps {
  flightId: string;
}

export function FlightDetailView({ flightId }: FlightDetailViewProps) {
  const setView = useAppStore((s) => s.setView);
  const addFlight = useBookingStore((s) => s.addFlight);
  const cabinClass = useBookingStore((s) => s.cabinClass);
  const setCabinClass = useBookingStore((s) => s.setCabinClass);
  const passengers = useBookingStore((s) => s.passengers);
  const setPassengers = useBookingStore((s) => s.setPassengers);
  const seats = useBookingStore((s) => s.seats);
  const setSeat = useBookingStore((s) => s.setSeat);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      // Fetch all flights and find by ID (single endpoint kept simple).
      const res = await fetch("/api/flights?delay=300");
      const data = await res.json();
      if (cancelled) return;
      const found = (data.flights as Flight[]).find((f) => f.id === flightId);
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setFlight(found);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [flightId]);

  useEffect(() => {
    if (!flight) return;
    let cancelled = false;
    (async () => {
      setCommentsLoading(true);
      const routeKey = `${flight.origin.code}-${flight.destination.code}`;
      const res = await fetch(
        `/api/comments?flightId=${encodeURIComponent(routeKey)}`
      );
      const data = await res.json();
      if (cancelled) return;
      setComments(data.comments as Comment[]);
      setCommentsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [flight]);

  const handleSelectAndBook = () => {
    if (!flight) return;
    addFlight(flight);
    toast({
      title: "Flight added to booking",
      description: `${flight.flightNumber} · ${flight.origin.code} → ${flight.destination.code}`,
    });
    setView("booking", undefined);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight) return;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You must be signed in to leave a review.",
        variant: "destructive",
      });
      setView("login", undefined);
      return;
    }
    setSubmitting(true);
    try {
      const routeKey = `${flight.origin.code}-${flight.destination.code}`;
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: routeKey,
          author: user.name,
          body: newComment,
          rating: newRating,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Review failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setComments((c) => [data.comment, ...c]);
      setNewComment("");
      setNewRating(5);
      toast({ title: "Review posted!" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="flight-detail-loading">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (notFound || !flight) {
    return (
      <Card data-testid="flight-not-found">
        <CardContent className="p-12 text-center">
          <h2 className="text-2xl font-semibold mb-2">Flight not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find a flight with ID &quot;{flightId}&quot;.
          </p>
          <Button
            onClick={() => setView("search", undefined)}
            data-testid="back-to-search"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to search
          </Button>
        </CardContent>
      </Card>
    );
  }

  const depTime = new Date(flight.departureTime).toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const arrTime = new Date(flight.arrivalTime).toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hours = Math.floor(flight.durationMins / 60);
  const mins = flight.durationMins % 60;
  const routeKey = `${flight.origin.code}-${flight.destination.code}`;

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("search", undefined)}
        data-testid="flight-detail-back"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to search
      </Button>

      {/* Flight header */}
      <Card data-testid="flight-detail-card">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {flight.airline.logo} {flight.airline.name}
              </Badge>
              <span
                className="text-sm font-mono text-muted-foreground"
                data-testid="flight-detail-number"
              >
                {flight.flightNumber}
              </span>
            </div>
            {flight.seatsLeft === 0 ? (
              <Badge variant="destructive">Sold out</Badge>
            ) : flight.seatsLeft < 10 ? (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-700 dark:text-amber-400"
              >
                Only {flight.seatsLeft} seats left
              </Badge>
            ) : (
              <Badge variant="secondary">{flight.seatsLeft} seats available</Badge>
            )}
          </div>

          {/* Route visualization */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <div
                className="text-3xl font-bold"
                data-testid="flight-detail-origin"
              >
                {flight.origin.code}
              </div>
              <div className="text-xs text-muted-foreground">
                {flight.origin.city}
              </div>
              <div className="text-sm font-medium mt-1">{depTime}</div>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <Plane className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              <div className="text-xs text-muted-foreground mt-1">
                {hours}h {mins}m
              </div>
              <div className="text-xs text-muted-foreground">
                {flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops === 1 ? "" : "s"}${
                      flight.stopCities ? ` via ${flight.stopCities.join(", ")}` : ""
                    }`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {flight.aircraft}
              </div>
            </div>

            <div className="text-center flex-1">
              <div
                className="text-3xl font-bold"
                data-testid="flight-detail-destination"
              >
                {flight.destination.code}
              </div>
              <div className="text-xs text-muted-foreground">
                {flight.destination.city}
              </div>
              <div className="text-sm font-medium mt-1">{arrTime}</div>
            </div>
          </div>

          <Separator />

          {/* Cabin class + price + book button */}
          <div className="flex flex-wrap items-end gap-4 justify-between">
            <div className="space-y-1">
              <Label htmlFor="cabin-class" className="text-xs">
                Cabin class
              </Label>
              <Select
                value={cabinClass}
                onValueChange={(v) => setCabinClass(v as CabinClass)}
              >
                <SelectTrigger id="cabin-class" data-testid="flight-detail-cabin" className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flight.cabinClasses.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total from</div>
              <div
                className="text-3xl font-bold text-sky-600 dark:text-sky-400"
                data-testid="flight-detail-price"
              >
                ${flight.price.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / pax
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSelectAndBook}
              disabled={flight.seatsLeft === 0}
              data-testid="flight-detail-book"
            >
              {flight.seatsLeft === 0 ? "Sold out" : "Select & continue"}
              {flight.seatsLeft > 0 && (
                <ArrowRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seat map */}
      <Card data-testid="seat-map-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Choose your seats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeatMap
            flight={flight}
            passengers={passengers}
            seats={seats}
            onSeatSelect={setSeat}
          />
        </CardContent>
      </Card>

      {/* Reviews / comments — contains the deliberate XSS lab */}
      <Separator />
      <section
        className="space-y-4"
        data-testid="flight-comments-section"
        aria-labelledby="reviews-heading"
      >
        <div className="flex items-center gap-2">
          <h2 id="reviews-heading" className="text-xl font-semibold">
            Reviews for {routeKey}
          </h2>
          <Badge variant="outline">{comments.length}</Badge>
        </div>

        {/* XSS LAB WARNING */}
        <div
          className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
          data-testid="xss-warning"
          role="note"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Intentional XSS lab.</strong> Reviews below are rendered as
            raw HTML. Submitting a payload like{" "}
            <code className="px-1 py-0.5 bg-amber-500/20 rounded">
              &lt;img src=x onerror=alert(1)&gt;
            </code>{" "}
            will execute in the browser. This is on purpose for the Playwright
            security chapter.
          </p>
        </div>

        {/* Review form */}
        <form
          onSubmit={handleSubmitComment}
          className="space-y-3"
          data-testid="comment-form"
        >
          <div className="space-y-1">
            <Label htmlFor="comment-input" className="text-sm">
              Leave your review
            </Label>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-xs">Rating:</Label>
              <div
                className="flex gap-1"
                data-testid="rating-input"
                role="radiogroup"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNewRating(n)}
                    data-testid={`rating-star-${n}`}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    aria-checked={newRating === n}
                    role="radio"
                  >
                    <Star
                      className={
                        n <= newRating
                          ? "h-5 w-5 fill-yellow-500 text-yellow-500"
                          : "h-5 w-5 text-muted-foreground"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                user
                  ? "Share your flight experience... (HTML allowed — XSS lab)"
                  : "Sign in to leave a review"
              }
              disabled={!user || submitting}
              data-testid="comment-input"
              className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={!user || submitting || !newComment.trim()}
            data-testid="comment-submit"
          >
            {submitting ? "Posting..." : "Post review"}
          </Button>
        </form>

        {/* Reviews list — XSS vuln: rendered with dangerouslySetInnerHTML */}
        {commentsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p
            className="text-sm text-muted-foreground py-4"
            data-testid="no-comments"
          >
            No reviews yet. Be the first!
          </p>
        ) : (
          <ul className="space-y-3" data-testid="comments-list">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-border p-3 bg-card"
                data-testid={`comment-${c.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{c.author}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex"
                      data-testid={`comment-rating-${c.id}`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < c.rating
                              ? "h-3 w-3 fill-yellow-500 text-yellow-500"
                              : "h-3 w-3 text-muted-foreground"
                          }
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {/*
                  XSS LAB — deliberately rendering raw HTML.
                  Do NOT do this in production.
                */}
                <div
                  className="text-sm prose prose-sm max-w-none"
                  data-testid={`comment-body-${c.id}`}
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Simple 6-row × 4-col seat map. Seats are deterministic per flight ID. */
function SeatMap({
  flight,
  passengers,
  seats,
  onSeatSelect,
}: {
  flight: Flight;
  passengers: { type: string; firstName: string; lastName: string }[];
  seats: Record<number, string>;
  onSeatSelect: (passengerIndex: number, seat: string) => void;
}) {
  // Generate seat availability deterministically from flight ID.
  const rows = 6;
  const cols = ["A", "B", "C", "D"];
  const seatState = (row: number, col: string) => {
    // Hash-ish: ~30% of seats are taken, deterministic per flight+seat.
    const hash = (flight.id.charCodeAt(0) + row * 7 + col.charCodeAt(0)) % 10;
    if (hash < 3) return "taken";
    if (hash < 5) return "premium";
    return "available";
  };

  const activePassengerIdx = passengers.findIndex(
    (_, i) => !seats[i]
  );
  const currentPassengerIdx = activePassengerIdx === -1 ? 0 : activePassengerIdx;

  return (
    <div className="space-y-3" data-testid="seat-map">
      <p className="text-sm text-muted-foreground">
        Click a seat to assign it to passenger {currentPassengerIdx + 1} of{" "}
        {passengers.length}.
      </p>

      <div
        className="inline-grid gap-2 p-4 rounded-lg border border-border bg-muted/30"
        style={{ gridTemplateColumns: `repeat(${cols.length + 1}, minmax(0, 1fr))` }}
        data-testid="seat-grid"
        role="grid"
        aria-label="Seat map"
      >
        {/* Header row */}
        <div />
        {cols.map((c) => (
          <div
            key={c}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {c}
          </div>
        ))}

        {/* Seat rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const rowNumber = rowIdx + 1;
          return (
            <div key={`row-wrap-${rowNumber}`} className="contents">
              <div
                className="text-center text-xs font-medium text-muted-foreground self-center"
              >
                {rowNumber}
              </div>
              {cols.map((col) => {
                const seatId = `${rowNumber}${col}`;
                const state = seatState(rowNumber, col);
                const isSelected = Object.values(seats).includes(seatId);
                const isCurrentPaxSeat = seats[currentPassengerIdx] === seatId;
                const disabled = state === "taken" && !isCurrentPaxSeat;

                return (
                  <button
                    key={seatId}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onSeatSelect(currentPassengerIdx, seatId)
                    }
                    data-testid={`seat-${seatId}`}
                    data-seat-state={
                      isCurrentPaxSeat
                        ? "selected"
                        : isSelected
                        ? "taken-other"
                        : state
                    }
                    aria-label={`Seat ${seatId} — ${
                      isCurrentPaxSeat
                        ? "your seat"
                        : isSelected
                        ? "taken by another passenger"
                        : state
                    }`}
                    className={`h-9 w-9 rounded text-xs font-medium transition-colors ${
                      isCurrentPaxSeat
                        ? "bg-sky-600 text-white"
                        : isSelected
                        ? "bg-muted-foreground/30 text-muted-foreground cursor-not-allowed"
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
        className="flex flex-wrap gap-3 text-xs text-muted-foreground"
        data-testid="seat-legend"
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

      {/* Selected seats summary */}
      {Object.keys(seats).length > 0 && (
        <div
          className="text-sm text-muted-foreground"
          data-testid="selected-seats"
        >
          <strong className="text-foreground">Selected seats:</strong>{" "}
          {Object.entries(seats)
            .map(([idx, seat]) => `P${parseInt(idx, 10) + 1}: ${seat}`)
            .join(", ")}
        </div>
      )}
    </div>
  );
}
