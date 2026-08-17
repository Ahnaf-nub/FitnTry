import React from "react";
import { ImageOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-10 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-surface">
        {icon ?? <ImageOff className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />}
      </div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
