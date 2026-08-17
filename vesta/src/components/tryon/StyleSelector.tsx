import React from "react";
import { cn } from "@/lib/utils";

export function StyleSelector<T extends string>({
  title,
  hint,
  options,
  value,
  onChange,
  optional,
}: {
  title: string;
  hint?: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-ink">{title}</p>
        {optional && <span className="text-[11px] text-ink-faint">Optional</span>}
      </div>
      {hint && <p className="mb-3 text-[12px] text-ink-faint">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
              value === opt
                ? "border-ink bg-ink text-canvas"
                : "border-line-strong bg-surface text-ink-soft hover:border-ink/40 hover:text-ink"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
