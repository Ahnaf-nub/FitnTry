import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { SavedLookCard } from "@/components/saved/SavedLookCard";
import { NearbyStores } from "@/components/saved/NearbyStores";
import { StylistModal } from "@/components/saved/StylistModal";
import EmptyState from "@/components/ui/EmptyState";
import { useTryOnStore } from "@/hooks/useTryOnStore";
import { cn } from "@/lib/utils";
import { SavedLook } from "@/types/tryOn";

const FILTERS = ["All", "Favorites", "Casual", "Work", "Party"] as const;
type Filter = (typeof FILTERS)[number];

function matchesFilter(look: { favorite: boolean; style?: string }, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "Favorites") return look.favorite;
  if (filter === "Work") return look.style === "Office";
  return look.style === filter;
}

export default function Saved() {
  const navigate = useNavigate();
  const { savedLooks, savedLooksLoading, toggleFavorite, removeSavedLook, setUserImage, setGarment, setStyle } = useTryOnStore();
  const [filter, setFilter] = useState<Filter>("All");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState<[SavedLook, SavedLook] | null>(null);

  function toggleCompareMode() {
    setCompareMode((v) => !v);
    setSelectedIds([]);
  }

  function toggleSelect(id: string) {
    setSelectedIds((ids) => {
      if (ids.includes(id)) return ids.filter((i) => i !== id);
      if (ids.length >= 2) return [ids[1], id]; // keep it to the 2 most recent picks
      return [...ids, id];
    });
  }

  function handleGetOpinion() {
    const picked = savedLooks.filter((l) => selectedIds.includes(l.id));
    if (picked.length === 2) setComparing([picked[0], picked[1]]);
  }

  const filtered = useMemo(
    () => savedLooks.filter((l) => matchesFilter(l, filter)),
    [savedLooks, filter]
  );

  function handleTryAgain(look: (typeof savedLooks)[number]) {
    setUserImage(look.beforeImage);
    setGarment(look.garment);
    setStyle((look.style as any) ?? null);
    navigate("/try-on");
  }

  return (
    <div className="container-FitnTry py-10 sm:py-14">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">My looks</p>
          <h1 className="font-display text-3xl sm:text-4xl">Saved Looks</h1>
        </div>
        {savedLooks.length >= 2 && (
          <button
            onClick={toggleCompareMode}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
              compareMode
                ? "border-ink bg-ink text-canvas"
                : "border-line-strong bg-surface text-ink-soft hover:border-ink/40 hover:text-ink"
            )}
          >
            {compareMode ? <X className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {compareMode ? "Cancel" : "Compare 2 looks"}
          </button>
        )}
      </div>

      <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
              filter === f
                ? "border-ink bg-ink text-canvas"
                : "border-line-strong bg-surface text-ink-soft hover:border-ink/40 hover:text-ink"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <NearbyStores />

      {savedLooksLoading ? (
        <p className="py-16 text-center text-[13px] text-ink-faint">Loading your saved looks…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Looks you save from a try-on will show up here, ready to revisit any time."
          actionLabel="Start a try-on"
          onAction={() => navigate("/try-on")}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {filtered.map((look) => (
            <SavedLookCard
              key={look.id}
              look={look}
              onToggleFavorite={() => toggleFavorite(look.id)}
              onTryAgain={() => handleTryAgain(look)}
              onDelete={() => removeSavedLook(look.id)}
              selectMode={compareMode}
              selected={selectedIds.includes(look.id)}
              onToggleSelect={() => toggleSelect(look.id)}
            />
          ))}
        </div>
      )}

      {compareMode && selectedIds.length === 2 && (
        <div className="fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <button
            onClick={handleGetOpinion}
            className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13.5px] font-medium text-canvas shadow-lg"
          >
            <Sparkles className="h-4 w-4" /> Get AI opinion
          </button>
        </div>
      )}

      {comparing && <StylistModal looks={comparing} onClose={() => setComparing(null)} />}
    </div>
  );
}
