"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthBoot } from "@/components/providers/auth-boot";
import { useAppStore } from "@/stores/use-app-store";
import { HomeView } from "@/components/views/home-view";
import { SearchView } from "@/components/views/search-view";
import { FlightDetailView } from "@/components/views/flight-detail-view";
import { BookingView } from "@/components/views/booking-view";
import { PaymentView } from "@/components/views/payment-view";
import { MyBookingsView } from "@/components/views/my-bookings-view";
import { LoginView } from "@/components/views/login-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { ProfileView } from "@/components/views/profile-view";
import { SettingsView } from "@/components/views/settings-view";
import { AdminView } from "@/components/views/admin-view";
import { PlaygroundView } from "@/components/views/playground-view";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const activeFlightId = useAppStore((s) => s.activeFlightId);

  // Scroll to top on view change. playwright tests can rely on this.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [view, activeFlightId]);

  return (
    <AuthBoot>
      <div
        className="min-h-screen flex flex-col bg-background"
        data-testid="app-root"
      >
        <Header />
        <main
          className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
          data-testid="main-content"
        >
          {view === "home" && <HomeView />}
          {view === "search" && <SearchView />}
          {view === "flight-detail" && activeFlightId && (
            <FlightDetailView flightId={activeFlightId} />
          )}
          {view === "booking" && <BookingView />}
          {view === "payment" && <PaymentView />}
          {view === "my-bookings" && <MyBookingsView />}
          {view === "login" && <LoginView />}
          {view === "dashboard" && <DashboardView />}
          {view === "profile" && <ProfileView />}
          {view === "settings" && <SettingsView />}
          {view === "admin" && <AdminView />}
          {view === "playground" && <PlaygroundView />}
        </main>
        <Footer />
      </div>
    </AuthBoot>
  );
}
