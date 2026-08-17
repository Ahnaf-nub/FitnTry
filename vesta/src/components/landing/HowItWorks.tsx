import React from "react";
import { Camera, Shirt, Sparkles } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Camera,
    title: "Upload your photo",
    body: "Use a clear, well-lit photo — or start instantly with one of our sample models.",
  },
  {
    n: "02",
    icon: Shirt,
    title: "Choose a garment",
    body: "Browse tops, dresses, jackets and full looks, or upload a piece you're considering.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "See yourself in it",
    body: "FitnTry generates your try-on in seconds, ready to compare before and after.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line bg-surface py-20">
      <div className="container-FitnTry">
        <div className="mb-14 max-w-lg">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            Three steps between you and your next outfit decision.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute right-[-16px] top-6 hidden h-px w-8 bg-line-strong sm:block" aria-hidden="true" />
              )}
              <span className="font-mono text-[13px] text-ink-faint">{s.n}</span>
              <div className="mt-4 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-canvas">
                <s.icon className="h-5 w-5 text-oxblood" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl">{s.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
