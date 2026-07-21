"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Pause, Play } from "lucide-react";

interface StockEntry {
  id: string;
  slug: string;
  name: string;
  stock: number;
  inStock: boolean;
  updatedAt: number;
}

/**
 * Playground module: Dynamic data.
 *
 * Polls /api/stock every 2 seconds and renders live stock counts. playwright
 * tests can assert that values change over time (e.g. `await expect(locator)
 * .not.toHaveText(initial)`).
 */
export function DynamicDataDemo() {
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!polling) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch("/api/stock?delay=300");
        const data = await res.json();
        if (cancelled) return;
        setStock(data.stock as StockEntry[]);
        setLastUpdated(data.serverTime as number);
        setUpdateCount((c) => c + 1);
        setLoading(false);
      } catch {
        // ignore transient errors
      }
    };

    tick();
    const interval = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [polling]);

  return (
    <Card data-testid="dynamic-data-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Dynamic data (live stock)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge
              variant={polling ? "default" : "secondary"}
              data-testid="dynamic-data-status"
            >
              {polling ? "Polling" : "Paused"}
            </Badge>
            <span>
              Updated{" "}
              <span data-testid="dynamic-data-count">{updateCount}</span>{" "}
              {updateCount === 1 ? "time" : "times"}
            </span>
            {lastUpdated && (
              <span className="text-xs">
                (last: {new Date(lastUpdated).toLocaleTimeString()})
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPolling((p) => !p)}
            data-testid="dynamic-data-toggle"
          >
            {polling ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Stock counts refresh every 2 seconds. playwright tests can assert
          that values change across polls.
        </p>

        {loading ? (
          <div
            className="text-sm text-muted-foreground py-4"
            data-testid="dynamic-data-loading"
          >
            Loading stock data...
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1"
            data-testid="dynamic-data-list"
          >
            {stock.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border border-border rounded-md px-3 py-2"
                data-testid={`stock-row-${s.slug}`}
              >
                <span className="text-sm truncate mr-2">{s.name}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`text-sm font-mono font-bold ${
                      s.inStock ? "" : "text-muted-foreground"
                    }`}
                    data-testid={`stock-value-${s.slug}`}
                  >
                    {s.stock}
                  </span>
                  <Badge
                    variant={s.inStock ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {s.inStock ? "in" : "out"}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
