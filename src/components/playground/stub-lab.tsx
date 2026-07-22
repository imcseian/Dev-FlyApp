"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MousePointerClick, Send, Webhook } from "lucide-react";

/**
 * Playwright concept: `page.exposeFunction()` + `page.evaluate()` for stubbing.
 *
 * This module exposes a global `window.CyRam` object with several methods.
 * Playwright tests can stub or spy on any of them via exposeFunction:
 *
 *   const calls: any[] = [];
 *   await page.exposeFunction('trackEventSpy', (...args) => calls.push(args));
 *   await page.evaluate(() => { window.CyRam.trackEvent = window.trackEventSpy; });
 *   await page.getByTestId('stub-track-click').click();
 *   expect(calls).toEqual([['button_click', { id: 'track-click' }]]);
 *
 * The component renders a live log of method calls so you can verify visually
 * too.
 */

interface CallLogEntry {
  id: number;
  method: string;
  args: unknown[];
  timestamp: number;
}

declare global {
  interface Window {
    CyRam?: {
      trackEvent: (event: string, payload?: Record<string, unknown>) => void;
      analytics: (event: string, props?: Record<string, unknown>) => void;
      logMessage: (level: string, message: string) => void;
      webhook: (url: string, body: unknown) => Promise<{ ok: true }>;
    };
  }
}

export function StubLab() {
  const [callLog, setCallLog] = useState<CallLogEntry[]>([]);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  // Install window.CyRam on mount. Playwright tests can stub these methods
  // AFTER this effect runs (i.e., after the page loads).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const log = (method: string, args: unknown[]) => {
      setCallLog((prev) => [
        {
          id: Date.now() + Math.random(),
          method,
          args,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 20));
    };

    window.CyRam = {
      trackEvent: (event, payload = {}) => {
        log("trackEvent", [event, payload]);
        // Real impl would send to analytics
      },
      analytics: (event, props = {}) => {
        log("analytics", [event, props]);
      },
      logMessage: (level, message) => {
        log("logMessage", [level, message]);
      },
      webhook: async (url, body) => {
        log("webhook", [url, body]);
        setWebhookResult(`Posted to ${url}`);
        return { ok: true };
      },
    };

    return () => {
      delete window.CyRam;
    };
  }, []);

  const fireTrackClick = () => {
    window.CyRam?.trackEvent("button_click", { id: "track-click" });
  };
  const fireAnalytics = () => {
    window.CyRam?.analytics("page_view", { page: "/stub-lab" });
  };
  const fireLog = () => {
    window.CyRam?.logMessage("info", "User clicked log button");
  };
  const fireWebhook = async () => {
    setWebhookResult(null);
    await window.CyRam?.webhook("https://example.com/webhook", {
      event: "test",
    });
  };

  return (
    <Card data-testid="stub-lab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Stub & spy lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Exposes <code className="px-1 py-0.5 bg-muted rounded">window.CyRam</code>{" "}
          with four methods. Stub them via <code className="px-1 py-0.5 bg-muted rounded">page.exposeFunction()</code>, click the buttons below,
          then assert the stub was called with the expected args.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="stub-snippet"
        >
{`const calls: any[] = [];
await page.exposeFunction('trackEventSpy', (...args) => calls.push(args));
await page.evaluate(() => {
  window.CyRam.trackEvent = window.trackEventSpy;
});
await page.getByTestId('stub-track-click').click();
expect(calls).toEqual([
  ['button_click', { id: 'track-click' }],
]);`}
        </pre>

        {/* Action buttons */}
        <div
          className="grid grid-cols-2 gap-2"
          data-testid="stub-actions"
        >
          <Button
            onClick={fireTrackClick}
            data-testid="stub-track-click"
            variant="outline"
          >
            <MousePointerClick className="h-4 w-4 mr-2" />
            trackEvent()
          </Button>
          <Button
            onClick={fireAnalytics}
            data-testid="stub-analytics"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            analytics()
          </Button>
          <Button
            onClick={fireLog}
            data-testid="stub-log"
            variant="outline"
          >
            <Send className="h-4 w-4 mr-2" />
            logMessage()
          </Button>
          <Button
            onClick={fireWebhook}
            data-testid="stub-webhook"
            variant="outline"
          >
            <Webhook className="h-4 w-4 mr-2" />
            webhook()
          </Button>
        </div>

        {webhookResult && (
          <p
            className="text-xs text-muted-foreground"
            data-testid="stub-webhook-result"
          >
            {webhookResult}
          </p>
        )}

        {/* Call log */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Method call log (most recent 20):
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCallLog([])}
              data-testid="stub-clear-log"
              className="h-7 text-xs"
            >
              Clear
            </Button>
          </div>
          <div
            className="space-y-1 max-h-60 overflow-y-auto"
            data-testid="stub-call-log"
          >
            {callLog.length === 0 ? (
              <p
                className="text-sm text-muted-foreground py-4 text-center"
                data-testid="stub-call-log-empty"
              >
                No calls yet. Click a button above.
              </p>
            ) : (
              callLog.map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs border border-border rounded px-2 py-1 font-mono"
                  data-testid="stub-call-log-entry"
                >
                  <span className="font-semibold text-primary">
                    {entry.method}
                  </span>
                  <span className="text-muted-foreground">()</span>{" "}
                  <span className="text-muted-foreground">
                    {JSON.stringify(entry.args)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
