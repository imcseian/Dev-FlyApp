"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Flight, CabinClass, Passenger, BookingItem } from "@/lib/types";

interface BookingState {
  /** Selected flights for the current booking (outbound + optional return). */
  selectedFlights: Flight[];
  /** Selected cabin class for all flights in the booking. */
  cabinClass: CabinClass;
  /** Passengers on this booking. */
  passengers: Passenger[];
  /** Selected seats per passenger (key = passenger index). */
  seats: Record<number, string>;
  /** Hydration flag — playwright tests can wait on this. */
  hydrated: boolean;
  setHydrated: () => void;

  addFlight: (flight: Flight) => void;
  removeFlight: (flightId: string) => void;
  clearFlights: () => void;
  setCabinClass: (c: CabinClass) => void;
  setPassengers: (p: Passenger[]) => void;
  setSeat: (passengerIndex: number, seat: string) => void;
  clearSeats: () => void;
  reset: () => void;

  totalPrice: () => number;
  toBookingItems: () => BookingItem[];
}

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1,
  premium: 1.5,
  business: 2.5,
  first: 4,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      selectedFlights: [],
      cabinClass: "economy",
      passengers: [
        { type: "adult", firstName: "", lastName: "" },
      ],
      seats: {},
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      addFlight: (flight) =>
        set((state) => {
          // Avoid duplicates by flight ID.
          if (state.selectedFlights.some((f) => f.id === flight.id)) {
            return state;
          }
          return { selectedFlights: [...state.selectedFlights, flight] };
        }),

      removeFlight: (flightId) =>
        set((state) => ({
          selectedFlights: state.selectedFlights.filter(
            (f) => f.id !== flightId
          ),
        })),

      clearFlights: () => set({ selectedFlights: [], seats: {} }),

      setCabinClass: (cabinClass) => set({ cabinClass }),

      setPassengers: (passengers) => set({ passengers }),

      setSeat: (passengerIndex, seat) =>
        set((state) => ({
          seats: { ...state.seats, [passengerIndex]: seat },
        })),

      clearSeats: () => set({ seats: {} }),

      reset: () =>
        set({
          selectedFlights: [],
          cabinClass: "economy",
          passengers: [{ type: "adult", firstName: "", lastName: "" }],
          seats: {},
        }),

      totalPrice: () => {
        const { selectedFlights, cabinClass, passengers } = get();
        const paxCount = Math.max(1, passengers.length);
        const mult = CABIN_MULTIPLIER[cabinClass];
        return selectedFlights.reduce(
          (sum, f) => sum + f.price * mult * paxCount,
          0
        );
      },

      toBookingItems: () => {
        const { selectedFlights, cabinClass, passengers, seats } = get();
        const items: BookingItem[] = [];
        selectedFlights.forEach((f) => {
          passengers.forEach((p, idx) => {
            const paxName =
              p.firstName || p.lastName
                ? `${p.firstName} ${p.lastName}`.trim()
                : "Unnamed passenger";
            items.push({
              flightId: f.id,
              flightNumber: f.flightNumber,
              origin: f.origin.code,
              destination: f.destination.code,
              airline: f.airline.name,
              departureTime: f.departureTime,
              arrivalTime: f.arrivalTime,
              cabinClass,
              passengerName: paxName,
              seat: seats[idx],
              price: Math.round(f.price * CABIN_MULTIPLIER[cabinClass] * 100) / 100,
            });
          });
        });
        return items;
      },
    }),
    {
      name: "fwr_cart", // keep same localStorage key for back-compat with tests
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
