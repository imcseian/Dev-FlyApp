"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Frame, Send } from "lucide-react";

const IFRAME_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>pwr-iframe</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; background: #f4f4f5; color: #18181b; }
      h2 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; }
      #output { font-weight: bold; padding: 12px; background: white; border: 1px solid #e4e4e7; border-radius: 6px; min-height: 20px; word-break: break-word; }
      button { margin-top: 12px; padding: 8px 12px; border: none; background: #18181b; color: white; border-radius: 6px; cursor: pointer; font-size: 13px; }
      button:hover { background: #27272a; }
      .meta { font-size: 11px; color: #71717a; margin-top: 8px; }
    </style>
  </head>
  <body>
    <h2>Iframe content</h2>
    <div id="output" data-testid="iframe-output">No message yet.</div>
    <div class="meta">This is rendered inside an iframe. playwright needs frameLocator() to reach it.</div>
    <button id="ping" data-testid="iframe-ping-button">Ping parent</button>
    <script>
      window.addEventListener('message', function(e) {
        if (e.data && e.data.__pwr) {
          document.getElementById('output').textContent = e.data.payload;
        }
      });
      document.getElementById('ping').addEventListener('click', function() {
        window.parent.postMessage({ __pwr: true, payload: 'Ping from iframe at ' + new Date().toISOString() }, '*');
      });
    </script>
  </body>
</html>`;

/**
 * Playground module: iframe.
 *
 * Renders an iframe whose content is provided via `srcDoc` (same-origin by
 * default). Playwright tests must use `frameLocator()` or `page.frame()` to
 * interact with elements inside this iframe.
 */
export function IframeDemo() {
  const [message, setMessage] = useState("Hello from parent!");
  const [lastReceived, setLastReceived] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for messages from the iframe.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.__pwr) {
        setLastReceived(e.data.payload as string);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const sendMessage = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { __pwr: true, payload: message },
      "*"
    );
  };

  return (
    <Card data-testid="iframe-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Frame className="h-5 w-5" />
          iframe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The box below is a real iframe with its own document. Use{" "}
          <code className="px-1 py-0.5 bg-muted rounded">
            page.frameLocator(&apos;iframe[data-testid=pwr-iframe]&apos;)
          </code>{" "}
          to interact with elements inside it.
        </p>

        <div className="flex items-end gap-2">
          <div className="space-y-1 flex-1">
            <Label htmlFor="iframe-message-input" className="text-xs">
              Message to send into iframe
            </Label>
            <Input
              id="iframe-message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-testid="iframe-message-input"
            />
          </div>
          <Button onClick={sendMessage} data-testid="iframe-send-message">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>

        <div className="rounded-lg overflow-hidden border border-border">
          <iframe
            ref={iframeRef}
            title="Fly with Ram iframe demo"
            srcDoc={IFRAME_HTML}
            data-testid="pwr-iframe"
            className="w-full h-64"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Messages received FROM the iframe appear here:
          </p>
          <div
            className="p-3 bg-muted rounded-md text-sm font-mono min-h-[2.5rem] break-all"
            data-testid="iframe-received"
          >
            {lastReceived ?? "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
