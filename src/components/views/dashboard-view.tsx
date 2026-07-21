"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/lib/types";
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Plane,
  ShieldCheck,
  ArrowRight,
  Award,
  Calendar,
} from "lucide-react";

export function DashboardView() {
  const setView = useAppStore((s) => s.setView);
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setView("login", undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(
        `/api/bookings?userEmail=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();
      if (cancelled) return;
      setBookings(data.bookings as Booking[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, setView]);

  if (!user) return null;

  const upcomingBookings = bookings.slice(0, 3);
  const totalSpent = bookings.reduce((s, b) => s + b.total, 0);
  const miles = user.miles ?? 0;

  const quickActions = [
    {
      label: "My Bookings",
      desc: "View PNRs, tickets, and flight status",
      view: "my-bookings" as const,
      icon: Plane,
    },
    {
      label: "Profile",
      desc: "Edit your details, upload an avatar",
      view: "profile" as const,
      icon: UserIcon,
    },
    {
      label: "Settings",
      desc: "Notifications, theme, danger zone",
      view: "settings" as const,
      icon: SettingsIcon,
    },
    ...(user.role === "admin"
      ? [
          {
            label: "Admin panel",
            desc: "Manage all bookings and view stats",
            view: "admin" as const,
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-view">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="dashboard-title"
          >
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={user.role === "admin" ? "default" : "secondary"}
            data-testid="dashboard-role"
          >
            {user.role === "admin" ? "Admin" : "Member"}
          </Badge>
          <Badge
            variant="outline"
            className="bg-sky-500/10 text-sky-700 dark:text-sky-300"
            data-testid="dashboard-miles"
          >
            <Award className="h-3 w-3 mr-1" />
            {miles.toLocaleString()} miles
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-testid="dashboard-stats"
      >
        <Card data-testid="dashboard-stat-bookings">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Plane className="h-4 w-4" />
              Total bookings
            </div>
            <div className="text-3xl font-bold mt-1">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card data-testid="dashboard-stat-upcoming">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-4 w-4" />
              Upcoming trips
            </div>
            <div className="text-3xl font-bold mt-1">{upcomingBookings.length}</div>
          </CardContent>
        </Card>
        <Card data-testid="dashboard-stat-spent">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Award className="h-4 w-4" />
              Total spent
            </div>
            <div className="text-3xl font-bold mt-1">${totalSpent.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Quick actions</h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="dashboard-actions"
        >
          <Card
            className="cursor-pointer hover:border-sky-500 transition-colors"
            onClick={() => setView("search", undefined)}
            data-testid="dashboard-action-search"
          >
            <CardContent className="p-5 flex items-start gap-3">
              <div className="rounded-lg bg-sky-500/10 p-2">
                <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Book a flight</div>
                <div className="text-sm text-muted-foreground">
                  Search and book new flights
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
            </CardContent>
          </Card>
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Card
                key={a.label}
                className="cursor-pointer hover:border-sky-500 transition-colors"
                onClick={() => setView(a.view, undefined)}
                data-testid={`dashboard-action-${a.view}`}
              >
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-2">
                    <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{a.label}</div>
                    <div className="text-sm text-muted-foreground">{a.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming bookings */}
      <Card data-testid="dashboard-upcoming">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Upcoming bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-testid="dashboard-no-bookings"
            >
              <p>No bookings yet.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setView("search", undefined)}
                data-testid="dashboard-go-search"
              >
                Book your first flight
              </Button>
            </div>
          ) : (
            <ul className="space-y-3" data-testid="dashboard-bookings-list">
              {upcomingBookings.map((b) => (
                <li
                  key={b.id}
                  className="border border-border rounded-lg p-3"
                  data-testid={`dashboard-booking-${b.id}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-mono font-medium text-sky-600 dark:text-sky-400">
                        {b.pnr}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.items.length} ticket{b.items.length === 1 ? "" : "s"} ·{" "}
                        {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {b.status.replace("_", " ")}
                      </Badge>
                      <span className="font-bold">${b.total.toFixed(0)}</span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {b.items.map((i, idx) => (
                      <li key={idx}>
                        {i.flightNumber} · {i.origin}→{i.destination} · {i.passengerName}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
