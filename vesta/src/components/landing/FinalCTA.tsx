import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="border-t border-line bg-surface py-24">
      <div className="container-FitnTry text-center">
        <h2 className="mx-auto max-w-xl font-display text-4xl leading-tight sm:text-5xl">
          Stop guessing. <span className="italic text-oxblood">Now, try it. Own it. Slay it.</span>
        </h2>
       <p className="mx-auto mt-5 max-w-xl text-[15px] text-ink-soft">
  Connect FitnTry directly with your favorite online stores to instantly try on any dress or outfit before you buy.
</p>
        <Button size="lg" className="mt-8" onClick={() => navigate("/try-on")}>
          Try Virtual Dressing Room
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
