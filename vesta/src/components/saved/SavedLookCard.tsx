import React, { useState } from "react";
import { Heart, RotateCcw, Download, Trash2, Loader2 } from "lucide-react";
import { SavedLook } from "@/types/tryOn";
import { cn, formatDate, formatPrice, downloadImage } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function SavedLookCard({
  look,
  onToggleFavorite,
  onTryAgain,
  onDelete,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: {
  look: SavedLook;
  onToggleFavorite: () => void;
  onTryAgain: () => void;
  onDelete: () => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    await downloadImage(look.resultImage, `${look.garment.name.replace(/\s+/g, "-").toLowerCase()}-look.jpg`);
    setDownloading(false);
  }

  return (
    <div
      className={cn(
        "group rounded-md border bg-surface p-3 transition-colors",
        selectMode ? "cursor-pointer border-line" : "border-line",
        selected && "border-ink ring-1 ring-ink"
      )}
      onClick={selectMode ? onToggleSelect : undefined}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-line/30">
        <img
          src={look.resultImage}
          alt={`Generated look with ${look.garment.name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {selectMode ? (
          <div
            className={cn(
              "absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold",
              selected ? "border-ink bg-ink text-canvas" : "border-canvas bg-canvas/70 text-transparent"
            )}
          >
            {selected ? "✓" : ""}
          </div>
        ) : (
          <button
            onClick={onToggleFavorite}
            aria-pressed={look.favorite}
            aria-label={look.favorite ? "Remove from favorites" : "Add to favorites"}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-canvas/90 text-ink hover:bg-canvas"
          >
            <Heart className={cn("h-4 w-4", look.favorite && "fill-oxblood text-oxblood")} />
          </button>
        )}
        {look.style && (
          <div className="absolute left-2.5 top-2.5">
            <Badge variant="dark">{look.style}</Badge>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="truncate text-[13px] font-medium text-ink">{look.garment.name}</p>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[11px] text-ink-faint">{formatDate(look.createdAt)}</span>
          {look.garment.price > 0 && (
            <span className="font-mono text-[12px] text-ink-soft">{formatPrice(look.garment.price)}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {!selectMode && (
          <>
            <Button variant="secondary" size="sm" className="flex-1" onClick={onTryAgain}>
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </Button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              aria-label="Download image"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line-strong text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            </button>
            {confirmingDelete ? (
              <button
                onClick={onDelete}
                aria-label="Confirm remove"
                className="flex h-9 shrink-0 items-center justify-center rounded-sm border border-oxblood bg-oxblood px-2.5 text-[11.5px] font-medium text-canvas"
              >
                Remove?
              </button>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                onBlur={() => setConfirmingDelete(false)}
                aria-label="Remove from saved looks"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line-strong text-ink-soft hover:border-oxblood hover:text-oxblood"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
