"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, User, UserCog, UserPlus } from "lucide-react";
import type { User as UserType } from "@/lib/types";

/**
 * Playwright concept: `storageState` for session reuse.
 *
 * Playwright caches auth state across tests via `storageState`.
 * This module exposes 3 role-based quick-login buttons — perfect for
 * parametrized tests that switch roles.
 *
 *   const roles = ['guest', 'member', 'admin'];
 *   for (const role of roles) {
 *     test(`as ${role}`, async ({ page, context }) => {
 *       // Use saved storageState or log in fresh
 *       await page.goto('/');
 *       await page.getByTestId(`session-login-${role}`).click();
 *       // Save state for reuse
 *       await context.storageState({ path: `playwright/.auth/${role}.json` });
 *     });
 *   }
 */

const ROLES = [
  {
    key: "guest" as const,
    label: "Guest",
    email: "guest@flyram.dev",
    password: "guest1234",
    role: "user" as const,
    icon: User,
    desc: "Logged-out visitor. No session cookie.",
  },
  {
    key: "member" as const,
    label: "Member",
    email: "member@flyram.dev",
    password: "member1234",
    role: "user" as const,
    icon: UserPlus,
    desc: "Standard authenticated user. Can shop and comment.",
  },
  {
    key: "admin" as const,
    label: "Admin",
    email: "root@admin.flyram.dev",
    password: "admin1234",
    role: "admin" as const,
    icon: UserCog,
    desc: "Admin role. Can access /admin panel.",
  },
];

export function SessionLab() {
  const setView = useAppStore((s) => s.setView);
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const loginAs = async (roleKey: "guest" | "member" | "admin") => {
    if (roleKey === "guest") {
      // Log out
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("fwr_user");
      }
      setUser(null);
      toast({ title: "Signed out" });
      return;
    }

    const role = ROLES.find((r) => r.key === roleKey)!;
    setLoadingRole(roleKey);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: role.email,
          password: role.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Login failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setUser(data.user as UserType);
      if (typeof window !== "undefined") {
        localStorage.setItem("fwr_user", JSON.stringify(data.user));
      }
      toast({
        title: `Signed in as ${role.label}`,
        description: `Email: ${role.email}`,
      });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Card data-testid="session-lab">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Session lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Three role-based quick-login buttons — perfect for{" "}
          <code className="px-1 py-0.5 bg-muted rounded">storageState</code>{" "}
          caching across parametrized tests.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="session-snippet"
        >
{`// Save auth state per role
for (const role of ['guest', 'member', 'admin']) {
  test('as ' + role, async ({ page, context }) => {
    await page.goto('/');
    await page.getByTestId('session-login-' + role).click();
    // Save for reuse in other tests
    await context.storageState({
      path: 'playwright/.auth/' + role + '.json',
    });
  });
}

// Reuse saved state in later tests
test.use({ storageState: 'playwright/.auth/admin.json' });`}
        </pre>

        {/* Current session */}
        <div
          className="p-3 bg-muted/50 rounded-md text-sm"
          data-testid="session-current"
        >
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Current session
          </div>
          {user ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{user.email}</Badge>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                data-testid="session-current-role"
              >
                {user.role}
              </Badge>
            </div>
          ) : (
            <Badge variant="outline" data-testid="session-current-role">
              guest (signed out)
            </Badge>
          )}
        </div>

        {/* Role buttons */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          data-testid="session-role-buttons"
        >
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isCurrent =
              (r.key === "guest" && !user) ||
              (user && user.email === r.email);
            const isLoading = loadingRole === r.key;
            return (
              <Button
                key={r.key}
                variant={isCurrent ? "secondary" : "outline"}
                onClick={() => loginAs(r.key)}
                disabled={isLoading}
                data-testid={`session-login-${r.key}`}
                className="h-auto py-3 flex flex-col items-start gap-1"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{r.label}</span>
                </div>
                <span className="text-xs font-normal opacity-70 text-left">
                  {r.email}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Role descriptions */}
        <ul className="text-xs text-muted-foreground space-y-1">
          {ROLES.map((r) => (
            <li key={r.key} data-testid={`session-desc-${r.key}`}>
              <strong className="text-foreground">{r.label}:</strong> {r.desc}
            </li>
          ))}
        </ul>

        <Button
          variant="link"
          size="sm"
          onClick={() => setView("dashboard")}
          data-testid="session-go-dashboard"
          className="px-0"
        >
          Go to dashboard →
        </Button>
      </CardContent>
    </Card>
  );
}
