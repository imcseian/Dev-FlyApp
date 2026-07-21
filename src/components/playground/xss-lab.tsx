"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ShieldAlert, Bug } from "lucide-react";

/**
 * Playground module: XSS lab.
 *
 * A self-contained demo (separate from the Product comment XSS). The user
 * types raw HTML, the component renders it via dangerouslySetInnerHTML.
 *
 * Includes copy-paste payload suggestions so testers can verify their
 * playwright XSS-detection tests actually fire.
 */

const PAYLOADS = [
  {
    label: "Alert box",
    code: `<img src=x onerror="alert('XSS!')">`,
  },
  {
    label: "Cookie theft (simulated)",
    code: `<img src=x onerror="document.getElementById('xss-output').textContent='cookie:'+document.cookie">`,
  },
  {
    label: "Link hijack",
    code: `<a href="javascript:alert('clicked')">Click me for free testing!</a>`,
  },
  {
    label: "Style injection",
    code: `<style>body{background:red}</style>Red background injected!`,
  },
];

export function XssLab() {
  const [input, setInput] = useState("");
  const [rendered, setRendered] = useState("");

  const handleRender = () => {
    setRendered(input);
  };

  const fillPayload = (code: string) => {
    setInput(code);
  };

  return (
    <Card
      data-testid="xss-lab"
      className="border-destructive/40"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          XSS lab (deliberate vulnerability)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Do NOT deploy this to production.</p>
            <p className="text-xs mt-1 opacity-90">
              This module intentionally renders user-supplied HTML via
              <code className="px-1 py-0.5 bg-destructive/20 rounded mx-1">
                dangerouslySetInnerHTML
              </code>
              so playwright security tests have a real XSS target.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="xss-input" className="text-sm">
            HTML payload
          </Label>
          <Input
            id="xss-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Try: <img src=x onerror="alert(1)">'
            data-testid="xss-input"
          />
        </div>

        <Button
          onClick={handleRender}
          disabled={!input.trim()}
          data-testid="xss-render-button"
        >
          <Bug className="h-4 w-4 mr-2" />
          Render (unsafe)
        </Button>

        {/* Payload suggestions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Quick payloads:
          </p>
          <div
            className="flex flex-wrap gap-2"
            data-testid="xss-payload-suggestions"
          >
            {PAYLOADS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => fillPayload(p.code)}
                data-testid={`xss-payload-${p.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Rendered output */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Rendered output:
            </p>
            <Badge variant="outline" className="text-xs">
              dangerouslySetInnerHTML
            </Badge>
          </div>
          <div
            className="p-4 border border-border rounded-md min-h-[6rem] prose prose-sm max-w-none"
            data-testid="xss-output"
          >
            {rendered ? (
              <span dangerouslySetInnerHTML={{ __html: rendered }} />
            ) : (
              <span className="text-muted-foreground text-sm">
                Rendered payload will appear here.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
