"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogIn, Info, ArrowRight } from "lucide-react";

export function LoginView() {
  const setView = useAppStore((s) => s.setView);
  const { user, setUser, setLoading } = useAuthStore();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to dashboard.
  useEffect(() => {
    if (user) setView("dashboard");
  }, [user, setView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Sign in failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setUser(data.user);
      // Mirror user into localStorage for storageState testing & fast hydration.
      if (typeof window !== "undefined") {
        localStorage.setItem("fwr_user", JSON.stringify(data.user));
      }
      toast({
        title: `Welcome, ${data.user.name}!`,
        description:
          data.user.role === "admin"
            ? "You have admin access."
            : "You are signed in.",
      });
      setView("dashboard");
    } catch (err) {
      toast({
        title: "Network error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const fillDemo = (kind: "user" | "admin") => {
    if (kind === "user") {
      setEmail("ram@tester.dev");
      setPassword("test1234");
    } else {
      setEmail("root@admin.flyram.dev");
      setPassword("admin1234");
    }
  };

  return (
    <div className="max-w-md mx-auto" data-testid="login-view">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign in to Fly with Ram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testid="login-form"
          >
            <div className="space-y-1">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="login-email-input"
                autoComplete="email"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 4 characters"
                data-testid="login-password-input"
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
              data-testid="login-submit"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border">
            <div
              className="flex items-start gap-2 text-xs text-muted-foreground"
              data-testid="login-help"
            >
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>
                  Any valid email + password (≥4 chars) works. Use a
                  <code className="px-1 py-0.5 bg-muted rounded mx-1">
                    @admin.flyram.dev
                  </code>
                  email to sign in as admin.
                </p>
                <p className="text-muted-foreground">
                  Auth state is persisted via a <code>fwr_auth</code> cookie
                  AND a <code>fwr_user</code> localStorage entry — perfect for
                  playwright <code>storageState</code> testing.
                </p>
              </div>
            </div>

            <Separator className="my-3" />

            <div
              className="flex gap-2"
              data-testid="login-demo-buttons"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo("user")}
                data-testid="login-demo-user"
                className="flex-1"
                type="button"
              >
                Fill user demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo("admin")}
                data-testid="login-demo-admin"
                className="flex-1"
                type="button"
              >
                Fill admin demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
