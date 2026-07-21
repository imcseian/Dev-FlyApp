"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Timer, Zap } from "lucide-react";

const STATUS_STATES = ["idle", "loading", "ready"] as const;
type Status = (typeof STATUS_STATES)[number];

/**
 * Playground module: Auto-waiting.
 *
 * - A button reveals a "secret" button after a 1500ms delay.
 * - A separate async data load completes after 2000ms.
 *
 * playwright tests can practice `await expect(...).toBeVisible()`,
 * `await page.waitForResponse()`, and `waitForTimeout` patterns here.
 */
export function AutoWaitDemo() {
  const [revealStatus, setRevealStatus] = useState<Status>("idle");
  const [dataStatus, setDataStatus] = useState<Status>("idle");
  const [data, setData] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const handleReveal = () => {
    setRevealStatus("loading");
    setTimeout(() => {
      setRevealStatus("ready");
    }, 1500);
  };

  const handleLoadData = () => {
    setDataStatus("loading");
    setData(null);
    setTimeout(() => {
      setData(
        `Server time: ${new Date().toISOString()} · random id ${Math.random()
          .toString(36)
          .slice(2, 10)}`
      );
      setDataStatus("ready");
    }, 2000);
  };

  return (
    <div className="space-y-4" data-testid="autowait-demo">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Auto-waiting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reveal-after-delay */}
          <div
            className="space-y-3 p-4 border border-border rounded-lg"
            data-testid="autowait-reveal-section"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delayed reveal</p>
                <p className="text-sm text-muted-foreground">
                  Click the button — a secret action appears after 1.5s.
                </p>
              </div>
              <Badge
                variant="outline"
                data-testid="autowait-reveal-status"
              >
                {revealStatus}
              </Badge>
            </div>

            <Button
              onClick={handleReveal}
              disabled={revealStatus === "loading"}
              data-testid="autowait-start-reveal"
            >
              {revealStatus === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revealing...
                </>
              ) : (
                "Reveal secret button"
              )}
            </Button>

            {revealStatus === "ready" && (
              <Button
                variant="secondary"
                onClick={() => setClickCount((c) => c + 1)}
                data-testid="autowait-secret-button"
                className="ml-2"
              >
                <Zap className="h-4 w-4 mr-1" />
                Secret action (clicked {clickCount}×)
              </Button>
            )}
          </div>

          {/* Async data load */}
          <div
            className="space-y-3 p-4 border border-border rounded-lg"
            data-testid="autowait-data-section"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Async data load (2s)</p>
                <p className="text-sm text-muted-foreground">
                  Simulated network latency — playwright can wait for the
                  response text to appear.
                </p>
              </div>
              <Badge variant="outline" data-testid="autowait-data-status">
                {dataStatus}
              </Badge>
            </div>

            <Button
              onClick={handleLoadData}
              disabled={dataStatus === "loading"}
              data-testid="autowait-load-data"
            >
              {dataStatus === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load data"
              )}
            </Button>

            <div className="min-h-[2.5rem]">
              {dataStatus === "loading" && (
                <div
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  data-testid="autowait-data-loading"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching from server...
                </div>
              )}
              {dataStatus === "ready" && data && (
                <div
                  className="text-sm font-mono p-3 bg-muted rounded-md"
                  data-testid="autowait-data-result"
                >
                  {data}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
