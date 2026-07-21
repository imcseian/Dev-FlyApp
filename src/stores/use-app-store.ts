"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ViewName } from "@/lib/types";

interface AppState {
  /** Current client-side "page". The only user-visible route is `/`. */
  view: ViewName;
  /** Active flight ID when view === "flight-detail". */
  activeFlightId: string | null;
  /** Mobile slide-out drawer. */
  mobileNavOpen: boolean;
  /** Visual regression demo state — toggles between v1 and v2 of certain UI. */
  visualVariant: "v1" | "v2";

  setView: (view: ViewName, opts?: { flightId?: string }) => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  toggleVisualVariant: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: "home",
      activeFlightId: null,
      mobileNavOpen: false,
      visualVariant: "v1",

      setView: (view, opts) =>
        set({
          view,
          activeFlightId: opts?.flightId ?? null,
          mobileNavOpen: false,
        }),
      openMobileNav: () => set({ mobileNavOpen: true }),
      closeMobileNav: () => set({ mobileNavOpen: false }),
      toggleMobileNav: () =>
        set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      toggleVisualVariant: () =>
        set((s) => ({ visualVariant: s.visualVariant === "v1" ? "v2" : "v1" })),
    }),
    {
      name: "fwr_app",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        view: s.view,
        activeFlightId: s.activeFlightId,
        visualVariant: s.visualVariant,
      }),
    }
  )
);
