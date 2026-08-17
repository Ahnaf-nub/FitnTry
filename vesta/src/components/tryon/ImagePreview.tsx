import React from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ImagePreview({
  image,
  onReplace,
  onRemove,
  onContinue,
  continueLabel = "Continue",
}: {
  image: string;
  onReplace: () => void;
  onRemove: () => void;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-md border border-line-strong bg-line/30 sm:mx-0">
        <img src={image} alt="Your uploaded photo" className="aspect-[4/5] w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <div>
          <p className="text-[14px] font-medium text-ink">Photo ready</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            This is what FitnTry will use to generate your try-on. You can replace it any time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={onReplace}>
            <RefreshCw className="h-3.5 w-3.5" /> Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
          <Button size="sm" className="sm:ml-auto" onClick={onContinue}>
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
