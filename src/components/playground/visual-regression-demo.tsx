"use client";

import { useAppStore } from "@/stores/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, GitCompare } from "lucide-react";

/**
 * Playground module: Visual regression.
 *
 * Two visual variants toggled by a global store flag. playwright visual
 * regression tests can capture screenshots of each variant and assert
 * pixel-level differences.
 *
 * The toggle is global so other components can also react to the variant
 * (we don&apos;t do that here, but it&apos;s possible).
 */
export function VisualRegressionDemo() {
  const variant = useAppStore((s) => s.visualVariant);
  const toggle = useAppStore((s) => s.toggleVisualVariant);

  return (
    <Card data-testid="visual-regression-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Visual regression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Toggle between two visual variants and screenshot each for
            visual-regression testing.
          </p>
          <Badge
            variant={variant === "v1" ? "default" : "secondary"}
            data-testid="visual-regression-variant"
          >
            {variant}
          </Badge>
        </div>

        <Button
          onClick={toggle}
          variant="outline"
          data-testid="visual-regression-toggle"
        >
          <Eye className="h-4 w-4 mr-2" />
          Switch to {variant === "v1" ? "v2" : "v1"}
        </Button>

        {/* v1 */}
        {variant === "v1" && (
          <div
            className="p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            data-testid="visual-regression-canvas-v1"
          >
            <h3 className="text-2xl font-bold mb-2">Variant 1</h3>
            <p className="opacity-90">
              Emerald-to-teal gradient. Rounded corners. Big bold heading.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="h-12 w-12 rounded-full bg-white/30" />
              <div className="h-12 w-12 rounded-full bg-white/20" />
              <div className="h-12 w-12 rounded-full bg-white/10" />
            </div>
          </div>
        )}

        {/* v2 */}
        {variant === "v2" && (
          <div
            className="p-6 rounded-sm bg-gradient-to-br from-rose-600 to-orange-500 text-white border-2 border-white/20"
            data-testid="visual-regression-canvas-v2"
          >
            <h3 className="text-xl font-light mb-2 tracking-wide">
              VARIANT 2
            </h3>
            <p className="opacity-90 text-sm">
              Rose-to-orange gradient. Sharp corners. Light, wide heading.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="h-12 w-12 rounded-none bg-white/40 rotate-45" />
              <div className="h-12 w-12 rounded-none bg-white/30 rotate-45" />
              <div className="h-12 w-12 rounded-none bg-white/20 rotate-45" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
