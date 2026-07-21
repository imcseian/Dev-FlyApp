"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useBookingStore } from "@/stores/use-cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Search,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { AIRPORTS, CATALOG } from "@/lib/catalog";
import type { Flight } from "@/lib/types";

const POPULAR_ROUTES: { from: string; to: string; label: string }[] = [
  { from: "JFK", to: "LAX", label: "New York → Los Angeles" },
  { from: "LHR", to: "JFK", label: "London → New York" },
  { from: "SFO", to: "NRT", label: "San Francisco → Tokyo" },
  { from: "DXB", to: "SIN", label: "Dubai → Singapore" },
  { from: "DEL", to: "BOM", label: "New Delhi → Mumbai" },
];

export function HomeView() {
  const setView = useAppStore((s) => s.setView);
  const setViewWithFlight = useAppStore((s) => s.setView);
  const addFlight = useBookingStore((s) => s.addFlight);
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LAX");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [passengers, setPassengers] = useState(1);
  const [featured, setFeatured] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 800ms artificial delay so playwright can practice loading-state assertions.
      const res = await fetch("/api/flights?sort=price-asc&delay=800");
      const data = await res.json();
      if (cancelled) return;
      setFeatured((data.flights as Flight[]).slice(0, 4));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = () => {
    setView("search", undefined);
    // The search view reads origin/destination from sessionStorage (set below).
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "fwr_search",
        JSON.stringify({ origin, destination, tripType, passengers })
      );
    }
  };

  const swapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div className="space-y-12">
      {/* Hero with search widget */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 via-background to-cyan-500/10 p-8 sm:p-12"
        data-testid="hero-section"
      >
        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="secondary" className="mb-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Playwright Mastery Academy
          </Badge>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight"
            data-testid="hero-title"
          >
            Fly with Ram —
            <br />
            <span className="text-sky-600 dark:text-sky-400">
              test automation takes off.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            A deliberately complex flight-booking playground built for the
            Playwright Mastery Academy. Every edge case you&apos;ll meet in
            production is in here, on purpose.
          </p>

          {/* Search widget */}
          <Card data-testid="search-widget" className="backdrop-blur-sm">
            <CardContent className="p-5 space-y-4">
              {/* Trip type toggle */}
              <div
                className="flex gap-2"
                data-testid="trip-type-toggle"
                role="tablist"
                aria-label="Trip type"
              >
                <Button
                  type="button"
                  variant={tripType === "oneway" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTripType("oneway")}
                  data-testid="trip-type-oneway"
                  role="tab"
                  aria-selected={tripType === "oneway"}
                >
                  One-way
                </Button>
                <Button
                  type="button"
                  variant={tripType === "roundtrip" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTripType("roundtrip")}
                  data-testid="trip-type-roundtrip"
                  role="tab"
                  aria-selected={tripType === "roundtrip"}
                >
                  Round-trip
                </Button>
              </div>

              {/* Origin / Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-end">
                <div className="space-y-1">
                  <Label htmlFor="origin" className="text-xs">
                    From
                  </Label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger id="origin" data-testid="search-origin">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AIRPORTS).map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.city} ({a.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={swapAirports}
                  data-testid="swap-airports"
                  aria-label="Swap origin and destination"
                  className="mb-1"
                >
                  <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
                </Button>
                <div className="space-y-1">
                  <Label htmlFor="destination" className="text-xs">
                    To
                  </Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger id="destination" data-testid="search-destination">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AIRPORTS).map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.city} ({a.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Passengers + Search */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label htmlFor="passengers" className="text-xs">
                    Passengers
                  </Label>
                  <Select
                    value={String(passengers)}
                    onValueChange={(v) => setPassengers(parseInt(v, 10))}
                  >
                    <SelectTrigger id="passengers" data-testid="search-passengers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} passenger{n === 1 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleSearch}
                  data-testid="search-submit"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search flights
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("search", undefined)}
              data-testid="hero-browse-cta"
            >
              Browse all flights
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("playground", undefined)}
              data-testid="hero-playground-cta"
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Enter the Playground
            </Button>
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section>
        <h2
          className="text-xl font-semibold mb-4"
          data-testid="popular-routes-title"
        >
          Popular routes
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          data-testid="popular-routes-grid"
        >
          {POPULAR_ROUTES.map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              onClick={() => {
                setOrigin(r.from);
                setDestination(r.to);
                handleSearch();
              }}
              data-testid={`popular-route-${r.from}-${r.to}`}
              className="rounded-lg border border-border p-4 text-left hover:border-sky-500 hover:bg-sky-500/5 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                {r.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {r.from} → {r.to}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured flights */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold"
            data-testid="featured-section-title"
          >
            Cheapest flights right now
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("search", undefined)}
            data-testid="view-all-flights"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-testid="featured-grid"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} data-testid={`featured-skeleton-${i}`}>
                  <Skeleton className="h-32 w-full rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            : featured.map((f) => (
                <FlightCard
                  key={f.id}
                  flight={f}
                  onView={() => setView("flight-detail", { flightId: f.id })}
                  onSelect={() => {
                    addFlight(f);
                    setView("flight-detail", { flightId: f.id });
                  }}
                />
              ))}
        </div>
      </section>
    </div>
  );
}

export function FlightCard({
  flight,
  onView,
  onSelect,
}: {
  flight: Flight;
  onView: () => void;
  onSelect: () => void;
}) {
  const depTime = new Date(flight.departureTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const arrTime = new Date(flight.arrivalTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hours = Math.floor(flight.durationMins / 60);
  const mins = flight.durationMins % 60;

  return (
    <Card
      className="overflow-hidden flex flex-col"
      data-testid={`flight-card-${flight.id}`}
    >
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {flight.airline.logo} {flight.airline.name}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`flight-number-${flight.id}`}>
            {flight.flightNumber}
          </span>
        </div>

        <button
          onClick={onView}
          className="text-left"
          data-testid={`flight-route-${flight.id}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{flight.origin.code}</div>
              <div className="text-xs text-muted-foreground">
                {depTime}
              </div>
            </div>
            <div className="flex-1 mx-2 flex flex-col items-center">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground mt-1">
                {hours}h {mins}m
              </div>
              <div className="text-xs text-muted-foreground">
                {flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops === 1 ? "" : "s"}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{flight.destination.code}</div>
              <div className="text-xs text-muted-foreground">
                {arrTime}
              </div>
            </div>
          </div>
        </button>

        <div className="flex items-center justify-between mt-1">
          <span
            className="text-lg font-bold text-sky-600 dark:text-sky-400"
            data-testid={`flight-price-${flight.id}`}
          >
            ${flight.price.toFixed(0)}
          </span>
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
            <Badge variant="secondary">{flight.seatsLeft} seats</Badge>
          )}
        </div>

        <Button
          size="sm"
          onClick={onSelect}
          disabled={flight.seatsLeft === 0}
          data-testid={`flight-select-${flight.id}`}
        >
          {flight.seatsLeft === 0 ? "Sold out" : "Select flight"}
        </Button>
      </CardContent>
    </Card>
  );
}
