import type { Booking, Comment, User } from "./types";

/**
 * Shared in-memory stores for the playground. Module-level singletons survive
 * across requests in the same Node.js process (and across HMR reloads in dev
 * via globalThis). This is intentionally NOT a database — the goal is a
 * deterministic-enough mock backend for Playwright tests.
 */

const g = globalThis as unknown as {
  __fwrBookings?: Booking[];
  __fwrComments?: Comment[];
  __fwrUsers?: Map<string, User>;
};

export const bookingsStore: Booking[] = (g.__fwrBookings ??= []);
export const commentsStore: Comment[] = (g.__fwrComments ??= [
  {
    id: "c-seed-1",
    flightId: "JFK-LAX",
    author: "Testy McTestface",
    body: "FWR 101 was on time and the seatback screen had every movie I wanted. Highly recommend!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    rating: 5,
  },
  {
    id: "c-seed-2",
    flightId: "JFK-LAX",
    author: "QA Wizard",
    body: "The connection in ORD was tight but SkyJet held the plane. Luggage arrived intact.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    rating: 4,
  },
]);
export const usersStore: Map<string, User> = (g.__fwrUsers ??= new Map());
