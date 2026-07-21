"use client";

import { useEffect, useState } from "react";
import {
  Plane,
  Menu,
  Search,
  LayoutDashboard,
  FlaskConical,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/use-app-store";
import { useBookingStore } from "@/stores/use-cart-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ViewName } from "@/lib/types";

const NAV_ITEMS: { label: string; view: ViewName; icon: React.ElementType }[] = [
  { label: "Search", view: "search", icon: Search },
  { label: "My Bookings", view: "my-bookings", icon: Ticket },
  { label: "Dashboard", view: "dashboard", icon: LayoutDashboard },
  { label: "Playground", view: "playground", icon: FlaskConical },
];

export function Header() {
  const setView = useAppStore((s) => s.setView);
  const view = useAppStore((s) => s.view);
  // Booking store — selectedFlights acts like a "cart" for the booking flow.
  const selectedFlights = useBookingStore((s) => s.selectedFlights);
  const hydrated = useBookingStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on view change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [view]);

  const go = (v: ViewName) => () => setView(v, undefined);

  const NavButtons = (
    <nav
      className="flex items-center gap-1"
      aria-label="Primary navigation"
      data-testid="primary-nav"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.view;
        return (
          <Button
            key={item.view}
            variant={active ? "secondary" : "ghost"}
            size="sm"
            onClick={go(item.view)}
            data-testid={`nav-${item.view}`}
            aria-current={active ? "page" : undefined}
            className="hidden md:inline-flex"
          >
            <Icon className="h-4 w-4 mr-1.5" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );

  const MobileNavContent = (
    <nav
      className="flex flex-col gap-2 mt-4"
      aria-label="Mobile navigation"
      data-testid="mobile-nav"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.view;
        return (
          <Button
            key={item.view}
            variant={active ? "secondary" : "ghost"}
            size="lg"
            onClick={go(item.view)}
            data-testid={`mobile-nav-${item.view}`}
            aria-current={active ? "page" : undefined}
            className="justify-start h-12"
          >
            <Icon className="h-5 w-5 mr-2" />
            {item.label}
          </Button>
        );
      })}
      <Button
        variant={user ? "secondary" : "outline"}
        size="lg"
        onClick={go(user ? "dashboard" : "login")}
        data-testid="mobile-nav-auth"
        className="justify-start h-12 mt-2"
      >
        {user ? `Hi, ${user.name}` : "Sign In"}
      </Button>
    </nav>
  );

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md"
      data-testid="site-header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Left: logo + mobile menu */}
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px]"
                data-testid="mobile-drawer"
              >
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                {MobileNavContent}
              </SheetContent>
            </Sheet>

            <button
              onClick={go("home")}
              className="flex items-center gap-2 cursor-pointer"
              data-testid="logo-link"
              aria-label="Fly with Ram home"
            >
              <Logo />
            </button>
          </div>

          {/* Center: desktop nav */}
          <div className="hidden md:block">{NavButtons}</div>

          {/* Right: theme, booking indicator, auth */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* Booking flow indicator — like a cart badge but for flights */}
            <Button
              variant="ghost"
              size="icon"
              onClick={go("booking")}
              aria-label={`${selectedFlights.length} flights in booking`}
              data-testid="booking-button"
              className="relative"
            >
              <Ticket className="h-5 w-5" />
              {hydrated && selectedFlights.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs bg-sky-600"
                  data-testid="booking-count-badge"
                >
                  {selectedFlights.length}
                </Badge>
              )}
            </Button>

            <Button
              variant={user ? "secondary" : "outline"}
              size="sm"
              onClick={go(user ? "dashboard" : "login")}
              data-testid="auth-button"
              className="hidden sm:inline-flex"
            >
              {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign In"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
