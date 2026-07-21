"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Hydration flag — playwright tests should wait for `hydrated === true`. */
  hydrated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  hydrated: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setHydrated: () => set({ hydrated: true }),
  logout: () => set({ user: null }),
}));
