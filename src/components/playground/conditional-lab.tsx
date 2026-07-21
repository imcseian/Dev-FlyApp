"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Shuffle, Sparkles } from "lucide-react";

/**
 * Playwright concept: conditional testing via `cy.then()` + `cy.request()`.
 *
 * Playwright doesn't have native `if/else` for assertions — the recommended
 * pattern is to query backend state first, then branch inside `cy.then()`.
 *
 *   cy.request('/api/pw/feature-flag?flag=new_dashboard').then((res) => {
 *     if (res.body.data.enabled) {
 *       cy.get('[data-testid=conditional-dashboard-new]').should('be.visible')
 *     } else {
 *       cy.get('[data-testid=conditional-dashboard-old]').should('be.visible')
 *     }
 *   })
 *
 * This module has three sections:
 *   1. Feature flag — deterministic per-flag-name state from the backend
 *   2. A/B test — server picks A or B; tests must branch
 *   3. Surprise box — random prize; tests can't predict without asking
 */

interface FlagResponse {
  data: { flag: string; enabled: boolean; state: "on" | "off" | "beta"; known: boolean };
}

const FLAG_OPTIONS = [
  { key: "new_dashboard", label: "new_dashboard" },
  { key: "beta_features", label: "beta_features" },
  { key: "dark_mode_v2", label: "dark_mode_v2" },
  { key: "checkout_v2", label: "checkout_v2" },
  { key: "unknown_flag", label: "unknown_flag" },
];

export function ConditionalLab() {
  const [flag, setFlag] = useState<FlagResponse["data"] | null>(null);
  const [loadingFlag, setLoadingFlag] = useState<string | null>(null);
  const [abVariant, setAbVariant] = useState<"A" | "B" | null>(null);
  const [surprise, setSurprise] = useState<string | null>(null);

  const fetchFlag = async (flagName: string) => {
    setLoadingFlag(flagName);
    setFlag(null);
    try {
      const res = await fetch(
        `/api/pw/feature-flag?flag=${encodeURIComponent(flagName)}`
      );
      const data: FlagResponse = await res.json();
      setFlag(data.data);
    } finally {
      setLoadingFlag(null);
    }
  };

  const fetchAbVariant = async () => {
    setAbVariant(null);
    await new Promise((r) => setTimeout(r, 300));
    // Deterministic-ish: based on current second
    const variant = (Date.now() % 2 === 0 ? "A" : "B") as "A" | "B";
    setAbVariant(variant);
  };

  const openSurprise = () => {
    const prizes = ["🎁 Toy", "💎 Gem", "⭐ Star", "🎀 Ribbon", "🚀 Rocket"];
    setSurprise(prizes[Math.floor(Math.random() * prizes.length)]);
  };

  return (
    <Card data-testid="conditional-lab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Conditional lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Three flavors of conditional UI. Playwright can&apos;t <code>if/else</code>{" "}
          on assertions — use <code className="px-1 py-0.5 bg-muted rounded">cy.request()</code>{" "}
          + <code className="px-1 py-0.5 bg-muted rounded">cy.then()</code> to
          branch.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="conditional-snippet"
        >
{`cy.request('/api/pw/feature-flag?flag=new_dashboard')
  .then((res) => {
    if (res.body.data.enabled) {
      cy.get('[data-testid=conditional-dashboard-new]').should('be.visible')
    } else {
      cy.get('[data-testid=conditional-dashboard-old]').should('be.visible')
    }
  })`}
        </pre>

        {/* Feature flag */}
        <div
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="conditional-flag-section"
        >
          <p className="font-medium flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Feature flags (deterministic)
          </p>
          <p className="text-xs text-muted-foreground">
            State is hashed from the flag name — same name always returns same
            state in a deploy. Test by branching on the response.
          </p>
          <div
            className="flex flex-wrap gap-2"
            data-testid="conditional-flag-buttons"
          >
            {FLAG_OPTIONS.map((f) => (
              <Button
                key={f.key}
                variant="outline"
                size="sm"
                onClick={() => fetchFlag(f.key)}
                disabled={loadingFlag !== null}
                data-testid={`conditional-flag-${f.key}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
          {flag && (
            <div
              className="flex items-center gap-2 text-sm"
              data-testid="conditional-flag-result"
            >
              <span className="text-muted-foreground">State:</span>
              <Badge
                variant={flag.state === "on" ? "default" : flag.state === "beta" ? "secondary" : "outline"}
                data-testid="conditional-flag-state"
              >
                {flag.state}
              </Badge>
              <span className="text-xs text-muted-foreground">
                enabled={String(flag.enabled)}
              </span>
            </div>
          )}
          {flag && (
            <div className="text-xs text-muted-foreground" data-testid="conditional-flag-dashboard">
              {flag.enabled ? (
                <span data-testid="conditional-dashboard-new">
                  🆕 Showing <strong>NEW dashboard</strong> (flag is on)
                </span>
              ) : flag.state === "beta" ? (
                <span data-testid="conditional-dashboard-beta">
                  🧪 Showing <strong>BETA dashboard</strong> (flag is in beta)
                </span>
              ) : (
                <span data-testid="conditional-dashboard-old">
                  📦 Showing <strong>OLD dashboard</strong> (flag is off)
                </span>
              )}
            </div>
          )}
        </div>

        {/* A/B test */}
        <div
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="conditional-ab-section"
        >
          <p className="font-medium flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            A/B test (server-picked)
          </p>
          <p className="text-xs text-muted-foreground">
            Backend picks variant A or B. Your test must request the variant
            first, then assert on the right branch.
          </p>
          <Button
            onClick={fetchAbVariant}
            variant="outline"
            size="sm"
            data-testid="conditional-ab-fetch"
          >
            Fetch my variant
          </Button>
          {abVariant && (
            <div
              className="flex items-center gap-2 text-sm"
              data-testid="conditional-ab-result"
            >
              <span className="text-muted-foreground">Variant:</span>
              <Badge variant="default" data-testid="conditional-ab-variant">
                {abVariant}
              </Badge>
              {abVariant === "A" ? (
                <span data-testid="conditional-ab-content-a">
                  Variant A content: blue hero banner
                </span>
              ) : (
                <span data-testid="conditional-ab-content-b">
                  Variant B content: green hero banner
                </span>
              )}
            </div>
          )}
        </div>

        {/* Surprise box */}
        <div
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="conditional-surprise-section"
        >
          <p className="font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Surprise box (random)
          </p>
          <p className="text-xs text-muted-foreground">
            Truly random — your test can&apos;t predict without opening the box.
            Use <code>cy.then()</code> + <code>cy.wrap()</code> to handle
            whatever appears.
          </p>
          <Button
            onClick={openSurprise}
            variant="outline"
            size="sm"
            data-testid="conditional-surprise-open"
          >
            Open box
          </Button>
          {surprise && (
            <div
              className="text-2xl"
              data-testid="conditional-surprise-result"
            >
              {surprise}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
