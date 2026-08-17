import React from "react";
import { cn } from "@/lib/utils";

export function CategoryTabs<T extends string>({
  categories,
  active,
  onChange,
}: {
  categories: readonly T[];
  active: T;
  onChange: (c: T) => void;
}) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
      {categories.map((c) => (
        <button
          key={c}
          role="tab"
          aria-selected={active === c}
          onClick={() => onChange(c)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
            active === c
              ? "border-ink bg-ink text-canvas"
              : "border-line-strong bg-surface text-ink-soft hover:border-ink/40 hover:text-ink"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
