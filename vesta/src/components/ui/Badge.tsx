import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "oxblood" | "camel" | "outline" | "dark";

const styles: Record<BadgeVariant, string> = {
  default: "bg-line/70 text-ink-soft",
  oxblood: "bg-oxblood text-canvas",
  camel: "bg-camel/20 text-[#6b5330] border border-camel/40",
  outline: "border border-ink/30 text-ink-soft",
  dark: "bg-ink text-canvas",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest2",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
