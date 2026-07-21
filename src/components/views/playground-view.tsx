"use client";

import { AutoWaitDemo } from "@/components/playground/autowait-demo";
import { IframeDemo } from "@/components/playground/iframe-demo";
import { FileUploadDemo } from "@/components/playground/file-upload-demo";
import { DynamicDataDemo } from "@/components/playground/dynamic-data-demo";
import { A11yLab } from "@/components/playground/a11y-lab";
import { XssLab } from "@/components/playground/xss-lab";
import { VisualRegressionDemo } from "@/components/playground/visual-regression-demo";
import { InterceptLab } from "@/components/playground/intercept-lab";
import { ClockLab } from "@/components/playground/clock-lab";
import { StubLab } from "@/components/playground/stub-lab";
import { ShadowDomLab } from "@/components/playground/shadow-dom-lab";
import { SessionLab } from "@/components/playground/session-lab";
import { ConditionalLab } from "@/components/playground/conditional-lab";
import { FlaskConical } from "lucide-react";

/**
 * Playground view — composes every edge-case module into one scrollable page.
 * Each module is a Card with a stable data-testid attribute so Playwright tests can
 * scope their assertions.
 */
export function PlaygroundView() {
  return (
    <div className="space-y-6" data-testid="playground-view">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight flex items-center gap-2"
          data-testid="playground-title"
        >
          <FlaskConical className="h-7 w-7" />
          Playground
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          A curated collection of intentional edge cases for the Playwright
          Mastery Academy. Every module below is a deliberate test target —
          network intercepts, time control, stubs & spies, shadow DOM,
          sessions, conditional testing, plus the classic auto-waiting,
          iframes, file uploads, dynamic data, visual regressions,
          accessibility violations, and XSS.
        </p>
      </div>

      {/* Playwright-specific modules — front and center */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <InterceptLab />
        <ClockLab />
        <StubLab />
        <ShadowDomLab />
        <SessionLab />
        <ConditionalLab />
      </div>

      {/* Classic modules */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AutoWaitDemo />
        <IframeDemo />
        <FileUploadDemo />
        <DynamicDataDemo />
        <VisualRegressionDemo />
        <A11yLab />
      </div>

      {/* XSS lab gets its own full-width row to keep it visually distinct. */}
      <XssLab />
    </div>
  );
}
