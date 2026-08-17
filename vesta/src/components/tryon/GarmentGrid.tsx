import React from "react";
import { Plus } from "lucide-react";
import { Garment } from "@/types/tryOn";
import { GarmentCard } from "./GarmentCard";

export function GarmentGrid({
  garments,
  selectedId,
  onSelect,
  onUploadOwn,
}: {
  garments: Garment[];
  selectedId?: string;
  onSelect: (g: Garment) => void;
  onUploadOwn: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {garments.map((g) => (
        <GarmentCard key={g.id} garment={g} selected={selectedId === g.id} onSelect={() => onSelect(g)} />
      ))}

      <button
        type="button"
        onClick={onUploadOwn}
        className="flex aspect-[3/4.7] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-surface text-center transition-colors hover:border-ink/40"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-canvas">
          <Plus className="h-4 w-4 text-ink-soft" />
        </span>
        <span className="px-4 text-[12px] font-medium text-ink-soft">Upload your own garment</span>
      </button>
    </div>
  );
}
