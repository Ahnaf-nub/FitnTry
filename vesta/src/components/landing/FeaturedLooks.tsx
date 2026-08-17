import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { garments } from "@/data/garments";
import { formatPrice, cn } from "@/lib/utils";

const featured = [garments[6], garments[3], garments[9], garments[0]];

export function FeaturedLooks() {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container-FitnTry">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Featured looks</p>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Start with something the studio loves.
            </h2>
          </div>
          <button
            onClick={() => navigate("/discover")}
            className="hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink sm:flex"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((g, i) => (
            <button
              key={g.id}
              onClick={() => navigate("/try-on")}
              className={cn(
                "group text-left",
                i % 2 === 1 && "sm:mt-8"
              )}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-line bg-line/30">
                <img
                  src={g.image}
                  alt={g.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="m-3 rounded-full bg-canvas px-3 py-1.5 text-[11px] font-medium text-ink">
                    Try this on →
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[14px] font-medium text-ink">{g.name}</p>
              <p className="text-[12px] text-ink-faint">{formatPrice(g.price)}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
