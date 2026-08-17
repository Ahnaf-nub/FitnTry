import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { pollTryOnJob } from "@/services";
import { TryOnError } from "@/types/tryOn";

const STAGES = [
  "Preparing your look",
  "Analyzing the garment",
  "Creating your virtual try-on",
  "Finishing the preview",
];

export function ProcessingModal({
  jobId,
  garmentImage,
  onComplete,
  onError,
}: {
  jobId: string;
  garmentImage: string;
  onComplete: (resultImage: string) => void;
  onError: (err: TryOnError) => void;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(4);
  const doneRef = useRef(false);

  // Advance the staged copy + progress bar on a steady cadence, independent
  // of the actual network/poll timing, so the experience always feels alive.
  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((p) => (p < 92 ? p + Math.random() * 6 + 2 : p));
      setStageIndex((i) => (i < STAGES.length - 1 ? i + 1 : i));
    }, 1050);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const stop = pollTryOnJob(jobId, (job) => {
      if (doneRef.current) return;
      if (job.status === "completed" && job.resultImage) {
        doneRef.current = true;
        setProgress(100);
        setStageIndex(STAGES.length - 1);
        window.setTimeout(() => onComplete(job.resultImage!), 500);
      } else if (job.status === "failed") {
        doneRef.current = true;
        onError({ code: "GENERATION_FAILED", message: job.error ?? "We couldn't create your look this time. Please try again." });
      }
    });
    return stop;
  }, [jobId, onComplete, onError]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Generating your virtual try-on"
    >
      <div className="mx-4 flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative mb-8 h-28 w-28">
          <div className="absolute inset-0 overflow-hidden rounded-full border border-canvas/20">
            <img src={garmentImage} alt="" className="h-full w-full object-cover opacity-80" />
          </div>
          <svg className="absolute inset-[-4px] h-[calc(100%+8px)] w-[calc(100%+8px)] -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(246,243,236,0.15)" strokeWidth="2" />
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="#F6F3EC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 47}
              strokeDashoffset={2 * Math.PI * 47 * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-canvas">
            <Sparkles className="h-4 w-4 text-oxblood animate-pulse" />
          </div>
        </div>

        <p className="font-display text-2xl text-canvas">{STAGES[stageIndex]}</p>
        <p className="mt-2 text-[13px] text-canvas/55">This usually takes less than a minute.</p>

        <div className="mt-8 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-canvas/15">
          <div
            className="h-full rounded-full bg-canvas transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <ul className="mt-8 flex gap-2" aria-hidden="true">
          {STAGES.map((_, i) => (
            <li
              key={i}
              className={`h-1 w-6 rounded-full transition-colors ${
                i <= stageIndex ? "bg-canvas" : "bg-canvas/20"
              }`}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
