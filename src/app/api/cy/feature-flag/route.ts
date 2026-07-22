import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cy/feature-flag?flag=<name>
 * Returns deterministic feature-flag state for conditional-testing practice.
 *
 * The flag value is derived from a hash of the flag name so it's stable
 * across requests within a single deploy — perfect for `cy.then()` conditionals.
 *
 *   cy.request('/api/cy/feature-flag?flag=new_dashboard').then((res) => {
 *     if (res.body.data.enabled) {
 *       cy.get('[data-cy=new-dashboard]').should('be.visible')
 *     } else {
 *       cy.get('[data-cy=old-dashboard]').should('be.visible')
 *     }
 *   })
 */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const KNOWN_FLAGS = ["new_dashboard", "beta_features", "dark_mode_v2", "checkout_v2"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flag = url.searchParams.get("flag") ?? "unknown";
  const seed = hashString(flag);
  // 3 possible states for richer conditional testing
  const states = ["on", "off", "beta"] as const;
  const state = states[seed % states.length];

  return NextResponse.json({
    data: {
      flag,
      enabled: state === "on",
      state,
      known: KNOWN_FLAGS.includes(flag),
    },
  });
}
