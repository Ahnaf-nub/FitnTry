import React, { useEffect, useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { SavedLook } from "@/types/tryOn";

async function fetchOpinion(looks: SavedLook[]): Promise<string> {
  const res = await fetch("/api/compare-looks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      looks: looks.map((l) => ({ name: l.garment.name, imageUrl: l.resultImage })),
      occasion: looks[0].style ?? undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Server returned ${res.status}`);
  }
  const data = await res.json();
  return data.opinion as string;
}

export function StylistModal({ looks, onClose }: { looks: [SavedLook, SavedLook]; onClose: () => void }) {
  const [opinion, setOpinion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchOpinion(looks)
      .then((text) => {
        if (!cancelled) setOpinion(text);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-md bg-canvas p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-5 w-5" /> Ask a stylist
          </h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-ink-soft" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {looks.map((look) => (
            <div key={look.id} className="overflow-hidden rounded-sm border border-line-strong">
              <img src={look.resultImage} alt={look.garment.name} className="aspect-[3/4] w-full object-cover" />
              <p className="truncate p-2 text-[12px] font-medium text-ink">{look.garment.name}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking it over…
          </div>
        )}

        {error && <p className="text-[13px] text-oxblood">{error}</p>}

        {opinion && (
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{opinion}</p>
        )}
      </div>
    </div>
  );
}
