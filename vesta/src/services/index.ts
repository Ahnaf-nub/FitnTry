import * as realApi from "./tryOnApi";
import * as mockApi from "./mockTryOnApi";
import { TryOnError, TryOnJob, TryOnRequestPayload } from "@/types/tryOn";

/**
 * Single switch point. Defaults to the mock so the hackathon demo always
 * works offline; set VITE_USE_MOCK_API=false once the real backend at
 * POST /api/try-on and GET /api/try-on/:jobId is live.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";

const api = USE_MOCK ? mockApi : realApi;

export async function createTryOn(payload: TryOnRequestPayload) {
  return api.createTryOn(payload);
}

export async function getTryOnStatus(jobId: string) {
  return api.getTryOnStatus(jobId);
}

/**
 * Polls until the job resolves. Used by ProcessingModal so no component
 * has to know whether it's talking to the mock or the real backend.
 */
export function pollTryOnJob(
  jobId: string,
  onUpdate: (job: TryOnJob) => void,
  intervalMs = 1100
): () => void {
  let cancelled = false;

  const tick = async () => {
    if (cancelled) return;
    try {
      const job = await api.getTryOnStatus(jobId);
      if (cancelled) return;
      onUpdate(job);
      if (job.status === "processing") {
        window.setTimeout(tick, intervalMs);
      }
    } catch {
      if (!cancelled) {
        onUpdate({ jobId, status: "failed", error: "We couldn't create your look this time. Please try again." });
      }
    }
  };

  tick();
  return () => {
    cancelled = true;
  };
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 12;

export function validateImageFile(file: File): TryOnError | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { code: "UNSUPPORTED_FORMAT", message: "Please upload a JPG, PNG, or WEBP photo." };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { code: "INVALID_IMAGE", message: `That photo is a bit large — please use a file under ${MAX_SIZE_MB}MB.` };
  }
  return null;
}
