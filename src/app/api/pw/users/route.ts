import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/pw/users
 * Returns a list of users in a predictable shape designed for `cy.intercept()`:
 *
 *   cy.intercept('GET', '/api/pw/users', { fixture: 'users.json' }).as('getUsers')
 *   cy.get('[data-testid=fetch-users]').click()
 *   cy.wait('@getUsers')
 *   cy.get('[data-testid=user-row]').should('have.length', 3)
 *
 * Query params:
 *   - fail=true   → returns 500 with error shape (for testing error states)
 *   - delay=<ms>  → artificial latency
 *   - empty=true  → returns empty list (for testing empty states)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = url.searchParams.get("fail") === "true";
  const empty = url.searchParams.get("empty") === "true";
  const delayParam = url.searchParams.get("delay");
  if (delayParam) {
    const ms = Math.min(parseInt(delayParam, 10) || 0, 5000);
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }
  if (fail) {
    return NextResponse.json(
      { error: "Internal server error", code: "USERS_FETCH_FAILED" },
      { status: 500 }
    );
  }
  if (empty) {
    return NextResponse.json({ data: [], meta: { count: 0, total: 0 } });
  }

  const users = [
    { id: "u-1", name: "Alice Ashe", email: "alice@example.com", role: "admin" },
    { id: "u-2", name: "Bob Bean", email: "bob@example.com", role: "member" },
    { id: "u-3", name: "Cara Cole", email: "cara@example.com", role: "member" },
  ];
  return NextResponse.json({
    data: users,
    meta: { count: users.length, total: users.length },
  });
}
