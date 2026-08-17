import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Alert({
  title,
  description,
  onRetry,
  retryLabel = "Try again",
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-oxblood/25 bg-oxblood/[0.05] px-4 py-3.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-oxblood" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-[13.5px] font-medium text-ink">{title}</p>
        {description && <p className="mt-0.5 text-[12.5px] text-ink-soft">{description}</p>}
        {onRetry && (
          <Button variant="link" size="sm" onClick={onRetry} className="mt-2 text-oxblood">
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
