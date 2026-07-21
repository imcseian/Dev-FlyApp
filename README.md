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

```js
await page.getByTestId('search-submit').click();
await expect(page.getByTestId('flight-card-f-001')).toBeVisible();
```

### 2. Predictable API response shapes
All `/api/pw/*` endpoints return:
```json
{
  "data": [...],
  "meta": { "count": N }
}
```
Perfect for `page.route()` stubs:

```js
await page.route('**/api/pw/users**', async (route) => {
  await route.fulfill({ path: 'fixtures/users.json' });
});
```

### 3. `?fail=true` and `?delay=ms` query params
Every `/api/pw/*` endpoint supports:
- `?fail=true` — returns a 500/503 error (for testing error states)
- `?delay=500` — adds artificial latency (for testing loading states)
- `?empty=true` — returns empty data (for testing empty states)

### 4. Real timers (not Promise-based)
The Clock lab uses `setTimeout` and `setInterval` — the actual browser APIs that Playwright's `page.clock()` overrides.

### 5. Exposed globals for stubbing
The Stub lab exposes `window.CyRam` with four methods (`trackEvent`, `analytics`, `logMessage`, `webhook`). Playwright can stub or spy any of them via `page.evaluate()`.

### 6. Real web components with shadow roots
The Shadow DOM lab registers two custom elements:
- `<cy-ram-counter>` — open shadow root (use `locator.shadow()`)
- `<cy-ram-toggle>` — closed shadow root

### 7. `storageState`-friendly login
Three role buttons in the Session lab let you parametrize tests:

```js
['guest', 'member', 'admin'].forEach((role) => {
  test.describe(`As ${role}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.getByTestId(`session-login-${role}`).click();
    });
    test('sees the right UI', async ({ page }) => { ... });
  });
});
```

### 8. Conditional testing via backend query
The Conditional lab demonstrates the Playwright-recommended pattern for `if/else`:

```js
const res = await page.request.get('/api/pw/feature-flag?flag=new_dashboard');
const { data } = await res.json();
if (data.enabled) {
  await expect(page.getByTestId('conditional-dashboard-new')).toBeVisible();
} else {
  await expect(page.getByTestId('conditional-dashboard-old')).toBeVisible();
}
```

---

## Quick start (local)

### Prerequisites

- **Node.js 18+** (Node 20 recommended)
- **npm** / **pnpm** / **yarn** / **bun** — any works
- **Playwright** installed in your test project (separate repo)

### Install & run

```bash
# 1. Extract the archive
tar -xzf fly-with-ram.tar.gz
cd fly-with-ram

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env

# 4. Run the dev server
npm run dev

# 5. Open http://localhost:3000
```

### Set up Playwright (separate project)

```bash
mkdir fly-with-ram-tests && cd fly-with-ram-tests
npm init -y
npm install -D @playwright/test
npx playwright install
```

In `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

Write your first test in `tests/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('hero-title')).toContainText('Fly with Ram');
});
```

---

## Push to GitHub

### Step 1 — Create a new repo on GitHub

1. Go to <https://github.com/new>
2. **Repository name**: `fly-with-ram` (or whatever you like)
3. Set to **Public** or **Private** — your choice
4. **DO NOT** check "Add a README" / "Add .gitignore" / "Choose a license"
5. Click **Create repository**
6. Copy the repo URL

### Step 2 — Initialize git and push

```bash
git init
git add .
git commit -m "Initial commit: Fly with Ram playground"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fly-with-ram.git
git push -u origin main
```

If you hit `! [rejected] main -> main (fetch first)`:

```bash
git push -u origin main --force
```

---

## Deploy to Vercel (free)

### Step 1 — Sign up for Vercel

1. Go to <https://vercel.com/signup>
2. Click **Continue with GitHub**
3. Authorize Vercel

### Step 2 — Import the repo

1. Go to <https://vercel.com/new>
2. Find your `fly-with-ram` repo
3. Click **Import**

### Step 3 — Configure (defaults are fine)

| Setting            | Value                                |
| ------------------ | ------------------------------------ |
| Framework Preset   | Next.js (auto-detected)              |
| Root Directory     | `./` (default)                       |
| Build Command      | `next build` (default)               |
| Output Directory   | `.next` (default)                    |
| Install Command    | `npm install` (default)              |
| Environment Variables | (none required)                  |

Click **Deploy**.

### Step 4 — Get your URL

Vercel gives you:
```
https://fly-with-ram-<your-username>.vercel.app
```

Point your Playwright `baseURL` at this URL for production-smoke tests:

```ts
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
});
```

```bash
BASE_URL=https://fly-with-ram-<your-username>.vercel.app npx playwright test
```

