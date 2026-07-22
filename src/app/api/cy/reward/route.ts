import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cy/reward
 * Returns the user's daily reward status. The reward "matures" 60 seconds
 * after first claim — perfect for `cy.clock()` + `cy.tick()` testing.
 *
 * Cypress test pattern:
 *   cy.clock()
 *   cy.visit('/')
 *   cy.get('[data-cy=claim-reward]').click()  // claim now
 *   cy.tick(60_000)                            // advance 60s
 *   cy.get('[data-cy=claim-reward]').should('not.be.disabled')
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const claimedAt = url.searchParams.get("claimedAt");

  if (!claimedAt) {
    return NextResponse.json({
      data: {
        status: "available",
        lastClaimedAt: null,
        nextAvailableAt: null,
        cooldownMs: 60_000,
      },
    });
  }

  const claimed = parseInt(claimedAt, 10);
  const now = Date.now();
  const cooldownMs = 60_000;
  const nextAvailableAt = claimed + cooldownMs;
  const isReady = now >= nextAvailableAt;

  return NextResponse.json({
    data: {
      status: isReady ? "available" : "cooldown",
      lastClaimedAt: claimed,
      nextAvailableAt,
      cooldownMs,
      ready: isReady,
      remainingMs: Math.max(0, nextAvailableAt - now),
    },
  });
}
