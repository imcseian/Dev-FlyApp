// Domain types for the Fly with Ram flight booking playground.

export type CabinClass = "economy" | "premium" | "business" | "first";

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface Airline {
  code: string;
  name: string;
  logo: string; // emoji or short text — kept simple
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO time string e.g. "2026-08-15T08:30:00"
  arrivalTime: string;
  durationMins: number;
  stops: number;
  stopCities?: string[];
  price: number;
  currency: string;
  cabinClasses: CabinClass[];
  seatsLeft: number;
  aircraft: string;
  tags: string[];
  /** Some flights intentionally have low contrast / bad metadata for a11y tests. */
  a11yIssues?: string[];
}

export interface Passenger {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dob?: string;
  passportNumber?: string;
}

export interface BookingItem {
  flightId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: CabinClass;
  passengerName: string;
  seat?: string;
  price: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: string;
  /** Frequent flyer miles — flight-booking-specific. */
  miles?: number;
}

export interface Comment {
  id: string;
  flightId: string; // route key like "JFK-LAX"
  author: string;
  /** Stored raw — rendered with dangerouslySetInnerHTML on purpose (XSS lab). */
  body: string;
  createdAt: string;
  rating: number;
}

export interface Booking {
  id: string;
  userEmail: string;
  items: BookingItem[];
  total: number;
  status: "pending" | "confirmed" | "cancelled" | "checked_in";
  pnr: string; // 6-char booking reference
  createdAt: string;
}

export type ViewName =
  | "home"
  | "search"
  | "flight-detail"
  | "booking"
  | "payment"
  | "my-bookings"
  | "login"
  | "dashboard"
  | "profile"
  | "settings"
  | "admin"
  | "playground";
