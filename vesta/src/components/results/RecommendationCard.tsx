import React from "react";
import { RecommendationItem } from "@/types/tryOn";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function RecommendationCard({
  item,
  onTryOn,
}: {
  item: RecommendationItem;
  onTryOn: (item: RecommendationItem) => void;
}) {
  return (
    <div className="group rounded-md border border-line bg-surface p-3">
      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-line/30">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-3 truncate text-[13px] font-medium text-ink">{item.name}</p>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">{item.category}</span>
        <span className="font-mono text-[12px] text-ink-soft">{formatPrice(item.price)}</span>
      </div>
      <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => onTryOn(item)}>
        Try On
      </Button>
    </div>
  );
}
