"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { useBookingStore } from "@/stores/use-cart-store";

/**
 * On mount, fetch the current user from the auth cookie (server-side check)
 * and hydrate the auth store. Also mirrors the result into localStorage
 * `fwr_user` so subsequent loads skip the network round-trip.
 *
 * playwright storageState tests can rely on either the cookie OR localStorage
 * — both are kept in sync.
 */
export function AuthBoot({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.user) {
          setUser(data.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("fwr_user", JSON.stringify(data.user));
          }
        } else {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("fwr_user");
          }
        }
      } catch {
        // Network error — leave user as null.
        setUser(null);
      } finally {
        setHydrated();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setHydrated]);

  // Force booking-store hydration flag on mount (zustand persist handles the
  // actual state, but `hydrated` lets tests wait for readiness).
  const setBookingHydrated = useBookingStore((s) => s.setHydrated);
  useEffect(() => {
    // persist middleware calls onRehydrateStorage automatically, but in case
    // there is nothing to rehydrate (empty booking), force the flag here.
    const t = setTimeout(() => setBookingHydrated(), 0);
    return () => clearTimeout(t);
  }, [setBookingHydrated]);

  return <>{children}</>;
}