---

## Test accounts

Mock auth accepts **any valid email + any password ≥ 4 characters**. Special behavior:

| Email pattern                       | Role   | Example                           |
| ----------------------------------- | ------ | --------------------------------- |
| `*@admin.flyram.dev`                | admin  | `root@admin.flyram.dev` / `admin1234` |
| anything else                       | user   | `ram@tester.dev` / `test1234`     |

For `storageState` practice, use the **Session lab** quick-login buttons:

| Button                    | Email                    | Role   |
| ------------------------- | ------------------------ | ------ |
| `session-login-guest`     | (signs out)              | guest  |
| `session-login-member`    | `member@flyram.dev`      | user   |
| `session-login-admin`     | `root@admin.flyram.dev`  | admin  |

---

## Playwright test targets

Every interactive element has a stable `data-testid` attribute. Highlights:

### Flight booking flow
- `search-widget`, `trip-type-oneway`, `trip-type-roundtrip`, `search-origin`, `search-destination`, `swap-airports`, `search-passengers`, `search-submit`
- `popular-route-JFK-LAX`, `popular-route-LHR-JFK`, `popular-route-SFO-NRT`, `popular-route-DXB-SIN`, `popular-route-DEL-BOM`
- `featured-grid`, `featured-skeleton-0..3`
- `flight-card-{id}`, `flight-number-{id}`, `flight-route-{id}`, `flight-price-{id}`, `flight-select-{id}`
- `search-bar`, `search-origin-select`, `search-destination-select`, `search-swap`, `search-passengers-select`
- `search-query-input`, `search-sort`, `search-cabin`, `search-airline`, `search-stops`, `search-min-price`, `search-max-price`, `search-clear-filters`
- `search-results-count`, `search-route-badge`, `search-grid`, `search-empty`
- `flight-detail-back`, `flight-detail-card`, `flight-detail-number`, `flight-detail-origin`, `flight-detail-destination`, `flight-detail-price`, `flight-detail-cabin`, `flight-detail-book`
- `seat-map-card`, `seat-map`, `seat-grid`, `seat-{row}{col}` (e.g. `seat-1A`, `seat-3D`), `seat-legend`, `selected-seats`
- `booking-back`, `booking-title`, `booking-flights-card`, `booking-flight-{id}`, `booking-remove-flight-{id}`, `booking-passengers-card`, `passenger-{idx}`, `pax-{idx}-type`, `pax-{idx}-first`, `pax-{idx}-last`, `add-passenger`, `remove-passenger-{idx}`
- `booking-summary`, `booking-subtotal`, `booking-taxes`, `booking-total`, `booking-continue`, `booking-validation`, `booking-add-more`, `booking-empty`
- `payment-back`, `payment-title`, `payment-contact-card`, `payment-email`, `payment-name`, `payment-method-card`, `payment-method`, `payment-card`, `payment-expiry`, `payment-cvc`, `payment-summary`, `payment-total`, `payment-submit`
- `payment-success`, `booking-pnr`, `success-book-another`, `success-view-bookings`, `payment-error`, `payment-retry`
- `my-bookings-title`, `my-bookings-list`, `booking-card-{id}`, `booking-pnr-{id}`, `booking-status-{id}`, `booking-total-{id}`, `booking-ticket-{id}-{i}`, `my-bookings-empty`, `my-bookings-search`

### Auth + Dashboard
- `login-form`, `login-email-input`, `login-password-input`, `login-submit`, `login-demo-user`, `login-demo-admin`, `login-help`
- `dashboard-title`, `dashboard-role`, `dashboard-miles`, `dashboard-stat-bookings`, `dashboard-stat-upcoming`, `dashboard-stat-spent`, `dashboard-action-search`, `dashboard-action-my-bookings`, `dashboard-action-profile`, `dashboard-action-settings`, `dashboard-action-admin`, `dashboard-upcoming`, `dashboard-booking-{id}`
- `profile-avatar`, `profile-avatar-input`, `profile-name-input`, `profile-save`, `profile-avatar-url`
- `settings-notifications-card`, `pref-marketing`, `pref-product`, `pref-security`, `settings-localization-card`, `pref-language`, `pref-timezone`, `settings-appearance-card`, `settings-dark-mode`, `settings-danger-card`, `settings-logout`, `settings-delete-trigger`, `settings-delete-confirm`
- `admin-stat-bookings`, `admin-stat-customers`, `admin-stat-revenue`, `admin-bookings-table`, `admin-booking-row-{id}`

