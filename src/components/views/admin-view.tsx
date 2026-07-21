"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Booking } from "@/lib/types";
import {
  ShieldCheck,
  ShieldAlert,
  Plane,
  Users,
  DollarSign,
} from "lucide-react";

export function AdminView() {
  const setView = useAppStore((s) => s.setView);
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setView("login", undefined);
      return;
    }
    if (user.role !== "admin") {
      setView("dashboard", undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (cancelled) return;
      setBookings(data.bookings as Booking[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, setView]);

  if (!user || user.role !== "admin") return null;

  const totalRevenue = bookings.reduce((s, b) => s + b.total, 0);
  const uniqueCustomers = new Set(bookings.map((b) => b.userEmail)).size;
  const totalTickets = bookings.reduce(
    (s, b) => s + b.items.length,
    0
  );

  return (
    <div className="space-y-6" data-testid="admin-view">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-sky-600 dark:text-sky-400" />
        <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-testid="admin-stats"
      >
        <Card data-testid="admin-stat-bookings">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Plane className="h-4 w-4" />
              Total bookings
            </div>
            <div className="text-3xl font-bold mt-1">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card data-testid="admin-stat-customers">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" />
              Unique customers
            </div>
            <div className="text-3xl font-bold mt-1">{uniqueCustomers}</div>
          </CardContent>
        </Card>
        <Card data-testid="admin-stat-revenue">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              Revenue
            </div>
            <div className="text-3xl font-bold mt-1">
              ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All bookings */}
      <Card data-testid="admin-bookings-card">
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-testid="admin-no-bookings"
            >
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-40" />
              No bookings have been made yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-testid="admin-bookings-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>PNR</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow
                      key={b.id}
                      data-testid={`admin-booking-row-${b.id}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {b.pnr}
                      </TableCell>
                      <TableCell>{b.userEmail}</TableCell>
                      <TableCell>{b.items.length}</TableCell>
                      <TableCell className="font-medium">
                        ${b.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {b.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(b.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
