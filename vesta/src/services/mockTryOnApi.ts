import { TryOnJob, TryOnRequestPayload } from "@/types/tryOn";

/**
 * Self-contained mock of the backend contract described in tryOnApi.ts.
 * Nothing outside this file knows it's fake — swap the export in
 * services/index.ts and every component keeps working unchanged.
 */

interface MockJob {
  status: TryOnJob["status"];
  resultImage?: string;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, MockJob>();

function hashSeed(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function createTryOn(
  payload: TryOnRequestPayload
): Promise<{ jobId: string; status: string }> {
  await delay(400 + Math.random() * 300);

  const jobId = `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const seed = hashSeed(payload.userImage + payload.garmentImage);

  jobs.set(jobId, { status: "processing", createdAt: Date.now() });

  // Simulate generation time, then resolve to a deterministic "result" image.
  window.setTimeout(() => {
    const job = jobs.get(jobId);
    if (!job) return;
    job.status = "completed";
    job.resultImage = `https://picsum.photos/seed/FitnTry-result-${seed}/900/1150`;
    jobs.set(jobId, job);
  }, 3400 + Math.random() * 900);

  return { jobId, status: "processing" };
}

export async function getTryOnStatus(jobId: string): Promise<TryOnJob> {
  await delay(250);
  const job = jobs.get(jobId);
  if (!job) {
    return { jobId, status: "failed", error: "We couldn't find that request. Please try again." };
  }
  return {
    jobId,
    status: job.status,
    resultImage: job.resultImage,
    error: job.error,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
