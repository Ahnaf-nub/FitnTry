import React from "react";
import { Repeat, ShieldCheck, Wallet, Zap } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Decide in seconds",
    body: "See how a piece actually looks on you before adding it to cart — no guesswork, no waiting for delivery.",
  },
  {
    icon: Repeat,
    title: "Compare freely",
    body: "Try as many garments as you like and hold results side by side to see what genuinely works.",
  },
  {
    icon: Wallet,
    title: "Fewer returns",
    body: "Shoppers who try on virtually first return significantly less — better for you, better for the planet.",
  },
  {
    icon: ShieldCheck,
    title: "Your photos, protected",
    body: "Images are processed for your session and never used to train models or shown to other users.",
  },
];

export function WhyVirtualTryOn() {
  return (
    <section className="border-t border-line bg-ink py-20 text-canvas">
      <div className="container-FitnTry">
        <div className="mb-14 max-w-lg">
          <p className="text-[11px] uppercase tracking-widest2 text-canvas/50">Why virtual try-on</p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            Shopping should feel certain, not speculative.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
          {reasons.map((r) => (
            <div key={r.title} className="flex gap-4">
              <r.icon className="mt-1 h-5 w-5 shrink-0 text-camel-light" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg">{r.title}</h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-canvas/65">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
