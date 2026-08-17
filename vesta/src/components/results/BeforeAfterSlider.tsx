import React, { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt = "Before",
  afterAlt = "After",
}: {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
}) {
  const [percent, setPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-md border border-line-strong bg-ink shadow-lift sm:aspect-[3/4]"
      onMouseDown={(e) => {
        dragging.current = true;
        updateFromClientX(e.clientX);
      }}
      onMouseMove={(e) => dragging.current && updateFromClientX(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => updateFromClientX(e.touches[0].clientX)}
      onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
    >
      <img src={after} alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}>
        <img src={before} alt={beforeAlt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>

      <div className="absolute left-4 top-4 rounded-full bg-canvas/90 px-3 py-1 text-[10px] font-medium uppercase tracking-widest2 text-ink">
        Before
      </div>
      <div className="absolute right-4 top-4 rounded-full bg-oxblood px-3 py-1 text-[10px] font-medium uppercase tracking-widest2 text-canvas">
        After
      </div>

      <div
        className="absolute inset-y-0 w-[2px] bg-canvas"
        style={{ left: `${percent}%`, transform: "translateX(-1px)" }}
        aria-hidden="true"
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPercent((p) => Math.max(0, p - 4));
            if (e.key === "ArrowRight") setPercent((p) => Math.min(100, p + 4));
          }}
          className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-line-strong bg-canvas shadow-card"
        >
          <MoveHorizontal className="h-4 w-4 text-ink" />
        </div>
      </div>
    </div>
  );
}
