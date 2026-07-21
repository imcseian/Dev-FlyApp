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
import { Plane, Search, ArrowLeft, Clock, Filter, X } from "lucide-react";
import { AIRPORTS } from "@/lib/catalog";
import type { Flight, CabinClass } from "@/lib/types";
import { FlightCard } from "./home-view";

const SORTS = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Shortest duration" },
  { value: "departure-asc", label: "Earliest departure" },
];

const AIRLINE_CODES = ["FWR", "SKY", "CLD", "AZR", "STR", "ORB"];

export function SearchView() {
  const setView = useAppStore((s) => s.setView);
  const addFlight = useBookingStore((s) => s.addFlight);

  // Initial state from sessionStorage (set by Home search widget).
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("LAX");
  const [passengers, setPassengers] = useState(1);
  const [sort, setSort] = useState("price-asc");
  const [airlineFilter, setAirlineFilter] = useState<string>("all");
  const [maxStops, setMaxStops] = useState<string>("any");
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial search params from sessionStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("fwr_search");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.origin) setOrigin(parsed.origin);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.passengers) setPassengers(parsed.passengers);
      } catch {
        // ignore
      }
    }
  }, []);

  // Debounce free-text search.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (origin) params.set("origin", origin);
      if (destination) params.set("destination", destination);
      if (sort) params.set("sort", sort);
      if (airlineFilter !== "all") params.set("airline", airlineFilter);
      if (maxStops !== "any") params.set("maxStops", maxStops);
      if (cabinClass) params.set("cabinClass", cabinClass);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("delay", "300");
      const res = await fetch(`/api/flights?${params.toString()}`);
      const data = await res.json();
      if (cancelled) return;
      setFlights(data.flights as Flight[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    origin,
    destination,
    sort,
    airlineFilter,
    maxStops,
    cabinClass,
    minPrice,
    maxPrice,
    debouncedSearch,
  ]);

  const swapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const hasActiveFilters =
    airlineFilter !== "all" ||
    maxStops !== "any" ||
    minPrice !== "" ||
    maxPrice !== "";

  const clearFilters = () => {
    setAirlineFilter("all");
    setMaxStops("any");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("home", undefined)}
        data-testid="search-back"
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to home
      </Button>

      {/* Search bar */}
      <Card data-testid="search-bar">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="search-origin" className="text-xs">
                From
              </Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger id="search-origin" data-testid="search-origin-select">
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
              data-testid="search-swap"
              aria-label="Swap origin and destination"
              className="mb-1"
            >
              <Plane className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <Label htmlFor="search-destination" className="text-xs">
                To
              </Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger id="search-destination" data-testid="search-destination-select">
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
            <div className="space-y-1">
              <Label htmlFor="search-passengers" className="text-xs">
                Passengers
              </Label>
              <Select
                value={String(passengers)}
                onValueChange={(v) => setPassengers(parseInt(v, 10))}
              >
                <SelectTrigger id="search-passengers" data-testid="search-passengers-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Free-text search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by airline, aircraft, route, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="search-query-input"
              aria-label="Free-text search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters + sort */}
      <div
        className="flex flex-wrap items-end gap-3"
        data-testid="search-filters"
      >
        <div className="space-y-1">
          <Label className="text-xs">Sort</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px]" data-testid="search-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cabin</Label>
          <Select
            value={cabinClass}
            onValueChange={(v) => setCabinClass(v as CabinClass)}
          >
            <SelectTrigger className="w-[140px]" data-testid="search-cabin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Airline</Label>
          <Select value={airlineFilter} onValueChange={setAirlineFilter}>
            <SelectTrigger className="w-[160px]" data-testid="search-airline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All airlines</SelectItem>
              {AIRLINE_CODES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Stops</Label>
          <Select value={maxStops} onValueChange={setMaxStops}>
            <SelectTrigger className="w-[120px]" data-testid="search-stops">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="0">Nonstop</SelectItem>
              <SelectItem value="1">≤ 1 stop</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="min-price" className="text-xs">
            Min $
          </Label>
          <Input
            id="min-price"
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24"
            data-testid="search-min-price"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="max-price" className="text-xs">
            Max $
          </Label>
          <Input
            id="max-price"
            type="number"
            min="0"
            placeholder="9999"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24"
            data-testid="search-max-price"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            data-testid="search-clear-filters"
            className="mb-1"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p
          className="text-sm text-muted-foreground"
          data-testid="search-results-count"
        >
          {loading
            ? "Searching flights..."
            : `${flights.length} flight${flights.length === 1 ? "" : "s"} found`}
        </p>
        <Badge variant="outline" data-testid="search-route-badge">
          {origin} → {destination}
        </Badge>
      </div>

      {/* Results grid */}
      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-testid="search-grid-loading"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-32 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : flights.length === 0 ? (
        <Card data-testid="search-empty">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No flights match your filters.</p>
            <p className="text-sm mt-1">
              Try clearing filters or choosing different airports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-testid="search-grid"
        >
          {flights.map((f) => (
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
      )}
    </div>
  );
}
