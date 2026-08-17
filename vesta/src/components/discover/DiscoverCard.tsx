import React from "react";
import { Eye, Heart } from "lucide-react";
import { RecommendationItem } from "@/types/tryOn";
import { formatPrice, cn } from "@/lib/utils";

export function DiscoverCard({
  item,
  favorited,
  onView,
  onTryOn,
  onSave,
}: {
  item: RecommendationItem;
  favorited: boolean;
  onView: () => void;
  onTryOn: () => void;
  onSave: () => void;
}) {
  return (
    <div className="group w-[220px] shrink-0 sm:w-auto">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-line bg-line/30">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <button
          onClick={onSave}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from saved" : "Save"}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-canvas/90 text-ink transition-colors hover:bg-canvas"
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-oxblood text-oxblood")} />
        </button>

        <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={onView}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-canvas/95 py-2 text-[11px] font-medium text-ink hover:bg-canvas"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </button>
          <button
            onClick={onTryOn}
            className="flex flex-1 items-center justify-center rounded-sm bg-ink py-2 text-[11px] font-medium text-canvas hover:bg-oxblood"
          >
            Try On
          </button>
        </div>
      </div>
      <p className="mt-3 truncate text-[13px] font-medium text-ink">{item.name}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">{item.category}</span>
        <span className="font-mono text-[12px] text-ink-soft">{formatPrice(item.price)}</span>
      </div>
    </div>
  );
}
