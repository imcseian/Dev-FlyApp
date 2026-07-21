"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Layers } from "lucide-react";

/**
 * Playwright concept: `.shadow()` for reaching inside open/closed shadow roots.
 *
 * This module registers two custom elements:
 *   - <cy-ram-counter> (open shadow root)
 *   - <cy-ram-toggle> (closed shadow root — requires special handling)
 *
 * Playwright test patterns:
 *
 *   // Open shadow root — straightforward
 *   cy.get('cy-ram-counter').shadow().find('[data-testid=increment]').click()
 *   cy.get('cy-ram-counter').shadow().find('[data-testid=count]').should('contain', '1')
 *
 *   // Closed shadow root — must use { includeShadowDom: true } on selectBy*
 *   // or attach Playwright's closed-shadow-dom plugin.
 */

// --- Web Component definitions (registered only on the client) ---
// Classes that extend HTMLElement must NOT be evaluated on the server (SSR),
// because HTMLElement is undefined there. We wrap everything inside a
// registerComponents() function that runs only in the browser.

let registered = false;

function registerComponents() {
  if (registered) return;
  if (typeof window === "undefined") return;

  class CyRamCounter extends HTMLElement {
    private count = 0;
    private shadow: ShadowRoot;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();
    }

    private render() {
      this.shadow.innerHTML = `
        <style>
          :host { display: block; }
          .counter { display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid #e4e4e7; border-radius: 8px; font-family: system-ui, sans-serif; }
          button { padding: 6px 12px; border: 1px solid #e4e4e7; background: #fff; cursor: pointer; border-radius: 4px; font-size: 14px; }
          button:hover { background: #f4f4f5; }
          .count { font-weight: bold; min-width: 2ch; text-align: center; font-size: 18px; }
          .label { font-size: 12px; color: #71717a; margin-bottom: 8px; display: block; }
        </style>
        <span class="label">Shadow DOM counter (open root)</span>
        <div class="counter">
          <button data-testid="shadow-decrement">-</button>
          <span class="count" data-testid="shadow-count">0</span>
          <button data-testid="shadow-increment">+</button>
        </div>
      `;
      const inc = this.shadow.querySelector('[data-testid=shadow-increment]');
      const dec = this.shadow.querySelector('[data-testid=shadow-decrement]');
      const count = this.shadow.querySelector('[data-testid=shadow-count]');
      inc?.addEventListener("click", () => {
        this.count++;
        if (count) count.textContent = String(this.count);
      });
      dec?.addEventListener("click", () => {
        this.count--;
        if (count) count.textContent = String(this.count);
      });
    }
  }

  class CyRamToggle extends HTMLElement {
    private on = false;
    private shadow: ShadowRoot;

    constructor() {
      super();
      // CLOSED shadow root — harder for Playwright to reach.
      this.shadow = this.attachShadow({ mode: "closed" });
      this.render();
    }

    private render() {
      this.shadow.innerHTML = `
        <style>
          :host { display: block; }
          .toggle-wrap { padding: 12px; border: 1px solid #e4e4e7; border-radius: 8px; font-family: system-ui, sans-serif; }
          .label { font-size: 12px; color: #71717a; margin-bottom: 8px; display: block; }
          button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; background: #18181b; color: white; }
          button.on { background: #16a34a; }
          .state { font-size: 12px; color: #71717a; margin-left: 8px; }
        </style>
        <span class="label">Shadow DOM toggle (closed root — use includeShadowDom)</span>
        <div class="toggle-wrap">
          <button data-testid="shadow-toggle-btn">Toggle</button>
          <span class="state" data-testid="shadow-toggle-state">Off</span>
        </div>
      `;
      const btn = this.shadow.querySelector('[data-testid=shadow-toggle-btn]');
      const state = this.shadow.querySelector('[data-testid=shadow-toggle-state]');
      btn?.addEventListener("click", () => {
        this.on = !this.on;
        if (btn) {
          btn.classList.toggle("on", this.on);
          btn.textContent = this.on ? "On — click to turn off" : "Toggle";
        }
        if (state) state.textContent = this.on ? "On" : "Off";
      });
    }
  }

  if (!customElements.get("cy-ram-counter")) {
    customElements.define("cy-ram-counter", CyRamCounter);
  }
  if (!customElements.get("cy-ram-toggle")) {
    customElements.define("cy-ram-toggle", CyRamToggle);
  }
  registered = true;
}

export function ShadowDomLab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    registerComponents();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Card data-testid="shadow-dom-lab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Boxes className="h-5 w-5" />
          Shadow DOM lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Two custom elements with shadow roots. Reach inside with{" "}
          <code className="px-1 py-0.5 bg-muted rounded">.shadow()</code>.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="shadow-snippet"
        >
{`// Open shadow root
cy.get('cy-ram-counter')
  .shadow()
  .find('[data-testid=shadow-increment]')
  .click()
cy.get('cy-ram-counter')
  .shadow()
  .find('[data-testid=shadow-count]')
  .should('contain', '1')

// Closed shadow root — includeShadowDom
cy.get('cy-ram-toggle')
  .shadow({ includeShadowDom: true })
  .find('[data-testid=shadow-toggle-btn]')
  .click()`}
        </pre>

        {mounted ? (
          <div className="space-y-3" data-testid="shadow-components">
            <div data-testid="shadow-counter-host">
              <cy-ram-counter></cy-ram-counter>
            </div>
            <div data-testid="shadow-toggle-host">
              <cy-ram-toggle></cy-ram-toggle>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading web components...</p>
        )}

        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
          <Layers className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p>
              <strong>Open root</strong> (<code>cy-ram-counter</code>): Playwright
              can reach inside with <code>.shadow().find()</code>.
            </p>
            <p className="mt-1">
              <strong>Closed root</strong> (<code>cy-ram-toggle</code>): Use{" "}
              <code>{`.shadow({ includeShadowDom: true })`}</code> or install the
              <code> playwright-shadow-dom</code> plugin.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
