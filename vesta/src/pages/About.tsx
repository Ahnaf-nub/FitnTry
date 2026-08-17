import React from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Shirt, Sparkles, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  { icon: Camera, title: "Upload your photo", body: "Start with a clear photo of yourself, or pick one of our sample models to try FitnTry instantly." },
  { icon: Shirt, title: "Select a garment", body: "Browse the catalog or upload a piece you're deciding on — from a single top to a full look." },
  { icon: Sparkles, title: "AI generates your try-on", body: "FitnTry renders the garment onto your photo in under a minute, matched to your body and pose." },
  { icon: SplitSquareHorizontal, title: "Compare and decide", body: "Slide between before and after, save the looks you like, and complete the outfit with recommended pieces." },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="container-FitnTry py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">About FitnTry</p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            A dressing room that fits in your pocket.
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-ink-soft">
            FitnTry is an AI-powered virtual try-on experience built for the
            YouCam Apparel VTO Hackathon. Instead of imagining how something
            might look, you see it — on your own photo, in seconds — so
            every purchase starts with confidence instead of a guess.
          </p>
        </div>
      </div>

      <div className="border-t border-line bg-surface py-16 sm:py-20">
        <div className="container-FitnTry">
          <h2 className="mb-10 font-display text-2xl sm:text-3xl">How it works</h2>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title}>
                <span className="font-mono text-[12px] text-ink-faint">0{i + 1}</span>
                <div className="mt-3 mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-canvas">
                  <s.icon className="h-5 w-5 text-oxblood" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-FitnTry py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-md font-display text-3xl leading-tight sm:text-4xl">
          Ready to see yourself in it?
        </h2>
        <Button size="lg" className="mt-7" onClick={() => navigate("/try-on")}>
          Try Virtual Dressing Room
        </Button>
      </div>
    </div>
  );
}
