"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MousePointerClick, Info, Plane, MapPin } from "lucide-react";

/**
 * Playwright concept: Hover interactions.
 *
 * Two types of hover UI:
 *   1. Native CSS :hover (simple color change)
 *   2. Radix Hover Card / Tooltip (JS-driven, requires hover + wait)
 *
 * Playwright test patterns:
 *
 *   // Simple hover then assert visible state
 *   await page.getByTestId('hover-card-trigger').hover();
 *   await expect(page.getByTestId('hover-card-content')).toBeVisible();
 *
 *   // Hover off (move away)
 *   await page.getByTestId('hover-card-trigger').hover();
 *   await page.mouse.move(0, 0);
 *   await expect(page.getByTestId('hover-card-content')).toBeHidden();
 */
export function HoverDemo() {
  const [hoverCount, setHoverCount] = useState(0);

  return (
    <Card data-testid="hover-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointerClick className="h-5 w-5" />
          Hover interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Two flavors of hover UI — simple CSS hover and JS-driven Radix hover
          cards. Use <code className="px-1 py-0.5 bg-muted rounded">.hover()</code> and
          assert visibility.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="hover-snippet"
        >
{`// Hover over the trigger
await page.getByTestId('hover-card-trigger').hover();
await expect(page.getByTestId('hover-card-content')).toBeVisible();

// Hover off (move away)
await page.mouse.move(0, 0);
await expect(page.getByTestId('hover-card-content')).toBeHidden();`}
        </pre>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Hover card */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Hover card (Radix):
            </p>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="outline"
                  data-testid="hover-card-trigger"
                  onMouseEnter={() => setHoverCount((c) => c + 1)}
                >
                  <Plane className="h-4 w-4 mr-2" />
                  Hover for flight info
                </Button>
              </HoverCardTrigger>
              <HoverCardContent data-testid="hover-card-content" className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-sky-600" />
                    <span className="font-semibold">FWR 101</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    JFK → LAX · Nonstop · 6h 5m
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Boeing 787-9 · Departs 08:30 · Arrives 11:45
                  </div>
                  <Badge variant="secondary">On time</Badge>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Tooltip */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Tooltip (Radix):
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" data-testid="hover-tooltip-trigger">
                    <Info className="h-4 w-4 mr-2" />
                    Hover for help
                  </Button>
                </TooltipTrigger>
                <TooltipContent data-testid="hover-tooltip-content">
                  Click "Search flights" to find available routes.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* CSS-only hover */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            CSS :hover (color change):
          </p>
          <button
            data-testid="hover-css-button"
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors text-sm font-medium"
          >
            Hover me — I change color
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Hover card opened:</span>
          <Badge variant="outline" data-testid="hover-count">
            {hoverCount}×
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
