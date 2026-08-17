import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  n: string;
  label: string;
}

export function StepIndicator({
  steps,
  current,
  onStepClick,
  maxReached,
}: {
  steps: Step[];
  current: number;
  onStepClick?: (index: number) => void;
  maxReached: number;
}) {
  return (
    <ol className="flex items-center" aria-label="Try-on progress">
      {steps.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const clickable = i <= maxReached && onStepClick;

        return (
          <li key={s.n} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(i)}
              className={cn(
                "flex items-center gap-2.5 text-left",
                clickable ? "cursor-pointer" : "cursor-default"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] transition-colors",
                  isActive && "border-oxblood bg-oxblood text-canvas",
                  isDone && !isActive && "border-ink bg-ink text-canvas",
                  !isActive && !isDone && "border-line-strong text-ink-faint"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : s.n}
              </span>
              <span
                className={cn(
                  "hidden text-[13px] font-medium sm:block",
                  isActive || isDone ? "text-ink" : "text-ink-faint"
                )}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-3 h-px flex-1 sm:mx-4",
                  i < current ? "bg-ink" : "bg-line-strong"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
