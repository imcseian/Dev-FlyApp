"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye } from "lucide-react";

/**
 * Playground module: A11y violations lab.
 *
 * Deliberately broken accessibility patterns so playwright + axe-core tests
 * have something to find. Each card labels the violation on purpose.
 */
export function A11yLab() {
  return (
    <Card data-testid="a11y-lab" className="border-amber-500/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          Accessibility lab (intentional violations)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Every block below has a deliberately broken accessibility pattern
          so axe-core / playwright a11y tests have something to report. Do
          NOT fix these — they are the test targets.
        </p>

        {/* 1. Missing alt text */}
        <section
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="a11y-violation-1"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Violation #1</Badge>
            <span className="text-sm font-medium">Missing alt attribute</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Decorative image without alt=&quot;&quot; or descriptive text.
          </p>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&h=200&fit=crop"
            className="w-32 h-32 object-cover rounded-md"
          />
        </section>

        {/* 2. Low contrast text */}
        <section
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="a11y-violation-2"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Violation #2</Badge>
            <span className="text-sm font-medium">Low color contrast</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Light gray text on a white-ish background. Fails WCAG AA.
          </p>
          <div
            className="p-3 rounded-md"
            style={{ background: "#f9f9f9", color: "#cccccc" }}
            data-testid="a11y-low-contrast-text"
          >
            This text is intentionally low contrast. Hard to read, easy for
            axe-core to flag.
          </div>
        </section>

        {/* 3. Empty button label */}
        <section
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="a11y-violation-3"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Violation #3</Badge>
            <span className="text-sm font-medium">Empty button label</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Icon-only button without an aria-label.
          </p>
          <button
            type="button"
            data-testid="a11y-empty-button"
            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border"
          >
            <Eye className="h-4 w-4" />
          </button>
        </section>

        {/* 4. Input without label */}
        <section
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="a11y-violation-4"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Violation #4</Badge>
            <span className="text-sm font-medium">Input without label</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Text input with no associated &lt;label&gt; or aria-label.
          </p>
          <input
            type="text"
            placeholder="no label here"
            data-testid="a11y-unlabeled-input"
            className="w-full h-9 px-3 rounded-md border border-border bg-background"
          />
        </section>

        {/* 5. Heading hierarchy skip */}
        <section
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="a11y-violation-5"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Violation #5</Badge>
            <span className="text-sm font-medium">Skipped heading level</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Jumps from h2 to h4 — skips h3. Breaks screen-reader navigation.
          </p>
          <h2 className="text-lg font-bold">h2: Section title</h2>
          <h4 className="text-base font-semibold">
            h4: Skipped h3 — directly under h2
          </h4>
        </section>

        {/* 6. Clickable div (non-semantic button) */}
        <section
          className="space-y-2 p-4 border border-border rounded-lg"
          data-testid="a11y-violation-6"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Violation #6</Badge>
            <span className="text-sm font-medium">
              Clickable &lt;div&gt; instead of &lt;button&gt;
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            No role, no keyboard handler, no focus ring.
          </p>
          <div
            onClick={() => alert("clicked")}
            style={{ cursor: "pointer" }}
            className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground"
            data-testid="a11y-clickable-div"
          >
            Click me (broken)
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