### Playground modules
- **Intercept lab**: `intercept-lab`, `intercept-fetch-users`, `intercept-fetch-posts`, `intercept-fetch-stats`, `intercept-fail-users`, `intercept-fail-posts`, `intercept-user-row`, `intercept-post-row`, `intercept-stat-users`, `intercept-stat-posts`, `intercept-stat-views`, `intercept-stat-conv`, `intercept-error`, `intercept-last-call`, `intercept-snippet`
- **Clock lab**: `clock-lab`, `clock-display`, `clock-toggle-live`, `clock-countdown`, `clock-start-countdown`, `clock-reset-countdown`, `clock-reward-status`, `clock-claim-reward`, `clock-reward-ready`, `clock-reward-cooldown`, `clock-reset-reward`
- **Stub lab**: `stub-lab`, `stub-track-click`, `stub-analytics`, `stub-log`, `stub-webhook`, `stub-call-log`, `stub-call-log-entry`, `stub-call-log-empty`, `stub-clear-log`, `stub-snippet`
- **Shadow DOM lab**: `shadow-dom-lab`, `shadow-counter-host`, `shadow-toggle-host`, `shadow-increment`, `shadow-decrement`, `shadow-count`, `shadow-toggle-btn`, `shadow-toggle-state`, `shadow-snippet`
- **Session lab**: `session-lab`, `session-login-guest`, `session-login-member`, `session-login-admin`, `session-current`, `session-current-role`, `session-desc-guest`, `session-desc-member`, `session-desc-admin`, `session-go-dashboard`, `session-snippet`
- **Conditional lab**: `conditional-lab`, `conditional-flag-new_dashboard`, `conditional-flag-beta_features`, `conditional-flag-dark_mode_v2`, `conditional-flag-checkout_v2`, `conditional-flag-unknown_flag`, `conditional-flag-result`, `conditional-flag-state`, `conditional-dashboard-new`, `conditional-dashboard-beta`, `conditional-dashboard-old`, `conditional-ab-fetch`, `conditional-ab-variant`, `conditional-ab-content-a`, `conditional-ab-content-b`, `conditional-surprise-open`, `conditional-surprise-result`, `conditional-snippet`
- **Auto-wait**: `autowait-start-reveal`, `autowait-secret-button`, `autowait-load-data`, `autowait-data-result`
- **iframe**: `pwr-iframe`, `iframe-output`, `iframe-ping-button`, `iframe-message-input`, `iframe-send-message`, `iframe-received`
- **File upload**: `file-upload-input`, `file-drop-zone`, `file-upload-success`, `file-upload-error`
- **Dynamic data**: `dynamic-data-list`, `dynamic-data-toggle`, `stock-value-{slug}` (kept for back-compat — actually flight IDs)
- **Visual regression**: `visual-regression-toggle`, `visual-regression-canvas-v1`, `visual-regression-canvas-v2`
- **a11y lab**: `a11y-lab`, `a11y-violation-1` through `a11y-violation-6`
- **XSS lab**: `xss-lab`, `xss-input`, `xss-render-button`, `xss-output`, `xss-payload-alert-box`, `xss-payload-cookie-theft-simulated`, `xss-payload-link-hijack`, `xss-payload-style-injection`

### Global
- `site-header`, `site-footer`, `main-content`, `app-root`
- `logo-link`, `logo-badge`, `theme-toggle`, `booking-button`, `booking-count-badge`, `auth-button`
- `nav-search`, `nav-my-bookings`, `nav-dashboard`, `nav-playground` (desktop)
- `mobile-menu-button`, `mobile-drawer` (mobile)
- `footer-hidden-marker`, `footer-copyright`, `newsletter-form`

### Playwright-specific API routes
| Method | Route                            | Returns                              |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/api/pw/users`                  | `{ data: User[], meta: { count } }` |
| GET    | `/api/pw/users?fail=true`        | 500 error                            |
| GET    | `/api/pw/users?delay=500`        | 500ms delayed success                |
| GET    | `/api/pw/users?empty=true`       | `{ data: [], meta: { count: 0 } }`   |
| GET    | `/api/pw/posts`                  | `{ data: Post[], meta: { count } }`  |
| GET    | `/api/pw/stats`                  | `{ data: { users, posts, views, conversion } }` |
| GET    | `/api/pw/reward`                 | `{ data: { status, lastClaimedAt, nextAvailableAt, cooldownMs } }` |
| GET    | `/api/pw/reward?claimedAt=<ms>`  | Reward state after claim             |
| GET    | `/api/pw/feature-flag?flag=<n>`  | `{ data: { flag, enabled, state, known } }` |

### Flight booking API routes
| Method | Route                            | Returns                              |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/api/flights`                   | `{ count, flights: Flight[] }` — supports origin, destination, maxStops, airline, cabinClass, minPrice, maxPrice, sort, q, delay params |
| GET    | `/api/seats`                     | `{ seats, serverTime }` — live seat availability |
| POST   | `/api/booking`                   | Creates a booking with PNR (1/8 random fail) |
| GET    | `/api/bookings`                  | `{ bookings }` — optional `?userEmail=` filter |
| POST   | `/api/comments`                  | Reviews with rating (XSS lab) |
| GET    | `/api/comments?flightId=<route>` | Reviews for a route (e.g. `JFK-LAX`) |
| POST   | `/api/auth/login`                | Sets `fwr_auth` cookie |
| POST   | `/api/auth/logout`               | Clears cookie |
| GET    | `/api/auth/me`                   | Reads cookie, returns user |
| POST   | `/api/upload`                    | File upload (multipart) |
| POST   | `/api/newsletter`                | Newsletter signup |

