"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — next-themes resolves on the client only.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5" data-testid="theme-icon-sun" />
        ) : (
          <Moon className="h-5 w-5" data-testid="theme-icon-moon" />
        )
      ) : (
        <div className="h-5 w-5" />
      )}
    </Button>
  );
}
