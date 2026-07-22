"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertCircle, HelpCircle, Bell } from "lucide-react";

/**
 * Playwright concept: JavaScript dialogs (alert, confirm, prompt, beforeunload).
 *
 * Browsers show native modal dialogs that block page interaction. Playwright
 * auto-dismisses them by default, but tests can intercept:
 *
 *   page.on('dialog', async (dialog) => {
 *     expect(dialog.type()).toBe('alert');
 *     expect(dialog.message()).toContain('Booking confirmed');
 *     await dialog.accept();
 *   });
 *   await page.getByTestId('dialog-alert').click();
 *
 * Or wait for one-shot:
 *   const dialogPromise = page.waitForEvent('dialog');
 *   await page.getByTestId('dialog-prompt').click();
 *   const dialog = await dialogPromise;
 *   await dialog.accept('Jane Tester');
 */
export function DialogDemo() {
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [lastConfirm, setLastConfirm] = useState<string | null>(null);

  const fireAlert = () => {
    window.alert("Booking confirmed! Your PNR is ABC123.");
  };

  const fireConfirm = () => {
    const ok = window.confirm(
      "Cancel this booking? This action cannot be undone."
    );
    setLastConfirm(ok ? "accepted" : "dismissed");
  };

  const firePrompt = () => {
    const name = window.prompt(
      "Enter passenger name for upgrade:",
      "Jane Tester"
    );
    setLastPrompt(name ?? "cancelled");
  };

  const fireBeforeUnload = () => {
    // Set up a beforeunload handler — Playwright can listen via
    // page.on('dialog') with type 'beforeunload'.
    window.onbeforeunload = (e) => {
      e.preventDefault();
      e.returnValue = "You have unsaved booking changes. Leave anyway?";
      return e.returnValue;
    };
    // Show a small toast-like indicator
    setLastConfirm("beforeunload armed — try to navigate or refresh");
    setTimeout(() => {
      window.onbeforeunload = null;
    }, 5000);
  };

  return (
    <Card data-testid="dialog-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          JavaScript dialogs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Native browser dialogs that block the page. Use{" "}
          <code className="px-1 py-0.5 bg-muted rounded">page.on(&apos;dialog&apos;)</code>{" "}
          to intercept them in tests.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="dialog-snippet"
        >
{`page.on('dialog', async (dialog) => {
  console.log(dialog.type(), dialog.message());
  if (dialog.type() === 'prompt') {
    await dialog.accept('Jane Tester');
  } else {
    await dialog.accept();
  }
});
await page.getByTestId('dialog-alert').click();`}
        </pre>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="dialog-actions">
          <Button onClick={fireAlert} data-testid="dialog-alert" variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            Alert
          </Button>
          <Button onClick={fireConfirm} data-testid="dialog-confirm" variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Confirm
          </Button>
          <Button onClick={firePrompt} data-testid="dialog-prompt" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Prompt
          </Button>
          <Button onClick={fireBeforeUnload} data-testid="dialog-beforeunload" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            beforeunload
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-2 text-sm">
          {lastPrompt !== null && (
            <div
              className="flex items-center gap-2"
              data-testid="dialog-prompt-result"
            >
              <span className="text-muted-foreground">Last prompt response:</span>
              <Badge variant="outline">{lastPrompt}</Badge>
            </div>
          )}
          {lastConfirm !== null && (
            <div
              className="flex items-center gap-2"
              data-testid="dialog-confirm-result"
            >
              <span className="text-muted-foreground">Last confirm result:</span>
              <Badge variant="outline">{lastConfirm}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