---

## Project structure

```
fly-with-ram/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (ThemeProvider, Toaster)
│   │   ├── page.tsx                # The only route — client-side view router
│   │   ├── globals.css
│   │   └── api/                    # Mock API routes
│   │       ├── pw/                            # Playwright-specific endpoints
│   │       │   ├── users/route.ts
│   │       │   ├── posts/route.ts
│   │       │   ├── stats/route.ts
│   │       │   ├── reward/route.ts
│   │       │   └── feature-flag/route.ts
│   │       ├── flights/route.ts              # Flight search + filter
│   │       ├── booking/route.ts              # Create booking (with PNR)
│   │       ├── bookings/route.ts             # List bookings
│   │       ├── seats/route.ts                # Live seat availability
│   │       ├── auth/{login,logout,me}/...
│   │       ├── comments/route.ts             # Reviews (XSS lab)
│   │       ├── newsletter/route.ts
│   │       └── upload/route.ts
│   ├── components/
│   │   ├── layout/                 # Header, Footer, ThemeToggle, Logo
│   │   ├── providers/              # ThemeProvider, AuthBoot
│   │   ├── views/                  # 11 view components
│   │   │   ├── home-view.tsx              # Search widget + popular routes + featured flights
│   │   │   ├── search-view.tsx            # Filterable flight results
│   │   │   ├── flight-detail-view.tsx     # Flight info + seat map + reviews
│   │   │   ├── booking-view.tsx           # Passenger details + summary
│   │   │   ├── payment-view.tsx           # Payment form + PNR success
│   │   │   ├── my-bookings-view.tsx       # Booking history with PNRs
│   │   │   ├── dashboard-view.tsx         # Stats + quick actions + upcoming
│   │   │   ├── admin-view.tsx             # All bookings table
│   │   │   ├── login-view.tsx
│   │   │   ├── profile-view.tsx
│   │   │   ├── settings-view.tsx
│   │   │   └── playground-view.tsx
│   │   ├── playground/             # 13 edge-case modules
│   │   └── ui/                     # shadcn/ui
│   ├── stores/                     # 3 Zustand stores (app, booking, auth)
│   ├── lib/                        # types, catalog (flights/airports/airlines), store
│   └── hooks/                      # use-toast, use-mobile
├── public/
│   └── logo.svg                    # Sky-blue airplane favicon
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.mjs
├── components.json
└── package.json
```

---

## Known limitations on serverless

This app uses **in-memory stores** (`src/lib/store.ts`) for bookings, comments, and users. On Vercel's serverless platform:

- Each API route may run in a **separate function instance**
- State is **NOT shared** across instances
- A cold start **resets** all in-memory state

**What this means in practice:**
- ✅ Login works (cookie is stateless — `/api/auth/me` decodes the cookie, no DB lookup)
- ✅ Booking flow works (booking store is in client localStorage)
- ✅ Newsletter signup works (stateless POST)
- ✅ File upload works (returns metadata only)
- ✅ All `/api/pw/*` endpoints work (stateless — each returns fresh data)
- ⚠️ Bookings placed via `/api/booking` may not appear in `/api/bookings` immediately (different instances)
- ⚠️ Reviews posted may not appear in the review list (different instances)
- ⚠️ After a cold start, all previous bookings/reviews are gone

**For a playground this is fine** — even useful for testing flaky scenarios. If you want persistent state on Vercel, swap the in-memory store for:
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (Redis-compatible, free tier)
- [Supabase](https://supabase.com) Postgres (free tier)
- [Neon](https://neon.tech) Postgres (free tier)

---

## License

MIT — do whatever you want with it. Just don't run it as a real booking site; the XSS and a11y violations are intentional.

---

## Credits

Built for the **Playwright Mastery Academy**. Every bug, vulnerability, and edge case in here is on purpose.
