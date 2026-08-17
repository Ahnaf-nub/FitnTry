import React from "react";
import { useNavigate } from "react-router-dom";
import { recommendations } from "@/data/recommendations";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function CompleteLook() {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container-FitnTry grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow mb-3">Complete the look</p>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            Every try-on comes with what to pair it with next.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Once you generate a result, FitnTry suggests the pieces that finish
            the outfit — trousers, footwear, outerwear — so you can try those
            on too, without starting your search from zero.
          </p>
          <Button className="mt-7" variant="secondary" onClick={() => navigate("/try-on")}>
            Build a look
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {recommendations.map((r) => (
            <div key={r.id} className="rounded-md border border-line bg-surface p-2.5">
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-line/30">
                <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 truncate text-[12px] font-medium text-ink">{r.name}</p>
              <p className="text-[11px] text-ink-faint">{formatPrice(r.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
