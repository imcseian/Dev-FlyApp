"use client";

import { useEffect, useState } from "react";
import { Mail, Github, Twitter, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "./logo";
import type { ViewName } from "@/lib/types";

const FOOTER_LINKS: { heading: string; items: { label: string; view?: ViewName; href?: string }[] }[] = [
  {
    heading: "Flights",
    items: [
      { label: "Search", view: "search" },
      { label: "My Bookings", view: "my-bookings" },
      { label: "Payment", view: "payment" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Sign In", view: "login" },
      { label: "Dashboard", view: "dashboard" },
      { label: "Profile", view: "profile" },
      { label: "Settings", view: "settings" },
    ],
  },
  {
    heading: "Lab",
    items: [
      { label: "Playground", view: "playground" },
      { label: "Admin", view: "admin" },
    ],
  },
];

export function Footer() {
  const setView = useAppStore((s) => s.setView);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic year — playwright text-assertion target.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Subscription failed",
          description: data.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Subscribed!",
        description: data.message,
      });
      setEmail("");
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      className="mt-auto border-t border-border bg-background"
      data-testid="site-footer"
    >
      {/* Hidden locator target — playwright tests can find this exact node. */}
      <div
        data-testid="footer-hidden-marker"
        className="sr-only"
        aria-hidden="true"
      >
        pwr-footer-marker
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand + newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground max-w-sm">
              A deliberately complex playground built for the Playwright
              Mastery Academy. Every edge case is on purpose.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="space-y-2"
              data-testid="newsletter-form"
              aria-label="Newsletter signup"
            >
              <Label htmlFor="newsletter-email" className="text-sm font-medium">
                Get test-automation tips monthly
              </Label>
              <div className="flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="newsletter-email-input"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  data-testid="newsletter-submit"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </form>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() =>
                        item.view && setView(item.view)
                      }
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      data-testid={`footer-link-${item.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Dynamic year — playwright text-assertion target. */}
          <p
            className="text-xs text-muted-foreground"
            data-testid="footer-copyright"
          >
            © {year ?? "2024"} Fly with Ram. Built for testers, by testers.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a
              href="mailto:hello@flyram.dev"
              aria-label="Email us"
              className="hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/playwright-community"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/playwrightjs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <span className="text-xs flex items-center gap-1">
              Made with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> for QA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
