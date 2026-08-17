import React, { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  onFile,
  label = "Drop a photo here",
  helper = "JPG, PNG or WEBP — up to 12MB",
  compact = false,
}: {
  onFile: (file: File) => void;
  label?: string;
  helper?: string;
  compact?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-center transition-colors",
        compact ? "px-4 py-8" : "px-6 py-16",
        dragging ? "border-oxblood bg-oxblood/5" : "border-line-strong bg-surface hover:border-ink/40"
      )}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-canvas">
        <UploadCloud className="h-5 w-5 text-ink-soft" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <p className="text-[14px] font-medium text-ink">{label}</p>
      <p className="mt-1 text-[12px] text-ink-faint">{helper}</p>
      <span className="mt-4 rounded-sm border border-ink/70 px-4 py-2 text-[12px] font-medium text-ink hover:bg-ink hover:text-canvas">
        Browse files
      </span>
    </div>
  );
}
