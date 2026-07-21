"use client";

import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fly with Ram logo — sky-to-cyan gradient badge with an airplane icon,
 * plus the "Fly with Ram" wordmark.
 *
 * Used in both the header and footer. Clickable when wrapped in a button.
 */
export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const badgeSize = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const wordmarkSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-sm overflow-hidden",
          badgeSize
        )}
        data-testid="logo-badge"
        aria-hidden="true"
      >
        {/* Subtle shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
        <Plane
          className={cn("relative z-10", iconSize)}
          strokeWidth={2.5}
        />
      </div>
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight",
            wordmarkSize
          )}
        >
          <span className="text-sky-600 dark:text-sky-400">Fly</span>
          <span className="text-foreground"> with Ram</span>
        </span>
      )}
    </div>
  );
}
