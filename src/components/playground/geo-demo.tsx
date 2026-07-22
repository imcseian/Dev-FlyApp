"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, AlertTriangle } from "lucide-react";

/**
 * Playwright concept: Geolocation & permissions.
 *
 * Uses the browser Geolocation API. Playwright can grant the permission and
 * mock a location:
 *
 *   const context = await browser.newContext({
 *     permissions: ['geolocation'],
 *     geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC
 *   });
 *   await page.getByTestId('geo-request').click();
 *   await expect(page.getByTestId('geo-result')).toContainText('New York');
 *
 * Or deny the permission:
 *   await context.setPermissions('https://example.com', []);
 *   await page.getByTestId('geo-request').click();
 *   await expect(page.getByTestId('geo-error')).toBeVisible();
 */
export function GeoDemo() {
  const [status, setStatus] = useState<"idle" | "requesting" | "success" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestGeo = () => {
    setStatus("requesting");
    setError(null);
    setCoords(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Geolocation not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setStatus("success");
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === 1
            ? "Permission denied — grant geolocation in browser settings"
            : err.code === 2
            ? "Position unavailable — Playwright can mock this"
            : "Timeout"
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Determine nearest airport based on coords (mock).
  const getNearestAirport = () => {
    if (!coords) return null;
    // Mock: round to nearest 10 degrees and pick from a tiny lookup.
    const airports = [
      { code: "JFK", lat: 40.64, lng: -73.78, city: "New York" },
      { code: "LAX", lat: 33.94, lng: -118.41, city: "Los Angeles" },
      { code: "LHR", lat: 51.47, lng: -0.45, city: "London" },
      { code: "NRT", lat: 35.77, lng: 140.39, city: "Tokyo" },
      { code: "SIN", lat: 1.35, lng: 103.99, city: "Singapore" },
    ];
    let nearest = airports[0];
    let minDist = Infinity;
    for (const a of airports) {
      const dist = Math.sqrt(
        Math.pow(a.lat - coords.lat, 2) + Math.pow(a.lng - coords.lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = a;
      }
    }
    return nearest;
  };

  const nearest = getNearestAirport();

  return (
    <Card data-testid="geo-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geolocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Requests browser geolocation. Grant the permission and mock a location
          in Playwright context options.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="geo-snippet"
        >
{`// Grant + mock location (NYC)
const context = await browser.newContext({
  permissions: ['geolocation'],
  geolocation: { latitude: 40.7128, longitude: -74.0060 },
});
await page.getByTestId('geo-request').click();
await expect(page.getByTestId('geo-nearest-airport'))
  .toContainText('JFK');

// Deny permission
await context.clearPermissions();
await page.getByTestId('geo-request').click();
await expect(page.getByTestId('geo-error')).toBeVisible();`}
        </pre>

        <Button
          onClick={requestGeo}
          disabled={status === "requesting"}
          data-testid="geo-request"
        >
          <Globe className="h-4 w-4 mr-2" />
          {status === "requesting" ? "Requesting location..." : "Find my location"}
        </Button>

        {/* Status badge */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Status:</span>
          <Badge
            variant={
              status === "success"
                ? "default"
                : status === "error"
                ? "destructive"
                : "outline"
            }
            data-testid="geo-status"
          >
            {status}
          </Badge>
        </div>

        {/* Success result */}
        {status === "success" && coords && nearest && (
          <div
            className="space-y-2 p-3 border border-sky-500/30 bg-sky-500/5 rounded-md"
            data-testid="geo-result"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your coordinates:</span>
              <span
                className="font-mono text-xs"
                data-testid="geo-coords"
              >
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nearest airport:</span>
              <Badge variant="default" data-testid="geo-nearest-airport">
                {nearest.code} — {nearest.city}
              </Badge>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && error && (
          <div
            className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            data-testid="geo-error"
            role="alert"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
