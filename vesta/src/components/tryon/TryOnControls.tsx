import React from "react";
import { Info } from "lucide-react";
import { BodyArea, StyleOccasion } from "@/types/tryOn";
import { StyleSelector } from "./StyleSelector";

const bodyAreas: BodyArea[] = ["Auto Detect", "Upper Body", "Lower Body", "Full Body"];
const occasions: StyleOccasion[] = ["Casual", "University", "Office", "Party", "Date", "Wedding"];

export function TryOnControls({
  bodyArea,
  onBodyAreaChange,
  style,
  onStyleChange,
}: {
  bodyArea: BodyArea;
  onBodyAreaChange: (v: BodyArea) => void;
  style: StyleOccasion | null;
  onStyleChange: (v: StyleOccasion) => void;
}) {
  return (
    <div className="space-y-8">
      <StyleSelector
        title="Body area"
        hint="Helps FitnTry fit the garment to the right region of your photo."
        options={bodyAreas}
        value={bodyArea}
        onChange={onBodyAreaChange}
      />
      <StyleSelector
        title="Style / occasion"
        hint="Used to tailor your look recommendations — it doesn't change the generated try-on itself."
        options={occasions}
        value={style}
        onChange={onStyleChange}
        optional
      />

      <div className="flex items-start gap-2.5 rounded-md border border-line bg-surface px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          These preferences personalize your recommendations and saved-look
          tags. Your photo and garment selection are what FitnTry uses to
          generate the try-on itself.
        </p>
      </div>
    </div>
  );
}
