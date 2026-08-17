import React from "react";
import { Check } from "lucide-react";
import { Garment } from "@/types/tryOn";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function GarmentCard({
  garment,
  selected,
  onSelect,
}: {
  garment: Garment;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative text-left outline-none",
        "rounded-md border bg-surface transition-all duration-200",
        selected ? "border-ink shadow-card" : "border-line hover:border-line-strong"
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[5px] bg-line/30">
        <img
          src={garment.image}
          alt={garment.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {garment.tag && (
          <div className="absolute left-2 top-2">
            <Badge variant={garment.tag === "Editor's Pick" ? "oxblood" : "dark"}>{garment.tag}</Badge>
          </div>
        )}
        {selected && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-canvas">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-[13px] font-medium text-ink">{garment.name}</p>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[11px] text-ink-faint">{garment.category}</span>
          <span className="font-mono text-[12px] text-ink-soft">{formatPrice(garment.price)}</span>
        </div>
      </div>
    </button>
  );
}
