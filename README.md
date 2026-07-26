# Fly with Ram — Playwright Test Automation Playground

A deliberately complex **Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui** flight-booking playground built for the **Playwright Mastery Academy** course. It's a flight booking + SaaS hybrid stuffed with intentional UI/UX, network, and architectural edge cases so every chapter has a real target to test.

> ⚠️ This app contains **deliberate vulnerabilities** (XSS via `dangerouslySetInnerHTML`, accessibility violations, etc.). Do NOT deploy it as a real booking site. It exists purely for Playwright practice.

---

## Table of Contents

1. [What's inside](#whats-inside)
2. [Playwright-specific design choices](#playwright-specific-design-choices)
3. [Quick start (local)](#quick-start-local)
4. [Push to GitHub](#push-to-github)
5. [Deploy to Vercel (free)](#deploy-to-vercel-free)
6. [Test accounts](#test-accounts)
7. [Playwright test targets](#playwright-test-targets)
8. [Project structure](#project-structure)
9. [Known limitations on serverless](#known-limitations-on-serverless)

---

## What's inside

- **Flight booking storefront**: home (search widget with airports, passengers, trip type), search results (filters + sort), flight detail (with seat map), booking (passenger details), payment (mock), my bookings (PNR + tickets)
- **SaaS dashboard**: profile (with avatar upload), settings (notifications, theme, danger zone), admin panel (bookings table + revenue stats)
- **Auth**: cookie + localStorage dual storage so Playwright `storageState` works either way
- **Dark mode** via `next-themes` + fully responsive (mobile slide-out drawer)
- **Frequent flyer miles** — every booking earns miles, displayed on the dashboard
- **13 dedicated playground modules**:
  - **Intercept lab** — predictable network routes for `cy.intercept()` / `page.route()` + `cy.wait('@alias')` / `waitForResponse()`
  - **Clock lab** — real `setTimeout`/`setInterval` timers for `cy.clock()` + `cy.tick()` / Playwright `page.clock()`
  - **Stub & spy lab** — exposes `window.CyRam.*` methods for `cy.stub()` + `cy.spy()`
  - **Shadow DOM lab** — web components with open + closed shadow roots for `.shadow()` / `frameLocator`
  - **Session lab** — 3 role-based quick-login buttons for `cy.session()` / `storageState`
  - **Conditional lab** — feature flags, A/B tests, and surprise boxes for `cy.then()` + `cy.request()` branching
  - **Auto-waiting** — delayed-reveal button, 2s async data load, artificial API latency
  - **iframe** — sandboxed iframe with bidirectional `postMessage`
  - **File upload** — drag-drop + `<input type="file">` posting to `/api/upload`
  - **Dynamic data** — live seat availability polling every 2s
  - **Visual regression** — V1/V2 variant toggle with completely different visuals
  - **a11y lab** — 6 intentional WCAG violations
  - **XSS lab** — `dangerouslySetInnerHTML` with copy-paste payloads

---

## Playwright-specific design choices

This app is built around [Playwright best practices](https://playwright.dev/docs/best-practices):

### 1. `data-testid` selectors everywhere
Every interactive element has a stable `data-testid` attribute — the [Playwright-recommended selector](https://playwright.dev/docs/locators). Avoids coupling tests to CSS classes or text content.



---

## License

MIT — do whatever you want with it. Just don't run it as a real booking site; the XSS and a11y violations are intentional.

---

## Credits

Built for the **Playwright Mastery Academy**. Every bug, vulnerability, and edge case in here is on purpose.
