"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Trash2, Plus, Link2 } from "lucide-react";

/**
 * Playwright concept: Multiple tabs / popup windows.
 *
 * Triggers new tabs via three different mechanisms so tests can practice
 * `page.waitForEvent('popup')` and `context.pages`:
 *
 *   1. <a target="_blank"> — native link with target attribute
 *   2. window.open() — programmatic popup
 *   3. <form target="_blank"> — form submission in new tab
 *
 * Playwright test patterns:
 *
 *   // Wait for a popup
 *   const [popup] = await Promise.all([
 *     page.waitForEvent('popup'),
 *     page.getByTestId('newtab-link-target').click(),
 *   ]);
 *   await expect(popup.getByText('Popup content')).toBeVisible();
 *
 *   // List all open pages in context
 *   const pages = context.pages();
 */
export function NewTabDemo() {
  const [popupsOpened, setPopupsOpened] = useState(0);
  const [popupMessages, setPopupMessages] = useState<string[]>([]);

  const popupContent = `<!doctype html>
<html>
<head>
  <title>Fly with Ram Popup</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
    h1 { color: #0ea5e9; }
    .meta { color: #71717a; font-size: 13px; margin-top: 24px; padding: 12px; background: #f4f4f5; border-radius: 6px; font-family: monospace; }
    button { padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Popup Window #${popupsOpened + 1}</h1>
  <p data-testid="popup-content">This is a separate browser tab opened by Fly with Ram.</p>
  <p>Playwright can interact with this tab via the <code>popup</code> object returned by <code>page.waitForEvent('popup')</code>.</p>
  <button data-testid="popup-close-button" onclick="window.close()">Close this tab</button>
  <button data-testid="popup-send-message" onclick="window.opener.postMessage({__fwr:true, payload:'Hello from popup #' + ${popupsOpened + 1}}, '*')">Send message to parent</button>
  <div class="meta">popup URL: ${typeof window !== "undefined" ? window.location.href : ""}</div>
</body>
</html>`;

  const openPopupViaWindowOpen = () => {
    const w = window.open("", "_blank", "width=600,height=500");
    if (!w) return;
    w.document.write(popupContent);
    w.document.close();
    setPopupsOpened((n) => n + 1);
  };

  const openPopupViaBlob = () => {
    const blob = new Blob([popupContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "width=600,height=500");
    setPopupsOpened((n) => n + 1);
  };

  // Listen for messages from popups
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.__fwr) {
        setPopupMessages((m) => [...m, e.data.payload as string].slice(-5));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <Card data-testid="newtab-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          New tab &amp; popups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Three different ways to open a new tab. Use{" "}
          <code className="px-1 py-0.5 bg-muted rounded">page.waitForEvent(&apos;popup&apos;)</code>{" "}
          to handle them.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="newtab-snippet"
        >
{`// Wait for popup after click
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByTestId('newtab-window-open').click(),
]);
await expect(popup.getByTestId('popup-content')).toBeVisible();
await popup.getByTestId('popup-close-button').click();`}
        </pre>

        {/* Action buttons */}
        <div className="grid grid-cols-1 gap-2" data-testid="newtab-actions">
          {/* Native link with target="_blank" */}
          <a
            href="/?popup=1"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="newtab-link-target"
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Open link (target=_blank)
          </a>

          {/* window.open() with document.write */}
          <Button
            onClick={openPopupViaWindowOpen}
            data-testid="newtab-window-open"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            window.open() popup
          </Button>

          {/* window.open() with blob URL */}
          <Button
            onClick={openPopupViaBlob}
            data-testid="newtab-blob-url"
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Blob URL popup
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Popups opened:</span>
          <Badge variant="outline" data-testid="newtab-count">
            {popupsOpened}
          </Badge>
        </div>

        {/* Messages received from popups */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Messages received FROM popups:
          </p>
          <div
            className="space-y-1 min-h-[3rem]"
            data-testid="newtab-messages"
          >
            {popupMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              popupMessages.map((msg, i) => (
                <div
                  key={i}
                  className="text-xs font-mono p-2 border border-border rounded"
                  data-testid={`newtab-message-${i}`}
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
