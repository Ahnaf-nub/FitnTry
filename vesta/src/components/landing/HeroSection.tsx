import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import beforeImg from "../../model-before.jpg";
import afterImg from "../../model-after.jpg";
export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="container-FitnTry grid grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-20">
        {/* Copy column */}
        <div className="animate-fade-up">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-oxblood" aria-hidden="true" />
            <span className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft">
              AI Virtual Dressing Room
            </span>
          </div>

          <h1 className="font-display text-[42px] font-normal leading-[1.06] tracking-tight text-ink sm:text-[56px] lg:text-[64px]">
            Fit check? Say less.
            <br />
            Now, don't just imagine the fit.
            <br />
            <span className="italic text-oxblood">Try it. Slay it. Own it.</span>
          </h1>

          <p className="mt-7 max-w-[440px] text-[16px] leading-relaxed text-ink-soft">
           Wanna see yourself rocking your dream fit before you hit checkout? 
 Meet FitnTry — your AI-powered virtual try-on that lets you discover, compare, and slay the fits that feel so you. 
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/try-on")}>
              Try Virtual Dressing Room
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/discover")}>
              Explore Styles
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-line pt-6">
            <Stat value="30s" label="Avg. try-on time" />
            <div className="h-8 w-px bg-line" aria-hidden="true" />
            <Stat value="12+" label="Garments to try" />
            <div className="h-8 w-px bg-line" aria-hidden="true" />
            <Stat value="4.8/5" label="Fit confidence" />
          </div>
        </div>

        {/* Visual column — ambient before/after reveal */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] animate-fade-in [animation-delay:150ms]">
          <div className="absolute inset-0 overflow-hidden rounded-md border border-line-strong bg-ink shadow-lift">
            <img
             src={afterImg}
              alt="Model wearing an AI-generated virtual try-on outfit"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="hero-seam absolute inset-0 overflow-hidden">
              <img
                src={beforeImg}
                alt="Same model before the virtual try-on"
                className="absolute inset-0 h-full w-full object-cover grayscale"
              />
            </div>
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-canvas/90 px-3 py-1 text-[10px] font-medium uppercase tracking-widest2 text-ink">
                Before
              </span>
            </div>
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-oxblood px-3 py-1 text-[10px] font-medium uppercase tracking-widest2 text-canvas">
                After
              </span>
            </div>
          </div>

          {/* Seam handle, purely decorative, echoes the real slider on the Result page */}
          <div className="hero-seam-handle pointer-events-none absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-line-strong bg-canvas shadow-card" aria-hidden="true" />
        </div>
      </div>

      <style>{`
        .hero-seam {
          animation: hero-seam-sweep 7s cubic-bezier(0.65,0,0.35,1) infinite;
          clip-path: inset(0 45% 0 0);
        }
        .hero-seam-handle {
          left: 55%;
          animation: hero-seam-handle 7s cubic-bezier(0.65,0,0.35,1) infinite;
        }
        @keyframes hero-seam-sweep {
          0%, 8% { clip-path: inset(0 45% 0 0); }
          50%, 58% { clip-path: inset(0 0 0 45%); }
          100% { clip-path: inset(0 45% 0 0); }
        }
        @keyframes hero-seam-handle {
          0%, 8% { left: 55%; }
          50%, 58% { left: 45%; }
          100% { left: 55%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-seam, .hero-seam-handle { animation: none; }
        }
      `}</style>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-lg text-ink">{value}</p>
      <p className="text-[11px] text-ink-faint">{label}</p>
    </div>
  );
}
