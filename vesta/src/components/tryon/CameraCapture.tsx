import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CameraCapture({
  onCapture,
  onCancel,
}: {
  onCapture: (file: File) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Your browser doesn't support camera access. Please upload a photo instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError("Couldn't access your camera. Check your browser's camera permission, or upload a photo instead.");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreviewUrl(dataUrl);
    stopStream();
  }

  function handleRetake() {
    setPreviewUrl(null);
    setReady(false);
    setError(null);
    // Re-trigger the effect by remounting the video stream.
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        setError("Couldn't access your camera. Check your browser's camera permission, or upload a photo instead.");
      }
    })();
  }

  function handleUsePhoto() {
    if (!previewUrl) return;
    fetch(previewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      });
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-line-strong bg-surface px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-ink">{error}</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={onCancel}>
          Back to upload
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-line-strong bg-surface">
      <div className="relative aspect-[4/5] w-full bg-ink">
        {previewUrl ? (
          <img src={previewUrl} alt="Captured photo" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
        )}
        {!ready && !previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[13px] text-canvas/70">Starting camera…</p>
          </div>
        )}
        <button
          onClick={() => {
            stopStream();
            onCancel();
          }}
          aria-label="Cancel"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-canvas hover:bg-ink/80"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-center gap-3 border-t border-line p-4">
        {previewUrl ? (
          <>
            <Button variant="ghost" size="sm" onClick={handleRetake}>
              <RotateCcw className="h-4 w-4" /> Retake
            </Button>
            <Button size="sm" onClick={handleUsePhoto}>
              Use this photo
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={handleCapture} disabled={!ready}>
            <Camera className="h-4 w-4" /> Capture
          </Button>
        )}
      </div>
    </div>
  );
}
