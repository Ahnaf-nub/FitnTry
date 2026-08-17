import React from "react";
import { Sparkles } from "lucide-react";
import { Garment } from "@/types/tryOn";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function GenerateButton({
  userImage,
  garment,
  onGenerate,
  disabled,
  loading,
}: {
  userImage: string;
  garment: Garment;
  onGenerate: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-md border border-line bg-surface p-5 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          <img
            src={userImage}
            alt="Your photo"
            className="h-14 w-14 rounded-full border-2 border-surface object-cover"
          />
          <img
            src={garment.image}
            alt={garment.name}
            className="h-14 w-14 rounded-full border-2 border-surface object-cover"
          />
        </div>
        <div>
          <p className="text-[13px] font-medium text-ink">{garment.name}</p>
          <p className="text-[12px] text-ink-faint">{garment.category} · {formatPrice(garment.price)}</p>
        </div>
      </div>

      <Button size="lg" onClick={onGenerate} disabled={disabled} loading={loading} className="w-full sm:w-auto">
        <Sparkles className="h-4 w-4" />
        {loading ? "Generating…" : "Generate Try-On"}
      </Button>
    </div>
  );
}
